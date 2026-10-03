import { describe, it, expect } from 'vitest';
import { applyItemAction } from '@/lib/actions/care';
import { createInitialBuddyState } from '@/lib/generation/engine';
import { InventoryState } from '@/lib/generation/types';

// FEAT-P2-001: item catalogue and economy must be functional (use/sell/equip).

function createState(items: { id: string; quantity: number }[], coins = 0) {
  const buddy = createInitialBuddyState('item-test', 'Test');
  buddy.needs.hunger = 50;
  buddy.needs.happiness = 50;
  buddy.needs.energy = 80;
  buddy.health = 50;
  buddy.stats.courage = 10;
  buddy.identity.hat = 'none';
  const inventory: InventoryState = { coins, items };
  return { buddy, inventory };
}

describe('Item actions (FEAT-P2-001)', () => {
  it('uses food to restore hunger and consumes it', () => {
    const { buddy, inventory } = createState([{ id: 'apple', quantity: 1 }]);
    const result = applyItemAction(buddy, inventory, 'apple', 'use');
    expect(result.success).toBe(true);
    expect(result.buddy.needs.hunger).toBe(75);
    expect(result.inventory.items.find(i => i.id === 'apple')).toBeUndefined();
  });

  it('uses medicine to restore health and consumes it', () => {
    const { buddy, inventory } = createState([{ id: 'potion', quantity: 1 }]);
    const result = applyItemAction(buddy, inventory, 'potion', 'use');
    expect(result.buddy.health).toBe(80);
    expect(result.inventory.items).toHaveLength(0);
  });

  it('uses a skill book to raise the matching stat', () => {
    const { buddy, inventory } = createState([{ id: 'courage_book', quantity: 1 }]);
    const result = applyItemAction(buddy, inventory, 'courage_book', 'use');
    expect(result.buddy.stats.courage).toBe(15);
    expect(result.inventory.items).toHaveLength(0);
  });

  it('uses a toy for happiness at a small energy cost', () => {
    const { buddy, inventory } = createState([{ id: 'yarn_ball', quantity: 1 }]);
    const result = applyItemAction(buddy, inventory, 'yarn_ball', 'use');
    expect(result.buddy.needs.happiness).toBe(70);
    expect(result.buddy.needs.energy).toBe(75);
  });

  it('sells an item for its sellValue and decrements the stack', () => {
    const { buddy, inventory } = createState([{ id: 'apple', quantity: 2 }], 0);
    const result = applyItemAction(buddy, inventory, 'apple', 'sell');
    expect(result.success).toBe(true);
    expect(result.inventory.coins).toBe(2);
    expect(result.inventory.items).toEqual([{ id: 'apple', quantity: 1 }]);
  });

  it('equips a hat without consuming it', () => {
    const { buddy, inventory } = createState([{ id: 'flower_crown', quantity: 1 }]);
    const result = applyItemAction(buddy, inventory, 'flower_crown', 'equip');
    expect(result.success).toBe(true);
    expect(result.buddy.identity.hat).toBe('flower_crown');
    expect(result.inventory.items).toEqual([{ id: 'flower_crown', quantity: 1 }]);
  });

  it('rejects actions on items the player does not own', () => {
    const { buddy, inventory } = createState([]);
    const result = applyItemAction(buddy, inventory, 'apple', 'use');
    expect(result.success).toBe(false);
  });

  it('rejects equipping a non-hat and using a material', () => {
    const nonHat = createState([{ id: 'apple', quantity: 1 }]);
    expect(applyItemAction(nonHat.buddy, nonHat.inventory, 'apple', 'equip').success).toBe(false);

    const material = createState([{ id: 'cloth', quantity: 1 }]);
    expect(applyItemAction(material.buddy, material.inventory, 'cloth', 'use').success).toBe(false);
  });

  it('refuses to sell a zero-value quest item', () => {
    const { buddy, inventory } = createState([{ id: 'mysterious_egg', quantity: 1 }]);
    const result = applyItemAction(buddy, inventory, 'mysterious_egg', 'sell');
    expect(result.success).toBe(false);
    expect(result.inventory.items).toHaveLength(1);
  });
});
