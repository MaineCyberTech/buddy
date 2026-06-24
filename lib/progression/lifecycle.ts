import {
  BuddyState,
  LifecycleStage,
  SkillState,
  ProgressionState,
} from '@/lib/generation/types';

const STAGE_ORDER: LifecycleStage[] = ['egg', 'baby', 'child', 'teen', 'adult', 'elder'];

const STAGE_XP_THRESHOLDS: Record<LifecycleStage, number> = {
  egg: 0,
  baby: 30,
  child: 100,
  teen: 300,
  adult: 800,
  elder: 2000,
};

export function createInitialProgression(): ProgressionState {
  return {
    lifecycle: 'baby',
    age: 0,
    skills: { exploring: 0, training: 0, social: 0, crafting: 0, cooking: 0 },
    bondLevel: 1,
    totalAdventures: 0,
    memories: [],
    achievements: [],
    careQuality: 1.0,
  };
}

export function calculateLifecycle(totalXp: number): LifecycleStage {
  if (totalXp >= STAGE_XP_THRESHOLDS.elder) return 'elder';
  if (totalXp >= STAGE_XP_THRESHOLDS.adult) return 'adult';
  if (totalXp >= STAGE_XP_THRESHOLDS.teen) return 'teen';
  if (totalXp >= STAGE_XP_THRESHOLDS.child) return 'child';
  if (totalXp >= STAGE_XP_THRESHOLDS.baby) return 'baby';
  return 'egg';
}

export function getStageProgress(totalXp: number): { current: LifecycleStage; next: LifecycleStage | null; progress: number } {
  const current = calculateLifecycle(totalXp);
  const currentIndex = STAGE_ORDER.indexOf(current);
  const nextStage = currentIndex < STAGE_ORDER.length - 1 ? STAGE_ORDER[currentIndex + 1] : null;

  if (!nextStage) return { current, next: null, progress: 1 };

  const currentThreshold = STAGE_XP_THRESHOLDS[current];
  const nextThreshold = STAGE_XP_THRESHOLDS[nextStage];
  const progress = (totalXp - currentThreshold) / (nextThreshold - currentThreshold);

  return { current, next: nextStage, progress: Math.min(1, Math.max(0, progress)) };
}

export function checkEvolution(state: BuddyState): LifecycleStage | null {
  const currentStage = state.progression?.lifecycle || 'baby';
  const totalXp = state.xp;
  const newStage = calculateLifecycle(totalXp);
  const currentIndex = STAGE_ORDER.indexOf(currentStage);
  const newIndex = STAGE_ORDER.indexOf(newStage);
  return newIndex > currentIndex ? newStage : null;
}

export function updateSkills(
  skills: SkillState,
  actionType: string,
  statValue: number
): SkillState {
  const gain = Math.max(1, Math.floor(statValue / 10));
  const newSkills = { ...skills };

  switch (actionType) {
    case 'exploring': newSkills.exploring += gain; break;
    case 'train': newSkills.training += gain; break;
    case 'talk': newSkills.social += gain; break;
    case 'crafting': newSkills.crafting += gain; break;
    case 'cooking': newSkills.cooking += gain; break;
    default: break;
  }

  return newSkills;
}

export function getBondLevel(bond: number): number {
  return Math.floor(bond / 10) + 1;
}

export function levelUpXp(level: number): number {
  return 50 + (level - 1) * 25;
}

export function getStageName(stage: LifecycleStage): string {
  const names: Record<LifecycleStage, string> = {
    egg: 'Egg',
    baby: 'Baby',
    child: 'Child',
    teen: 'Teen',
    adult: 'Adult',
    elder: 'Elder',
  };
  return names[stage];
}

export const STAGE_ASCII: Record<LifecycleStage, string[]> = {
  egg: ['  ___', ' /...\\', '|___|', '  VV'],
  baby: ['  ___', ' /..\\ ', '|__|  ', '  ||'],
  child: ['  ___', ' /...\\', '|____|', '  ||'],
  teen: ['  ___', ' /...\\', '|____|', '  ||||'],
  adult: ['  ___', ' /...\\', '|____|', ' |||||'],
  elder: ['  ___', ' /...\\', '|____|', ' |||||'],
};