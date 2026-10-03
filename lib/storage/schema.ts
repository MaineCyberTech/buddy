import { z } from 'zod';
import { GameSave, InventoryState } from '@/lib/generation/types';
import { createInitialProgression } from '@/lib/progression/lifecycle';

/**
 * Current on-disk save schema version.
 *
 * This is the single source of truth for the version written by every
 * persistence path (manual save, autosave) and expected by `loadGame`.
 * Bump this together with a migration entry in `MIGRATIONS`.
 */
export const SAVE_VERSION = 2;

/** Maximum accepted size of a base64-encoded import payload (~750 KB decoded). */
export const MAX_IMPORT_LENGTH = 1_000_000;

const RARITY = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const;
const MOODS = ['happy', 'content', 'neutral', 'sad', 'sick'] as const;
const LIFECYCLE = ['egg', 'baby', 'child', 'teen', 'adult', 'elder'] as const;
const MEMORY_TYPES = ['hatch', 'evolution', 'adventure', 'milestone', 'achievement'] as const;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** A finite number, clamped into [min, max] so drifted values recover instead of crashing. */
const boundedNumber = (min: number, max: number) =>
  z.number().finite().transform((value) => clamp(value, min, max));

const count = (max: number) => boundedNumber(0, max);
const timestamp = z.number().finite().nonnegative();
const shortString = (max: number) => z.string().max(max);

const statsSchema = z.object({
  courage: boundedNumber(0, 100),
  curiosity: boundedNumber(0, 100),
  playfulness: boundedNumber(0, 100),
  discipline: boundedNumber(0, 100),
  empathy: boundedNumber(0, 100),
});

const needsSchema = z.object({
  hunger: boundedNumber(0, 100),
  happiness: boundedNumber(0, 100),
  cleanliness: boundedNumber(0, 100),
  energy: boundedNumber(0, 100),
  social: boundedNumber(0, 100),
});

const personalitySchema = z.object({
  id: shortString(64),
  name: shortString(64),
  description: shortString(1024),
  likes: z.array(shortString(64)).max(64),
  dislikes: z.array(shortString(64)).max(64),
  preferredActivities: z.array(shortString(64)).max(64),
  careModifiers: z.record(z.number().finite()).default({}),
  idleLines: z.array(shortString(1024)).max(64),
  happyLines: z.array(shortString(1024)).max(64),
  hungryLines: z.array(shortString(1024)).max(64),
  adventureLines: z.array(shortString(1024)).max(64),
  sleepLines: z.array(shortString(1024)).max(64),
});

const identitySchema = z.object({
  speciesId: shortString(64).min(1),
  speciesName: shortString(64).min(1),
  nickname: shortString(64),
  rarity: z.enum(RARITY),
  isShiny: z.boolean(),
  hat: shortString(64),
  eyes: shortString(64),
  generatedAt: timestamp,
  seed: shortString(256),
});

const memorySchema = z.object({
  id: shortString(64),
  type: z.enum(MEMORY_TYPES),
  title: shortString(128),
  description: shortString(1024),
  timestamp,
  icon: shortString(16),
});

const progressionSchema = z.object({
  lifecycle: z.enum(LIFECYCLE),
  age: count(1_000_000_000),
  skills: z.object({
    exploring: count(1_000_000_000),
    training: count(1_000_000_000),
    social: count(1_000_000_000),
    crafting: count(1_000_000_000),
    cooking: count(1_000_000_000),
  }),
  bondLevel: boundedNumber(1, 1_000_000),
  totalAdventures: count(1_000_000_000),
  memories: z.array(memorySchema).max(1000),
  achievements: z.array(shortString(64)).max(1000),
  careQuality: boundedNumber(0, 1_000_000),
});

const buddyStateSchema = z.object({
  identity: identitySchema,
  stats: statsSchema,
  needs: needsSchema,
  personality: personalitySchema,
  level: boundedNumber(1, 1_000_000),
  xp: count(1_000_000_000),
  bond: count(1_000_000_000),
  mood: z.enum(MOODS),
  health: boundedNumber(0, 100),
  lastInteraction: timestamp,
  totalCareActions: count(1_000_000_000),
  progression: progressionSchema,
});

const inventorySchema = z.object({
  coins: count(1_000_000_000_000),
  items: z
    .array(
      z.object({
        id: shortString(64).min(1),
        quantity: count(1_000_000_000),
      })
    )
    .max(500),
});

export const gameSaveSchema = z.object({
  version: z.number().int().min(1).max(SAVE_VERSION),
  buddy: buddyStateSchema.nullable(),
  guestId: shortString(128).min(1),
  createdAt: timestamp,
  updatedAt: timestamp,
  inventory: inventorySchema.optional(),
});

function defaultInventory(): InventoryState {
  return { coins: 0, items: [] };
}

type RawSave = Record<string, unknown>;

type Migration = (save: RawSave) => RawSave;

/**
 * Versioned migration registry. Each entry upgrades a save from key `N` to `N + 1`.
 * Keep transformations pure and idempotent.
 */
const MIGRATIONS: Record<number, Migration> = {
  // v1 predates the guarantee that `progression` and `inventory` exist.
  1: (save) => {
    const buddy = save.buddy;
    if (buddy && typeof buddy === 'object' && !Array.isArray(buddy)) {
      const record = buddy as RawSave;
      if (!record.progression || typeof record.progression !== 'object') {
        record.progression = createInitialProgression();
      }
    }
    if (!save.inventory || typeof save.inventory !== 'object' || Array.isArray(save.inventory)) {
      save.inventory = defaultInventory();
    }
    return { ...save, version: 2 };
  },
};

export type SaveValidationResult =
  | { ok: true; save: GameSave }
  | { ok: false; error: string };

/**
 * Validate a raw save object, migrating older versions up to `SAVE_VERSION`.
 *
 * Returns a typed result; never throws. Malformed or unsupported saves fail
 * closed (`ok: false`) so callers can fall back to a recoverable state.
 */
export function validateSave(input: unknown): SaveValidationResult {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, error: 'save is not an object' };
  }

  let raw = { ...(input as RawSave) };
  let version = raw.version;
  if (typeof version !== 'number' || !Number.isInteger(version) || version < 1) {
    return { ok: false, error: 'missing or invalid save version' };
  }
  if (version > SAVE_VERSION) {
    return { ok: false, error: `unsupported save version ${version}` };
  }

  while (version < SAVE_VERSION) {
    const migrate = MIGRATIONS[version];
    if (!migrate) {
      return { ok: false, error: `no migration path from version ${version}` };
    }
    raw = migrate(raw);
    version = raw.version;
    if (typeof version !== 'number' || !Number.isInteger(version) || version <= 0) {
      return { ok: false, error: 'migration produced an invalid version' };
    }
  }

  const parsed = gameSaveSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues.map((i) => i.path.join('.') + ': ' + i.message).join('; ') };
  }

  return { ok: true, save: parsed.data as GameSave };
}
