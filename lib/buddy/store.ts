import { create } from 'zustand';
import { BuddyState, InventoryState, ProgressionState, AdventureResult, DecorPlacement, DEFAULT_PLACED_DECOR } from '@/lib/generation/types';
import { GameScreen } from '@/lib/buddy/screens';
import { createInitialProgression } from '@/lib/progression/lifecycle';
import { initSpeciesBook, initLoreJournal, initPhotoAlbum, addPhoto as addPhotoUtil } from '@/lib/collections';
import { initDailyLogin } from '@/lib/events';
import type { SpeciesEntry, LoreEntry, PhotoEntry } from '@/lib/collections';
import type { DailyLoginState } from '@/lib/events';

interface GameStore {
  buddy: BuddyState | null;
  screen: GameScreen;
  guestId: string;
  isOnline: boolean;
  inventory: InventoryState;
  currentAdventureResult: AdventureResult | null;
  placedDecor: DecorPlacement[];
  speciesBook: SpeciesEntry[];
  loreJournal: LoreEntry[];
  photoAlbum: PhotoEntry[];
  dailyLogin: DailyLoginState;
  soundEnabled: boolean;
  minigameHighScores: Record<string, number>;

  setBuddy: (buddy: BuddyState) => void;
  setScreen: (screen: GameScreen) => void;
  setGuestId: (id: string) => void;
  setIsOnline: (online: boolean) => void;
  updateBuddy: (updates: Partial<BuddyState>) => void;
  setInventory: (inventory: InventoryState) => void;
  addCoins: (amount: number) => void;
  addItem: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string, quantity: number) => void;
  setCurrentAdventureResult: (result: AdventureResult | null) => void;
  initializeProgression: () => void;
  placeDecor: (slotId: string, itemId: string | null) => void;
  setPlacedDecor: (decor: DecorPlacement[]) => void;
  setSpeciesBook: (book: SpeciesEntry[]) => void;
  setLoreJournal: (journal: LoreEntry[]) => void;
  setPhotoAlbum: (photos: PhotoEntry[]) => void;
  addPhoto: (photo: PhotoEntry) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setDailyLogin: (dl: DailyLoginState) => void;
  updateMinigameHighScore: (game: string, score: number) => void;
  setMinigameHighScores: (scores: Record<string, number>) => void;
}

const DEFAULT_INVENTORY: InventoryState = {
  coins: 0,
  items: [],
};

export const useGameStore = create<GameStore>((set) => ({
  buddy: null,
  screen: 'boot',
  guestId: '',
  isOnline: true,
  inventory: DEFAULT_INVENTORY,
  currentAdventureResult: null,
  placedDecor: [...DEFAULT_PLACED_DECOR],
  speciesBook: initSpeciesBook(),
  loreJournal: initLoreJournal(),
  photoAlbum: initPhotoAlbum(),
  dailyLogin: initDailyLogin(),
  soundEnabled: true,
  minigameHighScores: {},

  setBuddy: (buddy) => set({ buddy }),
  setScreen: (screen) => set({ screen }),
  setGuestId: (guestId) => set({ guestId }),
  setIsOnline: (isOnline) => set({ isOnline }),
  updateBuddy: (updates) =>
    set((state) => {
      if (!state.buddy) return state;
      const merged = { ...state.buddy, ...updates };
      if (updates.needs) merged.needs = { ...state.buddy.needs, ...updates.needs };
      if (updates.stats) merged.stats = { ...state.buddy.stats, ...updates.stats };
      if (updates.progression && state.buddy.progression) {
        merged.progression = { ...state.buddy.progression, ...updates.progression };
      }
      return { buddy: merged };
    }),
  setInventory: (inventory) => set({ inventory }),
  addCoins: (amount) =>
    set((state) => ({
      inventory: { ...state.inventory, coins: state.inventory.coins + amount },
    })),
  addItem: (itemId, quantity) =>
    set((state) => {
      const existing = state.inventory.items.find(i => i.id === itemId);
      const items = existing
        ? state.inventory.items.map(i =>
            i.id === itemId ? { ...i, quantity: i.quantity + quantity } : i
          )
        : [...state.inventory.items, { id: itemId, quantity }];
      return { inventory: { ...state.inventory, items } };
    }),
  removeItem: (itemId, quantity) =>
    set((state) => {
      const items = state.inventory.items
        .map(i => i.id === itemId ? { ...i, quantity: i.quantity - quantity } : i)
        .filter(i => i.quantity > 0);
      return { inventory: { ...state.inventory, items } };
    }),
  setCurrentAdventureResult: (result) => set({ currentAdventureResult: result }),
  initializeProgression: () =>
    set((state) => {
      if (!state.buddy) return state;
      return {
        buddy: {
          ...state.buddy,
          progression: state.buddy.progression || createInitialProgression(),
        },
      };
    }),
  placeDecor: (slotId, itemId) =>
    set((state) => {
      let newInventory = state.inventory;
      if (itemId !== null) {
        const items = state.inventory.items
          .map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i)
          .filter(i => i.quantity > 0);
        newInventory = { ...state.inventory, items };
      } else {
        const prev = state.placedDecor.find(p => p.slotId === slotId);
        if (prev && prev.itemId) {
          const items = [...state.inventory.items];
          const existing = items.find(i => i.id === prev.itemId);
          if (existing) {
            items.splice(items.indexOf(existing), 1, { ...existing, quantity: existing.quantity + 1 });
          } else {
            items.push({ id: prev.itemId, quantity: 1 });
          }
          newInventory = { ...state.inventory, items };
        }
      }
      return {
        inventory: newInventory,
        placedDecor: state.placedDecor.map(p =>
          p.slotId === slotId ? { slotId, itemId } : p
        ),
      };
    }),
  setPlacedDecor: (decor) => set({ placedDecor: decor }),
  setSpeciesBook: (book) => set({ speciesBook: book }),
  setLoreJournal: (journal) => set({ loreJournal: journal }),
  setPhotoAlbum: (photos) => set({ photoAlbum: photos }),
  addPhoto: (photo) => set((state) => ({ photoAlbum: addPhotoUtil(state.photoAlbum, photo) })),
  setDailyLogin: (dl) => set({ dailyLogin: dl }),
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  updateMinigameHighScore: (game, score) =>
    set((state) => ({
      minigameHighScores: {
        ...state.minigameHighScores,
        [game]: Math.max(state.minigameHighScores[game] || 0, score),
      },
    })),
  setMinigameHighScores: (scores) => set({ minigameHighScores: scores }),
}));
