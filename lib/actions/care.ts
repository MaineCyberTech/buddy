import { BuddyState, BuddyNeeds, InventoryState, StatName } from '@/lib/generation/types';
import { checkEvolution, updateSkills } from '@/lib/progression/lifecycle';
import { grantAchievements } from '@/data/achievements';
import { ITEM_MAP } from '@/data/items';

export type CareActionType = 'feed' | 'play' | 'wash' | 'rest' | 'talk' | 'train' | 'heal';

export interface CareActionResult {
  message: string;
  moodChange: number;
  bondChange: number;
  xpGain: number;
  healthChange: number;
}

const EMPTY_INVENTORY: InventoryState = { coins: 0, items: [] };

const ACTION_MESSAGES: Record<CareActionType, string[]> = {
  feed: ['Yum!', 'Delicious!', 'Nom nom nom!', 'Tasty!', 'Full belly!'],
  play: ['So fun!', 'Wheee!', 'Again!', 'Play time!', 'Happy dance!'],
  wash: ['Squeaky clean!', 'Fresh!', 'All clean!', 'Sparkling!', 'Nice and clean!'],
  rest: ['Zzz...', 'Cozy nap!', 'Restored!', 'Peaceful sleep!', 'Energized!'],
  talk: ['Chatter!', 'You get me!', 'Great talk!', 'Listening!', 'Bonding time!'],
  train: ['Stronger!', 'Learning!', 'Improving!', 'Focus!', 'Growth!'],
  heal: ['Better!', 'Healed!', 'Recovered!', 'Strong again!', 'Healthy!'],
};

function pickMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

export function applyAction(
  buddy: BuddyState,
  action: CareActionType,
  inventory: InventoryState = EMPTY_INVENTORY
): { buddy: BuddyState; inventory: InventoryState; result: CareActionResult } {
  let newBuddy = { ...buddy };
  const newNeeds: BuddyNeeds = { ...buddy.needs };
  const now = Date.now();

  const personalityMods = buddy.personality.careModifiers;
  const mod = personalityMods[action === 'feed' ? 'hunger' : 'happiness'] || 1;

  let message: string;
  let moodChange = 0;
  let bondChange = 0;
  let xpGain = 10;
  let healthChange = 0;

  switch (action) {
    case 'feed': {
      const amount = Math.round(25 * mod);
      newNeeds.hunger = Math.min(100, newNeeds.hunger + amount);
      newNeeds.happiness = Math.min(100, newNeeds.happiness + 5);
      message = pickMessage(ACTION_MESSAGES.feed);
      bondChange = 2;
      break;
    }
    case 'play': {
      const amount = Math.round(20 * mod);
      newNeeds.happiness = Math.min(100, newNeeds.happiness + amount);
      newNeeds.energy = Math.max(0, newNeeds.energy - 15);
      newNeeds.hunger = Math.max(0, newNeeds.hunger - 5);
      message = pickMessage(ACTION_MESSAGES.play);
      moodChange = 10;
      bondChange = 3;
      xpGain = 15;
      break;
    }
    case 'wash': {
      newNeeds.cleanliness = 100;
      newNeeds.happiness = Math.min(100, newNeeds.happiness + 5);
      message = pickMessage(ACTION_MESSAGES.wash);
      bondChange = 1;
      break;
    }
    case 'rest': {
      const amount = Math.round(30 * mod);
      newNeeds.energy = Math.min(100, newNeeds.energy + amount);
      newNeeds.hunger = Math.max(0, newNeeds.hunger - 3);
      message = pickMessage(ACTION_MESSAGES.rest);
      healthChange = 5;
      break;
    }
    case 'talk': {
      newNeeds.social = Math.min(100, newNeeds.social + 20);
      newNeeds.happiness = Math.min(100, newNeeds.happiness + 5);
      message = pickMessage(ACTION_MESSAGES.talk);
      moodChange = 5;
      bondChange = 4;
      xpGain = 8;
      break;
    }
    case 'train': {
      newNeeds.energy = Math.max(0, newNeeds.energy - 20);
      newNeeds.hunger = Math.max(0, newNeeds.hunger - 8);
      message = pickMessage(ACTION_MESSAGES.train);
      moodChange = -5;
      bondChange = 2;
      xpGain = 25;
      break;
    }
    case 'heal': {
      const healAmount = Math.round(30 * mod);
      newBuddy.health = Math.min(100, buddy.health + healAmount);
      newNeeds.energy = Math.max(0, newNeeds.energy - 10);
      message = pickMessage(ACTION_MESSAGES.heal);
      moodChange = 5;
      bondChange = 2;
      break;
    }
  }

  if (newBuddy.health <= 30 && action === 'heal') {
    moodChange += 10;
  }

  newBuddy.needs = newNeeds;
  newBuddy.bond = Math.min(100, buddy.bond + bondChange);
  newBuddy.xp = buddy.xp + xpGain;
  newBuddy.lastInteraction = now;
  newBuddy.totalCareActions = buddy.totalCareActions + 1;

  let newLevel = buddy.level;
  while (newBuddy.xp >= levelUpXp(newLevel)) {
    newBuddy.xp -= levelUpXp(newLevel);
    newLevel++;
  }
  newBuddy.level = newLevel;

  newBuddy.mood = recalculateMood(newBuddy);

  // Wire progression into the live action path (FEAT-P1-002). `train` and `talk`
  // grow the matching skill; evolution is evaluated against lifetime XP.
  const skillAction = action === 'train' ? 'train' : action === 'talk' ? 'talk' : null;
  const skillStatValue =
    action === 'train' ? newBuddy.stats.discipline : action === 'talk' ? newBuddy.stats.empathy : 0;
  newBuddy = advanceProgression(newBuddy, skillAction, skillStatValue);

  // Evaluate achievements after the transition and grant their rewards (FEAT-P1-001).
  const granted = grantAchievements(
    newBuddy,
    inventory,
    newBuddy.progression?.totalAdventures ?? 0
  );

  return {
    buddy: granted.buddy,
    inventory: granted.inventory,
    result: {
      message,
      moodChange,
      bondChange,
      xpGain,
      healthChange,
    },
  };
}

