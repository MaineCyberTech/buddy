export interface FriendHome {
  userId: string;
  username: string;
  buddyNickname: string;
  buddySpecies: string;
  decor: { slotId: string; itemId: string | null }[];
  lastVisit: number;
}

export function createFriendHome(userId: string, username: string, buddyNickname: string, buddySpecies: string, decor: { slotId: string; itemId: string | null }[]): FriendHome {
  return { userId, username, buddyNickname, buddySpecies, decor, lastVisit: Date.now() };
}
