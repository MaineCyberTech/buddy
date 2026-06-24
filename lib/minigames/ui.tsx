'use client';

import { MemoryMatchGame } from '@/components/minigames/MemoryMatchGame';
import { ReactionTestGame } from '@/components/minigames/ReactionTestGame';
import { RhythmTapGame } from '@/components/minigames/RhythmTapGame';

export type MinigameType = 'memory' | 'reaction' | 'rhythm';

export const MINIGAMES: { id: MinigameType; label: string; icon: string; desc: string }[] = [
  { id: 'memory', label: 'Memory Match', icon: '🧠', desc: 'Flip cards to find matching pairs' },
  { id: 'reaction', label: 'Reaction Test', icon: '⚡', desc: 'Tap as fast as you can when the screen turns green' },
  { id: 'rhythm', label: 'Rhythm Tap', icon: '🎵', desc: 'Follow the pattern of left and right taps' },
];

interface MinigameRendererProps {
  game: MinigameType;
  onBack: () => void;
  onComplete: (score: number) => void;
}

export function MinigameRenderer({ game, onBack, onComplete }: MinigameRendererProps) {
  switch (game) {
    case 'memory': return <MemoryMatchGame onBack={onBack} onComplete={onComplete} />;
    case 'reaction': return <ReactionTestGame onBack={onBack} onComplete={onComplete} />;
    case 'rhythm': return <RhythmTapGame onBack={onBack} onComplete={onComplete} />;
    default: return null;
  }
}
