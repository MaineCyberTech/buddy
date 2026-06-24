import { createInitialBuddyState } from '@/lib/generation/engine';
import { BuddyState, Rarity } from '@/lib/generation/types';

export interface BreedingPair {
  parentA: BuddyState;
  parentB: BuddyState;
}

export interface BreedingResult {
  offspring: BuddyState;
  rarityInheritance: 'parent' | 'mixed' | 'upgraded';
}

function combineSeed(parentA: BuddyState, parentB: BuddyState): string {
  const combined = parentA.identity.seed.slice(0, 8) + parentB.identity.seed.slice(0, 8);
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'breed-' + Math.abs(hash).toString(36).slice(0, 12);
}

const RARITY_ORDER: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

function getRarityIndex(r: Rarity): number {
  return RARITY_ORDER.indexOf(r);
}

function inheritRarity(parentA: BuddyState, parentB: BuddyState): { rarity: Rarity; inheritance: BreedingResult['rarityInheritance'] } {
  const idxA = getRarityIndex(parentA.identity.rarity);
  const idxB = getRarityIndex(parentB.identity.rarity);
  const maxIdx = Math.max(idxA, idxB);
  const roll = Math.random();
  if (roll < 0.4) {
    return { rarity: RARITY_ORDER[maxIdx], inheritance: 'parent' };
  }
  if (roll < 0.7) {
    const mid = Math.floor((idxA + idxB) / 2);
    return { rarity: RARITY_ORDER[mid], inheritance: 'mixed' };
  }
  const upgradeIdx = Math.min(maxIdx + 1, RARITY_ORDER.length - 1);
  return { rarity: RARITY_ORDER[upgradeIdx], inheritance: 'upgraded' };
}

export function breedBuddies(pair: BreedingPair): BreedingResult {
  const seed = combineSeed(pair.parentA, pair.parentB);
  const { rarity, inheritance } = inheritRarity(pair.parentA, pair.parentB);
  const offspring = createInitialBuddyState(seed);
  offspring.identity.rarity = rarity;
  offspring.identity.seed = seed;
  const mixedEyes = pair.parentA.identity.eyes.slice(0, 1) + pair.parentB.identity.eyes.slice(1);
  offspring.identity.eyes = mixedEyes.length === 2 ? mixedEyes : offspring.identity.eyes;
  return { offspring, rarityInheritance: inheritance };
}

export function canBreed(buddy: BuddyState): boolean {
  const stage = buddy.progression?.lifecycle;
  return stage === 'adult' || stage === 'elder';
}
