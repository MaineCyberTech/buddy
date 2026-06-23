'use client';

import { StatName, BuddyStats, BuddyNeeds } from '@/lib/generation/types';
import { getStatLabel } from '@/lib/stats/engine';
import { NEED_LABELS } from '@/lib/actions/labels';

interface StatBarsProps {
  stats: BuddyStats;
}

export function StatBars({ stats }: StatBarsProps) {
  const statNames = Object.keys(stats) as StatName[];

  return (
    <div className="space-y-1.5">
      <p className="text-xs lcd-text-accent uppercase tracking-wider mb-2">Stats</p>
      {statNames.map((stat) => (
        <StatBar
          key={stat}
          label={getStatLabel(stat)}
          value={stats[stat]}
          max={100}
        />
      ))}
    </div>
  );
}

interface NeedBarsProps {
  needs: BuddyNeeds;
}

export function NeedBars({ needs }: NeedBarsProps) {
  const needKeys = Object.keys(needs) as (keyof BuddyNeeds)[];

  return (
    <div className="space-y-1.5">
      <p className="text-xs lcd-text-accent uppercase tracking-wider mb-2">Needs</p>
      {needKeys.map((need) => (
        <StatBar
          key={need}
          label={NEED_LABELS[need]}
          value={needs[need]}
          max={100}
          color={needs[need] < 20 ? 'danger' : needs[need] < 40 ? 'warn' : 'accent'}
        />
      ))}
    </div>
  );
}

interface StatBarProps {
  label: string;
  value: number;
  max: number;
  color?: 'accent' | 'warn' | 'danger';
}

function StatBar({ label, value, max, color = 'accent' }: StatBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  const colorClasses = {
    accent: 'bg-gradient-to-r from-[#00ff88] to-[#00cc6a]',
    warn: 'bg-gradient-to-r from-[#ffaa00] to-[#cc8800]',
    danger: 'bg-gradient-to-r from-[#ff3366] to-[#cc2244]',
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs lcd-text w-20 shrink-0">{label}</span>
      <div className="stat-bar-bg flex-1 h-3 rounded-sm overflow-hidden">
        <div
          className={`h-full rounded-sm transition-all duration-300 ${colorClasses[color]}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={`${label}: ${value}/${max}`}
        />
      </div>
      <span className="text-xs lcd-text w-8 text-right">{value}</span>
    </div>
  );
}