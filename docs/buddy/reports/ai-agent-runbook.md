# Buddy — AI Agent Operator Runbook

## Execution Controller

This runbook documents the build order for the Buddy virtual pet PWA. Designed for execution-mode AI coding agents.

## Phase Order

### Core (Prompts 00–11) — Completed
| Phase | Module | Status |
|-------|--------|--------|
| 00 | Master build prompt, repo init | ✅ |
| 01 | Next.js 14 foundation, TypeScript, Tailwind LCD theme | ✅ |
| 02 | Deterministic generation: 50 species, 5 rarities, shiny, 5 stats, 22 personalities, seeded RNG | ✅ |
| 03 | Hatch flow (landing → hatching → reveal → nickname → main device), LCD display | ✅ |
| 04 | Care loop: 7 actions, 6 needs, mood, bond, XP/leveling, offline decay | ✅ |
| 05 | 10 locations, 10 loot tables, 45+ items, adventures, coin economy | ✅ |
| 06 | 6 lifecycle stages, 5 skills, evolution detection, bond levels | ✅ |
| 07 | Home customization: 6 decor slots, 14 decor items, browse/pick/preview/place | ✅ |
| 08 | PWA: manifest, cache-first SW, IndexedDB v2 save/load, autosave, export/import | ✅ |
| 09 | Local auth + Supabase auth abstraction, cloud save mock, guest migration | ✅ |
| 10 | QA blitz: P0/P1 fixes, immutability, data loss prevention, state sanitization | ✅ |
| 11 | Polish: hatch reveal, idle messages, shiny sparkle, memory album, silent mode, care journal | ✅ |

### Expansion (Prompts 13–19) — Completed
| Phase | Module | Status |
|-------|--------|--------|
| 12 | AI Agent Operator Runbook (this document) | ✅ |
| 13 | Anti-cheat: rate limiting, validation, state sanitization, suspicious activity logging | ✅ |
| 14 | Database schema + full API contracts (30+ typed endpoints) | ✅ |
| 15 | Supabase: SQL migrations, RLS policies, Edge Function for adventure validation | ✅ |
| 16 | Advanced PWA: install prompt, update prompt, SW v2, offline action queue | ✅ |
| 17 | Mini-games: Memory Match, Reaction Test, Rhythm Tap (3 complete) | ✅ |
| 18 | Collections: Species Book (50 entries), Lore Journal (10 locations), Photo Album (50 snapshots) | ✅ |
| 19 | Seasonal: 4 seasons, daily login (7-day streak), seasonal items | ✅ |

### Extra Features (Beyond Prompt Pack)
| Feature | Status |
|---------|--------|
| Breeding: rarity inheritance, eye blending, 3 breeds/session | ✅ |
| Marketplace: daily rotating stock (8-14 items), buy/sell, rarity-based pricing | ✅ |
| Sound engine: 15 Web Audio API effects, vibration on actions | ✅ |
| Save slots: 3 buddies per device, slot selection screen, per-slot persistence | ✅ |
| Photo capture: snapshot button saves current buddy state to album | ✅ |
| High score persistence per mini-game | ✅ |

## Quality Gates

Every phase requires:
- `npx vitest run` — all passing
- `npx tsc --noEmit` — clean
- `npx next build` — successful
- `npx next lint` — no errors/warnings

## Audit Trail

All audit reports stored under `docs/buddy/reports/audits/`
All phase reports stored under `docs/buddy/reports/phases/`

## Blocker Handling

If a test, build, or typecheck fails, fix before proceeding. Preserve partial work if interrupted.

## Current Stats
- **Test files**: 10
- **Total tests**: 178 (all passing)
- **First-load JS**: 130 kB
- **Lines of code**: ~15,000+ (est.)
- **P0/P1 issues**: 0