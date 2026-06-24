export interface MemoryMatchState {
  cards: { id: number; value: string; flipped: boolean; matched: boolean }[];
  flippedIndices: number[];
  moves: number;
  startTime: number;
  elapsed: number;
  completed: boolean;
}

const SYMBOLS = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🍑', '🥝', '🍌', '🍉', '🍍', '🥭'];

export function initMemoryMatch(difficulty: 'easy' | 'medium' | 'hard' = 'easy'): MemoryMatchState {
  const pairs = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;
  const selected = [...SYMBOLS].sort(() => Math.random() - 0.5).slice(0, pairs);
  const cards = [...selected, ...selected]
    .map((value, i) => ({ id: i, value, flipped: false, matched: false }))
    .sort(() => Math.random() - 0.5);
  return { cards, flippedIndices: [], moves: 0, startTime: Date.now(), elapsed: 0, completed: false };
}

export function flipCard(state: MemoryMatchState, cardId: number): MemoryMatchState {
  if (state.completed) return state;
  if (state.flippedIndices.length === 2) return state;
  const card = state.cards.find(c => c.id === cardId);
  if (!card || card.flipped || card.matched) return state;
  const newCards = state.cards.map(c => c.id === cardId ? { ...c, flipped: true } : c);
  const newFlipped = [...state.flippedIndices, cardId];
  if (newFlipped.length === 2) {
    const [a, b] = newFlipped.map(i => newCards.find(c => c.id === i)!);
    const matched = a.value === b.value;
    const updatedCards = newCards.map(c =>
      c.id === a.id || c.id === b.id ? { ...c, flipped: true, matched: matched || c.matched } : c
    );
    const allDone = updatedCards.every(c => c.matched);
    return {
      ...state,
      cards: updatedCards,
      flippedIndices: allDone ? [] : newFlipped,
      moves: state.moves + 1,
      elapsed: Date.now() - state.startTime,
      completed: allDone,
    };
  }
  return { ...state, cards: newCards, flippedIndices: newFlipped, moves: state.moves + 1, elapsed: Date.now() - state.startTime };
}

export function resetFlipped(state: MemoryMatchState): MemoryMatchState {
  if (state.flippedIndices.length !== 2) return state;
  const [a, b] = state.flippedIndices.map(i => state.cards.find(c => c.id === i)!);
  if (a.matched || b.matched) return state;
  return {
    ...state,
    cards: state.cards.map(c => c.id === a.id || c.id === b.id ? { ...c, flipped: false } : c),
    flippedIndices: [],
  };
}

export function getMemoryMatchScore(state: MemoryMatchState): number {
  if (!state.completed) return 0;
  const base = 100;
  const movePenalty = Math.max(0, state.moves - state.cards.length) * 2;
  const timePenalty = Math.floor(state.elapsed / 1000 / 5);
  return Math.max(10, base - movePenalty - timePenalty);
}
