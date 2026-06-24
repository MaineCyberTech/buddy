'use client';

import { BuddyState } from '@/lib/generation/types';
import { SPECIES_MAP } from '@/data/species';

interface LcdDisplayProps {
  buddy: BuddyState;
  animate?: boolean;
  className?: string;
}

export function LcdDisplay({ buddy, animate = true, className = '' }: LcdDisplayProps) {
  const species = SPECIES_MAP.get(buddy.identity.speciesId);
  const baseSprite = species?.asciiBase || ['(o o)', ' | |', ' / \\'];

  const displayLines = composeSprite(baseSprite, buddy.identity.eyes, buddy.identity.hat);

  return (
    <div
      className={`lcd-screen relative overflow-hidden rounded-lg p-4 ${animate ? '' : ''} ${className}`}
      role="img"
      aria-label={`${buddy.identity.nickname} the ${buddy.identity.speciesName}`}
    >
      <div className="scanlines absolute inset-0 pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center">
        <pre
          className={`font-lcd text-lg leading-tight whitespace-pre text-center lcd-text ${animate ? 'animate-fade-in' : ''}`}
          style={{ textShadow: '0 0 4px rgba(0,255,136,0.3)' }}
        >
          {displayLines.join('\n')}
        </pre>
        <div className="mt-2 text-center">
          <p className="text-xs lcd-text-accent opacity-70">
            {buddy.identity.rarity.toUpperCase()}
            {buddy.identity.isShiny && ' ✦ SHINY ✦'}
          </p>
        </div>
      </div>
    </div>
  );
}

function composeSprite(base: string[], eyes: string, hat: string): string[] {
  const result = [...base];
  let eyeParts = eyes.split(' ');
  if (eyeParts.length < 2 || eyes.trim() === '') eyeParts = ['o', 'o'];

  let replaced = false;
  for (let i = 0; i < result.length; i++) {
    const original = result[i];
    result[i] = result[i]
      .replace(/\([^)]+\)/, `(${eyeParts[0]} ${eyeParts[1]})`)
      .replace(/<[^>]+>/, `<${eyeParts[0]} ${eyeParts[1]}>`)
      .replace(/\[[^\]]+\]/, `[${eyeParts[0]} ${eyeParts[1]}]`);
    if (result[i] !== original) {
      replaced = true;
    }
  }

  if (!replaced && result.length > 1) {
    result[1] = result[1].replace(/\.\./g, `${eyeParts[0]}${eyeParts[1]}`);
  }

  if (hat !== 'none' && result.length > 0) {
    const hatDecorations: Record<string, string[]> = {
      crown: ['  \\ /  ', '   |   '],
      bow: ['   \\/   ', '   /\\   '],
      cap: ['  ___  ', '  | |  '],
      beanie: [' /___\\ ', ' |   | '],
      tophat: ['  ___  ', ' /   \\ ', ' |___| '],
      flower: ['   @   ', '   |   '],
      star: ['   *   ', '  ***  '],
      ribbon: ['  /\\   ', ' /  \\  '],
      beret: [' /---\\ ', ' |   | '],
      headband: ['  ---  ', '  | |  '],
      bandana: ['  /\\/\\ ', '  \\  / '],
      'party hat': ['  /\\   ', ' /  \\  ', '/____\\ '],
      'wizard hat': ['   /\\  ', '  /  \\ ', ' /____\\'],
      'pilot hat': ['  ___  ', ' /   \\ ', ' |___| '],
      'sailor hat': ['  _ _  ', ' |_ _| ', '  | |  '],
      helmet: [' /___\\ ', ' |   | '],
      hood: ['  ___  ', ' /...\\ ', ' |___| '],
      'hoodie up': ['  ___  ', ' /...\\ ', ' |___| '],
      antlers: ['  / \\  ', ' /   \\ '],
    };

    const decoration = hatDecorations[hat];
    if (decoration) {
      result.unshift(...decoration);
    }
  }

  return result;
}