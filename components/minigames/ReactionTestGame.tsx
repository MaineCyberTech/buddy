'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { initReactionTest, pressReactionButton, getReactionTestScore } from '@/lib/minigames';
import { SoundEngine } from '@/lib/sound';
import { useGameStore } from '@/lib/buddy/store';

interface ReactionTestProps {
  onBack: () => void;
  onComplete?: (score: number) => void;
}

export function ReactionTestGame({ onBack, onComplete }: ReactionTestProps) {
  const [state, setState] = useState(initReactionTest);
  const [display, setDisplay] = useState('Press START to begin');
  const [displayColor, setDisplayColor] = useState('lcd-text opacity-50');
  const [canTap, setCanTap] = useState(false);
  const [roundLabel, setRoundLabel] = useState('Round 1/5');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highScore = useGameStore(s => s.minigameHighScores.reaction || 0);
  const updateHighScore = useGameStore(s => s.updateMinigameHighScore);

  const cleanup = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }, []);

  const beginRound = useCallback((s: typeof state) => {
    cleanup();
    setDisplay('Wait...');
    setDisplayColor('lcd-text opacity-50');
    setCanTap(false);
    const delay = 1000 + Math.random() * 3000;
    const targetTime = Date.now() + delay;
    timerRef.current = setTimeout(() => {
      setDisplay('TAP NOW!');
      setDisplayColor('lcd-text-accent');
      setCanTap(true);
      setState({ ...s, phase: 'ready', targetTime });
    }, delay);
  }, [cleanup]);

  const startGame = useCallback(() => {
    const s = initReactionTest();
    setState(s);
    beginRound(s);
    setRoundLabel('Round 1/5');
  }, [beginRound]);

  const handleTap = useCallback(() => {
    SoundEngine.click();
    if (!canTap && state.phase !== 'ready') {
      if (state.phase === 'waiting') { startGame(); return; }
      return;
    }
    if (state.phase === 'too-early') { startGame(); return; }
    const newState = pressReactionButton(state);
    setState(newState);
    if (newState.phase === 'too-early') {
      SoundEngine.click();
      setDisplay('TOO EARLY!');
      setDisplayColor('lcd-text-warn');
      setCanTap(false);
      timerRef.current = setTimeout(() => startGame(), 1500);
      return;
    }
    if (newState.completed) {
      cleanup();
      setDisplay(`${newState.reactionTime}ms`);
      setDisplayColor('lcd-text-accent');
      setCanTap(false);
      const score = getReactionTestScore(newState);
      updateHighScore('reaction', score);
      SoundEngine.achievement();
      onComplete?.(score);
      return;
    }
    setDisplay(`${newState.reactionTime}ms`);
    setDisplayColor('lcd-text-accent');
    setCanTap(false);
    setRoundLabel(`Round ${newState.round}/${newState.maxRounds}`);
    timerRef.current = setTimeout(() => beginRound(newState), 1000);
  }, [state, canTap, beginRound, cleanup, onComplete, startGame, updateHighScore]);

  useEffect(() => { return cleanup; }, [cleanup]);

  const bg = state.phase === 'too-early' ? 'bg-red-900/30' : (canTap ? 'bg-lcd-dark cursor-pointer' : 'bg-[#1a1a2e]');
  const score = state.completed ? getReactionTestScore(state) : 0;

  return (
    <div className="animate-fade-in space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs lcd-text-accent uppercase tracking-wider">Reaction Test</p>
        <p className="text-xs lcd-text opacity-60">{roundLabel}</p>
      </div>
      <button onClick={handleTap} className={`w-full h-32 rounded-sm flex items-center justify-center text-lg font-lcd focus-ring ${bg}`} aria-label="Tap to react">
        <span className={displayColor}>{display}</span>
      </button>
      <div className="flex justify-between text-xs lcd-text opacity-50">
        <span>Best: {state.scores.length > 0 ? Math.min(...state.scores) + 'ms' : '-'}</span>
        <span>Avg: {state.scores.length > 0 ? Math.round(state.scores.reduce((a, b) => a + b, 0) / state.scores.length) + 'ms' : '-'}</span>
      </div>
      <p className="text-xs lcd-text opacity-60">High Score: {highScore}</p>
      {state.completed && <p className="text-xs lcd-text-accent text-center">Score: {score}</p>}
      <button onClick={onBack} className="btn-device px-4 py-2 text-xs rounded-md focus-ring">BACK</button>
    </div>
  );
}
