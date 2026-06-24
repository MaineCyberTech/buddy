import { BuddyState, InventoryState, AdventureResult, BuddyStats } from '@/lib/generation/types';
import { applyAction, CareActionType } from '@/lib/actions/care';

export interface ServerAction {
  type: 'care' | 'adventure' | 'inventory' | 'trade' | 'market';
  action: string;
  payload: unknown;
  timestamp: number;
  clientId: string;
  nonce: string;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  correctedPayload?: unknown;
  serverState?: {
    buddy?: BuddyState;
    inventory?: InventoryState;
  };
}

export interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const RATE_LIMITS: Record<string, { max: number; windowMs: number }> = {
  care: { max: 60, windowMs: 60000 },
  adventure: { max: 10, windowMs: 60000 },
  inventory: { max: 100, windowMs: 60000 },
  trade: { max: 20, windowMs: 60000 },
  market: { max: 50, windowMs: 60000 },
};

const rateLimitBuckets = new Map<string, RateLimitBucket>();

export function checkRateLimit(clientId: string, actionType: keyof typeof RATE_LIMITS): boolean {
  const key = `${clientId}:${actionType}`;
  const limit = RATE_LIMITS[actionType];
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + limit.windowMs });
    return true;
  }

  if (bucket.count >= limit.max) {
    return false;
  }

  bucket.count++;
  return true;
}

export function validateCareAction(action: CareActionType, buddy: BuddyState): ValidationResult {
  if (!buddy) return { valid: false, reason: 'No buddy found' };
  const { buddy: updated, result } = applyAction(buddy, action);
  if (result.xpGain < 0 && action !== 'heal') {
    return { valid: false, reason: 'Action produced negative XP' };
  }
  return { valid: true, serverState: { buddy: updated } };
}

export function validateAdventureAction(
  locationId: string, buddy: BuddyState, inventory: InventoryState, result: AdventureResult
): ValidationResult {
  if (!buddy) return { valid: false, reason: 'No buddy found' };
  if (buddy.needs.energy < result.energyCost) return { valid: false, reason: 'Insufficient energy' };
  if (result.xpGained > 50) return { valid: false, reason: 'XP reward exceeds server maximum' };
  if (result.coinsEarned > 30) return { valid: false, reason: 'Coin reward exceeds server maximum' };
  return { valid: true };
}

export function validateInventoryMutation(
  mutation: { type: 'add' | 'remove'; itemId: string; quantity: number },
  inventory: InventoryState
): ValidationResult {
  if (mutation.quantity > 99) return { valid: false, reason: 'Quantity exceeds stack limit' };
  if (mutation.type === 'remove') {
    const existing = inventory.items.find(i => i.id === mutation.itemId);
    if (!existing || existing.quantity < mutation.quantity) return { valid: false, reason: 'Insufficient quantity' };
  }
  return { valid: true };
}

const MAX_COINS = 999999;
const MAX_BUDDY_LEVEL = 50;

export function sanitizeBuddyState(buddy: BuddyState): BuddyState {
  const sanitized = { ...buddy };
  for (const key of Object.keys(sanitized.needs) as (keyof BuddyState['needs'])[]) {
    sanitized.needs[key] = Math.max(0, Math.min(100, sanitized.needs[key] ?? 50));
  }
  sanitized.health = Math.max(0, Math.min(100, sanitized.health ?? 100));
  sanitized.mood = sanitized.mood || 'content';
  sanitized.bond = Math.max(0, sanitized.bond ?? 0);
  sanitized.xp = Math.max(0, sanitized.xp ?? 0);
  sanitized.level = Math.max(1, Math.min(MAX_BUDDY_LEVEL, sanitized.level ?? 1));
  sanitized.lastInteraction = Math.min(sanitized.lastInteraction || Date.now(), Date.now());
  return sanitized;
}

export function sanitizeInventoryState(inventory: InventoryState): InventoryState {
  const sanitized = { ...inventory };
  sanitized.coins = Math.max(0, Math.min(MAX_COINS, sanitized.coins ?? 0));
  sanitized.items = (sanitized.items || []).filter(i => i && i.id).map(i => ({
    id: i.id,
    quantity: Math.max(1, Math.min(99, i.quantity)),
  }));
  return sanitized;
}

export interface SuspiciousActivityLog {
  id: string;
  clientId: string;
  actionType: string;
  reason: string;
  payload: unknown;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const suspiciousActivityLog: SuspiciousActivityLog[] = [];
const MAX_LOG_ENTRIES = 1000;

export function logSuspiciousActivity(clientId: string, actionType: string, reason: string, payload: unknown, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'): void {
  suspiciousActivityLog.push({
    id: `sus-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    clientId, actionType, reason, payload, timestamp: Date.now(), severity,
  });
  if (suspiciousActivityLog.length > MAX_LOG_ENTRIES) suspiciousActivityLog.shift();
}

export function getSuspiciousActivityLog(): SuspiciousActivityLog[] {
  return [...suspiciousActivityLog];
}