'use client';

import { useState } from 'react';
import { LeaderboardType, LeaderboardEntry, initLeaderboardState, getLeaderboardTitle } from '@/lib/social';

interface LeaderboardViewProps {
  onBack: () => void;
}

export function LeaderboardView({ onBack }: LeaderboardViewProps) {
  const [type, setType] = useState<LeaderboardType>('bond');
  const [entries] = useState<LeaderboardEntry[]>([]);

  return (
    <div className="animate-fade-in space-y-3">
      <p className="text-xs lcd-text-accent uppercase tracking-wider">{getLeaderboardTitle(type)}</p>
      <div className="flex gap-1">
        {(['bond', 'adventures', 'collection'] as LeaderboardType[]).map(t => (
          <button key={t} onClick={() => setType(t)} className={`text-[10px] px-2 py-1 rounded focus-ring ${type === t ? 'bg-lcd-accent text-black' : 'bg-[#1a1a2e] lcd-text opacity-70'}`}>
            {t === 'bond' ? 'BOND' : t === 'adventures' ? 'ADV' : 'COLLECTION'}
          </button>
        ))}
      </div>
      {entries.length === 0 ? (
        <p className="text-xs lcd-text opacity-50 italic">Leaderboards will populate when cloud sync is active.</p>
      ) : (
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {entries.map((e, i) => (
            <div key={i} className={`flex items-center gap-2 p-1.5 rounded-sm ${i < 3 ? 'bg-lcd-dark' : 'bg-[#1a1a2e]'}`}>
              <span className={`text-sm w-5 text-center ${i === 0 ? 'rarity-shiny' : i < 3 ? 'lcd-text-accent' : 'lcd-text opacity-50'}`}>#{e.rank}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs lcd-text-accent">{e.username}</p>
                <p className="text-[9px] lcd-text opacity-50">{e.buddyNickname} ({e.buddySpecies})</p>
              </div>
              <span className="text-xs lcd-text-accent">{type === 'bond' ? `♥${e.bondLevel}` : type === 'adventures' ? `🗺️${e.totalAdventures}` : `📖${e.collectionCount}`}</span>
            </div>
          ))}
        </div>
      )}
      <button onClick={onBack} className="btn-device px-4 py-2 text-xs rounded-md focus-ring">BACK</button>
    </div>
  );
}
