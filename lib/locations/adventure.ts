import { SeededRNG } from '@/lib/generation/rng';
import {
  BuddyState,
  InventoryState,
  AdventureResult,
} from '@/lib/generation/types';
import { LOCATION_MAP } from '@/data/locations';
import { LOOT_TABLE_MAP } from '@/data/loot-tables';
import { levelUpXp } from '@/lib/progression/lifecycle';

function rollLoot(rng: SeededRNG, lootTableId: string): { coins: number; items: { id: string; quantity: number }[]; xpGain: number } {
  const table = LOOT_TABLE_MAP.get(lootTableId);
  if (!table) return { coins: 0, items: [], xpGain: 0 };

  const coins = rng.nextInt(table.coinMin, table.coinMax);
  const items: { id: string; quantity: number }[] = [];

  for (const entry of table.entries) {
    if (rng.bool(entry.weight / 100)) {
      const qty = rng.nextInt(entry.minQuantity, entry.maxQuantity);
      items.push({ id: entry.itemId, quantity: qty });
    }
  }

  return { coins, items, xpGain: table.xpGain };
}

function calculateSuccess(
  rng: SeededRNG,
  buddy: BuddyState,
  location: import('@/lib/generation/types').LocationDefinition
): boolean {
  const statKeys = Object.keys(location.statChecks) as (keyof typeof location.statChecks)[];
  if (statKeys.length === 0) return true;
  let checkScore = 0;
  let totalWeight = 0;

  for (const statName of statKeys) {
    const required = location.statChecks[statName] || 0;
    const actual = buddy.stats[statName as keyof typeof buddy.stats] || 0;
    const ratio = actual / Math.max(1, required);
    checkScore += ratio;
    totalWeight += 1;
  }

  const avgRatio = checkScore / totalWeight;
  const baseChance = Math.min(0.95, avgRatio * 0.7);

  const luckModifier = rng.next() * 0.3;
  return baseChance + luckModifier >= 0.5;
}

function pickEncounter(rng: SeededRNG, location: import('@/lib/generation/types').LocationDefinition): string {
  if (location.encounterPool.length === 0) return '';
  return rng.pick(location.encounterPool);
}

export function runAdventure(
  buddy: BuddyState,
  inventory: InventoryState,
  locationId: string,
  seed?: number
): AdventureResult {
  const location = LOCATION_MAP.get(locationId);
  if (!location) {
    return {
      success: false,
      locationId,
      message: 'Location not found.',
      coinsEarned: 0,
      itemsReceived: [],
      xpGained: 0,
      bondChange: 0,
      statChanges: {},
      energyCost: 0,
      encounterText: '',
    };
  }

  const rng = new SeededRNG(seed || Date.now());

  if (buddy.needs.energy < location.energyCost) {
    return {
      success: false,
      locationId,
      message: 'Too tired! Let your buddy rest first.',
      coinsEarned: 0,
      itemsReceived: [],
      xpGained: 0,
      bondChange: 0,
      statChanges: {},
      energyCost: 0,
      encounterText: '',
    };
  }

  const success = calculateSuccess(rng, buddy, location);
  const loot = rollLoot(rng, location.lootTableId);
  const encounterText = pickEncounter(rng, location);

  const energyCost = location.energyCost;
  const xpGained = success ? (location.statChecks.courage || 10) + loot.xpGain : 3;
  const bondChange = success ? 2 : 1;
  const coinsEarned = success ? loot.coins : Math.floor(loot.coins / 2);
  const itemsReceived = success ? loot.items : [];

  const message = success
    ? `Adventure complete! ${encounterText}`
    : `The adventure was tough this time. ${encounterText}`;

  return {
    success,
    locationId,
    message,
    coinsEarned,
    itemsReceived,
    xpGained,
    bondChange,
    statChanges: {},
    energyCost,
    encounterText,
  };
}

export function applyAdventureResult(
  buddy: BuddyState,
  inventory: InventoryState,
  result: AdventureResult
): { buddy: BuddyState; inventory: InventoryState } {
  const newBuddy = { ...buddy };
  const newNeeds = { ...buddy.needs };
  const newInventory = { ...inventory };

  newNeeds.energy = Math.max(0, newNeeds.energy - result.energyCost);
  newNeeds.happiness = Math.min(100, newNeeds.happiness + (result.success ? 5 : -5));
  newNeeds.hunger = Math.max(0, newNeeds.hunger - (result.success ? 5 : 3));

  newBuddy.needs = newNeeds;
  newBuddy.xp += result.xpGained;
  newBuddy.bond = Math.min(100, newBuddy.bond + result.bondChange);
  newBuddy.lastInteraction = Date.now();

  let newLevel = newBuddy.level;
  let remainingXp = newBuddy.xp;
  while (remainingXp >= levelUpXp(newLevel)) {
    remainingXp -= levelUpXp(newLevel);
    newLevel++;
  }
  newBuddy.level = newLevel;

  const newItems = [...newInventory.items];
  for (const item of result.itemsReceived) {
    const existing = newItems.find(i => i.id === item.id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      newItems.push({ ...item });
    }
  }

  return {
    buddy: newBuddy,
    inventory: { coins: newInventory.coins + result.coinsEarned, items: newItems },
  };
}

