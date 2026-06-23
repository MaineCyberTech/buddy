import { SeededRNG } from '@/lib/generation/rng';
import { BuddyPersonality } from '@/lib/generation/types';
import { PERSONALITIES } from '@/data/personalities';

export function pickPersonality(
  rng: SeededRNG,
  personalityBiases: string[]
): BuddyPersonality {
  const biasPersonalities = PERSONALITIES.filter(p =>
    personalityBiases.includes(p.id)
  );

  if (biasPersonalities.length > 0 && rng.bool(0.6)) {
    return rng.pick(biasPersonalities);
  }

  return rng.pick(PERSONALITIES);
}

export function getPersonalityModifiers(personality: BuddyPersonality): Record<string, number> {
  return personality.careModifiers;
}