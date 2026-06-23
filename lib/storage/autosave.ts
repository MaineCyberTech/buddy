import { BuddyState, InventoryState } from '@/lib/generation/types';
import { saveGame } from '@/lib/storage/indexeddb';

let autosaveTimer: ReturnType<typeof setInterval> | null = null;

export function startAutosave(
  getBuddy: () => BuddyState | null,
  getInventory: () => InventoryState,
  intervalMs: number = 10000
): void {
  stopAutosave();
  const guestId = 'guest-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  autosaveTimer = setInterval(async () => {
    const buddy = getBuddy();
    if (!buddy) return;

    try {
      await saveGame({
        version: 1,
        buddy,
        guestId,
        createdAt: buddy.identity.generatedAt,
        updatedAt: Date.now(),
        inventory: getInventory(),
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