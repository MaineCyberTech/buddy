import { LOCATIONS } from '@/data/locations';

export interface LoreEntry {
  locationId: string;
  visits: number;
  discovered: boolean;
  notes: string;
}

export function initLoreJournal(): LoreEntry[] {
  return LOCATIONS.map(l => ({
    locationId: l.id,
    visits: 0,
    discovered: false,
    notes: '',
  }));
}

export function recordLocationVisit(journal: LoreEntry[], locationId: string): LoreEntry[] {
  return journal.map(e =>
    e.locationId === locationId
      ? { ...e, visits: e.visits + 1, discovered: true }
      : e
  );
}

export function updateLoreNote(journal: LoreEntry[], locationId: string, note: string): LoreEntry[] {
  return journal.map(e =>
    e.locationId === locationId ? { ...e, notes: note } : e
  );
}

export function getDiscoveredCount(journal: LoreEntry[]): number {
  return journal.filter(e => e.discovered).length;
}
