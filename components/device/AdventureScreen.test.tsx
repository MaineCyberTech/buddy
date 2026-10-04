import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdventureScreen } from '@/components/device/AdventureScreen';
import { useGameStore } from '@/lib/buddy/store';
import { createInitialBuddyState } from '@/lib/generation/engine';
import { BuddyState } from '@/lib/generation/types';

function makeBuddy(energy: number): BuddyState {
  const base = createInitialBuddyState('adventure-screen-test', 'Scout');
  return {
    ...base,
    needs: { ...base.needs, energy, hunger: 80, happiness: 80 },
  };
}

function resetStore() {
  useGameStore.setState({
    buddy: null,
    screen: 'boot',
    guestId: 'guest-adventure-test',
    isOnline: true,
    inventory: { coins: 0, items: [] },
    currentAdventureResult: null,
  });
}

beforeEach(resetStore);
afterEach(resetStore);

describe('AdventureScreen', () => {
  it('disables every location when the buddy has no energy', () => {
    useGameStore.setState({ buddy: makeBuddy(0) });

    render(<AdventureScreen onBack={() => {}} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    expect(buttons.every((b) => (b as HTMLButtonElement).disabled)).toBe(true);
    expect(screen.getByText(/Low energy/i)).toBeTruthy();
  });

  it('enables an affordable location when the buddy has energy', () => {
    useGameStore.setState({ buddy: makeBuddy(100) });

    render(<AdventureScreen onBack={() => {}} />);

    const backyard = screen.getByRole('button', { name: /^Backyard/ }) as HTMLButtonElement;
    expect(backyard.disabled).toBe(false);
  });

  it('applies the adventure result to the store and shows it', async () => {
    const buddy = makeBuddy(100);
    useGameStore.setState({ buddy });

    render(<AdventureScreen onBack={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /^Backyard/ }));

    // The component suspends for 1.5s before applying the result.
    await waitFor(
      () => expect(useGameStore.getState().currentAdventureResult).not.toBeNull(),
      { timeout: 4000 }
    );

    expect(screen.getByText(/SUCCESS|FAILED/)).toBeTruthy();
    expect(useGameStore.getState().buddy!.needs.energy).toBeLessThan(100);
  });
});
