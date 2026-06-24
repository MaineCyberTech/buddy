import { describe, it, expect } from 'vitest';
import { HOME_SLOTS, DEFAULT_PLACED_DECOR } from '@/lib/generation/types';
import { ITEMS, ITEM_MAP, DECOR_ITEMS } from '@/data/items';

describe('Home Customization', () => {
  describe('Decor Slots', () => {
    it('has 6 home slots', () => {
      expect(HOME_SLOTS.length).toBe(6);
    });

    it('has 2 locked slots', () => {
      const locked = HOME_SLOTS.filter(s => s.locked);
      expect(locked.length).toBe(2);
    });

    it('all slot IDs are unique', () => {
      const ids = HOME_SLOTS.map(s => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('default placed decor has all slots set to null', () => {
      expect(DEFAULT_PLACED_DECOR.length).toBe(HOME_SLOTS.length);
      for (const p of DEFAULT_PLACED_DECOR) {
        expect(p.itemId).toBeNull();
        expect(HOME_SLOTS.some(s => s.id === p.slotId)).toBe(true);
      }
    });
  });

  describe('Decor Items', () => {
    it('has at least 10 decor items', () => {
      expect(DECOR_ITEMS.length).toBeGreaterThanOrEqual(10);
    });

    it('all decor items have a placementSlot', () => {
      for (const item of DECOR_ITEMS) {
        expect(item.placementSlot).toBeTruthy();
      }
    });

    it('all decor items map to valid slots', () => {
      const slotIds = HOME_SLOTS.map(s => s.id);
      for (const item of DECOR_ITEMS) {
        expect(slotIds).toContain(item.placementSlot);
      }
    });

    it('no decor item has zero sellValue', () => {
      for (const item of DECOR_ITEMS) {
        expect(item.sellValue).toBeGreaterThan(0);
      }
    });
  });

  describe('Loot table decor references', () => {
    it('star_mobile and cozy_bed exist in loot tables', () => {
      expect(ITEM_MAP.has('star_mobile')).toBe(true);
      expect(ITEM_MAP.has('cozy_bed')).toBe(true);
    });
  });
});
