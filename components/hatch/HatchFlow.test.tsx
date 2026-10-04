import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HatchFlow } from '@/components/hatch/HatchFlow';
import { useGameStore } from '@/lib/buddy/store';

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

async function hatchToNicknameStep() {
  render(<HatchFlow />);
  fireEvent.click(screen.getByRole('button', { name: 'Hatch your buddy' }));

  // Hatching reveal is delayed by 2s in the component.
  await waitFor(
    () =>
      expect(
        screen.getByRole('button', { name: 'NAME YOUR BUDDY' })
      ).toBeTruthy(),
    { timeout: 4000 }
  );
  fireEvent.click(screen.getByRole('button', { name: 'NAME YOUR BUDDY' }));
}

describe('HatchFlow', () => {
  it('caps the nickname at 16 characters', async () => {
    await hatchToNicknameStep();

    const input = screen.getByLabelText('Buddy nickname') as HTMLInputElement;
    expect(input.maxLength).toBe(16);

    fireEvent.change(input, { target: { value: 'x'.repeat(24) } });

    expect(input.value).toHaveLength(16);
  });

  it('commits the hatched buddy, the chosen nickname and the screen transition', async () => {
    await hatchToNicknameStep();

    const input = screen.getByLabelText('Buddy nickname') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Pip' } });
    fireEvent.click(screen.getByRole('button', { name: 'Start with your buddy' }));

    await waitFor(() => {
      expect(useGameStore.getState().screen).toBe('main');
    });
    expect(useGameStore.getState().buddy?.identity.nickname).toBe('Pip');
    // SEC-P3-001: the guest id is now a crypto-random UUID (with a legacy
    // `guest-...` fallback for non-secure contexts), so assert presence rather
    // than the old `guest-` prefix.
    expect(useGameStore.getState().guestId).toBeTruthy();
  });

  it('defaults the nickname to the species name when left blank', async () => {
    await hatchToNicknameStep();

    const nicknameBefore = useGameStore.getState().buddy;
    expect(nicknameBefore).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Start with your buddy' }));

    await waitFor(() => {
      expect(useGameStore.getState().screen).toBe('main');
    });
    const buddy = useGameStore.getState().buddy!;
    expect(buddy.identity.nickname).toBe(buddy.identity.speciesName);
  });
});
