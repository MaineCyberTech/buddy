import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MainDevice } from '@/components/device/MainDevice';
import { useGameStore } from '@/lib/buddy/store';
import { createInitialBuddyState } from '@/lib/generation/engine';
import { BuddyState } from '@/lib/generation/types';

function makeBuddy(overrides: Partial<BuddyState> = {}): BuddyState {
  const base = createInitialBuddyState('main-device-test', 'Bud');
  return {
    ...base,
    needs: { hunger: 40, happiness: 40, cleanliness: 40, energy: 40, social: 40 },
    mood: 'neutral',
    health: 100,
    bond: 10,
    ...overrides,
  };
}

function resetStore() {
  useGameStore.setState({
    buddy: null,
    screen: 'boot',
    guestId: '',
    isOnline: true,
    inventory: { coins: 0, items: [] },
    currentAdventureResult: null,
  });
}

beforeEach(resetStore);
afterEach(resetStore);

describe('MainDevice', () => {
  it('renders identity, level and the care action controls', () => {
    const buddy = makeBuddy();
    useGameStore.setState({ buddy });

    render(<MainDevice buddy={buddy} />);

    expect(screen.getByText('Lv.1')).toBeTruthy();
    expect(screen.getByText('NEUTRAL')).toBeTruthy();
    for (const label of ['Feed', 'Play', 'Wash', 'Rest', 'Talk', 'Train', 'Heal']) {
      expect(screen.getByRole('button', { name: label })).toBeTruthy();
    }
  });

  it('applies a care action to the device display and the store', async () => {
    const buddy = makeBuddy();
    useGameStore.setState({ buddy });
    render(<MainDevice buddy={buddy} />);

    fireEvent.click(screen.getByRole('button', { name: 'Feed' }));

    await waitFor(() => {
      expect(useGameStore.getState().buddy!.needs.hunger).toBeGreaterThan(40);
    });

    const status = screen.getByRole('status');
    expect(status.textContent).toBeTruthy();
    expect(screen.getByText(`♥ ${useGameStore.getState().buddy!.bond}`)).toBeTruthy();
  });

  it('shows stat and need progressbars on the STATS tab', () => {
    const buddy = makeBuddy();
    useGameStore.setState({ buddy });
    render(<MainDevice buddy={buddy} />);

    fireEvent.click(screen.getByRole('button', { name: 'STATS' }));

    // 5 stats + 5 needs
    expect(screen.getAllByRole('progressbar')).toHaveLength(10);
  });

  it('renders the profile tab content', () => {
    const buddy = makeBuddy();
    useGameStore.setState({ buddy });
    render(<MainDevice buddy={buddy} />);

    fireEvent.click(screen.getByRole('button', { name: 'PROFILE' }));

    expect(screen.getByText('Bud')).toBeTruthy();
    expect(screen.getByText(`the ${buddy.identity.speciesName}`)).toBeTruthy();
  });
});

// ARCH-P1-002: the device must render the store's buddy (single source of truth),
// not a private copy, so adventure results written to the store are reflected
// immediately without remounting.
describe('MainDevice store decoupling (ARCH-P1-002)', () => {
  beforeEach(resetStore);

  it('seeds the store from its prop and re-renders when the store buddy changes', () => {
    const initial = createInitialBuddyState('guest-test', 'Tester');
    render(<MainDevice buddy={initial} />);

    expect(useGameStore.getState().buddy?.identity.nickname).toBe('Tester');
    expect(screen.getByText(/Lv\.1/)).toBeTruthy();

    const updated = { ...initial, level: 7, health: 42 };
    act(() => {
      useGameStore.getState().setBuddy(updated);
    });

    expect(screen.getByText(/Lv\.7/)).toBeTruthy();
    expect(screen.getByText(/HP 42/)).toBeTruthy();
  });
});
