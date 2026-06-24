'use client';

import { useState, useEffect, useCallback } from 'react';
import { initMemoryMatch, flipCard, resetFlipped, getMemoryMatchScore, MemoryMatchState } from '@/lib/minigames';
import { SoundEngine } from '@/lib/sound';
import { useGameStore } from '@/lib/buddy/store';

interface MemoryMatchProps {
  onBack: () => void;
  onComplete?: (score: number) => void;
}

export function MemoryMatchGame({ onBack, onComplete }: MemoryMatchProps) {
  const [state, setState] = useState<MemoryMatchState>(() => initMemoryMatch('easy'));
  const highScore = useGameStore(s => s.minigameHighScores.memory || 0);
  const updateHighScore = useGameStore(s => s.updateMinigameHighScore);

  useEffect(() => {
    if (state.flippedIndices.length === 2) {
      const timer = setTimeout(() => setState(prev => resetFlipped(prev)), 800);
      return () => clearTimeout(timer);
    }
  }, [state.flippedIndices]);

  const handleFlip = useCallback((cardId: number) => {
    SoundEngine.click();
    setState(prev => flipCard(prev, cardId));
  }, []);

  useEffect(() => {
    if (state.completed) {
      SoundEngine.achievement();
      const score = getMemoryMatchScore(state);
      updateHighScore('memory', score);
      onComplete?.(score);
    }
  }, [state.completed, state, onComplete, updateHighScore]);

  const score = state.completed ? getMemoryMatchScore(state) : 0;

  return (
    <div className="animate-fade-in space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs lcd-text-accent uppercase tracking-wider">Memory Match</p>
        <p className="text-xs lcd-text opacity-60">Moves: {state.moves} | {state.completed ? `Score: ${score}` : `Best: ${highScore}`}</p>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {state.cards.map(card => (
          <button
            key={card.id}
            onClick={() => !card.flipped && !card.matched && handleFlip(card.id)}
            className={`aspect-square rounded-sm text-2xl flex items-center justify-center transition-all focus-ring ${card.flipped || card.matched ? 'bg-lcd-dark' : 'bg-[#1a1a2e] cursor-pointer hover:bg-[#252540]'} ${card.matched ? 'opacity-60' : ''}`}
            disabled={card.flipped || card.matched || state.flippedIndices.length === 2}
            aria-label={card.flipped || card.matched ? card.value : 'Hidden card'}
          >
            {(card.flipped || card.matched) ? card.value : '?'}
          </button>
        ))}
      </div>
      {state.completed && (
        <p className="text-xs lcd-text-accent text-center">Completed in {state.moves} moves! Score: {score}</p>
      )}
      <button onClick={onBack} className="btn-device px-4 py-2 text-xs rounded-md focus-ring">BACK</button>
    </div>
  );
}
