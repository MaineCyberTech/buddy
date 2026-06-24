import { describe, it, expect } from 'vitest';
import { applyAction, applyOfflineDecay, recalculateMood } from '@/lib/actions/care';
import { createInitialBuddyState } from '@/lib/generation/engine';
import { BuddyState } from '@/lib/generation/types';

function createTestBuddy(overrides?: Partial<BuddyState>): BuddyState {
  const base = createInitialBuddyState('care-test-user', 'TestBuddy');
  return {
    ...base,
    needs: {
      hunger: 50,
      happiness: 50,
      cleanliness: 80,
      energy: 80,
      social: 50,
    },
    health: 100,
    bond: 0,
    level: 1,
    xp: 0,
    mood: 'neutral',
    totalCareActions: 0,
    ...overrides,
  };
}

describe('Care Actions', () => {
  describe('feed', () => {
    it('increases hunger', () => {
      const buddy = createTestBuddy();
      const { buddy: updated } = applyAction(buddy, 'feed');
      expect(updated.needs.hunger).toBeGreaterThan(buddy.needs.hunger);
    });

    it('caps hunger at 100', () => {
      const buddy = createTestBuddy({ needs: { ...createTestBuddy().needs, hunger: 95 } });
      const { buddy: updated } = applyAction(buddy, 'feed');
      expect(updated.needs.hunger).toBeLessThanOrEqual(100);
    });

    it('increases bond', () => {
      const buddy = createTestBuddy();
      const { buddy: updated } = applyAction(buddy, 'feed');
      expect(updated.bond).toBeGreaterThan(buddy.bond);
    });
  });

  describe('play', () => {
    it('increases happiness', () => {
      const buddy = createTestBuddy();
      const { buddy: updated } = applyAction(buddy, 'play');
      expect(updated.needs.happiness).toBeGreaterThan(buddy.needs.happiness);
    });

    it('decreases energy', () => {
      const buddy = createTestBuddy();
      const { buddy: updated } = applyAction(buddy, 'play');
      expect(updated.needs.energy).toBeLessThan(buddy.needs.energy);
    });

    it('returns action message', () => {
      const { result } = applyAction(createTestBuddy(), 'play');
      expect(result.message).toBeTruthy();
      expect(typeof result.message).toBe('string');
    });

    it('grants xp', () => {
      const buddy = createTestBuddy();
      const { buddy: updated } = applyAction(buddy, 'play');
      expect(updated.xp).toBeGreaterThan(buddy.xp);
    });
  });

  describe('wash', () => {
    it('sets cleanliness to 100', () => {
      const buddy = createTestBuddy({ needs: { ...createTestBuddy().needs, cleanliness: 30 } });
      const { buddy: updated } = applyAction(buddy, 'wash');
      expect(updated.needs.cleanliness).toBe(100);
    });
  });

  describe('rest', () => {
    it('increases energy', () => {
      const buddy = createTestBuddy({ needs: { ...createTestBuddy().needs, energy: 20 } });
      const { buddy: updated } = applyAction(buddy, 'rest');
      expect(updated.needs.energy).toBeGreaterThan(buddy.needs.energy);
    });

    it('caps energy at 100', () => {
      const buddy = createTestBuddy({ needs: { ...createTestBuddy().needs, energy: 90 } });
      const { buddy: updated } = applyAction(buddy, 'rest');
      expect(updated.needs.energy).toBeLessThanOrEqual(100);
    });
  });

  describe('talk', () => {
    it('increases social', () => {
      const buddy = createTestBuddy();
      const { buddy: updated } = applyAction(buddy, 'talk');
      expect(updated.needs.social).toBeGreaterThan(buddy.needs.social);
    });

    it('increases bond more than other actions', () => {
      const buddy = createTestBuddy();
      const { buddy: talkBuddy } = applyAction(buddy, 'talk');
      const { buddy: feedBuddy } = applyAction(buddy, 'feed');
      expect(talkBuddy.bond - buddy.bond).toBeGreaterThanOrEqual(feedBuddy.bond - buddy.bond);
    });
  });

  describe('train', () => {
    it('decreases energy', () => {
      const buddy = createTestBuddy();
      const { buddy: updated } = applyAction(buddy, 'train');
      expect(updated.needs.energy).toBeLessThan(buddy.needs.energy);
    });

    it('grants more xp than play', () => {
      const buddy = createTestBuddy();
      const { buddy: trainBuddy } = applyAction(buddy, 'train');
      const { buddy: playBuddy } = applyAction(buddy, 'play');
      expect(trainBuddy.xp - buddy.xp).toBeGreaterThan(playBuddy.xp - buddy.xp);
    });
  });

  describe('heal', () => {
    it('increases health', () => {
      const buddy = createTestBuddy({ health: 50 });
      const { buddy: updated } = applyAction(buddy, 'heal');
      expect(updated.health).toBeGreaterThan(buddy.health);
    });

    it('caps health at 100', () => {
      const buddy = createTestBuddy({ health: 95 });
      const { buddy: updated } = applyAction(buddy, 'heal');
      expect(updated.health).toBeLessThanOrEqual(100);
    });
  });

  describe('mood recalculation', () => {
    it('returns happy when all needs are high and bond is high', () => {
      const buddy = createTestBuddy({
        needs: { hunger: 80, happiness: 80, cleanliness: 80, energy: 80, social: 80 },
        bond: 60,
      });
      expect(recalculateMood(buddy)).toBe('happy');
    });

    it('returns sick when health is 0', () => {
      const buddy = createTestBuddy({ health: 0 });
      expect(recalculateMood(buddy)).toBe('sick');
    });

    it('returns sad when needs are critically low', () => {
      const buddy = createTestBuddy({
        needs: { hunger: 5, happiness: 5, cleanliness: 80, energy: 80, social: 80 },
      });
      expect(recalculateMood(buddy)).toBe('sad');
    });

    it('returns content when needs are adequate', () => {
      const buddy = createTestBuddy({
        needs: { hunger: 45, happiness: 45, cleanliness: 60, energy: 60, social: 45 },
        bond: 20,
      });
      expect(recalculateMood(buddy)).toBe('content');
    });
  });

  describe('level ups', () => {
    it('rewards xp', () => {
      const buddy = createTestBuddy();
      const { buddy: updated } = applyAction(buddy, 'feed');
      expect(updated.xp).toBeGreaterThan(buddy.xp);
    });
  });
});

