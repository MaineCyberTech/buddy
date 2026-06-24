export interface UserRecord {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: number;
  lastLoginAt: number;
  isActive: boolean;
  roles: string[];
}

export interface BuddyRecord {
  id: string;
  userId: string;
  slot: number;
  speciesId: string;
  nickname: string;
  rarity: string;
  isShiny: boolean;
  hat: string;
  eyes: string;
  seed: string;
  stats: Record<string, number>;
  needs: Record<string, number>;
  mood: string;
  bond: number;
  health: number;
  xp: number;
  level: number;
  lastInteraction: number;
  personalityId: string;
  lifecycle: string;
  age: number;
  skills: Record<string, number>;
  bondLevel: number;
  totalAdventures: number;
  achievements: string[];
  careQuality: number;
  memories: MemoryEntry[];
  createdAt: number;
  updatedAt: number;
}

export interface MemoryEntry {
  id: string;
  type: 'hatch' | 'evolution' | 'adventure' | 'milestone' | 'achievement';
  title: string;
  description: string;
  timestamp: number;
  icon: string;
}

export interface InventoryRecord {
  buddyId: string;
  coins: number;
  items: InventoryItem[];
}

export interface InventoryItem {
  itemId: string;
  quantity: number;
}

export interface HomeRecord {
  buddyId: string;
  placedDecor: DecorPlacement[];
}

export interface DecorPlacement {
  slotId: string;
  itemId: string | null;
}

export interface SkillRecord {
  buddyId: string;
  exploring: number;
  training: number;
  social: number;
  crafting: number;
  cooking: number;
}

export interface AdventureRecord {
  id: string;
  buddyId: string;
  locationId: string;
  success: boolean;
  statChecks: Record<string, { required: number; actual: number; passed: boolean }>;
  xpReward: number;
  bondReward: number;
  coinReward: number;
  itemRewards: InventoryItem[];
  statChanges: Record<string, number>;
  timestamp: number;
}

export interface AchievementRecord {
  buddyId: string;
  achievementIds: string[];
  unlockedAt: Record<string, number>;
}

export interface SaveConflictRecord {
  id: string;
  buddyId: string;
  localVersion: number;
  cloudVersion: number;
  localHash: string;
  cloudHash: string;
  resolved: boolean;
  resolution: 'local' | 'cloud' | 'merged';
  resolvedAt: number | null;
}

export interface AuditLogEntry {
  id: string;
  userId: string | null;
  buddyId: string | null;
  action: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: number;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export interface SyncEnvelope {
  version: number;
  buddyId: string;
  userId: string;
  checksum: string;
  timestamp: number;
  data: BuddyRecord & {
    inventory: InventoryRecord;
    home: HomeRecord;
    skills: SkillRecord;
  };
}

export type APIContract = {
  'POST /api/auth/signup': { request: { email: string; username: string; password: string }; response: { user: UserRecord; token: string } };
  'POST /api/auth/login': { request: { email: string; password: string }; response: { user: UserRecord; token: string } };
  'POST /api/auth/guest-migrate': { request: { guestId: string; email: string; username: string; password: string }; response: { user: UserRecord; token: string } };
  'POST /api/auth/refresh': { request: { refreshToken: string }; response: { token: string } };

  'GET /api/buddies': { request: {}; response: BuddyRecord[] };
  'POST /api/buddies': { request: { slot: number; speciesId?: string; nickname?: string }; response: BuddyRecord };
  'GET /api/buddies/:id': { request: { id: string }; response: BuddyRecord };
  'PATCH /api/buddies/:id': { request: { id: string; updates: Partial<BuddyRecord> }; response: BuddyRecord };
  'DELETE /api/buddies/:id': { request: { id: string }; response: { success: boolean } };

  'GET /api/buddies/:id/inventory': { request: { id: string }; response: InventoryRecord };
  'POST /api/buddies/:id/inventory/add': { request: { id: string; itemId: string; quantity: number }; response: InventoryRecord };
  'POST /api/buddies/:id/inventory/remove': { request: { id: string; itemId: string; quantity: number }; response: InventoryRecord };
  'POST /api/buddies/:id/inventory/coins': { request: { id: string; amount: number }; response: InventoryRecord };

  'GET /api/buddies/:id/home': { request: { id: string }; response: HomeRecord };
  'PATCH /api/buddies/:id/home': { request: { id: string; placedDecor: DecorPlacement[] }; response: HomeRecord };

  'GET /api/buddies/:id/skills': { request: { id: string }; response: SkillRecord };
  'PATCH /api/buddies/:id/skills': { request: { id: string; skills: Partial<SkillRecord> }; response: SkillRecord };

  'POST /api/buddies/:id/care': { request: { id: string; action: string; clientTimestamp: number }; response: { buddy: BuddyRecord; result: { needs: Record<string, number>; mood: string; bond: number; xp: number; level: number } } };
  'POST /api/buddies/:id/adventure': { request: { id: string; locationId: string; clientTimestamp: number }; response: { buddy: BuddyRecord; inventory: InventoryRecord; result: AdventureRecord } };

  'GET /api/buddies/:id/achievements': { request: { id: string }; response: AchievementRecord };
  'POST /api/buddies/:id/achievements/check': { request: { id: string }; response: { unlocked: string[] } };

  'POST /api/saves/:id/sync': { request: { id: string; localData: SyncEnvelope }; response: { syncResult: 'ok' | 'conflict' | 'error'; cloudData?: SyncEnvelope; conflict?: SaveConflictRecord } };
  'GET /api/saves/:id/conflicts': { request: { id: string }; response: SaveConflictRecord[] };
  'POST /api/saves/conflicts/:conflictId/resolve': { request: { conflictId: string; resolution: 'local' | 'cloud' | 'merged'; mergedData?: SyncEnvelope }; response: { success: boolean } };

  'GET /api/market/stock': { request: {}; response: { itemId: string; buyPrice: number; stock: number }[] };
  'POST /api/market/buy': { request: { buddyId: string; itemId: string; quantity: number }; response: { inventory: InventoryRecord; listing: { itemId: string; buyPrice: number; stock: number } } };
  'POST /api/market/sell': { request: { buddyId: string; itemId: string; quantity: number }; response: { inventory: InventoryRecord; sellPrice: number } };

  'POST /api/trading/offers': { request: { fromBuddyId: string; offeredItems: InventoryItem[]; requestedItems: InventoryItem[] }; response: { offerId: string } };
  'GET /api/trading/offers': { request: { buddyId?: string }; response: { id: string; fromBuddyId: string; offeredItems: InventoryItem[]; requestedItems: InventoryItem[]; status: string; createdAt: number }[] };
  'POST /api/trading/offers/:id/accept': { request: { id: string; buddyId: string }; response: { success: boolean } };
  'POST /api/trading/offers/:id/decline': { request: { id: string }; response: { success: boolean } };

  'GET /api/leaderboards': { request: { type: 'bond' | 'adventures' | 'collection'; limit?: number }; response: { rank: number; username: string; buddySpecies: string; buddyNickname: string; value: number }[] };

  'GET /api/audit/log': { request: { userId?: string; buddyId?: string; limit?: number }; response: AuditLogEntry[] };
};