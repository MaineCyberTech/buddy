import { GameSave } from '@/lib/generation/types';
import { openDB } from 'idb';
import { SyncResult, CloudSaveEnvelope } from './types';

const CLOUD_DB = 'buddy-cloud';
const CLOUD_STORE = 'saves';
const CLOUD_VERSION = 1;

async function getCloudDb() {
  return openDB(CLOUD_DB, CLOUD_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(CLOUD_STORE)) {
        db.createObjectStore(CLOUD_STORE, { keyPath: 'userId' });
      }
    },
  });
}

function computeChecksum(save: GameSave): string {
  const str = JSON.stringify({ buddy: save.buddy, inventory: save.inventory, placedDecor: save.placedDecor });
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

export const CloudSaveService = {
  async upload(save: GameSave, userId: string): Promise<void> {
    const db = await getCloudDb();
    const envelope: CloudSaveEnvelope = {
      version: save.version,
      userId,
      buddyId: save.buddy?.identity.speciesId || 'unknown',
      checksum: computeChecksum(save),
      timestamp: Date.now(),
    };
    await db.put(CLOUD_STORE, {
      userId,
      save,
      envelope,
      updatedAt: Date.now(),
    });
  },

  async download(userId: string): Promise<GameSave | null> {
    const db = await getCloudDb();
    const entry = await db.get(CLOUD_STORE, userId);
    return entry?.save || null;
  },

  async getEnvelope(userId: string): Promise<CloudSaveEnvelope | null> {
    const db = await getCloudDb();
    const entry = await db.get(CLOUD_STORE, userId);
    return entry?.envelope || null;
  },

  async resolveConflict(local: GameSave, cloud: GameSave): Promise<SyncResult> {
    if (!local.updatedAt || !cloud.updatedAt) {
      return { status: 'error', message: 'Missing timestamps for conflict resolution.' };
    }
    if (local.updatedAt >= cloud.updatedAt) {
      return { status: 'ok', localVersion: local.version, cloudVersion: cloud.version, message: 'Local save is newer.' };
    }
    return { status: 'conflict', localVersion: local.version, cloudVersion: cloud.version, message: 'Cloud save is newer. Manual resolution recommended.' };
  },
};
