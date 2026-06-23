export type StatName = 'courage' | 'curiosity' | 'playfulness' | 'discipline' | 'empathy';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface BuddyStats {
  courage: number;
  curiosity: number;
  playfulness: number;
  discipline: number;
  empathy: number;
}

export interface BuddyNeeds {
  hunger: number;
  happiness: number;
  cleanliness: number;
  energy: number;
  social: number;
}

export interface BuddyPersonality {
  id: string;
  name: string;
  description: string;
  likes: string[];
  dislikes: string[];
  preferredActivities: string[];
  careModifiers: Record<string, number>;
  idleLines: string[];
  happyLines: string[];
  hungryLines: string[];
  adventureLines: string[];
  sleepLines: string[];
}

export interface SpeciesData {
  id: string;
  name: string;
  category: string;
  rarity: Rarity;
  baseStats: Partial<BuddyStats>;
  favoredStat: StatName;
  growthBias: Partial<BuddyStats>;
  asciiBase: string[];
  personalityBiases: string[];
  profileDescription: string;
  idleLines: string[];
  preferredFoods: string[];
  dislikedFoods: string[];
}

export interface BuddyIdentity {
  speciesId: string;
  speciesName: string;
  nickname: string;
  rarity: Rarity;
  isShiny: boolean;
  hat: string;
  eyes: string;
  generatedAt: number;
  seed: string;
}

export interface BuddyState {
  identity: BuddyIdentity;
  stats: BuddyStats;
  needs: BuddyNeeds;
  personality: BuddyPersonality;
  level: number;
  xp: number;
  bond: number;
  mood: 'happy' | 'content' | 'neutral' | 'sad' | 'sick';
  health: number;
  lastInteraction: number;
  totalCareActions: number;
}

export interface GameSave {
  version: number;
  buddy: BuddyState | null;
  guestId: string;
  createdAt: number;
  updatedAt: number;
}

export const STAT_NAMES: StatName[] = ['courage', 'curiosity', 'playfulness', 'discipline', 'empathy'];

export const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 55,
  uncommon: 25,
  rare: 13,
  epic: 6,
  legendary: 1,
};

export const SHINY_CHANCE = 0.01;

export const STAT_RANGES = {
  peak: { min: 75, max: 100 },
  dump: { min: 0, max: 30 },
  normal: { min: 35, max: 75 },
};