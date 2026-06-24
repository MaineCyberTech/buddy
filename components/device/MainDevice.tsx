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
import { getStageName, checkEvolution } from '@/lib/progression/lifecycle';
import { checkAchievements, ACHIEVEMENTS } from '@/data/achievements';

interface MainDeviceProps {
  buddy: BuddyState;
  initialTab?: 'main' | 'profile' | 'stats' | 'adventure' | 'inventory' | 'home';
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

export function MainDevice({ buddy: initialBuddy, initialTab = 'main' }: MainDeviceProps) {
  const [currentBuddy, setCurrentBuddy] = useState(initialBuddy);
  const [tab, setTab] = useState<'main' | 'profile' | 'stats' | 'adventure' | 'inventory' | 'home'>(initialTab);
  const [message, setMessage] = useState('');
  const [messageKey, setMessageKey] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [achievementMessage, setAchievementMessage] = useState('');
  const [achievementKey, setAchievementKey] = useState(0);
  const updateBuddy = useGameStore((s) => s.updateBuddy);

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

  const handleAction = useCallback(
    async (action: CareActionType) => {
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
        });
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus(''), 2000);
      } catch {
        setAutoSaveStatus('save failed');
        setTimeout(() => setAutoSaveStatus(''), 3000);
      }
    },
    [currentBuddy, updateBuddy]
  );

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
          <h1 className="font-lcd text-sm lcd-text-accent opacity-70">
            BUDDY v0.1
          </h1>
          <div className="flex items-center gap-2 text-xs">
            <span className={`lcd-text opacity-50`}>
              Lv.{currentBuddy.level}
            </span>
            {autoSaveStatus && (
              <span className={`lcd-text-${autoSaveStatus === 'saved' ? 'accent' : 'danger'} text-xs`}>
                {autoSaveStatus}
              </span>
            )}
          </div>
        </div>

        <LcdDisplay buddy={currentBuddy} />

        {message && (
          <div
            key={messageKey}
            className="text-center text-sm lcd-text-accent animate-fade-in px-2"
            role="status"
            aria-live="polite"
          >
            {message}
          </div>
        )}
        {achievementMessage && (
          <div
            key={achievementKey}
            className="text-center text-sm rarity-shiny animate-fade-in px-2"
            role="status"
            aria-live="polite"
          >
            {achievementMessage}
          </div>
        )}

        <div className="flex items-center justify-center gap-2">
          <span className={`text-sm font-lcd ${moodColors[currentBuddy.mood] || 'lcd-text'}`}>
            {currentBuddy.mood.toUpperCase()}
          </span>
          <span className="text-xs lcd-text opacity-50">
            ♥ {currentBuddy.bond}
          </span>
          <span className="text-xs lcd-text opacity-50">
            HP {currentBuddy.health}
          </span>
        </div>

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

        <div className="flex justify-center gap-2 border-t border-[#1a1a2e] pt-3 mt-2 flex-wrap">
          <button
            onClick={() => setTab('main')}
            className={`text-xs font-lcd focus-ring px-2 py-1 rounded ${tab === 'main' ? 'lcd-text-accent border-b border-lcd-accent' : 'lcd-text opacity-50'}`}
          >
            DEVICE
          </button>
          <button
            onClick={() => setTab('profile')}
            className={`text-xs font-lcd focus-ring px-2 py-1 rounded ${tab === 'profile' ? 'lcd-text-accent border-b border-lcd-accent' : 'lcd-text opacity-50'}`}
          >
            PROFILE
          </button>
          <button
            onClick={() => setTab('stats')}
            className={`text-xs font-lcd focus-ring px-2 py-1 rounded ${tab === 'stats' ? 'lcd-text-accent border-b border-lcd-accent' : 'lcd-text opacity-50'}`}
          >
            STATS
          </button>
          <button
            onClick={() => setTab('home')}
            className={`text-xs font-lcd focus-ring px-2 py-1 rounded ${tab === 'home' ? 'lcd-text-accent border-b border-lcd-accent' : 'lcd-text opacity-50'}`}
          >
            HOME
          </button>
          <button
            onClick={() => setTab('adventure')}
            className={`text-xs font-lcd focus-ring px-2 py-1 rounded ${tab === 'adventure' ? 'lcd-text-accent border-b border-lcd-accent' : 'lcd-text opacity-50'}`}
          >
            EXPLORE
          </button>
          <button
            onClick={() => setTab('inventory')}
            className={`text-xs font-lcd focus-ring px-2 py-1 rounded ${tab === 'inventory' ? 'lcd-text-accent border-b border-lcd-accent' : 'lcd-text opacity-50'}`}
          >
            ITEMS
          </button>
        </div>

        {tab === 'profile' && (
          <div className="animate-fade-in space-y-2 text-sm">
            <p className="lcd-text-accent font-lcd">{currentBuddy.identity.nickname}</p>
            <p className="lcd-text text-xs">
              the {currentBuddy.identity.speciesName}
            </p>
            <p className="lcd-text text-xs opacity-70">
              <span className={`rarity-${currentBuddy.identity.rarity}`}>
                {currentBuddy.identity.rarity.toUpperCase()}
              </span>
              {currentBuddy.identity.isShiny && (
                <span className="rarity-shiny ml-2">✦ SHINY ✦</span>
              )}
            </p>
            {currentBuddy.progression && (
              <p className="text-xs lcd-text-accent opacity-80">
                {getStageName(currentBuddy.progression.lifecycle)} stage
              </p>
            )}
            <p className="lcd-text text-xs mt-2 opacity-60">
              {currentBuddy.personality.name} personality
            </p>
            <p className="lcd-text text-xs opacity-50 italic">
              "{currentBuddy.personality.description}"
            </p>
            <p className="lcd-text text-xs mt-2">
              Hat: {currentBuddy.identity.hat}
            </p>
          </div>
        )}

        {tab === 'stats' && (
          <div className="animate-fade-in space-y-4">
            <StatBars stats={currentBuddy.stats} />
            <NeedBars needs={currentBuddy.needs} />
          </div>
        )}

        {tab === 'adventure' && (
          <AdventureScreen onBack={() => setTab('main')} />
        )}

        {tab === 'inventory' && (
          <InventoryScreen onBack={() => setTab('main')} />
        )}

        {tab === 'home' && (
          <HomeScreen onBack={() => setTab('main')} />
        )}
      </div>
    </div>
  );
}