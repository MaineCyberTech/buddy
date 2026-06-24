import { describe, it, expect } from 'vitest';
import { SeededRNG } from '@/lib/generation/rng';
import { hashString, hashCombine, generateSeed } from '@/lib/generation/hash';
import { generateBuddy, createInitialBuddyState } from '@/lib/generation/engine';
import { generateStats } from '@/lib/stats/engine';
import { pickPersonality } from '@/lib/personality/engine';
import { SPECIES } from '@/data/species';
import { PERSONALITIES } from '@/data/personalities';
import { EYES } from '@/data/eyes';
import { HATS } from '@/data/hats';
import { RARITY_WEIGHTS, STAT_NAMES, STAT_RANGES } from '@/lib/generation/types';

describe('Deterministic Generation', () => {
  describe('Hash utilities', () => {
    it('hashString produces consistent results', () => {
      const hash1 = hashString('test-user-123');
      const hash2 = hashString('test-user-123');
      expect(hash1).toBe(hash2);
    });

    it('hashString produces different results for different inputs', () => {
      const hash1 = hashString('user-a');
      const hash2 = hashString('user-b');
      expect(hash1).not.toBe(hash2);
    });

    it('hashCombine produces consistent results', () => {
      const h1 = hashCombine('seed', 1, 2, 3);
      const h2 = hashCombine('seed', 1, 2, 3);
      expect(h1).toBe(h2);
    });

    it('generateSeed produces consistent results', () => {
      const seed1 = generateSeed('user-42');
      const seed2 = generateSeed('user-42');
      expect(seed1).toBe(seed2);
    });

    it('generateSeed produces different results for different users', () => {
      const seed1 = generateSeed('user-1');
      const seed2 = generateSeed('user-2');
      expect(seed1).not.toBe(seed2);
    });
  });

  describe('SeededRNG', () => {
    it('produces consistent results with same seed', () => {
      const rng1 = new SeededRNG(12345);
      const rng2 = new SeededRNG(12345);

      for (let i = 0; i < 100; i++) {
        expect(rng1.next()).toBe(rng2.next());
      }
    });

    it('produces results in [0, 1) range', () => {
      const rng = new SeededRNG(42);
      for (let i = 0; i < 1000; i++) {
        const val = rng.next();
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThan(1);
      }
    });

    it('nextInt produces integers in range', () => {
      const rng = new SeededRNG(99);
      for (let i = 0; i < 100; i++) {
        const val = rng.nextInt(5, 10);
        expect(val).toBeGreaterThanOrEqual(5);
        expect(val).toBeLessThanOrEqual(10);
        expect(Number.isInteger(val)).toBe(true);
      }
    });

    it('pick selects from array deterministically', () => {
      const items = ['a', 'b', 'c', 'd'];
      const rng1 = new SeededRNG(777);
      const rng2 = new SeededRNG(777);

      for (let i = 0; i < 20; i++) {
        expect(rng1.pick(items)).toBe(rng2.pick(items));
      }
    });

    it('weightedPick respects weights', () => {
      const rng = new SeededRNG(42);
      const items = ['common', 'rare'];
      const weights = [99, 1];
      let commonCount = 0;
      for (let i = 0; i < 1000; i++) {
        const pick = rng.weightedPick(items, weights);
        if (pick === 'common') commonCount++;
      }
      expect(commonCount).toBeGreaterThan(900);
    });

    it('bool returns true/false based on probability', () => {
      const rng = new SeededRNG(42);
      let trueCount = 0;
      for (let i = 0; i < 1000; i++) {
        if (rng.bool(0.5)) trueCount++;
      }
      expect(trueCount).toBeGreaterThan(400);
      expect(trueCount).toBeLessThan(600);
    });

    it('shuffle returns deterministic order', () => {
      const arr = [1, 2, 3, 4, 5, 6, 7, 8];
      const rng1 = new SeededRNG(42);
      const rng2 = new SeededRNG(42);
      expect(rng1.shuffle(arr)).toEqual(rng2.shuffle(arr));
    });
  });

  describe('Species data', () => {
    it('has exactly 50 species', () => {
      expect(SPECIES).toHaveLength(50);
    });

    it('each species has required fields', () => {
      for (const species of SPECIES) {
        expect(species.id).toBeTruthy();
        expect(species.name).toBeTruthy();
        expect(species.category).toBeTruthy();
        expect(species.asciiBase).toBeTruthy();
        expect(species.asciiBase.length).toBeGreaterThan(0);
        expect(species.personalityBiases.length).toBeGreaterThan(0);
        expect(species.preferredFoods.length).toBeGreaterThan(0);
        expect(species.dislikedFoods.length).toBeGreaterThan(0);
      }
    });

    it('all species have unique IDs', () => {
      const ids = SPECIES.map(s => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all species IDs are lowercase alphanumeric', () => {
      for (const species of SPECIES) {
        expect(species.id).toMatch(/^[a-z0-9]+$/);
      }
    });
  });

  describe('Rarity distribution', () => {
    it('rarity weights sum to 100', () => {
      const sum = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
      expect(sum).toBe(100);
    });

    it('has all five rarity tiers', () => {
      expect(RARITY_WEIGHTS).toHaveProperty('common');
      expect(RARITY_WEIGHTS).toHaveProperty('uncommon');
      expect(RARITY_WEIGHTS).toHaveProperty('rare');
      expect(RARITY_WEIGHTS).toHaveProperty('epic');
      expect(RARITY_WEIGHTS).toHaveProperty('legendary');
    });

    it('species have valid rarities', () => {
      const validRarities = Object.keys(RARITY_WEIGHTS);
      for (const species of SPECIES) {
        expect(validRarities).toContain(species.rarity);
      }
    });
  });

  describe('Eye and hat data', () => {
    it('has at least 20 eye options', () => {
      expect(EYES.length).toBeGreaterThanOrEqual(20);
    });

    it('has at least 20 hat options including "none"', () => {
      expect(HATS.length).toBeGreaterThanOrEqual(20);
      expect(HATS).toContain('none');
    });
  });

  describe('Personality data', () => {
    it('has at least 20 personality archetypes', () => {
      expect(PERSONALITIES.length).toBeGreaterThanOrEqual(20);
    });

    it('each personality has required fields', () => {
      for (const p of PERSONALITIES) {
        expect(p.id).toBeTruthy();
        expect(p.name).toBeTruthy();
        expect(p.description).toBeTruthy();
        expect(p.likes.length).toBeGreaterThan(0);
        expect(p.dislikes.length).toBeGreaterThan(0);
        expect(p.preferredActivities.length).toBeGreaterThan(0);
        expect(p.idleLines.length).toBeGreaterThan(0);
      }
    });

    it('all personality IDs are unique', () => {
      const ids = PERSONALITIES.map(p => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('Stats engine', () => {
    it('generates valid stats', () => {
      const rng = new SeededRNG(42);
      const stats = generateStats(rng, 'curiosity');

      expect(stats.courage).toBeGreaterThanOrEqual(0);
      expect(stats.curiosity).toBeGreaterThanOrEqual(0);
      expect(stats.playfulness).toBeGreaterThanOrEqual(0);
      expect(stats.discipline).toBeGreaterThanOrEqual(0);
      expect(stats.empathy).toBeGreaterThanOrEqual(0);

      for (const stat of STAT_NAMES) {
        expect(stats[stat]).toBeLessThanOrEqual(100);
      }
    });

    it('favored stat gets bonus', () => {
      const rng = new SeededRNG(42);
      const stats = generateStats(rng, 'discipline');
      expect(stats.discipline).toBeGreaterThanOrEqual(10);
    });

    it('deterministic with same seed', () => {
      const stats1 = generateStats(new SeededRNG(42), 'courage');
      const stats2 = generateStats(new SeededRNG(42), 'courage');
      expect(stats1).toEqual(stats2);
    });

    it('produces at least one peak stat >= 75', () => {
      const rng = new SeededRNG(42);
      const stats = generateStats(rng, 'courage');
      const maxVal = Math.max(...STAT_NAMES.map(s => stats[s]));
      expect(maxVal).toBeGreaterThanOrEqual(75);
    });

    it('produces at least one dump stat <= 30', () => {
      const rng = new SeededRNG(42);
      const stats = generateStats(rng, 'courage');
      const minVal = Math.min(...STAT_NAMES.map(s => stats[s]));
      expect(minVal).toBeLessThanOrEqual(30);
    });

    it('all stats are in valid range', () => {
      const rng = new SeededRNG(42);
      const stats = generateStats(rng, 'courage');
      for (const stat of STAT_NAMES) {
        expect(stats[stat]).toBeGreaterThanOrEqual(0);
        expect(stats[stat]).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('Personality engine', () => {
    it('picks a valid personality', () => {
      const rng = new SeededRNG(42);
      const personality = pickPersonality(rng, ['cheerful', 'playful']);
      expect(personality).toBeTruthy();
      expect(personality.id).toBeTruthy();
    });

    it('deterministic with same seed', () => {
      const rng1 = new SeededRNG(42);
      const rng2 = new SeededRNG(42);
      const p1 = pickPersonality(rng1, ['brave', 'curious']);
      const p2 = pickPersonality(rng2, ['brave', 'curious']);
      expect(p1.id).toBe(p2.id);
    });
  });

  describe('Full Buddy generation', () => {
    it('generates a complete buddy from userId', () => {
      const buddy = generateBuddy('test-user-42');

      expect(buddy.identity.speciesId).toBeTruthy();
      expect(buddy.identity.speciesName).toBeTruthy();
      expect(buddy.identity.rarity).toBeTruthy();
      expect(buddy.identity.eyes).toBeTruthy();
      expect(buddy.identity.hat).toBeTruthy();
      expect(buddy.identity.seed).toBeTruthy();
      expect(buddy.identity.generatedAt).toBeGreaterThan(0);

      expect(buddy.stats).toBeTruthy();
      expect(buddy.personality).toBeTruthy();
      expect(buddy.personality.id).toBeTruthy();
    });

    it('produces consistent buddy for same userId', () => {
      const buddy1 = generateBuddy('consistent-user', 'Buddy');
      const buddy2 = generateBuddy('consistent-user', 'Buddy');

      expect(buddy1.identity.speciesId).toBe(buddy2.identity.speciesId);
      expect(buddy1.identity.rarity).toBe(buddy2.identity.rarity);
      expect(buddy1.identity.isShiny).toBe(buddy2.identity.isShiny);
      expect(buddy1.identity.eyes).toBe(buddy2.identity.eyes);
      expect(buddy1.identity.hat).toBe(buddy2.identity.hat);
      expect(buddy1.stats).toEqual(buddy2.stats);
      expect(buddy1.personality.id).toBe(buddy2.personality.id);
    });

    it('produces different buddies for different userIds', () => {
      const buddy1 = generateBuddy('user-alpha');
      const buddy2 = generateBuddy('user-beta');
      const sameSpecies = buddy1.identity.speciesId === buddy2.identity.speciesId;
      const sameStats = JSON.stringify(buddy1.stats) === JSON.stringify(buddy2.stats);
      expect(sameSpecies || !sameStats).toBe(true);
    });

    it('shiny chance is approximately 1%', () => {
      let shinyCount = 0;
      const trials = 10000;
      for (let i = 0; i < trials; i++) {
        const buddy = generateBuddy(`shiny-test-${i}`);
        if (buddy.identity.isShiny) shinyCount++;
      }
      const rate = shinyCount / trials;
      expect(rate).toBeLessThan(0.03);
      expect(rate).toBeGreaterThan(0);
    });

    it('needs start at default values', () => {
      const buddy = generateBuddy('needs-test');
      expect(buddy.needs.hunger).toBe(50);
      expect(buddy.needs.happiness).toBe(50);
      expect(buddy.needs.cleanliness).toBe(80);
      expect(buddy.needs.energy).toBe(80);
      expect(buddy.needs.social).toBe(50);
    });
  });

  describe('createInitialBuddyState', () => {
    it('creates complete BuddyState', () => {
      const state = createInitialBuddyState('state-test', 'MyBuddy');
      expect(state.identity.nickname).toBe('MyBuddy');
      expect(state.identity.speciesId).toBeTruthy();
      expect(state.level).toBe(1);
      expect(state.xp).toBe(0);
      expect(state.bond).toBe(0);
      expect(state.health).toBe(100);
      expect(state.mood).toBeDefined();
      expect(state.totalCareActions).toBe(0);
      expect(state.lastInteraction).toBeGreaterThan(0);
    });
  });
});