import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InventoryScreen } from '@/components/device/InventoryScreen';
import { useGameStore } from '@/lib/buddy/store';
import { createInitialBuddyState } from '@/lib/generation/engine';
import { BuddyState, InventoryState } from '@/lib/generation/types';
import { deleteSave, loadGame } from '@/lib/storage/indexeddb';

function makeBuddy(overrides: Partial<BuddyState> = {}): BuddyState {
  const base = createInitialBuddyState('inventory-screen-test', 'Pocket');
  return {
    ...base,
    identity: { ...base.identity, hat: 'none' },
    ...overrides,
  };
}

function resetStore(buddy: BuddyState | null = null, inventory: InventoryState = { coins: 0, items: [] }) {
  useGameStore.setState({
    buddy,
    screen: 'boot',
    guestId: 'guest-inventory-test',
    isOnline: true,
    inventory,
    currentAdventureResult: null,
  });
}

beforeEach(async () => {
  await deleteSave();
  resetStore();
});

afterEach(async () => {
  resetStore();
  await deleteSave();
});

// ARCH-P2-001 / DATA-P2-001 / USE-P2-001: item actions must survive a reload.
describe('InventoryScreen persistence', () => {
  it('persists a used item and restores the reduced stack on reload', async () => {
    const buddy = makeBuddy();
    resetStore(buddy, { coins: 0, items: [{ id: 'apple', quantity: 2 }] });

    render(<InventoryScreen onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Use Apple' }));

    await waitFor(() => expect(screen.getByText('saved')).toBeTruthy());
    expect(useGameStore.getState().inventory.items).toEqual([{ id: 'apple', quantity: 1 }]);

    const loaded = await loadGame();
    expect(loaded?.inventory).toEqual({ coins: 0, items: [{ id: 'apple', quantity: 1 }] });

    // Simulate a reload: drop the store and hydrate only from the save layer.
    resetStore();
    useGameStore.getState().setBuddy(loaded!.buddy!);
    useGameStore.getState().setInventory(loaded!.inventory!);
    expect(useGameStore.getState().inventory.items).toEqual([{ id: 'apple', quantity: 1 }]);
  });

  it('persists coins from a sale after the confirmation step', async () => {
    const buddy = makeBuddy();
    resetStore(buddy, { coins: 0, items: [{ id: 'apple', quantity: 2 }] });

    render(<InventoryScreen onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Sell Apple for 2 coins' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm selling Apple for 2 coins' }));

    await waitFor(() => expect(screen.getByText('saved')).toBeTruthy());

    const loaded = await loadGame();
    expect(loaded?.inventory).toEqual({ coins: 2, items: [{ id: 'apple', quantity: 1 }] });
  });

  it('clears and persists the equipped hat when its last copy is sold', async () => {
    const buddy = makeBuddy();
    buddy.identity.hat = 'flower_crown';
    resetStore(buddy, { coins: 0, items: [{ id: 'flower_crown', quantity: 1 }] });

    render(<InventoryScreen onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Sell Flower Crown for 12 coins' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Confirm selling Flower Crown for 12 coins' })
    );

    await waitFor(() => expect(screen.getByText('saved')).toBeTruthy());
    expect(useGameStore.getState().buddy!.identity.hat).toBe('none');

    const loaded = await loadGame();
    expect(loaded?.buddy?.identity.hat).toBe('none');
    expect(loaded?.inventory?.coins).toBe(12);
  });

  it('can cancel a sale without changing or persisting anything', async () => {
    const buddy = makeBuddy();
    resetStore(buddy, { coins: 0, items: [{ id: 'apple', quantity: 1 }] });

    render(<InventoryScreen onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Sell Apple for 2 coins' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel selling Apple' }));

    expect(useGameStore.getState().inventory.items).toEqual([{ id: 'apple', quantity: 1 }]);
    expect(await loadGame()).toBeNull();
  });
});
