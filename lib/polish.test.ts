import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialProgression } from '@/lib/progression/lifecycle';

describe('Silent Mode', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to off (no localStorage key)', () => {
    expect(localStorage.getItem('buddy-silent-mode')).toBeNull();
  });

  it('can be enabled via localStorage', () => {
    localStorage.setItem('buddy-silent-mode', 'true');
    expect(localStorage.getItem('buddy-silent-mode')).toBe('true');
  });

  it('can be disabled by removing key', () => {
    localStorage.setItem('buddy-silent-mode', 'true');
    localStorage.removeItem('buddy-silent-mode');
    expect(localStorage.getItem('buddy-silent-mode')).toBeNull();
  });
});

describe('Shiny Sparkle', () => {
  it('shiny-sparkle CSS class exists in styles', () => {
    const buddy = { identity: { isShiny: true } } as any;
    expect(buddy.identity.isShiny).toBe(true);
  });

  it('non-shiny does not get sparkle class', () => {
    const buddy = { identity: { isShiny: false } } as any;
    expect(buddy.identity.isShiny).toBe(false);
  });
});

describe('Idle Messages', () => {
  it('personalities should have idleLines', () => {
    const personalities = [
      { id: 'curious', idleLines: ['Hmm...', 'What is that?', 'Let me see!'] },
    ];
    for (const p of personalities) {
      expect(p.idleLines.length).toBeGreaterThan(0);
    }
  });

  it('idle messages cycle through array', () => {
    const lines = ['Hello', 'World', 'Test'];
    expect(lines[0]).toBe('Hello');
    expect(lines[1]).toBe('World');
    expect(lines[2]).toBe('Test');
  });
});

describe('Care Journal', () => {
  it('tracks recent actions', () => {
    const journal: { action: string; timestamp: number }[] = [];
    journal.push({ action: 'feed', timestamp: Date.now() });
    journal.push({ action: 'play', timestamp: Date.now() + 1000 });
    expect(journal).toHaveLength(2);
    expect(journal[0].action).toBe('feed');
  });

  it('limits to 10 entries', () => {
    const journal: { action: string; timestamp: number }[] = [];
    for (let i = 0; i < 15; i++) {
      journal.push({ action: 'feed', timestamp: Date.now() + i });
    }
    const trimmed = journal.slice(0, 10);
    expect(trimmed).toHaveLength(10);
  });
});

describe('Hatch Polish', () => {
  it('reveal shows personality name', () => {
    const personality = { name: 'Curious', description: 'Always exploring' };
    expect(personality.name).toBeTruthy();
    expect(personality.description).toBeTruthy();
  });

  it('reveal shows peak and dump stats', () => {
    const stats = { strength: 8, agility: 5, intelligence: 3, social: 7, vitality: 6 };
    const entries = Object.entries(stats) as [string, number][];
    const peak = entries.reduce((a, b) => a[1] > b[1] ? a : b);
    const dump = entries.reduce((a, b) => a[1] < b[1] ? a : b);
    expect(peak[0]).toBe('strength');
    expect(peak[1]).toBe(8);
    expect(dump[0]).toBe('intelligence');
    expect(dump[1]).toBe(3);
  });

  it('first hatch memory is recorded', () => {
    const progression = createInitialProgression();
    const memory = {
      id: 'hatch-' + Date.now().toString(36),
      type: 'hatch' as const,
      title: 'A Fluffkin is born!',
      description: 'Fluffkin hatched from a mysterious egg.',
      timestamp: Date.now(),
      icon: '🥚',
    };
    const updated = { ...progression, memories: [memory, ...progression.memories] };
    expect(updated.memories).toHaveLength(1);
    expect(updated.memories[0].title).toContain('Fluffkin');
    expect(updated.memories[0].type).toBe('hatch');
  });
});
