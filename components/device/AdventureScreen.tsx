'use client';

import { useState, useCallback } from 'react';
import { useGameStore } from '@/lib/buddy/store';
import { runAdventure, applyAdventureResult } from '@/lib/locations/adventure';
import { LOCATIONS } from '@/data/locations';
import { LocationDefinition, AdventureResult } from '@/lib/generation/types';
import { saveGame } from '@/lib/storage/indexeddb';
import { checkEvolution, getStageName } from '@/lib/progression/lifecycle';
import { checkAchievements } from '@/data/achievements';

interface AdventureScreenProps {
  onBack: () => void;
}

export function AdventureScreen({ onBack }: AdventureScreenProps) {
  const { buddy, inventory, setBuddy, setInventory, setCurrentAdventureResult, guestId } = useGameStore();
  const [selectedLocation, setSelectedLocation] = useState<LocationDefinition | null>(null);
  const [result, setResult] = useState<AdventureResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [gateMessage, setGateMessage] = useState('');

  const isGuest = guestId.startsWith('guest-');
  const availableLocations = isGuest
    ? LOCATIONS.filter(l => !l.requiresAccount)
    : LOCATIONS;

  const handleAdventure = useCallback(async (location: LocationDefinition) => {
    if (!buddy) return;

    if (isGuest && location.requiresAccount) {
      setGateMessage(`Create an account to explore ${location.name}! Sign up to unlock all locations, cloud saves, and more.`);
      setTimeout(() => setGateMessage(''), 4000);
      return;
    }

    setSelectedLocation(location);
    setLoading(true);

    const seed = Date.now();
    const adventureResult = runAdventure(buddy, inventory, location.id, seed);

    await new Promise(r => setTimeout(r, 1500));

    const { buddy: updatedBuddy, inventory: updatedInv } = applyAdventureResult(buddy, inventory, adventureResult);

    const newProgression = updatedBuddy.progression
      ? { ...updatedBuddy.progression, totalAdventures: updatedBuddy.progression.totalAdventures + 1 }
      : undefined;
    if (newProgression) updatedBuddy.progression = newProgression;

    const evolvedStage = checkEvolution(updatedBuddy);
    if (evolvedStage && updatedBuddy.progression) {
      updatedBuddy.progression = { ...updatedBuddy.progression, lifecycle: evolvedStage };
      adventureResult.message += ` ${getStageName(evolvedStage)} stage unlocked!`;
    }

    const unlocked = updatedBuddy.progression?.achievements || [];
    const totalAdv = updatedBuddy.progression?.totalAdventures || 0;
    const newAchievements = checkAchievements(updatedBuddy, updatedInv, totalAdv, unlocked);
    if (newAchievements.length > 0) {
      const ids = newAchievements.map(a => a.id);
      if (updatedBuddy.progression) {
        updatedBuddy.progression = { ...updatedBuddy.progression, achievements: [...unlocked, ...ids] };
      }
      let coinReward = 0;
      for (const a of newAchievements) {
        coinReward += a.rewardCoins || 0;
        if (a.rewardItemId) {
          updatedInv.items.push({ id: a.rewardItemId, quantity: 1 });
        }
      }
      updatedInv.coins += coinReward;
      adventureResult.message += ` Achievement: ${newAchievements.map(a => a.name).join(', ')}!`;
    }

    setBuddy(updatedBuddy);
    setInventory(updatedInv);
    setResult(adventureResult);
    setCurrentAdventureResult(adventureResult);
    setLoading(false);

    try {
      await saveGame({
        version: 2,
        guestId,
        buddy: updatedBuddy,
        inventory: updatedInv,
        createdAt: updatedBuddy.identity.generatedAt,
        updatedAt: Date.now(),
      });
    } catch (err) {
      console.error('Save after adventure failed:', err);
    }
  }, [buddy, inventory, setBuddy, setInventory, setCurrentAdventureResult, guestId, isGuest]);

  const handleBack = useCallback(() => {
    setSelectedLocation(null);
    setResult(null);
    onBack();
  }, [onBack]);

  if (loading && selectedLocation) {
    return (
      <div className="animate-fade-in p-4 text-center" role="status" aria-live="polite">
        <div className="lcd-text-accent text-lg animate-pulse font-lcd mb-4">EXPLORING {selectedLocation.name.toUpperCase()}...</div>
        <pre className="font-lcd text-xs lcd-text opacity-50">
          {selectedLocation.backgroundAscii.join('\n')}
        </pre>
      </div>
    );
  }

  if (result && selectedLocation) {
    return (
      <div className="animate-fade-in space-y-3 p-2">
        <div className="lcd-text-accent font-lcd text-sm">
          {selectedLocation.name} — {result.success ? 'SUCCESS' : 'FAILED'}
        </div>
        <p className="text-xs lcd-text opacity-80">{result.message}</p>
        <div className="space-y-1 text-xs lcd-text">
          <p>Coins: +{result.coinsEarned}</p>
          <p>XP: +{result.xpGained}</p>
          <p>Bond: +{result.bondChange}</p>
          {result.itemsReceived.length > 0 && (
            <div>
              <p className="lcd-text-accent mt-1">Items found:</p>
              {result.itemsReceived.map((item, i) => (
                <p key={i} className="opacity-70">- {item.id} x{item.quantity}</p>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleBack}
          className="btn-device px-4 py-2 text-xs rounded-md focus-ring mt-2"
        >
          BACK
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-2">
      <p className="text-xs lcd-text-accent uppercase tracking-wider mb-2">
        {isGuest ? 'Guest Locations' : 'Locations'}
      </p>
      {gateMessage && (
        <div className="text-xs rarity-shiny animate-fade-in px-2 py-1" role="status" aria-live="polite">
          {gateMessage}
        </div>
      )}
      {isGuest && (
        <p className="text-[10px] lcd-text-warn opacity-70">Some locations require an account.</p>
      )}
      <div className="space-y-1.5">
        {availableLocations.map((loc) => {
          const energyOk = buddy ? buddy.needs.energy >= loc.energyCost : false;
          return (
            <button
              key={loc.id}
              onClick={() => handleAdventure(loc)}
              disabled={!energyOk || !buddy}
              className="btn-device w-full px-3 py-2 text-xs rounded-md focus-ring text-left disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label={`${loc.name} - ${loc.description}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="lcd-text-accent">{loc.name}</span>
                  <span className="text-[10px] opacity-50 ml-2">{loc.riskProfile.toUpperCase()}</span>
                </div>
                <span className="text-[10px] opacity-60">⚡{loc.energyCost}</span>
              </div>
              <p className="text-[10px] opacity-60 mt-0.5">{loc.description}</p>
            </button>
          );
        })}
      </div>
      {buddy && buddy.needs.energy < 5 && (
        <p className="text-[10px] lcd-text-warn mt-1">Low energy! Rest your buddy before adventuring.</p>
      )}
    </div>
  );
}