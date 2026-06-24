import { SPECIES } from '@/data/species';

export interface SpeciesEntry {
  speciesId: string;
  seen: boolean;
  hatched: boolean;
  shinySeen: boolean;
  count: number;
}

export function initSpeciesBook(): SpeciesEntry[] {
  return SPECIES.map(s => ({
    speciesId: s.id,
    seen: false,
    hatched: false,
    shinySeen: false,
    count: 0,
  }));
}

export function recordSpeciesSeen(book: SpeciesEntry[], speciesId: string, isShiny: boolean, didHatch: boolean): SpeciesEntry[] {
  return book.map(e =>
    e.speciesId === speciesId
      ? { ...e, seen: true, hatched: e.hatched || didHatch, shinySeen: e.shinySeen || isShiny, count: e.count + (didHatch ? 1 : 0) }
      : e
  );
}

export function getSpeciesCompletion(book: SpeciesEntry[]): { total: number; seen: number; hatched: number; shiny: number; percent: number } {
  const total = book.length;
  const seen = book.filter(e => e.seen).length;
  const hatched = book.filter(e => e.hatched).length;
  const shiny = book.filter(e => e.shinySeen).length;
  return { total, seen, hatched, shiny, percent: total > 0 ? Math.round((seen / total) * 100) : 0 };
}

export function getSpeciesByRarity(book: SpeciesEntry[]): Record<string, SpeciesEntry[]> {
  const grouped: Record<string, SpeciesEntry[]> = {};
  for (const entry of book) {
    const species = SPECIES.find(s => s.id === entry.speciesId);
    const rarity = species?.rarity || 'common';
    if (!grouped[rarity]) grouped[rarity] = [];
    grouped[rarity].push(entry);
  }
  return grouped;
}
