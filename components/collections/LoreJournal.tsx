'use client';

import { LoreEntry } from '@/lib/collections';
import { LOCATIONS } from '@/data/locations';
import { getDiscoveredCount } from '@/lib/collections';

interface LoreJournalProps {
  journal: LoreEntry[];
  onBack: () => void;
}

export function LoreJournal({ journal, onBack }: LoreJournalProps) {
  const discovered = getDiscoveredCount(journal);

  return (
    <div className="animate-fade-in space-y-3">
      <p className="text-xs lcd-text-accent uppercase tracking-wider">Lore Journal</p>
      <p className="text-[10px] lcd-text opacity-60">{discovered}/{LOCATIONS.length} locations discovered</p>
      <div className="space-y-1.5 max-h-60 overflow-y-auto">
        {LOCATIONS.map(loc => {
          const entry = journal.find(e => e.locationId === loc.id);
          const visited = entry?.discovered || false;
          return (
            <div key={loc.id} className={`p-2 rounded-sm ${visited ? 'bg-lcd-dark' : 'bg-[#1a1a2e] opacity-40'}`}>
              <p className={`text-xs ${visited ? 'lcd-text-accent' : 'lcd-text opacity-40'}`}>
                {visited ? loc.name : '???'}
              </p>
              {visited && (
                <>
                  <p className="text-[10px] lcd-text opacity-60 mt-0.5">{loc.description}</p>
                  <p className="text-[9px] lcd-text opacity-40 mt-0.5">Visits: {entry?.visits || 0}{loc.requiresAccount ? ' (Account required)' : ''}</p>
                </>
              )}
            </div>
          );
        })}
      </div>
      <button onClick={onBack} className="btn-device px-4 py-2 text-xs rounded-md focus-ring">BACK</button>
    </div>
  );
}
