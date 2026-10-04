import { describe, it, expect } from 'vitest';
import { SAVE_VERSION, validateSave } from '@/lib/storage/schema';
import { createInitialBuddyState } from '@/lib/generation/engine';
import { GameSave } from '@/lib/generation/types';

function validSave(): GameSave {
  const buddy = createInitialBuddyState('guest-test', 'Testy');
  return {
    version: SAVE_VERSION,
    buddy,
    guestId: 'guest-test',
    createdAt: buddy.identity.generatedAt,
    updatedAt: Date.now(),
    inventory: { coins: 100, items: [{ id: 'apple', quantity: 2 }] },
  };
}

describe('Save schema + migration', () => {
  it('declares the current save version as 2', () => {
    expect(SAVE_VERSION).toBe(2);
  });

  it('accepts a valid current save and preserves the version', () => {
    const save = validSave();
    const result = validateSave(save);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.save.version).toBe(SAVE_VERSION);
      expect(result.save.guestId).toBe('guest-test');
      expect(result.save.buddy?.progression.lifecycle).toBe('baby');
      expect(result.save.inventory?.items).toEqual([{ id: 'apple', quantity: 2 }]);
    }
  });

  it('migrates a v1 fixture up to the current version with defaults', () => {
    const save = validSave();
    const { progression: _progression, ...buddyV1 } = save.buddy!;
    const v1 = { ...save, version: 1, buddy: buddyV1, inventory: undefined };
    const result = validateSave(v1);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.save.version).toBe(SAVE_VERSION);
      expect(result.save.buddy?.progression).toBeDefined();
      expect(result.save.buddy?.progression.totalAdventures).toBe(0);
      expect(result.save.inventory).toEqual({ coins: 0, items: [] });
    }
  });

  it('rejects a save with no version', () => {
    const { version: _version, ...noVersion } = validSave();
    const result = validateSave(noVersion);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/version/i);
  });

  it('rejects an unsupported future version instead of downgrading', () => {
    const result = validateSave({ ...validSave(), version: SAVE_VERSION + 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/unsupported/i);
  });

  it('rejects a save missing required fields', () => {
    const { guestId: _guestId, ...missingGuest } = validSave();
    expect(validateSave(missingGuest).ok).toBe(false);
  });

  it('rejects malformed nested data (wrong types)', () => {
    const save = validSave();
    const malformed = {
      ...save,
      buddy: { ...save.buddy!, stats: { ...save.buddy!.stats, courage: 'lots' } },
    };
    expect(validateSave(malformed).ok).toBe(false);
  });

  it('rejects an unknown mood/mood enum value', () => {
    const save = validSave();
    const malformed = { ...save, buddy: { ...save.buddy!, mood: 'ecstatic' } };
    expect(validateSave(malformed).ok).toBe(false);
  });

  it('clamps out-of-range stats into [0, 100]', () => {
    const save = validSave();
    const drifted = {
      ...save,
      buddy: {
        ...save.buddy!,
        stats: { ...save.buddy!.stats, courage: 9999, empathy: -50 },
      },
    };
    const result = validateSave(drifted);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.save.buddy?.stats.courage).toBe(100);
      expect(result.save.buddy?.stats.empathy).toBe(0);
    }
  });

  it('rejects an oversized inventory rather than persisting it', () => {
    const save = validSave();
    const items = Array.from({ length: 501 }, (_, i) => ({ id: `item-${i}`, quantity: 1 }));
    const result = validateSave({ ...save, inventory: { coins: 0, items } });
    expect(result.ok).toBe(false);
  });

  it('rejects a null / non-object payload (bad import shape)', () => {
    expect(validateSave(null).ok).toBe(false);
    expect(validateSave('not-a-save').ok).toBe(false);
    expect(validateSave([1, 2, 3]).ok).toBe(false);
  });

  it('accepts a valid JSON import payload round-trip', () => {
    // Simulates the decoded payload handled by importSave.
    const encoded = JSON.stringify(validSave());
    const result = validateSave(JSON.parse(encoded));
    expect(result.ok).toBe(true);
  });
});
