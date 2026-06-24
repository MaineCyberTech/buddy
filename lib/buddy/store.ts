import { create } from 'zustand';
import { BuddyState, InventoryState, ProgressionState, AdventureResult } from '@/lib/generation/types';
import { GameScreen } from '@/lib/buddy/screens';
import { createInitialProgression } from '@/lib/progression/lifecycle';

interface GameStore {
  buddy: BuddyState | null;
  screen: GameScreen;
  guestId: string;
  isOnline: boolean;
  inventory: InventoryState;
  currentAdventureResult: AdventureResult | null;

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
      const items = [...state.inventory.items];
      const existing = items.find(i => i.id === itemId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        items.push({ id: itemId, quantity });
      }
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
}));