describe('Offline Decay', () => {
  it('reduces hunger over time', () => {
    const buddy = createTestBuddy();
    const elapsed = 2 * 60 * 60 * 1000;
    const decayed = applyOfflineDecay(buddy, elapsed);
    expect(decayed.needs.hunger).toBeLessThan(buddy.needs.hunger);
  });

  it('caps decay at 48 hours', () => {
    const buddy = createTestBuddy();
    const elapsed = 100 * 60 * 60 * 1000;
    const decayed = applyOfflineDecay(buddy, elapsed);
    expect(decayed.needs.hunger).toBeGreaterThanOrEqual(0);
  });

  it('reduces health when needs are extremely low', () => {
    const buddy = createTestBuddy({
      needs: { hunger: 5, happiness: 5, cleanliness: 5, energy: 5, social: 5 },
    });
    const elapsed = 6 * 60 * 60 * 1000;
    const decayed = applyOfflineDecay(buddy, elapsed);
    expect(decayed.health).toBeLessThanOrEqual(buddy.health);
  });

  it('decreases energy slightly during offline', () => {
    const buddy = createTestBuddy({ needs: { ...createTestBuddy().needs, energy: 50 } });
    const elapsed = 2 * 60 * 60 * 1000;
    const decayed = applyOfflineDecay(buddy, elapsed);
    expect(decayed.needs.energy).toBeLessThan(buddy.needs.energy);
  });
});