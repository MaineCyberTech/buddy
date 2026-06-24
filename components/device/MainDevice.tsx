'use client';

import { useState, useCallback, useEffect } from 'react';
import { BuddyState } from '@/lib/generation/types';
import { useGameStore } from '@/lib/buddy/store';
import { applyAction, applyOfflineDecay, CareActionType } from '@/lib/actions/care';
import { saveGame } from '@/lib/storage/indexeddb';
import { LcdDisplay } from '@/components/device/LcdDisplay';
import { StatBars, NeedBars } from '@/components/ui/StatBars';
import { AdventureScreen } from '@/components/device/AdventureScreen';
import { InventoryScreen } from '@/components/device/InventoryScreen';
import { HomeScreen } from '@/components/device/HomeScreen';
import { SettingsScreen } from '@/components/device/SettingsScreen';
import { MemoryAlbum } from '@/components/device/MemoryAlbum';
import { AccountPrompt } from '@/components/device/AccountPrompt';
import { LocalAuthService } from '@/lib/auth';
import { SoundEngine } from '@/lib/sound';
import { getStageName, checkEvolution } from '@/lib/progression/lifecycle';
import { checkAchievements } from '@/data/achievements';
import { recordSpeciesSeen } from '@/lib/collections';
import { DeviceTab } from '@/lib/buddy/screens';
import { MinigameRenderer, MINIGAMES, MinigameType } from '@/lib/minigames/ui';
import { SpeciesBook } from '@/components/collections/SpeciesBook';
import { LoreJournal } from '@/components/collections/LoreJournal';
import { PhotoAlbumView } from '@/components/collections/PhotoAlbumView';
import { TradingScreen } from '@/components/social/TradingScreen';
import { MarketScreen } from '@/components/social/MarketScreen';
import { BreedingScreen } from '@/components/social/BreedingScreen';
import { LeaderboardView } from '@/components/social/LeaderboardView';
import { DailyLoginView } from '@/components/events/DailyLoginView';
import { SeasonalEventsView } from '@/components/events/SeasonalEventsView';

interface MainDeviceProps {
  buddy: BuddyState;
  initialTab?: DeviceTab;
}

const ACTIONS: { type: CareActionType; label: string; icon: string }[] = [
  { type: 'feed', label: 'Feed', icon: '🍽' },
  { type: 'play', label: 'Play', icon: '🎾' },
  { type: 'wash', label: 'Wash', icon: '🧼' },
  { type: 'rest', label: 'Rest', icon: '💤' },
  { type: 'talk', label: 'Talk', icon: '💬' },
  { type: 'train', label: 'Train', icon: '⚡' },
  { type: 'heal', label: 'Heal', icon: '💊' },
];

type NavTab = { id: DeviceTab; label: string; icon: string };
const NAV_TABS: NavTab[] = [
  { id: 'main', label: 'DEVICE', icon: '📟' },
  { id: 'profile', label: 'PROFILE', icon: '👤' },
  { id: 'stats', label: 'STATS', icon: '📊' },
  { id: 'inventory', label: 'ITEMS', icon: '🎒' },
  { id: 'minigames', label: 'GAMES', icon: '🎮' },
  { id: 'adventure', label: 'EXPLORE', icon: '🗺️' },
  { id: 'home', label: 'HOME', icon: '🏠' },
  { id: 'settings', label: 'MORE', icon: '⚙️' },
];

