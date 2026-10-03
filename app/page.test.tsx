import { render, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

const { loadGame, hasSave } = vi.hoisted(() => ({
  loadGame: vi.fn(),
  hasSave: vi.fn(),
}));

vi.mock('@/lib/storage/indexeddb', () => ({ loadGame, hasSave }));

import HomePage from '@/app/page';
import { useGameStore } from '@/lib/buddy/store';
import { createInitialBuddyState } from '@/lib/generation/engine';

// ARCH-P2-002: the persisted guestId must be restored into the store on reload so
// subsequent saves keep the same identity.
describe('HomePage guest identity restore (ARCH-P2-002)', () => {
  beforeEach(() => {
    useGameStore.setState({
      buddy: null,
      screen: 'boot',
      guestId: '',
      isOnline: true,
      inventory: { coins: 0, items: [] },
      currentAdventureResult: null,
    });
    hasSave.mockReset();
    loadGame.mockReset();
    hasSave.mockResolvedValue(true);
  });

  it('restores guestId and buddy from the loaded save', async () => {
    const buddy = createInitialBuddyState('guest-abc', 'Persisted');
    loadGame.mockResolvedValue({
      version: 2,
      guestId: 'guest-abc',
      buddy,
      createdAt: 1,
      updatedAt: 2,
      inventory: { coins: 3, items: [] },
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(useGameStore.getState().guestId).toBe('guest-abc');
    });
    expect(useGameStore.getState().buddy?.identity.nickname).toBe('Persisted');
    expect(useGameStore.getState().inventory.coins).toBe(3);
  });
});
