import { SeededRNG } from '@/lib/generation/rng';
import { generateSeed, deriveSeeds } from '@/lib/generation/hash';
import { generateStats } from '@/lib/stats/engine';
import { pickPersonality } from '@/lib/personality/engine';
import {
  BuddyIdentity,
  BuddyState,
  BuddyNeeds,
  Rarity,
  RARITY_WEIGHTS,
  SHINY_CHANCE,
} from '@/lib/generation/types';
import { SPECIES } from '@/data/species';
import { EYES } from '@/data/eyes';
import { HATS } from '@/data/hats';

const RARITY_KEYS: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const RARITY_BIAS: Record<Rarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 5,
};

export interface GeneratedBuddy {
  identity: BuddyIdentity;
  stats: import('@/lib/generation/types').BuddyStats;
  personality: import('@/lib/generation/types').BuddyPersonality;
  needs: BuddyNeeds;
}

export function generateBuddy(userId: string, nickname?: string): GeneratedBuddy {
  const seed = generateSeed(userId);
  const seeds = deriveSeeds(seed, 10);
  const rng = new SeededRNG(seeds[0]);

  const species = rng.weightedPick(SPECIES, SPECIES.map(s => {
    const rarityWeight = RARITY_WEIGHTS[s.rarity];
    return rarityWeight;
  }));

  const rarity = species.rarity;
  const isShiny = rng.bool(SHINY_CHANCE);

  const eyeRng = new SeededRNG(seeds[1]);
  const eyes = eyeRng.pick(EYES);

  const hatRng = new SeededRNG(seeds[2]);
  const hat = hatRng.pick(HATS);

  const statRng = new SeededRNG(seeds[3]);
  const stats = generateStats(statRng, species.favoredStat, RARITY_BIAS[rarity]);

  const personalityRng = new SeededRNG(seeds[4]);
  const personality = pickPersonality(personalityRng, species.personalityBiases);

  const needs: BuddyNeeds = {
    hunger: 50,
    happiness: 50,
    cleanliness: 80,
    energy: 80,
    social: 50,
  };

  const identity: BuddyIdentity = {
    speciesId: species.id,
    speciesName: species.name,
    nickname: nickname || species.name,
    rarity,
    isShiny,
    hat,
    eyes,
    generatedAt: Date.now(),
    seed,
  };

  return { identity, stats, personality, needs };
}

export function createInitialBuddyState(userId: string, nickname?: string): BuddyState {
  const generated = generateBuddy(userId, nickname);

  return {
    identity: generated.identity,
    stats: generated.stats,
    needs: generated.needs,
    personality: generated.personality,
    level: 1,
    xp: 0,
    bond: 0,
    mood: 'neutral',
    health: 100,
    lastInteraction: Date.now(),
    totalCareActions: 0,
  };
}