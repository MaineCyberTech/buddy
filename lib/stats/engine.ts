import { SeededRNG } from '@/lib/generation/rng';
import { BuddyStats, StatName, STAT_RANGES, STAT_NAMES } from '@/lib/generation/types';

function pickPeakAndDump(rng: SeededRNG): { peak: StatName; dump: StatName } {
  const peak = rng.pick(STAT_NAMES);
  let dump = rng.pick(STAT_NAMES.filter(s => s !== peak));
  return { peak, dump };
}

function rollBaseStat(rng: SeededRNG, min: number, max: number): number {
  return rng.nextInt(min, max);
}

export function generateStats(
  rng: SeededRNG,
  favoredStat: StatName,
  rarityBias: number = 0
): BuddyStats {
  const { peak, dump } = pickPeakAndDump(rng);
  const biasBonus = Math.floor(rarityBias);

  const stats: Partial<BuddyStats> = {};

  for (const stat of STAT_NAMES) {
    if (stat === peak) {
      const min = Math.min(100, STAT_RANGES.peak.min + biasBonus * 5);
      const max = Math.min(100, STAT_RANGES.peak.max + biasBonus * 5);
      stats[stat] = clampStat(rollBaseStat(rng, min, max));
    } else if (stat === dump) {
      stats[stat] = clampStat(rollBaseStat(rng, STAT_RANGES.dump.min, STAT_RANGES.dump.max));
    } else {
      stats[stat] = clampStat(rollBaseStat(rng, STAT_RANGES.normal.min, STAT_RANGES.normal.max));
    }
  }

  if (favoredStat && stats[favoredStat] !== undefined) {
    stats[favoredStat] = clampStat(stats[favoredStat]! + 10);
  }

  return stats as BuddyStats;
}

function clampStat(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function getStatLabel(stat: StatName): string {
  const labels: Record<StatName, string> = {
    courage: 'Courage',
    curiosity: 'Curiosity',
    playfulness: 'Playfulness',
    discipline: 'Discipline',
    empathy: 'Empathy',
  };
  return labels[stat];
}

export function getPeakStat(stats: BuddyStats): StatName {
  let maxStat: StatName = 'courage';
  let maxValue = -1;
  for (const stat of STAT_NAMES) {
    if (stats[stat] > maxValue) {
      maxValue = stats[stat];
      maxStat = stat;
    }
  }
  return maxStat;
}

export function getDumpStat(stats: BuddyStats): StatName {
  let minStat: StatName = 'courage';
  let minValue = 101;
  for (const stat of STAT_NAMES) {
    if (stats[stat] < minValue) {
      minValue = stats[stat];
      minStat = stat;
    }
  }
  return minStat;
}