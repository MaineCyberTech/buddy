import { create } from 'zustand';
import { BuddyState } from '@/lib/generation/types';
import { GameScreen } from '@/lib/buddy/screens';

interface GameStore {
  buddy: BuddyState | null;
  screen: GameScreen;
  guestId: string;
  isOnline: boolean;

  setBuddy: (buddy: BuddyState) => void;
  setScreen: (screen: GameScreen) => void;
  setGuestId: (id: string) => void;
  setIsOnline: (online: boolean) => void;
  updateBuddy: (updates: Partial<BuddyState>) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  buddy: null,
  screen: 'boot',
  guestId: '',
  isOnline: true,

  setBuddy: (buddy) => set({ buddy }),
  setScreen: (screen) => set({ screen }),
  setGuestId: (guestId) => set({ guestId }),
  setIsOnline: (isOnline) => set({ isOnline }),
  updateBuddy: (updates) =>
    set((state) => ({
      buddy: state.buddy ? { ...state.buddy, ...updates } : null,
    })),
}));