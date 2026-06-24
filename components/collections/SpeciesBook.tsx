'use client';

import { useState } from 'react';
import { SpeciesEntry, getSpeciesCompletion, getSpeciesByRarity } from '@/lib/collections';
import { SPECIES } from '@/data/species';

interface SpeciesBookProps {
  book: SpeciesEntry[];
  onBack: () => void;
}

export function SpeciesBook({ book, onBack }: SpeciesBookProps) {
  const [filter, setFilter] = useState<string>('all');
  const completion = getSpeciesCompletion(book);
  const byRarity = getSpeciesByRarity(book);

  const display = filter === 'all'
    ? book
    : byRarity[filter] || [];

  return (
    <div className="animate-fade-in space-y-3">
      <p className="text-xs lcd-text-accent uppercase tracking-wider">Species Book</p>
      <p className="text-[10px] lcd-text opacity-60">{completion.seen}/{completion.total} seen ({completion.percent}%) | {completion.hatched} hatched | {completion.shiny} shiny</p>
      <div className="flex gap-1 flex-wrap">
        {['all', 'common', 'uncommon', 'rare', 'epic', 'legendary'].map(r => (
          <button key={r} onClick={() => setFilter(r)} className={`text-[10px] px-2 py-1 rounded focus-ring ${filter === r ? 'bg-lcd-accent text-black' : 'bg-[#1a1a2e] lcd-text opacity-70'}`}>
            {r.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="space-y-1 max-h-60 overflow-y-auto">
        {display.map(entry => {
          const species = SPECIES.find(s => s.id === entry.speciesId);
          if (!species) return null;
          return (
            <div key={entry.speciesId} className={`flex items-center gap-2 p-1.5 rounded-sm ${entry.seen ? 'bg-lcd-dark' : 'bg-[#1a1a2e] opacity-40'}`}>
              <span className={`text-lg rarity-${species.rarity}`}>{entry.seen ? (species.asciiBase?.[0]?.[0] || '?') : '?'}</span>
              <div className="min-w-0 flex-1">
                <p className={`text-xs ${entry.seen ? 'lcd-text-accent' : 'lcd-text opacity-40'}`}>
                  {entry.seen ? species.name : '???'}
                </p>
                <p className="text-[9px] lcd-text opacity-40">
                  <span className={`rarity-${species.rarity}`}>{species.rarity.toUpperCase()}</span>
                  {entry.shinySeen && <span className="rarity-shiny ml-1">✦</span>}
                  {entry.hatched && <span className="ml-1">Hatched ×{entry.count}</span>}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={onBack} className="btn-device px-4 py-2 text-xs rounded-md focus-ring">BACK</button>
    </div>
  );
}