export function MainDevice({ buddy: initialBuddy, initialTab = 'main' }: MainDeviceProps) {
  const [currentBuddy, setCurrentBuddy] = useState(initialBuddy);
  const [tab, setTab] = useState<DeviceTab>(initialTab);
  const [message, setMessage] = useState('');
  const [messageKey, setMessageKey] = useState(0);
  const [idleMessage, setIdleMessage] = useState('');
  const [idleKey, setIdleKey] = useState(0);
  const [careJournal, setCareJournal] = useState<{ action: string; timestamp: number }[]>([]);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [achievementMessage, setAchievementMessage] = useState('');
  const [achievementKey, setAchievementKey] = useState(0);
  const [accountPromptFeature, setAccountPromptFeature] = useState('');
  const [activeGame, setActiveGame] = useState<MinigameType | null>(null);
  const updateBuddy = useGameStore((s) => s.updateBuddy);
  const soundEnabled = useGameStore(s => s.soundEnabled);

  useEffect(() => {
    const elapsed = Date.now() - initialBuddy.lastInteraction;
    if (elapsed > 60_000) {
      const decayed = applyOfflineDecay(initialBuddy, elapsed);
      setCurrentBuddy(decayed);
      updateBuddy(decayed);
      setMessage('Your buddy missed you!');
      setMessageKey((k) => k + 1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const lines = currentBuddy.personality.idleLines || [];
    if (lines.length === 0) return;
    let idx = 0;
    const tick = () => {
      setIdleMessage(lines[idx % lines.length]);
      setIdleKey(k => k + 1);
      idx++;
    };
    tick();
    const iv = setInterval(tick, 15_000 + Math.random() * 15_000);
    return () => clearInterval(iv);
  }, [currentBuddy.personality.idleLines, currentBuddy.identity.nickname]);

  const handleAction = useCallback(
    async (action: CareActionType) => {
      try { if (soundEnabled) SoundEngine[action as keyof typeof SoundEngine]?.(); } catch {}
      try { if (navigator.vibrate) navigator.vibrate(30); } catch {}

      const { buddy: updated, result } = applyAction(currentBuddy, action);

      const evolvedStage = checkEvolution(updated);
      if (evolvedStage) {
        const progression = updated.progression
          ? { ...updated.progression, lifecycle: evolvedStage }
          : { lifecycle: evolvedStage, age: 0, skills: { exploring: 0, training: 0, social: 0, crafting: 0, cooking: 0 }, bondLevel: 1, totalAdventures: 0, memories: [], achievements: [], careQuality: 1.0 };
        updated.progression = progression;
        setMessage(`${getStageName(evolvedStage)} stage unlocked!`);
      }

      setCurrentBuddy(updated);
      updateBuddy(updated);

      if (!evolvedStage) {
        setMessage(result.message);
      }
      setMessageKey((k) => k + 1);
      setCareJournal(prev => [{ action, timestamp: Date.now() }, ...prev].slice(0, 10));

      const inv = useGameStore.getState().inventory;
      const unlocked = updated.progression?.achievements || [];
      const totalAdv = updated.progression?.totalAdventures || 0;
      const newAchievements = checkAchievements(updated, inv, totalAdv, unlocked);
      if (newAchievements.length > 0) {
        const ids = newAchievements.map(a => a.id);
        const updatedProgression = updated.progression
          ? { ...updated.progression, achievements: [...unlocked, ...ids] }
          : updated.progression;
        if (updatedProgression) updated.progression = updatedProgression;
        let coinReward = 0;
        for (const a of newAchievements) {
          coinReward += a.rewardCoins || 0;
          if (a.rewardItemId) {
            useGameStore.getState().addItem(a.rewardItemId, 1);
          }
        }
        if (coinReward > 0) {
          useGameStore.getState().addCoins(coinReward);
        }
        const names = newAchievements.map(a => a.name).join(', ');
        setAchievementMessage(`Achievement unlocked: ${names}${coinReward > 0 ? ` (+${coinReward} coins)` : ''}`);
        setAchievementKey((k) => k + 1);
        setTimeout(() => setAchievementMessage(''), 5000);
      }

      try {
        const storeState = useGameStore.getState();
        await saveGame({
          version: 2,
          guestId: storeState.guestId,
          buddy: updated,
          createdAt: updated.identity.generatedAt,
          updatedAt: Date.now(),
          inventory: storeState.inventory,
          placedDecor: storeState.placedDecor,
          speciesBook: storeState.speciesBook,
          loreJournal: storeState.loreJournal,
          photoAlbum: storeState.photoAlbum,
          minigameHighScores: storeState.minigameHighScores,
        });
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus(''), 2000);
      } catch {
        setAutoSaveStatus('save failed');
        setTimeout(() => setAutoSaveStatus(''), 3000);
      }
    },
    [currentBuddy, updateBuddy, soundEnabled]
  );

  const handleGameComplete = useCallback((game: MinigameType, _score: number) => {
    setActiveGame(null);
    setTab('main');
  }, []);

  const moodColors: Record<string, string> = {
    happy: 'lcd-text-accent',
    content: 'lcd-text',
    neutral: 'lcd-text-warn',
    sad: 'lcd-text-warn',
    sick: 'lcd-text-danger',
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f]">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full p-4 gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="font-lcd text-sm lcd-text-accent opacity-70">
              BUDDY v0.1
            </h1>
            {tab !== 'main' && (
              <button onClick={() => setTab('main')} className="text-xs lcd-text opacity-40 hover:opacity-100 focus-ring px-1" aria-label="Back to device">
                ✕
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="lcd-text opacity-50">
              Lv.{currentBuddy.level}
            </span>
            <button
              onClick={() => {
                useGameStore.getState().addPhoto({
                  id: 'photo-' + Date.now().toString(36),
                  timestamp: Date.now(),
                  speciesName: currentBuddy.identity.speciesName,
                  nickname: currentBuddy.identity.nickname,
                  stage: currentBuddy.progression ? getStageName(currentBuddy.progression.lifecycle) : 'egg',
                  rarity: currentBuddy.identity.rarity,
                  isShiny: currentBuddy.identity.isShiny,
                  hat: currentBuddy.identity.hat,
                });
                if (soundEnabled) SoundEngine.click();
                setMessage('Photo saved to album!');
                setMessageKey(k => k + 1);
              }}
              className="text-xs lcd-text opacity-50 hover:opacity-100 focus-ring px-1"
              aria-label="Save photo to album"
              title="Save Photo"
            >
              📸
            </button>
            {autoSaveStatus && (
              <span className={`lcd-text-${autoSaveStatus === 'saved' ? 'accent' : 'danger'} text-xs`}>
                {autoSaveStatus}
              </span>
            )}
          </div>
        </div>

        {tab === 'main' && (
          <>
            <LcdDisplay buddy={currentBuddy} />

            {message && localStorage.getItem('buddy-silent-mode') !== 'true' && (
              <div key={messageKey} className="text-center text-sm lcd-text-accent animate-fade-in px-2" role="status" aria-live="polite">
                {message}
              </div>
            )}
            {achievementMessage && (
              <div key={achievementKey} className="text-center text-sm rarity-shiny animate-fade-in px-2" role="status" aria-live="polite">
                {achievementMessage}
              </div>
            )}

            <div className="flex items-center justify-center gap-2">
              <span className={`text-sm font-lcd ${moodColors[currentBuddy.mood] || 'lcd-text'}`}>
                {currentBuddy.mood.toUpperCase()}
              </span>
              <span className="text-xs lcd-text opacity-50">♥ {currentBuddy.bond}</span>
              <span className="text-xs lcd-text opacity-50">HP {currentBuddy.health}</span>
              <span className="text-xs lcd-text opacity-50">XP {currentBuddy.xp}</span>
            </div>

            {idleMessage && !message && (
              <p key={idleKey} className="text-xs lcd-text opacity-60 italic text-center animate-fade-in idle-message">
                &quot;{idleMessage}&quot;
              </p>
            )}

            <div className="flex justify-center gap-1 flex-wrap">
              {ACTIONS.map((action) => (
                <button
                  key={action.type}
                  onClick={() => handleAction(action.type)}
                  className="btn-device px-3 py-2 text-xs rounded-md focus-ring flex flex-col items-center gap-0.5 min-w-[60px]"
                  aria-label={action.label}
                >
                  <span aria-hidden="true">{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        <div className="flex justify-center gap-1 border-t border-[#1a1a2e] pt-3 mt-2 flex-wrap">
          {NAV_TABS.map((nt) => (
            <button
              key={nt.id}
              onClick={() => { setTab(nt.id); setActiveGame(null); }}
              className={`text-xs font-lcd focus-ring px-2 py-1 rounded ${tab === nt.id ? 'lcd-text-accent border-b border-lcd-accent' : 'lcd-text opacity-50'}`}
            >
              {nt.label}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="animate-fade-in space-y-2 text-sm">
            <p className="lcd-text-accent font-lcd">{currentBuddy.identity.nickname}</p>
            <p className="lcd-text text-xs">the {currentBuddy.identity.speciesName}</p>
            <p className="lcd-text text-xs opacity-70">
              <span className={`rarity-${currentBuddy.identity.rarity}`}>{currentBuddy.identity.rarity.toUpperCase()}</span>
              {currentBuddy.identity.isShiny && <span className="rarity-shiny ml-2">✦ SHINY ✦</span>}
            </p>
            {currentBuddy.progression && <p className="text-xs lcd-text-accent opacity-80">{getStageName(currentBuddy.progression.lifecycle)} stage</p>}
            <p className="lcd-text text-xs mt-2 opacity-60">{currentBuddy.personality.name} personality</p>
            <p className="lcd-text text-xs opacity-50 italic">&quot;{currentBuddy.personality.description}&quot;</p>
            <p className="lcd-text text-xs mt-2">Hat: {currentBuddy.identity.hat}</p>
            <div className="border-t border-[#1a1a2e] pt-2 mt-2 space-y-1">
              <button onClick={() => setTab('memories')} className="btn-device px-3 py-1.5 text-xs rounded-md focus-ring w-full text-left">
                📖 Memory Album ({currentBuddy.progression?.memories?.length || 0})
              </button>
              <button onClick={() => setTab('species')} className="btn-device px-3 py-1.5 text-xs rounded-md focus-ring w-full text-left">
                📚 Species Book
              </button>
              <button onClick={() => setTab('lore')} className="btn-device px-3 py-1.5 text-xs rounded-md focus-ring w-full text-left">
                📜 Lore Journal
              </button>
              <button onClick={() => setTab('photos')} className="btn-device px-3 py-1.5 text-xs rounded-md focus-ring w-full text-left">
                📸 Photo Album
              </button>
            </div>
            {careJournal.length > 0 && (
              <div className="border-t border-[#1a1a2e] pt-2 mt-2">
                <p className="text-[10px] lcd-text opacity-50 uppercase mb-1">Care Journal</p>
                <div className="space-y-0.5 max-h-28 overflow-y-auto">
                  {careJournal.map((entry, i) => {
                    const act = ACTIONS.find(a => a.type === entry.action);
                    const minutesAgo = Math.floor((Date.now() - entry.timestamp) / 60_000);
                    return (
                      <p key={entry.timestamp + '-' + i} className="text-[10px] lcd-text opacity-60 flex items-center gap-1">
                        <span aria-hidden="true">{act?.icon || '•'}</span>
                        <span className="capitalize">{entry.action}</span>
                        <span className="opacity-40">{minutesAgo < 1 ? 'just now' : minutesAgo + 'm ago'}</span>
                      </p>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'stats' && (
          <div className="animate-fade-in space-y-4">
            <StatBars stats={currentBuddy.stats} />
            <NeedBars needs={currentBuddy.needs} />
          </div>
        )}

        {tab === 'adventure' && <AdventureScreen onBack={() => setTab('main')} />}
        {tab === 'inventory' && <InventoryScreen onBack={() => setTab('main')} />}
        {tab === 'home' && <HomeScreen onBack={() => setTab('main')} />}
        {tab === 'settings' && <SettingsScreen onBack={() => setTab('main')} />}
        {tab === 'memories' && <MemoryAlbum onBack={() => setTab('profile')} />}
        {tab === 'species' && <SpeciesBook book={useGameStore.getState().speciesBook} onBack={() => setTab('profile')} />}
        {tab === 'lore' && <LoreJournal journal={useGameStore.getState().loreJournal} onBack={() => setTab('profile')} />}
        {tab === 'photos' && <PhotoAlbumView photos={useGameStore.getState().photoAlbum} onBack={() => setTab('profile')} />}

        {tab === 'minigames' && !activeGame && (
          <div className="animate-fade-in space-y-3">
            <p className="text-xs lcd-text-accent uppercase tracking-wider">Mini-Games</p>
            <div className="space-y-2">
              {MINIGAMES.map(g => (
                <button key={g.id} onClick={() => setActiveGame(g.id)} className="btn-device w-full p-3 text-xs rounded-md focus-ring flex items-center gap-3">
                  <span className="text-lg" aria-hidden="true">{g.icon}</span>
                  <div className="text-left">
                    <p className="lcd-text-accent">{g.label}</p>
                    <p className="text-[10px] lcd-text opacity-50">{g.desc}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="border-t border-[#1a1a2e] pt-2 mt-2 space-y-1">
              <button onClick={() => setTab('leaderboards')} className="btn-device px-3 py-1.5 text-xs rounded-md focus-ring w-full text-left">
                🏆 Leaderboards
              </button>
              <button onClick={() => setTab('breeding')} className="btn-device px-3 py-1.5 text-xs rounded-md focus-ring w-full text-left">
                🧬 Breeding
              </button>
              <button onClick={() => setTab('market')} className="btn-device px-3 py-1.5 text-xs rounded-md focus-ring w-full text-left">
                🏪 Marketplace
              </button>
              <button onClick={() => setTab('trading')} className="btn-device px-3 py-1.5 text-xs rounded-md focus-ring w-full text-left">
                🤝 Trading
              </button>
              <button onClick={() => setTab('events')} className="btn-device px-3 py-1.5 text-xs rounded-md focus-ring w-full text-left">
                📅 Events
              </button>
            </div>
          </div>
        )}

        {tab === 'minigames' && activeGame && (
          <MinigameRenderer game={activeGame} onBack={() => setActiveGame(null)} onComplete={(score) => handleGameComplete(activeGame, score)} />
        )}

        {tab === 'market' && <MarketScreen onBack={() => setTab('minigames')} />}
        {tab === 'trading' && <TradingScreen onBack={() => setTab('minigames')} />}
        {tab === 'breeding' && <BreedingScreen onBack={() => setTab('minigames')} />}
        {tab === 'leaderboards' && <LeaderboardView onBack={() => setTab('minigames')} />}
        {tab === 'events' && (
          <div className="animate-fade-in space-y-2">
            <DailyLoginView onBack={() => setTab('minigames')} />
            <SeasonalEventsView onBack={() => setTab('minigames')} />
          </div>
        )}

        {accountPromptFeature && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="bg-[#0a0a0f] border border-[#1a1a2e] rounded-lg max-w-sm w-full">
              <AccountPrompt
                feature={accountPromptFeature}
                onClose={() => setAccountPromptFeature('')}
                onComplete={() => {
                  setAccountPromptFeature('');
                  setMessage('Welcome! All features are now unlocked.');
                  setMessageKey(k => k + 1);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
