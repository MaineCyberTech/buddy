'use client';

import { useState, useCallback } from 'react';
import { useGameStore } from '@/lib/buddy/store';
import { createInitialBuddyState } from '@/lib/generation/engine';
import { saveGame } from '@/lib/storage/indexeddb';

export function HatchFlow() {
  const [step, setStep] = useState<'landing' | 'hatching' | 'reveal' | 'nickname'>('landing');
  const [newBuddy, setNewBuddy] = useState<ReturnType<typeof createInitialBuddyState> | null>(null);
  const [nickname, setNickname] = useState('');
  const setBuddy = useGameStore((s) => s.setBuddy);
  const setScreen = useGameStore((s) => s.setScreen);

  const handleHatch = useCallback(() => {
    setStep('hatching');
    const guestId = 'guest-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const buddy = createInitialBuddyState(guestId);
    setNewBuddy(buddy);
    useGameStore.getState().setGuestId(guestId);
    setTimeout(() => setStep('reveal'), 2000);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!newBuddy) return;
    const finalBuddy = {
      ...newBuddy,
      identity: { ...newBuddy.identity, nickname: nickname || newBuddy.identity.speciesName },
    };
    setBuddy(finalBuddy);
    try {
      await saveGame({
        version: 1,
        guestId: useGameStore.getState().guestId,
        buddy: finalBuddy,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } catch (err) {
      console.error('Save after hatch failed:', err);
    }
    setScreen('main');
  }, [newBuddy, nickname, setBuddy, setScreen]);

  if (step === 'landing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 lcd-screen">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4 lcd-text" aria-hidden="true">
            {'{ }'}
          </div>
          <h1 className="text-3xl font-lcd lcd-text-accent mb-2">BUDDY</h1>
          <p className="text-sm lcd-text opacity-70 mb-8">
            A tiny friend awaits.
          </p>
          <button
            onClick={handleHatch}
            className="btn-device px-8 py-4 text-lg rounded-lg btn-primary focus-ring"
            aria-label="Hatch your buddy"
          >
            HATCH
          </button>
        </div>
      </div>
    );
  }

  if (step === 'hatching') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 lcd-screen" role="status" aria-live="polite">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-hatch-shake" aria-hidden="true">
            {'{ }'}
          </div>
          <p className="lcd-text-accent text-lg animate-pulse">HATCHING...</p>
          <div className="mt-4 w-32 h-1 mx-auto bg-lcd-dark rounded-full overflow-hidden">
            <div className="h-full bg-lcd-accent animate-pulse rounded-full" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    );
  }

  if (step === 'reveal' && newBuddy) {
    const species = newBuddy.identity;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 lcd-screen" role="status" aria-live="polite">
        <div className="text-center max-w-md animate-fade-in">
          <div className="mb-4">
            <span className={`text-lg font-bold rarity-${species.rarity}`}>
              {species.rarity.toUpperCase()}
            </span>
            {species.isShiny && (
              <span className="rarity-shiny ml-2">✦ SHINY ✦</span>
            )}
          </div>
          <pre className="font-lcd text-xl lcd-text mb-4 leading-tight" aria-hidden="true">
            {['  ___', ' /...\\ ', '|_____|', '  ||||'].join('\n')}
          </pre>
          <h2 className="text-2xl font-lcd lcd-text-accent mb-2">
            A {species.speciesName}!
          </h2>
          <p className="sr-only">A {species.rarity} {species.speciesName}{species.isShiny ? ' Shiny variant' : ''} was hatched.</p>
          <button
            onClick={() => setStep('nickname')}
            className="btn-device px-6 py-3 rounded-lg btn-primary focus-ring mt-4"
          >
            NAME YOUR BUDDY
          </button>
        </div>
      </div>
    );
  }

  if (step === 'nickname' && newBuddy) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 lcd-screen">
        <div className="text-center max-w-md animate-slide-up">
          <h2 className="text-xl font-lcd lcd-text-accent mb-4">NAME YOUR BUDDY</h2>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value.slice(0, 16))}
            placeholder={newBuddy.identity.speciesName}
            maxLength={16}
            className="w-full px-4 py-3 bg-lcd-dark border border-[#2a2a4a] rounded-lg text-center lcd-text font-lcd text-lg focus:outline-none focus:border-lcd-accent focus-ring"
            aria-label="Buddy nickname"
            autoFocus
          />
          <p className="text-xs lcd-text opacity-50 mt-2">max 16 characters</p>
          <button
            onClick={handleConfirm}
            className="btn-device px-8 py-4 text-lg rounded-lg btn-primary focus-ring mt-6"
            aria-label="Start with your buddy"
          >
            START
          </button>
        </div>
      </div>
    );
  }

  return null;
}