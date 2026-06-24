export interface ReactionTestState {
  phase: 'waiting' | 'ready' | 'too-early' | 'react' | 'result';
  targetTime: number;
  reactionTime: number;
  round: number;
  maxRounds: number;
  scores: number[];
  startTime: number;
  completed: boolean;
}

export function initReactionTest(): ReactionTestState {
  return {
    phase: 'waiting',
    targetTime: 0,
    reactionTime: 0,
    round: 1,
    maxRounds: 5,
    scores: [],
    startTime: 0,
    completed: false,
  };
}

export function startReactionRound(state: ReactionTestState): ReactionTestState {
  if (state.completed) return state;
  const delay = 1000 + Math.random() * 3000;
  return {
    ...state,
    phase: 'ready',
    targetTime: Date.now() + delay,
    startTime: Date.now(),
  };
}

export function pressReactionButton(state: ReactionTestState): ReactionTestState {
  if (state.phase === 'ready') {
    if (Date.now() < state.targetTime) {
      return { ...state, phase: 'too-early', reactionTime: 0 };
    }
    const rt = Date.now() - state.targetTime;
    const newScores = [...state.scores, rt];
    const nextRound = state.round + 1;
    const done = nextRound > state.maxRounds;
    return {
      ...state,
      phase: done ? 'result' : 'waiting',
      reactionTime: rt,
      round: done ? state.round : nextRound,
      scores: newScores,
      completed: done,
    };
  }
  if (state.phase === 'too-early') {
    return startReactionRound(state);
  }
  return state;
}

export function getReactionTestScore(state: ReactionTestState): number {
  if (!state.completed || state.scores.length === 0) return 0;
  const avg = state.scores.reduce((a, b) => a + b, 0) / state.scores.length;
  if (avg <= 200) return 100;
  if (avg <= 300) return 80;
  if (avg <= 400) return 60;
  if (avg <= 500) return 40;
  return 20;
}
