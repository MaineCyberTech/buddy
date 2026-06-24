import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveGame, loadGame, hasSave, deleteSave, exportSave, importSave } from './indexeddb';
import { GameSave } from '@/lib/generation/types';

const NOW = Date.now();

const MOCK_SAVE: GameSave = {
  version: 2,
  guestId: 'test-guest-123',
  buddy: {
    identity: {
      speciesId: 'fluffkin',
      speciesName: 'Fluffkin',
      nickname: 'TestBuddy',
      rarity: 'common',
      isShiny: false,
      hat: 'none',
      eyes: '..',
      generatedAt: NOW,
      seed: 'seed123',
    },
    stats: { courage: 10, curiosity: 10, playfulness: 10, discipline: 10, empathy: 10 },
    needs: { hunger: 50, happiness: 50, cleanliness: 50, energy: 50, social: 50 },
    mood: 'content',
    bond: 0,
    health: 100,
    xp: 0,
    level: 1,
    lastInteraction: NOW,
    personality: { id: 'curious', name: 'Curious', description: 'Always exploring', likes: ['exploring'], dislikes: [], preferredActivities: ['adventure'], careModifiers: {}, idleLines: ['Hmm...'], happyLines: ['Yay!'], hungryLines: ['Hungry!'], adventureLines: ['Adventure time!'], sleepLines: ['Sleepy...'] },
    progression: { lifecycle: 'baby', age: 0, skills: { exploring: 0, training: 0, social: 0, crafting: 0, cooking: 0 }, bondLevel: 1, totalAdventures: 0, memories: [], achievements: [], careQuality: 1.0 },
    totalCareActions: 0,
  },
  createdAt: NOW,
  updatedAt: NOW,
  inventory: { coins: 100, items: [] },
  saveSlot: 1,
};

describe('IndexedDB Storage', () => {
  beforeEach(async () => {
    await deleteSave(1);
  });

  describe('saveGame / loadGame', () => {
    it('saves and loads a game', async () => {
      await saveGame(MOCK_SAVE);
      const loaded = await loadGame(1);
      expect(loaded).not.toBeNull();
      expect(loaded?.guestId).toBe('test-guest-123');
      expect(loaded?.buddy?.identity?.nickname).toBe('TestBuddy');
    });

    it('loadGame returns null when no save exists', async () => {
      const loaded = await loadGame(2);
      expect(loaded).toBeNull();
    });

    it('loadGame preserves save version', async () => {
      await saveGame(MOCK_SAVE);
      const loaded = await loadGame(1);
      expect(loaded?.version).toBe(2);
    });

    it('overwrites existing save', async () => {
      await saveGame(MOCK_SAVE);
      const modified = { ...MOCK_SAVE, buddy: { ...MOCK_SAVE.buddy!, identity: { ...MOCK_SAVE.buddy!.identity, nickname: 'NewName' } } };
      await saveGame(modified);
      const loaded = await loadGame(1);
      expect(loaded?.buddy?.identity?.nickname).toBe('NewName');
    });
  });

  describe('hasSave', () => {
    it('returns false when no save exists', async () => {
      const exists = await hasSave(1);
      expect(exists).toBe(false);
    });

    it('returns true after saveGame', async () => {
      await saveGame(MOCK_SAVE);
      const exists = await hasSave(1);
      expect(exists).toBe(true);
    });

    it('returns false for different slot', async () => {
      await saveGame(MOCK_SAVE);
      const exists = await hasSave(2);
      expect(exists).toBe(false);
    });
  });

  describe('deleteSave', () => {
    it('removes save for specific slot', async () => {
      await saveGame(MOCK_SAVE);
      await deleteSave(1);
      const loaded = await loadGame(1);
      expect(loaded).toBeNull();
    });

    it('does not affect other slots', async () => {
      await saveGame(MOCK_SAVE);
      const slot2 = { ...MOCK_SAVE, saveSlot: 2, guestId: 'guest2' };
      await saveGame(slot2);
      await deleteSave(1);
      const loaded2 = await loadGame(2);
      expect(loaded2).not.toBeNull();
    });
  });

  describe('exportSave / importSave', () => {
    it('exports and imports saves', async () => {
      await saveGame(MOCK_SAVE);
      const exported = await exportSave();
      await deleteSave(1);
      const ok = await importSave(exported);
      expect(ok).toBe(true);
      const loaded = await loadGame(1);
      expect(loaded?.guestId).toBe('test-guest-123');
    });

    it('importSave rejects invalid data', async () => {
      const ok = await importSave('not valid json');
      expect(ok).toBe(false);
    });

    it('importSave rejects invalid structure', async () => {
      const ok = await importSave(JSON.stringify({ version: 1, saves: 'not an array' }));
      expect(ok).toBe(false);
    });
  });
});