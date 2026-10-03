import { BuddyState, InventoryState, Achievement, MemoryEntry } from '@/lib/generation/types';
import { ITEM_MAP } from '@/data/items';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_hatch',
    name: 'New Life',
    description: 'Hatch your first Buddy.',
    icon: '🥚',
    condition: () => true,
    rewardCoins: 10,
  },
  {
    id: 'first_feed',
    name: 'First Meal',
    description: 'Feed your Buddy for the first time.',
    icon: '🍎',
    condition: (state) => state.totalCareActions >= 1,
    rewardCoins: 5,
  },
  {
    id: 'first_adventure',
    name: 'First Steps',
    description: 'Go on your first adventure.',
    icon: '🚶',
    condition: (_state, _inv, totalAdventures) => totalAdventures >= 1,
    rewardCoins: 15,
  },
  {
    id: 'bond_10',
    name: 'Getting Close',
    description: 'Reach bond level 10.',
    icon: '💕',
    condition: (state) => state.bond >= 10,
    rewardCoins: 20,
  },
  {
    id: 'bond_50',
    name: 'Best Friends',
    description: 'Reach bond level 50.',
    icon: '💖',
    condition: (state) => state.bond >= 50,
    rewardCoins: 50,
  },
  {
    id: 'bond_100',
    name: 'Unbreakable Bond',
    description: 'Max out your bond.',
    icon: '💗',
    condition: (state) => state.bond >= 100,
    rewardCoins: 100,
    rewardItemId: 'friendship_bracelet',
  },
  {
    id: 'level_5',
    name: 'Getting Stronger',
    description: 'Reach level 5.',
    icon: '⭐',
    condition: (state) => state.level >= 5,
    rewardCoins: 25,
  },
  {
    id: 'level_10',
    name: 'Seasoned Buddy',
    description: 'Reach level 10.',
    icon: '🌟',
    condition: (state) => state.level >= 10,
    rewardCoins: 50,
  },
  {
    id: 'adventure_10',
    name: 'Explorer',
    description: 'Complete 10 adventures.',
    icon: '🧭',
    condition: (_state, _inv, totalAdventures) => totalAdventures >= 10,
    rewardCoins: 30,
  },
  {
    id: 'adventure_50',
    name: 'Veteran Explorer',
    description: 'Complete 50 adventures.',
    icon: '🗺️',
    condition: (_state, _inv, totalAdventures) => totalAdventures >= 50,
    rewardCoins: 100,
  },
  {
    id: 'evolution_child',
    name: 'Growing Up',
    description: 'Evolve to Child stage.',
    icon: '🌱',
    condition: (state) => (state.progression?.lifecycle === 'child' || state.progression?.lifecycle === 'teen' || state.progression?.lifecycle === 'adult' || state.progression?.lifecycle === 'elder'),
    rewardCoins: 30,
  },
  {
    id: 'evolution_teen',
    name: 'Adolescent',
    description: 'Evolve to Teen stage.',
    icon: '🌿',
    condition: (state) => (state.progression?.lifecycle === 'teen' || state.progression?.lifecycle === 'adult' || state.progression?.lifecycle === 'elder'),
    rewardCoins: 50,
  },
  {
    id: 'evolution_adult',
    name: 'All Grown Up',
    description: 'Evolve to Adult stage.',
    icon: '🌳',
    condition: (state) => (state.progression?.lifecycle === 'adult' || state.progression?.lifecycle === 'elder'),
    rewardCoins: 100,
  },
  {
    id: 'care_100',
    name: 'Dedicated Caretaker',
    description: 'Perform 100 care actions.',
    icon: '🏆',
    condition: (state) => state.totalCareActions >= 100,
    rewardCoins: 75,
  },
  {
    id: 'collector_10',
    name: 'Item Collector',
    description: 'Collect 10 different items.',
    icon: '📦',
    condition: (_state, inv) => (inv?.items?.length ?? 0) >= 10,
    rewardCoins: 40,
  },
];

export function createMemory(
  type: MemoryEntry['type'],
  title: string,
  description: string,
  icon: string
): MemoryEntry {
  return { id: `${type}-${Date.now()}`, type, title, description, timestamp: Date.now(), icon };
}

export function checkAchievements(
  state: BuddyState,
  inventory: InventoryState,
  totalAdventures: number,
  unlocked: string[]
): Achievement[] {
  return ACHIEVEMENTS.filter(
    a => !unlocked.includes(a.id) && a.condition(state, inventory, totalAdventures)
  );
}

export interface AchievementGrantResult {
  buddy: BuddyState;
  inventory: InventoryState;
  granted: Achievement[];
}

/**
 * Evaluate and apply achievements for a state transition (FEAT-P1-001).
 *
 * Persists newly unlocked ids in `progression.achievements`, records a memory for
 * each unlock, and grants the configured `rewardCoins` / `rewardItemId`. The
 * `unlocked` list is the dedupe guard, so a reward is granted exactly once.
 */
export function grantAchievements(
  buddy: BuddyState,
  inventory: InventoryState,
  totalAdventures: number
): AchievementGrantResult {
  const unlocked = buddy.progression?.achievements ?? [];
  const granted = checkAchievements(buddy, inventory, totalAdventures, unlocked);

  if (granted.length === 0) {
    return { buddy, inventory, granted: [] };
  }

  const achievements = [...unlocked];
  const items = inventory.items.map(i => ({ ...i }));
  let coins = inventory.coins;

  for (const achievement of granted) {
    achievements.push(achievement.id);
    if (achievement.rewardCoins) {
      coins += achievement.rewardCoins;
    }
    if (achievement.rewardItemId && ITEM_MAP.has(achievement.rewardItemId)) {
      const existing = items.find(i => i.id === achievement.rewardItemId);
      if (existing) {
        existing.quantity += 1;
      } else {
        items.push({ id: achievement.rewardItemId, quantity: 1 });
      }
    }
  }

  const memories = [
    ...(buddy.progression?.memories ?? []),
    ...granted.map(a => createMemory('achievement', a.name, a.description, a.icon)),
  ];

  return {
    buddy: {
      ...buddy,
      progression: buddy.progression
        ? { ...buddy.progression, achievements, memories }
        : buddy.progression,
    },
    inventory: { coins, items },
    granted,
  };
}