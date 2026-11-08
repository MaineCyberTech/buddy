import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LcdDisplay } from '@/components/device/LcdDisplay';
import { createInitialBuddyState } from '@/lib/generation/engine';

function withHat(hat: string) {
  const buddy = createInitialBuddyState('lcd-hat-test', 'Hatty');
  return { ...buddy, identity: { ...buddy.identity, hat } };
}

// USE-P2-002: an equipped catalogue hat must render through the normalisation
// map rather than being silently ignored by the LCD renderer.
describe('LcdDisplay equipment rendering', () => {
  it('renders the flower crown style for the flower_crown item id', () => {
    render(<LcdDisplay buddy={withHat('flower_crown')} animate={false} />);
    expect(screen.getByRole('img').textContent).toContain('@');
  });

  it('renders the glasses style for the tiny_glasses item id', () => {
    render(<LcdDisplay buddy={withHat('tiny_glasses')} animate={false} />);
    expect(screen.getByRole('img').textContent).toContain('---');
  });

  it('renders the pilot hat style for the adventurer_hat item id', () => {
    const withItem = withHat('adventurer_hat');
    const without = withHat('none');
    const { unmount } = render(<LcdDisplay buddy={without} animate={false} />);
    const baseline = screen.getByRole('img').textContent ?? '';
    unmount();

    render(<LcdDisplay buddy={withItem} animate={false} />);
    expect(screen.getByRole('img').textContent).not.toBe(baseline);
    expect(screen.getByRole('img').textContent).toContain('/   \\');
  });
});
