import { openDB, IDBPDatabase } from 'idb';
import { GameSave, SaveSlotSummary } from '@/lib/generation/types';

const DB_NAME = 'buddy-save';
const DB_VERSION = 3;
const STORE_NAME = 'saves';

let dbInstance: IDBPDatabase | null = null;

async function getDb(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, _newVersion, _transaction) {
      if (oldVersion < 1) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      }
      if (oldVersion < 3) {
        db.createObjectStore('meta', { keyPath: 'key' });
      }
    },
  });

  return dbInstance;
}

function saveKey(slot?: number): string {
  return `buddy-save-slot-${slot || 1}`;
}

export const MAX_SAVE_SLOTS = 3;

export async function saveGame(save: GameSave): Promise<void> {
  try {
    const db = await getDb();
    const key = saveKey(save.saveSlot);
    await db.put(STORE_NAME, { key, value: save, timestamp: Date.now() });
    await updateSlotMeta(save);
  } catch (error) {
    console.error('Failed to save game:', error);
    throw new Error('Save failed');
  }
}

async function updateSlotMeta(save: GameSave): Promise<void> {
  try {
    const db = await getDb();
    const slot = save.saveSlot || 1;
    const meta: SaveSlotSummary = {
      slot,
      buddy: save.buddy,
      createdAt: save.createdAt,
      updatedAt: save.updatedAt,
      playTime: 0,
      buddyName: save.buddy?.identity?.nickname || 'Empty',
      buddySpecies: save.buddy?.identity?.speciesName || '—',
      buddyRarity: save.buddy?.identity?.rarity || 'common',
      buddyShiny: save.buddy?.identity?.isShiny || false,
    };
    await db.put('meta', { key: `slot-${slot}`, value: meta, timestamp: Date.now() });
  } catch { /* ignore meta errors */ }
}

export async function loadGame(slot: number): Promise<GameSave | null> {
  try {
    const db = await getDb();
    const entry = await db.get(STORE_NAME, saveKey(slot));
    if (!entry?.value) return null;
    return entry.value as GameSave;
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
}

export async function loadAllSlots(): Promise<SaveSlotSummary[]> {
  try {
    const db = await getDb();
    const all = await db.getAll('meta');
    const slots: SaveSlotSummary[] = [];
    for (let i = 1; i <= MAX_SAVE_SLOTS; i++) {
      const found = all.find(e => e.key === `slot-${i}`);
      if (found?.value) {
        slots.push(found.value);
      } else {
        slots.push({
          slot: i,
          buddy: null,
          createdAt: 0,
          updatedAt: 0,
          playTime: 0,
          buddyName: 'Empty',
          buddySpecies: '—',
          buddyRarity: 'common',
          buddyShiny: false,
        });
      }
    }
    return slots;
  } catch {
    return Array.from({ length: MAX_SAVE_SLOTS }, (_, i) => ({
      slot: i + 1,
      buddy: null,
      createdAt: 0,
      updatedAt: 0,
      playTime: 0,
      buddyName: 'Empty',
      buddySpecies: '—',
      buddyRarity: 'common',
      buddyShiny: false,
    }));
  }
}

export async function deleteSave(slot: number): Promise<void> {
  try {
    const db = await getDb();
    await db.delete(STORE_NAME, saveKey(slot));
    await db.delete('meta', `slot-${slot}`);
  } catch (error) {
    console.error('Failed to delete save:', error);
  }
}

export async function hasSave(slot?: number): Promise<boolean> {
  try {
    if (slot) {
      const save = await loadGame(slot);
      return save !== null;
    }
    const slots = await loadAllSlots();
    return slots.some(s => s.buddy !== null);
  } catch {
    return false;
  }
}

export async function exportSave(): Promise<string> {
  try {
    const db = await getDb();
    const all = await db.getAll(STORE_NAME);
    const saves = all.map(e => e.value).filter((v): v is GameSave => v !== undefined);
    return JSON.stringify({ version: 3, saves });
  } catch {
    throw new Error('Export failed');
  }
}

export async function importSave(json: string): Promise<boolean> {
  try {
    const data = JSON.parse(json);
    if (!data.saves || !Array.isArray(data.saves)) return false;
    const db = await getDb();
    for (const save of data.saves) {
      if (save && save.saveSlot) {
        await saveGame(save);
      }
    }
    return true;
  } catch {
    return false;
  }
}