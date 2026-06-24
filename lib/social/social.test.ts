import { describe, it, expect } from 'vitest';
import { initMemoryMatch, flipCard, resetFlipped, getMemoryMatchScore, initReactionTest, pressReactionButton, getReactionTestScore, initRhythmTap, tapRhythmNote, getRhythmTapScore } from '@/lib/minigames';
import { canBreed } from '@/lib/social/breeding';
import { generateDailyStock, getBuyPrice } from '@/lib/social/marketplace';

describe('Minigame: Memory Match', () => {
  it('initializes with correct number of cards', () => {
    const state = initMemoryMatch('easy');
    expect(state.cards.length).toBe(8);
    expect(state.moves).toBe(0);
    expect(state.completed).toBe(false);
  });

  it('flips a card', () => {
    const state = initMemoryMatch('easy');
    const next = flipCard(state, state.cards[0].id);
    expect(next.cards[0].flipped).toBe(true);
    expect(next.moves).toBe(1);
  });

  it('ignores flipping already flipped card', () => {
    const state = initMemoryMatch('easy');
    const first = flipCard(state, state.cards[0].id);
    const second = flipCard(first, state.cards[0].id);
    expect(second.moves).toBe(1);
  });

  it('scores completed game', () => {
    const state = initMemoryMatch('easy');
    const completed = { ...state, completed: true, moves: 8, elapsed: 5000 };
    const score = getMemoryMatchScore(completed);
    expect(score).toBeGreaterThan(0);
  });
});

describe('Minigame: Reaction Test', () => {
  it('initializes correctly', () => {
    const state = initReactionTest();
    expect(state.phase).toBe('waiting');
    expect(state.round).toBe(1);
    expect(state.maxRounds).toBe(5);
  });

  it('too-early tap sets phase', () => {
    const state = initReactionTest();
    const ready = { ...state, phase: 'ready' as const, targetTime: Date.now() + 5000 };
    const result = pressReactionButton(ready);
    expect(result.phase).toBe('too-early');
  });

  it('completes after max rounds', () => {
    const state = initReactionTest();
    const nearEnd = { ...state, phase: 'ready' as const, round: 5, targetTime: Date.now() - 100, scores: [100, 200, 300, 400] };
    const result = pressReactionButton(nearEnd);
    expect(result.completed).toBe(true);
  });

  it('calculates score', () => {
    const state = initReactionTest();
    const completed = { ...state, completed: true, scores: [150, 200, 180, 160, 190] };
    const score = getReactionTestScore(completed);
    expect(score).toBeGreaterThan(0);
  });
});

describe('Minigame: Rhythm Tap', () => {
  it('initializes with pattern', () => {
    const state = initRhythmTap('easy');
    expect(state.pattern.length).toBe(6);
    expect(state.phase).toBe('intro');
  });

  it('tracks correct and missed notes', () => {
    const state = initRhythmTap('easy');
    const playing = { ...state, phase: 'playing' as const, currentIndex: 0 };
    const expected = playing.pattern[0];
    const result = tapRhythmNote(playing, expected);
    expect(result.score).toBe(10);
    expect(result.misses).toBe(0);
  });

  it('misses wrong note', () => {
    const state = initRhythmTap('easy');
    const playing = { ...state, phase: 'playing' as const, currentIndex: 0 };
    const wrong = playing.pattern[0] === 'left' ? 'right' : 'left';
    const result = tapRhythmNote(playing, wrong);
    expect(result.misses).toBe(1);
  });

  it('scores completed game', () => {
    const state = initRhythmTap('easy');
    const completed = { ...state, completed: true, score: 50, pattern: ['left', 'right', 'left', 'right', 'left', 'right'] as ('left' | 'right')[] };
    const score = getRhythmTapScore(completed);
    expect(score).toBeGreaterThan(0);
  });
});

describe('Breeding', () => {
  it('canBreed checks stage', () => {
    const adult = { progression: { lifecycle: 'adult' } } as any;
    const baby = { progression: { lifecycle: 'baby' } } as any;
    expect(canBreed(adult)).toBe(true);
    expect(canBreed(baby)).toBe(false);
  });
});

describe('Marketplace', () => {
  it('generates daily stock', () => {
    const stock = generateDailyStock();
    expect(stock.length).toBeGreaterThanOrEqual(8);
    expect(stock[0]).toHaveProperty('itemId');
    expect(stock[0]).toHaveProperty('buyPrice');
    expect(stock[0]).toHaveProperty('stock');
  });

  it('buy price is always positive', () => {
    const price = getBuyPrice('test_item');
    expect(price).toBeGreaterThan(0);
  });
});