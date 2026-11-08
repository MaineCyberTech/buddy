import { BuddyState, GameSave, InventoryState } from '@/lib/generation/types';
import { SAVE_VERSION } from '@/lib/storage/schema';
import { saveGame } from '@/lib/storage/indexeddb';

export interface PersistGameInput {
  buddy: BuddyState;
  inventory: InventoryState;
  guestId: string;
}

/**
 * Build the canonical save payload for a gameplay mutation.
 *
 * Every mutation path (care, adventure, inventory) goes through this helper so
 * the version, timestamps and inventory snapshot cannot drift between screens
 * (ARCH-P2-001 / DATA-P2-001 / USE-P2-001).
 */
export function createGameSave({ buddy, inventory, guestId }: PersistGameInput): GameSave {
  return {
    version: SAVE_VERSION,
    guestId,
    buddy,
    createdAt: buddy.identity.generatedAt,
    updatedAt: Date.now(),
    inventory,
  };
}

export async function persistGame(input: PersistGameInput): Promise<GameSave> {
  const save = createGameSave(input);
  await saveGame(save);
  return save;
}
