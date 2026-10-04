import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatBars, NeedBars } from '@/components/ui/StatBars';
import { BuddyStats, BuddyNeeds } from '@/lib/generation/types';

const STATS: BuddyStats = {
  courage: 10,
  curiosity: 20,
  playfulness: 30,
  discipline: 40,
  empathy: 50,
};

const NEEDS: BuddyNeeds = {
  hunger: 90,
  happiness: 60,
  cleanliness: 10,
  energy: 5,
  social: 30,
};

describe('StatBars', () => {
  it('renders one progressbar per stat with accessible values', () => {
    render(<StatBars stats={STATS} />);

    const bars = screen.getAllByRole('progressbar');
    expect(bars).toHaveLength(5);

    const courage = screen.getByRole('progressbar', { name: 'Courage: 10/100' });
    expect(courage.getAttribute('aria-valuenow')).toBe('10');
    expect(courage.getAttribute('aria-valuemin')).toBe('0');
    expect(courage.getAttribute('aria-valuemax')).toBe('100');
  });

  it('clamps the rendered width to the 0-100 range', () => {
    render(<StatBars stats={{ ...STATS, courage: 150 }} />);

    const courage = screen.getByRole('progressbar', { name: 'Courage: 150/100' });
    expect((courage as HTMLElement).style.width).toBe('100%');
  });
});

describe('NeedBars', () => {
  it('renders a bar per need with the numeric label', () => {
    render(<NeedBars needs={NEEDS} />);

    expect(screen.getByRole('progressbar', { name: 'Hunger: 90/100' })).toBeTruthy();
    expect(screen.getByRole('progressbar', { name: 'Energy: 5/100' })).toBeTruthy();
  });

  it('uses the danger colour for needs below 20', () => {
    render(<NeedBars needs={NEEDS} />);

    const energy = screen.getByRole('progressbar', { name: 'Energy: 5/100' });
    expect(energy.className).toContain('from-[#ff3366]');
  });

  it('uses the accent colour for healthy needs', () => {
    render(<NeedBars needs={NEEDS} />);

    const hunger = screen.getByRole('progressbar', { name: 'Hunger: 90/100' });
    expect(hunger.className).toContain('from-[#00ff88]');
  });
});
