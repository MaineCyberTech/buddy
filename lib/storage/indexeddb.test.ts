import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveGame,
  loadGame,
  hasSave,
  deleteSave,
  exportSave,
  importSave,
  getSaveMetadata,
} from '@/lib/storage/indexeddb';
import { createInitialBuddyState } from '@/lib/generation/engine';
import { GameSave } from '@/lib/generation/types';
import { SAVE_VERSION } from '@/lib/storage/schema';

function makeSave(overrides: Partial<GameSave> = {}): GameSave {
  const buddy = createInitialBuddyState('storage-test-user', 'TestBuddy');
  return {
    version: 1,
    buddy,
    guestId: 'guest-test-1',
    createdAt: 1000,
    updatedAt: 2000,
    inventory: { coins: 5, items: [] },
    ...overrides,
  };
}

beforeEach(async () => {
  await deleteSave();
});

describe('Save round-trip', () => {
  it('returns null when no save exists', async () => {
    expect(await loadGame()).toBeNull();
    expect(await hasSave()).toBe(false);
  });

  it('persists and reloads buddy, guestId and inventory intact', async () => {
    await saveGame(makeSave());

    const loaded = await loadGame();

    expect(loaded).not.toBeNull();
    expect(loaded!.guestId).toBe('guest-test-1');
    expect(loaded!.buddy?.identity.nickname).toBe('TestBuddy');
    expect(loaded!.inventory).toEqual({ coins: 5, items: [] });
    expect(await hasSave()).toBe(true);
  });

  it('overwrites an existing save (last write wins)', async () => {
    await saveGame(makeSave({ guestId: 'first' }));
    await saveGame(makeSave({ guestId: 'second' }));

    expect((await loadGame())!.guestId).toBe('second');
  });

  it('deletes the save', async () => {
    await saveGame(makeSave());
    await deleteSave();

    expect(await hasSave()).toBe(false);
    expect(await loadGame()).toBeNull();
  });

  it('migrates a v1 save up to the supported schema version', async () => {
    await saveGame(makeSave({ version: 1 }));

    // DATA-P1-001: loadGame must run the real migration, never rewrite the
    // version without upgrading the payload.
    expect((await loadGame())!.version).toBe(SAVE_VERSION);
  });

  it('rejects an unsupported save version instead of normalizing it', async () => {
    await saveGame(makeSave({ version: 99 }));

    // DATA-P1-002: a future/unknown schema must not be handed to callers.
    expect(await loadGame()).toBeNull();
  });
});

describe('Save metadata', () => {
  it('reports non-existence when the store is empty', async () => {
    expect(await getSaveMetadata()).toEqual({ exists: false });
  });

  it('reflects the stored save', async () => {
    await saveGame(makeSave({ updatedAt: 1234 }));

    const meta = await getSaveMetadata();

    expect(meta?.exists).toBe(true);
    expect(meta?.version).toBe(SAVE_VERSION);
    expect(meta?.updatedAt).toBe(1234);
    expect(meta?.nickname).toBe('TestBuddy');
  });
});

describe('Export / import', () => {
  it('throws when exporting with no save', async () => {
    await expect(exportSave()).rejects.toThrow('No save to export');
  });

  it('exports a base64 payload that decodes to the saved json', async () => {
    await saveGame(makeSave({ guestId: 'exp-1' }));

    const encoded = await exportSave();
    const decoded = JSON.parse(atob(encoded)) as GameSave;

    expect(decoded.guestId).toBe('exp-1');
  });

  it('round-trips export -> delete -> import', async () => {
    await saveGame(makeSave({ guestId: 'rt-1' }));
    const encoded = await exportSave();
    await deleteSave();

    expect(await importSave(encoded)).toBe(true);
    expect((await loadGame())!.guestId).toBe('rt-1');
  });

  it('rejects a payload that is not valid base64/json', async () => {
    expect(await importSave('%%%not-base64%%%')).toBe(false);
  });

  it('rejects a JSON payload without a guestId', async () => {
    const bad = btoa(
      JSON.stringify({ version: 1, buddy: null, createdAt: 1, updatedAt: 1 })
    );

    expect(await importSave(bad)).toBe(false);
  });

  it('rejects a JSON payload without a version', async () => {
    const bad = btoa(
      JSON.stringify({ buddy: null, guestId: 'x', createdAt: 1, updatedAt: 1 })
    );

    expect(await importSave(bad)).toBe(false);
  });

  it('does not overwrite an existing save when an import is rejected', async () => {
    await saveGame(makeSave({ guestId: 'keep-me' }));
    const bad = btoa(JSON.stringify({ version: 0, buddy: null, guestId: '' }));

    expect(await importSave(bad)).toBe(false);
    expect((await loadGame())!.guestId).toBe('keep-me');
  });
});
