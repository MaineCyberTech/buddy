'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { initRhythmTap, startRhythmRound, tapRhythmNote, getRhythmTapScore, RhythmTapState } from '@/lib/minigames';
import { SoundEngine } from '@/lib/sound';
import { useGameStore } from '@/lib/buddy/store';

interface RhythmTapProps {
  onBack: () => void;
  onComplete?: (score: number) => void;
}

export function RhythmTapGame({ onBack, onComplete }: RhythmTapProps) {
  const [state, setState] = useState<RhythmTapState>(() => initRhythmTap('easy'));
  const [currentNote, setCurrentNote] = useState<number>(0);
  const ivRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const highScore = useGameStore(s => s.minigameHighScores.rhythm || 0);
  const updateHighScore = useGameStore(s => s.updateMinigameHighScore);

  const cleanup = useCallback(() => {
    if (ivRef.current) { clearInterval(ivRef.current); ivRef.current = null; }
  }, []);

  useEffect(() => { return cleanup; }, [cleanup]);

  const startPlaying = useCallback(() => {
    const s = startRhythmRound(state);
    setState(s);
    let idx = 0;
    setCurrentNote(idx);
    SoundEngine.adventure();
    ivRef.current = setInterval(() => {
      idx++;
      if (idx >= s.pattern.length) {
        if (ivRef.current) clearInterval(ivRef.current);
      }
      setCurrentNote(idx);
    }, 600);
  }, [state]);

  const handleTap = useCallback((side: 'left' | 'right') => {
    if (state.completed || state.phase !== 'playing') return;
    SoundEngine.click();
    const newState = tapRhythmNote(state, side);
    setState(newState);
    if (newState.completed) {
      cleanup();
      const score = getRhythmTapScore(newState);
      updateHighScore('rhythm', score);
      SoundEngine.achievement();
      onComplete?.(score);
    }
  }, [state, onComplete, updateHighScore, cleanup]);

  const score = state.completed ? getRhythmTapScore(state) : 0;
  const totalNotes = state.pattern.length;

  return (
    <div className="animate-fade-in space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs lcd-text-accent uppercase tracking-wider">Rhythm Tap</p>
        <p className="text-xs lcd-text opacity-60">{state.currentIndex}/{totalNotes} | Score: {state.score} | Best: {highScore}</p>
      </div>
      <div className="flex justify-center gap-4">
        {state.pattern.slice(0, Math.min(8, totalNotes)).map((note, i) => (
          <div key={i} className={`w-6 h-6 rounded-sm flex items-center justify-center text-xs ${i === currentNote ? 'bg-lcd-accent text-black' : i < state.currentIndex ? 'bg-lcd-dark opacity-50' : 'bg-[#1a1a2e]'}`}>
            {note === 'left' ? '◀' : '▶'}
          </div>
        ))}
        {totalNotes > 8 && <span className="text-xs lcd-text opacity-50 self-center">+{totalNotes - 8}</span>}
      </div>
      {state.phase === 'intro' && (
        <button onClick={startPlaying} className="btn-device w-full py-4 text-sm rounded-md focus-ring">START</button>
      )}
      {state.phase === 'playing' && (
        <div className="flex gap-4 justify-center">
          <button onClick={() => handleTap('left')} className="btn-device w-20 h-20 text-2xl rounded-md focus-ring" aria-label="Left tap">◀</button>
          <button onClick={() => handleTap('right')} className="btn-device w-20 h-20 text-2xl rounded-md focus-ring" aria-label="Right tap">▶</button>
        </div>
      )}
      {state.completed && <p className="text-xs lcd-text-accent text-center">Score: {score}</p>}
      <button onClick={onBack} className="btn-device px-4 py-2 text-xs rounded-md focus-ring">BACK</button>
    </div>
  );
}