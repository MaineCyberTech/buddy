import { describe, it, expect } from 'vitest';
import { ACHIEVEMENTS, grantAchievements } from '@/data/achievements';
import { createInitialBuddyState } from '@/lib/generation/engine';
import { runAdventure, applyAdventureResult } from '@/lib/locations/adventure';
import { InventoryState } from '@/lib/generation/types';

// FEAT-P1-001: achievements must be evaluated on gameplay transitions, persisted
// once, and pay out their configured coin/item rewards.

const EMPTY_INVENTORY: InventoryState = { coins: 0, items: [] };

function rewardCoins(id: string): number {
  return ACHIEVEMENTS.find(a => a.id === id)?.rewardCoins ?? 0;
}

describe('Achievement grants (FEAT-P1-001)', () => {
  it('unlocks an achieved condition, then never grants it again', () => {
    const buddy = createInitialBuddyState('ach-test', 'Test');
    buddy.bond = 10;

    const first = grantAchievements(buddy, EMPTY_INVENTORY, 0);
    expect(first.granted.map(a => a.id)).toContain('bond_10');
    expect(first.buddy.progression.achievements).toContain('bond_10');
    const expectedCoins = first.granted.reduce((sum, a) => sum + (a.rewardCoins ?? 0), 0);
    expect(first.inventory.coins).toBe(expectedCoins);
    expect(first.inventory.coins).toBeGreaterThanOrEqual(rewardCoins('bond_10'));

    const second = grantAchievements(first.buddy, first.inventory, 0);
    expect(second.granted).toHaveLength(0);
    expect(second.inventory.coins).toBe(first.inventory.coins);
    expect(
      second.buddy.progression.achievements.filter(id => id === 'bond_10')
    ).toHaveLength(1);
  });

  it('grants the configured reward item', () => {
    const buddy = createInitialBuddyState('ach-item-test', 'Test');
    buddy.bond = 100;

    const result = grantAchievements(buddy, EMPTY_INVENTORY, 0);
    expect(result.granted.map(a => a.id)).toContain('bond_100');
    const bracelet = result.inventory.items.find(i => i.id === 'friendship_bracelet');
    expect(bracelet?.quantity).toBe(1);
  });

  it('fires through the live adventure path exactly once', () => {
    const buddy = createInitialBuddyState('ach-adv-test', 'Test');
    buddy.needs.energy = 100;

    const first = applyAdventureResult(
      buddy,
      EMPTY_INVENTORY,
      runAdventure(buddy, EMPTY_INVENTORY, 'backyard', 7)
    );
    expect(first.buddy.progression.achievements).toContain('first_adventure');
    expect(first.inventory.coins).toBeGreaterThanOrEqual(rewardCoins('first_adventure'));

    const second = applyAdventureResult(
      first.buddy,
      first.inventory,
      runAdventure(first.buddy, first.inventory, 'park', 8)
    );
    expect(
      second.buddy.progression.achievements.filter(id => id === 'first_adventure')
    ).toHaveLength(1);
  });
});