/**
 * Lifetime XP from the remainder XP field plus the XP already consumed by level-ups.
 * `xp` is a remainder (see `applyAction`/`applyAdventureResult`), while lifecycle
 * thresholds are expressed in total XP.
 */
function lifetimeXp(buddy: BuddyState): number {
  let total = buddy.xp;
  for (let level = 1; level < buddy.level; level++) {
    total += levelUpXp(level);
  }
  return total;
}

/**
 * Apply lifecycle evolution and skill growth after an XP-changing transition
 * (FEAT-P1-002). Pure: returns a new buddy and never mutates the input.
 */
export function advanceProgression(
  buddy: BuddyState,
  skillAction: 'train' | 'talk' | 'exploring' | 'crafting' | 'cooking' | null,
  skillStatValue = 0
): BuddyState {
  if (!buddy.progression) return buddy;

  const progression = { ...buddy.progression };

  const evolved = checkEvolution({ ...buddy, xp: lifetimeXp(buddy) });
  if (evolved) {
    progression.lifecycle = evolved;
  }

  if (skillAction) {
    progression.skills = updateSkills(progression.skills, skillAction, skillStatValue);
  }

  return { ...buddy, progression };
}

export type ItemActionType = 'use' | 'sell' | 'equip';

export interface ItemActionResult {
  success: boolean;
  message: string;
  buddy: BuddyState;
  inventory: InventoryState;
}

function consumeOne(inventory: InventoryState, itemId: string): InventoryState {
  return {
    coins: inventory.coins,
    items: inventory.items
      .map(i => (i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i))
      .filter(i => i.quantity > 0),
  };
}

/**
 * Use, sell, or equip an inventory item (FEAT-P2-001). Pure: returns new state and
 * never mutates the inputs. Food/medicine/toy/skill_book are consumed on use, hats
 * are equipped (not consumed), and anything with `sellValue > 0` can be sold.
 */
