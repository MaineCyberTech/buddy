import { describe, it, expect } from 'vitest';
import { runAdventure, applyAdventureResult } from '@/lib/locations/adventure';
import { createInitialBuddyState } from '@/lib/generation/engine';
import { LOCATIONS } from '@/data/locations';
import { LOOT_TABLE_MAP } from '@/data/loot-tables';
import { BuddyState, InventoryState } from '@/lib/generation/types';

const SEED = 12345;

function createTestState(): { buddy: BuddyState; inventory: InventoryState } {
  const buddy = createInitialBuddyState('adventure-test-user', 'TestBuddy');
  buddy.needs.energy = 100;
  return {
    buddy,
    inventory: { coins: 0, items: [] },
  };
}

describe('Adventure System', () => {
  describe('Locations', () => {
    it('has 9 locations', () => {
      expect(LOCATIONS).toHaveLength(9);
    });

    it('all locations have valid loot tables', () => {
      for (const loc of LOCATIONS) {
        expect(LOOT_TABLE_MAP.has(loc.lootTableId)).toBe(true);
      }
    });

    it('all locations have energy costs', () => {
      for (const loc of LOCATIONS) {
        expect(loc.energyCost).toBeGreaterThan(0);
      }
    });

    it('all locations have encounter pools', () => {
      for (const loc of LOCATIONS) {
        expect(loc.encounterPool.length).toBeGreaterThan(0);
      }
    });
  });

  describe('runAdventure', () => {
    it('returns failure for unknown location', () => {
      const { buddy, inventory } = createTestState();
      const result = runAdventure(buddy, inventory, 'unknown_location', SEED);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Location not found.');
    });

    it('returns failure when energy is too low', () => {
      const { buddy, inventory } = createTestState();
      buddy.needs.energy = 0;
      const result = runAdventure(buddy, inventory, 'backyard', SEED);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Too tired');
    });

    it('runs successful adventure with enough energy', () => {
      const { buddy, inventory } = createTestState();
      buddy.needs.energy = 100;
      const result = runAdventure(buddy, inventory, 'backyard', SEED);
      expect(result.locationId).toBe('backyard');
      expect(result.energyCost).toBeGreaterThan(0);
      expect(result.encounterText).toBeTruthy();
    });

    it('deducts energy cost', () => {
      const { buddy, inventory } = createTestState();
      const result = runAdventure(buddy, inventory, 'backyard', SEED);
      expect(result.energyCost).toBe(5);
    });

    it('awards coins on success', () => {
      const { buddy, inventory } = createTestState();
      const result = runAdventure(buddy, inventory, 'backyard', SEED);
      expect(result.coinsEarned).toBeGreaterThanOrEqual(0);
    });

    it('produces deterministic results with same seed', () => {
      const { buddy: b1, inventory: i1 } = createTestState();
      const { buddy: b2, inventory: i2 } = createTestState();
      const r1 = runAdventure(b1, i1, 'backyard', SEED);
      const r2 = runAdventure(b2, i2, 'backyard', SEED);
      expect(r1.success).toBe(r2.success);
      expect(r1.coinsEarned).toBe(r2.coinsEarned);
      expect(r1.itemsReceived).toEqual(r2.itemsReceived);
    });
  });

  describe('applyAdventureResult', () => {
    it('applies energy cost', () => {
      const { buddy, inventory } = createTestState();
      buddy.needs.energy = 100;
      const result = runAdventure(buddy, inventory, 'backyard', SEED);
      const { buddy: updated } = applyAdventureResult(buddy, inventory, result);
      expect(updated.needs.energy).toBe(100 - result.energyCost);
    });

    it('adds coins to inventory', () => {
      const { buddy, inventory } = createTestState();
      const result = runAdventure(buddy, inventory, 'backyard', SEED);
      const { inventory: updatedInv } = applyAdventureResult(buddy, inventory, result);
      expect(updatedInv.coins).toBe(result.coinsEarned);
    });

    it('adds items to inventory', () => {
      const { buddy, inventory } = createTestState();
      const result = runAdventure(buddy, inventory, 'backyard', SEED);
      const { inventory: updatedInv } = applyAdventureResult(buddy, inventory, result);
      for (const item of result.itemsReceived) {
        const found = updatedInv.items.find(i => i.id === item.id);
        expect(found).toBeTruthy();
        expect(found!.quantity).toBeGreaterThanOrEqual(item.quantity);
      }
    });

    it('accumulates coins across adventures', () => {
      const { buddy, inventory } = createTestState();
      const r1 = runAdventure(buddy, inventory, 'backyard', SEED);
      const { buddy: b1, inventory: i1 } = applyAdventureResult(buddy, inventory, r1);
      const r2 = runAdventure(b1, i1, 'park', SEED + 1);
      const { inventory: i2 } = applyAdventureResult(b1, i1, r2);
      expect(i2.coins).toBe(r1.coinsEarned + r2.coinsEarned);
    });
  });
});