'use client';

import { useState, useCallback } from 'react';
import { useGameStore } from '@/lib/buddy/store';
import { runAdventure, applyAdventureResult } from '@/lib/locations/adventure';
import { EXPLORE_LOCATIONS } from '@/data/locations';
import { InventoryItem, LocationDefinition, AdventureResult } from '@/lib/generation/types';
import { saveGame } from '@/lib/storage/indexeddb';
import { checkEvolution, getStageName } from '@/lib/progression/lifecycle';
import { checkAchievements } from '@/data/achievements';

interface AdventureScreenProps {
  onBack: () => void;
}

export function AdventureScreen({ onBack }: AdventureScreenProps) {
  const buddy = useGameStore(s => s.buddy);
  const inventory = useGameStore(s => s.inventory);
  const setBuddy = useGameStore(s => s.setBuddy);
  const setInventory = useGameStore(s => s.setInventory);
  const setCurrentAdventureResult = useGameStore(s => s.setCurrentAdventureResult);
  const guestId = useGameStore(s => s.guestId);
  const [selectedLocation, setSelectedLocation] = useState<LocationDefinition | null>(null);
  const [result, setResult] = useState<AdventureResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [gateMessage, setGateMessage] = useState('');

  const isGuest = guestId.startsWith('guest-');
  const availableLocations = isGuest
    ? EXPLORE_LOCATIONS.filter(l => !l.requiresAccount)
    : EXPLORE_LOCATIONS;

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

    let resultMessage = adventureResult.message;
    let finalBuddy = updatedBuddy;

    if (finalBuddy.progression) {
      finalBuddy = {
        ...finalBuddy,
        progression: {
          ...finalBuddy.progression,
          totalAdventures: finalBuddy.progression.totalAdventures + 1,
        },
      };
    }

    const evolvedStage = checkEvolution(finalBuddy);
    if (evolvedStage && finalBuddy.progression) {
      finalBuddy = {
        ...finalBuddy,
        progression: { ...finalBuddy.progression, lifecycle: evolvedStage },
      };
      resultMessage += ` ${getStageName(evolvedStage)} stage unlocked!`;
    }

    const unlocked = finalBuddy.progression?.achievements || [];
    const totalAdv = finalBuddy.progression?.totalAdventures || 0;
    const newAchievements = checkAchievements(finalBuddy, updatedInv, totalAdv, unlocked);
    let finalInv = updatedInv;
    if (newAchievements.length > 0) {
      const ids = newAchievements.map(a => a.id);
      let newItems: InventoryItem[] = [...finalInv.items];
      let coinReward = 0;
      for (const a of newAchievements) {
        coinReward += a.rewardCoins || 0;
        if (a.rewardItemId) {
          const existing = newItems.find(i => i.id === a.rewardItemId);
          if (existing) {
            existing.quantity += 1;
          } else {
            newItems.push({ id: a.rewardItemId, quantity: 1 });
          }
        }
      }
      finalInv = { coins: finalInv.coins + coinReward, items: newItems };
      resultMessage += ` Achievement: ${newAchievements.map(a => a.name).join(', ')}!`;

      if (finalBuddy.progression) {
        finalBuddy = {
          ...finalBuddy,
          progression: { ...finalBuddy.progression, achievements: [...unlocked, ...ids] },
        };
      }
    }

    const finalResult: AdventureResult = { ...adventureResult, message: resultMessage };

    setBuddy(finalBuddy);
    setInventory(finalInv);
    setResult(finalResult);
    setCurrentAdventureResult(finalResult);
    setLoading(false);

    try {
      const storeState = useGameStore.getState();
      await saveGame({
        version: 2,
        guestId,
        buddy: finalBuddy,
        inventory: finalInv,
        createdAt: finalBuddy.identity.generatedAt,
        updatedAt: Date.now(),
        placedDecor: storeState.placedDecor,
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