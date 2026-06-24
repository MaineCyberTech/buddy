'use client';

import { useState } from 'react';
import { BuddyState } from '@/lib/generation/types';
import { breedBuddies, canBreed, BreedingResult } from '@/lib/social/breeding';
import { useGameStore } from '@/lib/buddy/store';
import { SoundEngine } from '@/lib/sound';
import { saveGame } from '@/lib/storage/indexeddb';

interface BreedingScreenProps {
  onBack: () => void;
}

export function BreedingScreen({ onBack }: BreedingScreenProps) {
  const buddy = useGameStore(s => s.buddy);
  const setBuddy = useGameStore(s => s.setBuddy);
  const guestId = useGameStore(s => s.guestId);
  const inventory = useGameStore(s => s.inventory);
  const [result, setResult] = useState<BreedingResult | null>(null);
  const [error, setError] = useState('');
  const [breedCount, setBreedCount] = useState(0);
  const [saving, setSaving] = useState(false);

  if (!buddy) return null;

  const canBreedNow = canBreed(buddy) && breedCount < 3;

  const handleBreed = async () => {
    if (!canBreedNow || !buddy) return;
    const secondBuddy = useGameStore.getState().buddy;
    if (!secondBuddy) { setError('No buddy to breed with.'); return; }
    if (!canBreed(secondBuddy)) { setError('Both buddies must be Adult or Elder stage.'); return; }
    try { setSaving(true); SoundEngine.evolve(); } catch {}
    const breedingResult = breedBuddies({ parentA: buddy, parentB: secondBuddy });
    setResult(breedingResult);
    setBreedCount(c => c + 1);
    setBuddy(breedingResult.offspring);
    try {
      await saveGame({ version: 2, guestId, buddy: breedingResult.offspring, createdAt: Date.now(), updatedAt: Date.now(), inventory });
    } catch { /* ignore */ }
    setSaving(false);
  };

  return (
    <div className="animate-fade-in space-y-3">
      <p className="text-xs lcd-text-accent uppercase tracking-wider">Breeding</p>
      {!result ? (
        <>
          {!canBreedNow && <p className="text-xs lcd-text-warn">Buddy must be Adult/Elder stage. ({breedCount}/3 breeds used)</p>}
          {error && <p className="text-xs lcd-text-warn">{error}</p>}
          {canBreedNow && (
            <button onClick={handleBreed} disabled={saving} className="btn-device w-full py-4 text-sm rounded-md focus-ring">
              {saving ? 'BREEDING...' : `BREED (${3 - breedCount} left)`}
            </button>
          )}
          <p className="text-[10px] lcd-text opacity-50">Your buddy is a {buddy.identity.speciesName} ({buddy.identity.rarity})</p>
        </>
      ) : (
        <div className="space-y-2 text-center">
          <p className="text-xs lcd-text-accent">A new buddy is born!</p>
          <p className="text-sm lcd-text">{result.offspring.identity.speciesName}</p>
          <p className="text-[10px] lcd-text opacity-70">
            <span className={`rarity-${result.offspring.identity.rarity}`}>
              {result.rarityInheritance.toUpperCase()} — {result.offspring.identity.rarity}
            </span>
          </p>
          <p className="text-[10px] lcd-text opacity-50">Eyes: {result.offspring.identity.eyes}</p>
          <button onClick={() => { setResult(null); setBreedCount(0); }} className="btn-device px-4 py-2 text-xs rounded-md focus-ring">OK</button>
        </div>
      )}
      <div className="border-t border-[#1a1a2e] pt-2 space-y-1">
        <p className="text-[10px] lcd-text opacity-50">Requirements: Adult/Elder stage buddy</p>
        <p className="text-[10px] lcd-text opacity-50">Max 3 breeds per session</p>
      </div>
      <button onClick={onBack} className="btn-device px-4 py-2 text-xs rounded-md focus-ring">BACK</button>
    </div>
  );
}
