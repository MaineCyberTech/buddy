import { BuddyState, InventoryState, DecorPlacement } from '@/lib/generation/types';
import { saveGame } from '@/lib/storage/indexeddb';

let autosaveTimer: ReturnType<typeof setInterval> | null = null;

export function startAutosave(
  getBuddy: () => BuddyState | null,
  getInventory: () => InventoryState,
  getGuestId: () => string,
  getPlacedDecor?: () => DecorPlacement[],
  intervalMs: number = 10000
): void {
  stopAutosave();

  autosaveTimer = setInterval(async () => {
    const buddy = getBuddy();
    if (!buddy) return;

    try {
      await saveGame({
        version: 2,
        buddy,
        guestId: getGuestId(),
        createdAt: buddy.identity.generatedAt,
        updatedAt: Date.now(),
        inventory: getInventory(),
        placedDecor: getPlacedDecor ? getPlacedDecor() : undefined,
      });
    } catch (error) {
      console.error('Autosave failed:', error);
    }
  }, intervalMs);
}

export function stopAutosave(): void {
  if (autosaveTimer) {
    clearInterval(autosaveTimer);
    autosaveTimer = null;
  }
}