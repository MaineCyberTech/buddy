import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveGame, loadGame, hasSave, deleteSave, exportSave, importSave, getSaveMetadata } from './indexeddb';
import { GameSave } from '@/lib/generation/types';

const NOW = Date.now();

const MOCK_SAVE: GameSave = {
  version: 2,
  guestId: 'test-guest-123',
  buddy: {
    identity: {
      speciesId: 'test_id',
      speciesName: 'Testomon',
      nickname: 'Testo',
      rarity: 'common',
      isShiny: false,
      eyes: 'default',
      hat: 'none',
      generatedAt: NOW,
      seed: 'test',
    },
    stats: { courage: 50, curiosity: 30, playfulness: 20, discipline: 40, empathy: 60 },
    needs: { hunger: 80, happiness: 70, cleanliness: 90, energy: 60, social: 50 },
    mood: 'happy',
    health: 100,
    bond: 10,
    xp: 50,
    level: 2,
    lastInteraction: NOW,
    totalCareActions: 5,
    personality: {
      id: 'cheerful',
      name: 'Cheerful',
      description: 'Always happy',
      likes: ['play', 'talk'],
      dislikes: ['wait'],
      preferredActivities: ['play'],
      careModifiers: { hunger: 1, happiness: 1.2, cleanliness: 0.8, energy: 1, social: 1 },
      idleLines: ['Hi!'],
      happyLines: ['Whee!'],
      hungryLines: ['Feed me'],
      adventureLines: ['Let us go!'],
      sleepLines: ['Zzz'],
    },
    progression: {
      lifecycle: 'baby',
      age: 0,
      skills: { exploring: 0, training: 0, social: 0, crafting: 0, cooking: 0 },
      bondLevel: 1,
      totalAdventures: 0,
      memories: [],
      achievements: [],
      careQuality: 1.0,
    },
  },
  createdAt: NOW,
  updatedAt: NOW,
  inventory: { coins: 50, items: [{ id: 'test_item', quantity: 2 }] },
};

describe('saveGame / loadGame', () => {
  beforeEach(async () => {
    await deleteSave();
  });

  it('saves and loads a game', async () => {
    await saveGame(MOCK_SAVE);
    const loaded = await loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded!.guestId).toBe('test-guest-123');
    expect(loaded!.buddy!.identity.speciesName).toBe('Testomon');
    expect(loaded!.inventory?.coins).toBe(50);
    expect(loaded!.inventory?.items).toHaveLength(1);
  });

  it('hasSave returns true after saving', async () => {
    expect(await hasSave()).toBe(false);
    await saveGame(MOCK_SAVE);
    expect(await hasSave()).toBe(true);
  });

  it('hasSave returns false after delete', async () => {
    await saveGame(MOCK_SAVE);
    expect(await hasSave()).toBe(true);
    await deleteSave();
    expect(await hasSave()).toBe(false);
  });

  it('loadGame returns null when no save exists', async () => {
    const loaded = await loadGame();
    expect(loaded).toBeNull();
  });

  it('loadGame preserves save version', async () => {
    await saveGame(MOCK_SAVE);
    const loaded = await loadGame();
    expect(loaded!.version).toBe(2);
  });

  it('exportSave exports base64 string', async () => {
    await saveGame(MOCK_SAVE);
    const exported = await exportSave();
    expect(typeof exported).toBe('string');
    expect(exported.length).toBeGreaterThan(0);
  });

  it('importSave restores a save from base64', async () => {
    await saveGame(MOCK_SAVE);
    const exported = await exportSave();
    await deleteSave();
    expect(await hasSave()).toBe(false);
    const result = await importSave(exported);
    expect(result).toBe(true);
    expect(await hasSave()).toBe(true);
    const loaded = await loadGame();
    expect(loaded!.guestId).toBe('test-guest-123');
  });

  it('importSave rejects invalid data', async () => {
    const result = await importSave('invalid-base64');
    expect(result).toBe(false);
  });

  it('getSaveMetadata returns save info', async () => {
    await saveGame(MOCK_SAVE);
    const meta = await getSaveMetadata();
    expect(meta).not.toBeNull();
    expect(meta!.exists).toBe(true);
    expect(meta!.version).toBe(2);
    expect(meta!.speciesName).toBe('Testomon');
    expect(meta!.nickname).toBe('Testo');
  });

  it('getSaveMetadata returns { exists: false } when no save', async () => {
    const meta = await getSaveMetadata();
    expect(meta).toEqual({ exists: false });
  });

  it('preserves inventory after save/load cycle', async () => {
    const saveWithInventory: GameSave = {
      ...MOCK_SAVE,
      inventory: { coins: 100, items: [{ id: 'food_apple', quantity: 3 }, { id: 'health_potion', quantity: 1 }] },
    };
    await saveGame(saveWithInventory);
    const loaded = await loadGame();
    expect(loaded!.inventory?.coins).toBe(100);
    expect(loaded!.inventory?.items).toHaveLength(2);
    expect(loaded!.inventory?.items.find(i => i.id === 'food_apple')?.quantity).toBe(3);
  });

  it('handles save without inventory (v1 compat)', async () => {
    const v1Save = { ...MOCK_SAVE, version: 1 };
    delete (v1Save as any).inventory;
    await saveGame(v1Save as GameSave);
    const loaded = await loadGame();
    expect(loaded!.version).toBe(1);
    expect(loaded!.inventory).toBeUndefined();
  });
});
