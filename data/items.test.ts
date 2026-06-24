import { describe, it, expect } from 'vitest';
import { ITEMS, ITEM_MAP, FOOD_ITEMS, TOY_ITEMS, HAT_ITEMS, MEDICINE_ITEMS, MATERIAL_ITEMS, SKILL_BOOK_ITEMS, DECOR_ITEMS } from '@/data/items';
import { LOOT_TABLES, LOOT_TABLE_MAP } from '@/data/loot-tables';
import { LOCATIONS } from '@/data/locations';

describe('Item System', () => {
  describe('Items data', () => {
    it('has at least 30 items', () => {
      expect(ITEMS.length).toBeGreaterThanOrEqual(30);
    });

    it('all items have unique IDs', () => {
      const ids = ITEMS.map(i => i.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all items have all required fields', () => {
      for (const item of ITEMS) {
        expect(item.id).toBeTruthy();
        expect(item.name).toBeTruthy();
        expect(item.category).toBeTruthy();
        expect(item.icon).toBeTruthy();
        expect(item.sellValue).toBeGreaterThanOrEqual(0);
        expect(item.flavorText).toBeTruthy();
      }
    });

    it('ITEM_MAP has all items', () => {
      for (const item of ITEMS) {
        expect(ITEM_MAP.get(item.id)).toBeTruthy();
      }
    });

    it('has at least 5 food items', () => {
      expect(FOOD_ITEMS.length).toBeGreaterThanOrEqual(5);
    });

    it('has at least 3 toy items', () => {
      expect(TOY_ITEMS.length).toBeGreaterThanOrEqual(3);
    });

    it('has at least 3 hat items', () => {
      expect(HAT_ITEMS.length).toBeGreaterThanOrEqual(3);
    });

    it('has at least 2 medicine items', () => {
      expect(MEDICINE_ITEMS.length).toBeGreaterThanOrEqual(2);
    });

    it('has at least 2 material items', () => {
      expect(MATERIAL_ITEMS.length).toBeGreaterThanOrEqual(2);
    });

    it('has at least 3 skill book items', () => {
      expect(SKILL_BOOK_ITEMS.length).toBeGreaterThanOrEqual(3);
    });

    it('has at least 10 decor items', () => {
      expect(DECOR_ITEMS.length).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Loot tables', () => {
    it('all loot tables have unique IDs', () => {
      const ids = LOOT_TABLES.map(t => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('each loot table has entries', () => {
      for (const table of LOOT_TABLES) {
        if (table.id === 'none') {
          expect(table.entries.length).toBe(0);
        } else {
          expect(table.entries.length).toBeGreaterThan(0);
          expect(table.xpGain).toBeGreaterThan(0);
        }
        expect(table.coinMin).toBeGreaterThanOrEqual(0);
        expect(table.coinMax).toBeGreaterThanOrEqual(table.coinMin);
      }
    });

    it('each loot table entry references a valid item', () => {
      for (const table of LOOT_TABLES) {
        for (const entry of table.entries) {
          expect(ITEM_MAP.has(entry.itemId)).toBe(true);
          expect(entry.weight).toBeGreaterThan(0);
          expect(entry.minQuantity).toBeGreaterThan(0);
          expect(entry.maxQuantity).toBeGreaterThanOrEqual(entry.minQuantity);
        }
      }
    });

    it('LOOT_TABLE_MAP has all tables', () => {
      for (const table of LOOT_TABLES) {
        expect(LOOT_TABLE_MAP.get(table.id)).toBeTruthy();
      }
    });
  });

  describe('Location-loot consistency', () => {
    it('each location references a valid loot table', () => {
      for (const loc of LOCATIONS) {
        expect(LOOT_TABLE_MAP.has(loc.lootTableId)).toBe(true);
      }
    });
  });
});