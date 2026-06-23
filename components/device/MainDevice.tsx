'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { BuddyState } from '@/lib/generation/types';
import { useGameStore } from '@/lib/buddy/store';
import { applyAction, applyOfflineDecay, CareActionType } from '@/lib/actions/care';
import { saveGame } from '@/lib/storage/indexeddb';
import { LcdDisplay } from '@/components/device/LcdDisplay';
import { StatBars, NeedBars } from '@/components/ui/StatBars';

interface MainDeviceProps {
  buddy: BuddyState;
  initialTab?: 'main' | 'profile' | 'stats';
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
  const [tab, setTab] = useState<'main' | 'profile' | 'stats'>(initialTab);
  const [message, setMessage] = useState('');
  const [messageKey, setMessageKey] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const updateBuddy = useGameStore((s) => s.updateBuddy);
  const buddyRef = useRef(initialBuddy);

  useEffect(() => {
    const buddy = buddyRef.current;
    const elapsed = Date.now() - buddy.lastInteraction;
    if (elapsed > 60_000) {
      const decayed = applyOfflineDecay(buddy, elapsed);
      setCurrentBuddy(decayed);
      updateBuddy({ needs: decayed.needs, mood: decayed.mood, health: decayed.health });
      setMessage('Your buddy missed you!');
      setMessageKey((k) => k + 1);
    }
  }, [updateBuddy]);

  const handleAction = useCallback(
    async (action: CareActionType) => {
      const { buddy: updated, result } = applyAction(currentBuddy, action);
      setCurrentBuddy(updated);
      updateBuddy(updated);
      setMessage(result.message);
      setMessageKey((k) => k + 1);

      try {
        await saveGame({
          version: 1,
          guestId: useGameStore.getState().guestId,
          buddy: updated,
          createdAt: updated.identity.generatedAt,
          updatedAt: Date.now(),
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

        <div className="flex justify-center gap-4 border-t border-[#1a1a2e] pt-4 mt-2">
          <button
            onClick={() => setTab('main')}
            className={`text-xs font-lcd focus-ring px-3 py-1 rounded ${tab === 'main' ? 'lcd-text-accent border-b border-lcd-accent' : 'lcd-text opacity-50'}`}
          >
            DEVICE
          </button>
          <button
            onClick={() => setTab('profile')}
            className={`text-xs font-lcd focus-ring px-3 py-1 rounded ${tab === 'profile' ? 'lcd-text-accent border-b border-lcd-accent' : 'lcd-text opacity-50'}`}
          >
            PROFILE
          </button>
          <button
            onClick={() => setTab('stats')}
            className={`text-xs font-lcd focus-ring px-3 py-1 rounded ${tab === 'stats' ? 'lcd-text-accent border-b border-lcd-accent' : 'lcd-text opacity-50'}`}
          >
            STATS
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
      </div>
    </div>
  );
}