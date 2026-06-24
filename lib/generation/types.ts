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
  progression: ProgressionState;
}

export interface HomeSlot {
  id: string;
  name: string;
  slotType: string;
  locked: boolean;
}

export interface DecorPlacement {
  slotId: string;
  itemId: string | null;
}

export const HOME_SLOTS: HomeSlot[] = [
  { id: 'floor_left', name: 'Floor Left', slotType: 'floor', locked: false },
  { id: 'floor_right', name: 'Floor Right', slotType: 'floor', locked: false },
  { id: 'table', name: 'Table', slotType: 'table', locked: false },
  { id: 'shelf', name: 'Shelf', slotType: 'shelf', locked: false },
  { id: 'window', name: 'Window', slotType: 'window', locked: true },
  { id: 'wall', name: 'Wall', slotType: 'wall', locked: true },
];

export const DEFAULT_PLACED_DECOR: DecorPlacement[] = HOME_SLOTS.map(s => ({
  slotId: s.id,
  itemId: null,
}));

export interface GameSave {
  version: number;
  buddy: BuddyState | null;
  guestId: string;
  createdAt: number;
  updatedAt: number;
  inventory?: InventoryState;
  placedDecor?: DecorPlacement[];
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

export type LifecycleStage = 'egg' | 'baby' | 'child' | 'teen' | 'adult' | 'elder';

export interface SkillState {
  exploring: number;
  training: number;
  social: number;
  crafting: number;
  cooking: number;
}

export interface InventoryItem {
  id: string;
  quantity: number;
}

export interface InventoryState {
  coins: number;
  items: InventoryItem[];
}

export interface ItemDefinition {
  id: string;
  name: string;
  category: 'food' | 'toy' | 'hat' | 'decor' | 'skill_book' | 'material' | 'medicine' | 'trinket' | 'quest';
  rarity: Rarity;
  description: string;
  icon: string;
  sellValue: number;
  effect?: string;
  flavorText: string;
  placementSlot?: string;
}

export interface LootTableEntry {
  itemId: string;
  weight: number;
  minQuantity: number;
  maxQuantity: number;
}

export interface LootTable {
  id: string;
  entries: LootTableEntry[];
  coinMin: number;
  coinMax: number;
  xpGain: number;
}

export interface LocationDefinition {
  id: string;
  name: string;
  description: string;
  requiredStage?: LifecycleStage;
  requiresAccount: boolean;
  energyCost: number;
  statChecks: Partial<Record<StatName, number>>;
  lootTableId: string;
  backgroundAscii: string[];
  encounterPool: string[];
  flavorText: string;
  riskProfile: 'safe' | 'moderate' | 'risky' | 'dangerous';
}

export interface AdventureResult {
  success: boolean;
  locationId: string;
  message: string;
  coinsEarned: number;
  itemsReceived: InventoryItem[];
  xpGained: number;
  bondChange: number;
  statChanges: Partial<BuddyStats>;
  energyCost: number;
  encounterText: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (state: BuddyState, inventory: InventoryState, totalAdventures: number) => boolean;
  rewardCoins?: number;
  rewardItemId?: string;
}

export interface MemoryEntry {
  id: string;
  type: 'hatch' | 'evolution' | 'adventure' | 'milestone' | 'achievement';
  title: string;
  description: string;
  timestamp: number;
  icon: string;
}

export interface ProgressionState {
  lifecycle: LifecycleStage;
  age: number;
  skills: SkillState;
  bondLevel: number;
  totalAdventures: number;
  memories: MemoryEntry[];
  achievements: string[];
  careQuality: number;
}