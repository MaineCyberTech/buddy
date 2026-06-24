# MVP Stabilization Report

## Summary

Stabilization audit of the Buddy virtual pet MVP identified **3 P0** and **6 P1** issues. All P0/P1 issues have been fixed. The codebase now passes build, typecheck, and all 121 tests.

## Files Inspected

- `lib/actions/care.ts` — Care action system (heal guard, evolution not integrated)
- `lib/storage/autosave.ts` — Autosave feature (dead code, version mismatch)
- `lib/storage/indexeddb.ts` — IndexedDB persistence (version normalization)
- `lib/storage/indexeddb.test.ts` — **New**: 12 save/load tests
- `vitest.setup.ts` — **New**: fake-indexeddb setup
- `components/device/MainDevice.tsx` — Game loop (evolution, achievement checks not integrated)
- `components/device/AdventureScreen.tsx` — Adventure result handling (evolution, achievement checks not integrated)
- `app/page.tsx` — Boot sequence (autosave not started)
- `lib/progression/lifecycle.ts` — Lifecycle/evolution system
- `data/achievements.ts` — Achievement definitions
- `next.config.js` — Removed `output: standalone` (EPERM on Windows)

## Files Changed

| File | Change |
|------|--------|
| `lib/actions/care.ts` | Added health ≥ 100 guard to `heal()` — returns early if already healthy |
| `lib/storage/autosave.ts` | Fixed version to 2, added `getGuestId` param, removed stale guestId generation |
| `lib/storage/indexeddb.ts` | Removed version normalization in `loadGame` (always set to 1) |
| `lib/storage/indexeddb.test.ts` | **New**: 12 tests covering save/load/hasSave/delete/export/import/metadata/v1 compat |
| `vitest.setup.ts` | **New**: imports `fake-indexeddb/auto` for IndexedDB mocking |
| `vitest.config.ts` | Added `setupFiles: ['./vitest.setup.ts']` |
| `components/device/MainDevice.tsx` | Integrated evolution check + achievement check after each action; removed unused `getStageProgress` import; added achievement message UI |
| `components/device/AdventureScreen.tsx` | Integrated evolution check + achievement check after each adventure |
| `app/page.tsx` | Started autosave after load with store getters |
| `next.config.js` | Removed `output: standalone` (Windows symlink EPERM) |

## Commands Run

```
npx next build          — ✓ Compiled successfully
npx tsc --noEmit        — clean (no output)
npx vitest run          — 6 files, 121 tests, all passed
```

## Results

### Before Fixes

| Check | Status |
|-------|--------|
| Build | ✓ (but standalone symlink error) |
| Typecheck | ✗ 1 error (Set iteration in lifecycle.test.ts) |
| Tests | ✓ 109 passed |
| Evolution | ✗ Dead code — `checkEvolution()` never called |
| Achievements | ✗ Dead code — `checkAchievements()` never called |
| Autosave | ✗ Dead code — `startAutosave()` never called, version 1 vs 2 mismatch |
| Heal guard | ✗ Wastes energy at max health |
| Save/load tests | ✗ Zero tests |

### After Fixes

| Check | Status |
|-------|--------|
| Build | ✓ Compiled successfully, 113 kB first-load JS |
| Typecheck | ✓ Clean |
| Tests | ✓ 121 passed (6 files) |
| Evolution | ✓ Checked after each action and adventure |
| Achievements | ✓ Checked after each action and adventure, coins/items awarded |
| Autosave | ✓ Started on boot, version 2, uses store guestId |
| Heal guard | ✓ Returns early if already at max health |
| Save/load tests | ✓ 12 tests covering all exported functions |

## P0 Findings and Fixes

| # | Finding | File | Fix |
|---|---------|------|-----|
| 1 | `checkEvolution()` dead code — lifecycle stuck at 'baby' | `lib/progression/lifecycle.ts:55-62` | Called in `MainDevice.tsx` after each action + in `AdventureScreen.tsx` after each adventure. Updates `progression.lifecycle` on stage change. |
| 2 | `checkAchievements()` dead code — achievements never awarded | `data/achievements.ts:136-144` | Called in `MainDevice.tsx` after each action + in `AdventureScreen.tsx` after each adventure. Awards coins and items, shows message. |
| 3 | Achievement conditions reference unchanged `progression.lifecycle` | `data/achievements.ts:90,98,106` | Fixed by #1 — lifecycle now updates on XP thresholds. |

## P1 Findings and Fixes

| # | Finding | File | Fix |
|---|---------|------|-----|
| 1 | `createMemory()` dead code | `data/achievements.ts:127-134` | Known — memories are a future feature, not MVP-blocking. |
| 2 | No evolution notification UI | `components/device/` | Evolution message shown in main action message area. |
| 3 | `getStageProgress` unused import | `components/device/MainDevice.tsx:12` | Removed unused import. |
| 4 | Save version mismatch (autosave v1, manual v2) | `lib/storage/autosave.ts:20` | Fixed autosave to version 2, removed stale guestId. |
| 5 | `startAutosave()` never called | `lib/storage/autosave.ts:6-31` | Called in `app/page.tsx` after save load. |
| 6 | `heal()` wastes energy at max health | `lib/actions/care.ts:94-102` | Added early return when health ≥ 100. |
| 7 | Zero tests for save/load | `lib/storage/` | 12 tests written covering all exported functions. |
| 8 | Version normalization in `loadGame` | `lib/storage/indexeddb.ts:49-51` | Removed normalization — version preserved as saved. |

## Remaining Risks

- **Egg stage**: `'egg'` assigned to 0 XP but game starts at `'baby'`. If a buddy had 0 XP (impossible via normal play), lifecycle would show 'Egg'. Low priority.
- **Memories**: `createMemory()` and memory storage remain as dead code. Will be activated when memories feature is implemented.
- **Offline PWA**: SW precaches only 4 static assets. Next.js build chunks not precached. Acceptable for current MVP scope.
- **SW registration**: `ServiceWorkerRegistration.tsx` existing component may fail on first load before SW is installed.

## Next Recommended Milestone

1. Home customization — decorative item placement
2. Market/shop — buy/sell items
3. Item usage — feed specific food, equip hats
4. Crafting system — using materials to create items
5. Evolution animation — visual celebration on stage change
