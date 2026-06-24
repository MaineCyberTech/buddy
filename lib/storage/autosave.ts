import { BuddyState, InventoryState, DecorPlacement } from '@/lib/generation/types';
import { SpeciesEntry, LoreEntry, PhotoEntry } from '@/lib/collections';
import { saveGame } from '@/lib/storage/indexeddb';

let autosaveTimer: ReturnType<typeof setInterval> | null = null;

export function startAutosave(
  getBuddy: () => BuddyState | null,
  getInventory: () => InventoryState,
  getGuestId: () => string,
  getPlacedDecor?: () => DecorPlacement[],
  getSpeciesBook?: () => SpeciesEntry[],
  getLoreJournal?: () => LoreEntry[],
  getPhotoAlbum?: () => PhotoEntry[],
  getMinigameHighScores?: () => Record<string, number>,
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
        speciesBook: getSpeciesBook ? getSpeciesBook() : undefined,
        loreJournal: getLoreJournal ? getLoreJournal() : undefined,
        photoAlbum: getPhotoAlbum ? getPhotoAlbum() : undefined,
        minigameHighScores: getMinigameHighScores ? getMinigameHighScores() : undefined,
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