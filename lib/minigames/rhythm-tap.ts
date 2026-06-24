export interface RhythmTapState {
  pattern: ('left' | 'right')[];
  currentIndex: number;
  phase: 'intro' | 'playing' | 'result';
  score: number;
  misses: number;
  startTime: number;
  tapWindow: number;
  completed: boolean;
}

const NOTE_LEFT = 'left';
const NOTE_RIGHT = 'right';

function generatePattern(length: number): ('left' | 'right')[] {
  return Array.from({ length }, () => Math.random() < 0.5 ? NOTE_LEFT : NOTE_RIGHT);
}

export function initRhythmTap(difficulty: 'easy' | 'medium' | 'hard' = 'easy'): RhythmTapState {
  const length = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 10 : 16;
  return {
    pattern: generatePattern(length),
    currentIndex: 0,
    phase: 'intro',
    score: 0,
    misses: 0,
    startTime: 0,
    tapWindow: 1000,
    completed: false,
  };
}

export function startRhythmRound(state: RhythmTapState): RhythmTapState {
  return { ...state, phase: 'playing', startTime: Date.now() };
}

export function tapRhythmNote(state: RhythmTapState, side: 'left' | 'right'): RhythmTapState {
  if (state.phase !== 'playing' || state.completed) return state;
  const expected = state.pattern[state.currentIndex];
  if (side === expected) {
    const next = state.currentIndex + 1;
    const done = next >= state.pattern.length;
    return {
      ...state,
      currentIndex: next,
      score: state.score + 10,
      phase: done ? 'result' : 'playing',
      completed: done,
    };
  }
  const next = state.currentIndex + 1;
  const done = next >= state.pattern.length;
  return {
    ...state,
    currentIndex: next,
    misses: state.misses + 1,
    phase: done ? 'result' : 'playing',
    completed: done,
  };
}

export function getRhythmTapScore(state: RhythmTapState): number {
  if (!state.completed) return 0;
  const accuracy = state.pattern.length > 0 ? (state.score / (state.pattern.length * 10)) * 100 : 0;
  if (accuracy >= 90) return 100;
  if (accuracy >= 70) return 70;
  if (accuracy >= 50) return 40;
  return 20;
}
