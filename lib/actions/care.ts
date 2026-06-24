import { BuddyState, BuddyNeeds } from '@/lib/generation/types';
import { levelUpXp } from '@/lib/progression/lifecycle';

export type CareActionType = 'feed' | 'play' | 'wash' | 'rest' | 'talk' | 'train' | 'heal';

export interface CareActionResult {
  message: string;
  moodChange: number;
  bondChange: number;
  xpGain: number;
  healthChange: number;
}

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

export function applyAction(buddy: BuddyState, action: CareActionType): { buddy: BuddyState; result: CareActionResult } {
  const newBuddy = { ...buddy };
  const newNeeds: BuddyNeeds = { ...buddy.needs };
  const now = Date.now();

  const personalityMods = buddy.personality.careModifiers;
  const modifierKeys: Record<CareActionType, string> = {
    feed: 'hunger', play: 'happiness', wash: 'cleanliness',
    rest: 'energy', talk: 'social', train: 'discipline', heal: 'empathy',
  };
  const mod = personalityMods[modifierKeys[action]] || 1;

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
      if (buddy.health >= 100) {
        return {
          buddy,
          result: { message: 'Already healthy!', moodChange: 0, bondChange: 0, xpGain: 0, healthChange: 0 },
        };
      }
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

  return {
    buddy: newBuddy,
    result: {
      message,
      moodChange,
      bondChange,
      xpGain,
      healthChange,
    },
  };
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