export function applyItemAction(
  buddy: BuddyState,
  inventory: InventoryState,
  itemId: string,
  action: ItemActionType
): ItemActionResult {
  const def = ITEM_MAP.get(itemId);
  const owned = inventory.items.find(i => i.id === itemId);

  if (!def || !owned || owned.quantity <= 0) {
    return { success: false, message: 'You do not own that item.', buddy, inventory };
  }

  if (action === 'sell') {
    if (def.sellValue <= 0) {
      return { success: false, message: `${def.name} cannot be sold.`, buddy, inventory };
    }
    return {
      success: true,
      message: `Sold ${def.name} for ${def.sellValue} coins.`,
      buddy,
      inventory: { ...consumeOne(inventory, itemId), coins: inventory.coins + def.sellValue },
    };
  }

  if (action === 'equip') {
    if (def.category !== 'hat') {
      return { success: false, message: `${def.name} cannot be equipped.`, buddy, inventory };
    }
    return {
      success: true,
      message: `Equipped ${def.name}.`,
      buddy: { ...buddy, identity: { ...buddy.identity, hat: def.id } },
      inventory,
    };
  }

  const newBuddy: BuddyState = { ...buddy, needs: { ...buddy.needs } };

  switch (def.category) {
    case 'food':
      newBuddy.needs.hunger = Math.min(100, newBuddy.needs.hunger + 25);
      newBuddy.needs.happiness = Math.min(100, newBuddy.needs.happiness + 5);
      break;
    case 'medicine':
      newBuddy.health = Math.min(100, newBuddy.health + 30);
      break;
    case 'toy':
      newBuddy.needs.happiness = Math.min(100, newBuddy.needs.happiness + 20);
      newBuddy.needs.energy = Math.max(0, newBuddy.needs.energy - 5);
      break;
    case 'skill_book': {
      const stat = def.effect as StatName | undefined;
      if (stat && stat in newBuddy.stats) {
        newBuddy.stats = { ...newBuddy.stats, [stat]: Math.min(100, newBuddy.stats[stat] + 5) };
      }
      break;
    }
    default:
      return { success: false, message: `${def.name} cannot be used.`, buddy, inventory };
  }

  newBuddy.mood = recalculateMood(newBuddy);

  return {
    success: true,
    message: `Used ${def.name}.`,
    buddy: newBuddy,
    inventory: consumeOne(inventory, itemId),
  };
}

function levelUpXp(level: number): number {
  return 50 + (level - 1) * 25;
}

export function recalculateMood(buddy: BuddyState): BuddyState['mood'] {
  const { hunger, happiness, cleanliness, energy, social } = buddy.needs;
  const lowCount = [hunger, happiness, cleanliness, energy, social].filter(v => v < 20).length;

  if (buddy.health <= 0) return 'sick';
  if (lowCount >= 3) return 'sick';
  if (lowCount >= 2 || hunger < 10 || happiness < 10) return 'sad';
  if (lowCount >= 1 || buddy.health < 40) return 'neutral';
  if (buddy.bond > 50 && happiness > 60) return 'happy';
  return 'content';
}

export function applyOfflineDecay(buddy: BuddyState, elapsedMs: number): BuddyState {
  const newBuddy = { ...buddy };
  const newNeeds: BuddyNeeds = { ...buddy.needs };

  const decayHours = Math.min(elapsedMs / (1000 * 60 * 60), 48);

  const decayRate = 1.5;
  newNeeds.hunger = Math.max(0, newNeeds.hunger - Math.round(decayHours * decayRate));
  newNeeds.happiness = Math.max(0, newNeeds.happiness - Math.round(decayHours * 0.8));
  newNeeds.cleanliness = Math.max(0, newNeeds.cleanliness - Math.round(decayHours * 0.5));
  newNeeds.energy = Math.min(100, newNeeds.energy + Math.round(Math.min(decayHours * 2, 30)));
  newNeeds.social = Math.max(0, newNeeds.social - Math.round(decayHours * 1.2));

  newBuddy.needs = newNeeds;
  newBuddy.mood = recalculateMood(newBuddy);

  if (newNeeds.hunger < 10 || newNeeds.happiness < 10) {
    newBuddy.health = Math.max(0, newBuddy.health - Math.round(decayHours * 0.5));
  }

  return newBuddy;
}