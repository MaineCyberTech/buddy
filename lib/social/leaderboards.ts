export interface LeaderboardEntry {
  rank: number;
  username: string;
  buddySpecies: string;
  buddyNickname: string;
  bondLevel: number;
  totalAdventures: number;
  collectionCount: number;
}

export type LeaderboardType = 'bond' | 'adventures' | 'collection';

export interface LeaderboardState {
  bond: LeaderboardEntry[];
  adventures: LeaderboardEntry[];
  collection: LeaderboardEntry[];
  lastUpdated: number;
}

export function initLeaderboardState(): LeaderboardState {
  return { bond: [], adventures: [], collection: [], lastUpdated: 0 };
}

export function getLeaderboardTitle(type: LeaderboardType): string {
  switch (type) {
    case 'bond': return 'Bond Level Rankings';
    case 'adventures': return 'Adventure Rankings';
    case 'collection': return 'Collection Rankings';
  }
}
