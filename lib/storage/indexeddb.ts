import { openDB, IDBPDatabase } from 'idb';
import { GameSave } from '@/lib/generation/types';
import { MAX_IMPORT_LENGTH, validateSave } from '@/lib/storage/schema';

const DB_NAME = 'buddy-save';
const DB_VERSION = 2;
const STORE_NAME = 'saves';

let dbInstance: IDBPDatabase | null = null;

async function getDb(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, _newVersion, transaction) {
      if (oldVersion < 1) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      }
    },
  });

  return dbInstance;
}

const SAVE_KEY = 'buddy-current-save';

export async function saveGame(save: GameSave): Promise<void> {
  try {
    const db = await getDb();
    await db.put(STORE_NAME, { key: SAVE_KEY, value: save, timestamp: Date.now() });
  } catch (error) {
    console.error('Failed to save game:', error);
    throw new Error('Save failed');
  }
}

export async function loadGame(): Promise<GameSave | null> {
  try {
    const db = await getDb();
    const entry = await db.get(STORE_NAME, SAVE_KEY);
    if (!entry?.value) return null;

    // IndexedDB contents are user-editable, so migrate + validate before use.
    // Never rewrite the version without running the matching migration.
    const result = validateSave(entry.value);
    if (!result.ok) {
      console.error('Invalid save data:', result.error);
      return null;
    }

    return result.save;
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
}

export async function hasSave(): Promise<boolean> {
  try {
    const db = await getDb();
    const count = await db.count(STORE_NAME, SAVE_KEY);
    return count > 0;
  } catch {
    return false;
  }
}

export async function deleteSave(): Promise<void> {
  try {
    const db = await getDb();
    await db.delete(STORE_NAME, SAVE_KEY);
  } catch (error) {
    console.error('Failed to delete save:', error);
  }
}

export async function exportSave(): Promise<string> {
  const save = await loadGame();
  if (!save) throw new Error('No save to export');
  const json = JSON.stringify(save);
  return btoa(json);
}

export async function importSave(encoded: string): Promise<boolean> {
  try {
    if (typeof encoded !== 'string' || encoded.length === 0 || encoded.length > MAX_IMPORT_LENGTH) {
      throw new Error('Save payload size invalid');
    }
    const json = atob(encoded);
    const raw = JSON.parse(json) as unknown;
    const result = validateSave(raw);
    if (!result.ok) {
      throw new Error('Invalid save format: ' + result.error);
    }
    await saveGame(result.save);
    return true;
  } catch (error) {
    console.error('Failed to import save:', error);
    return false;
  }
}

export async function getSaveMetadata(): Promise<{
  exists: boolean;
  version?: number;
  updatedAt?: number;
  speciesName?: string;
  nickname?: string;
} | null> {
  try {
    const save = await loadGame();
    if (!save) return { exists: false };
    return {
      exists: true,
      version: save.version,
      updatedAt: save.updatedAt,
      speciesName: save.buddy?.identity.speciesName,
      nickname: save.buddy?.identity.nickname,
    };
  } catch {
    return { exists: false };
  }
}