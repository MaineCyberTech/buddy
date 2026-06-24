# Milestone 2 — Locations, Adventures, and Loot — Completion Report

## Summary

Milestone 2 (Locations, Adventures, and Loot) was already largely implemented in a prior Phase 05 pass. Two gaps were identified and filled: the **Main House** home-base location was missing, and **guest account gating** for `requiresAccount` locations was not implemented. Both have been added.

## Files Created

- `docs/buddy/reports/phases/milestone-2-locations-adventures-loot-report.md`

## Files Modified

| File | Change |
|------|--------|
| `data/locations.ts` | Added `main_house` location (0 energy cost, no stat checks, `requiresAccount: false`, empty loot) |
| `data/loot-tables.ts` | Added `none` loot table (0 coins, 0 XP, empty entries) for Main House |
| `components/device/AdventureScreen.tsx` | Added guest gating: guests see only `requiresAccount: false` locations; trying `requiresAccount: true` shows a gate message; added `isGuest` check |
| `lib/locations/adventure.test.ts` | Updated location count test (9→10); added 3 new tests: market requires account, guest locations exclude account-only, main house has 0 energy cost |
| `data/items.test.ts` | Updated loot table test to skip `none` table for entries/XpGain checks |

## Features Implemented

| Feature | Status | Details |
|---------|--------|---------|
| Location map | ✓ | 10 locations in `LOCATIONS` array + `LOCATION_MAP` lookup |
| Required locations | ✓ | Main House, Backyard, Park, Market, Training Dojo, Forest Trail, Lake Dock, Crystal Cave, Sky Garden, Ancient Ruins |
| Guest account gating | ✓ | Guests filtered to `requiresAccount: false` locations; gate message shown for account-only locations |
| Adventure action | ✓ | `runAdventure()` with stat checks, energy costs, success calculation |
| Energy cost | ✓ | Each location (except Main House) has energy cost deducted on adventure |
| Adventure result | ✓ | Returns success/failure, coins, items, XP, bond change, encounter text |
| Loot award | ✓ | `rollLoot()` with weighted random selection from location-specific loot tables |
| Inventory persistence | ✓ | IndexedDB v2 save with inventory, autosave, manual save after adventure |

## Tests Added

| Test | File | Status |
|------|------|--------|
| market requires account | `adventure.test.ts` | ✓ |
| guest locations exclude account-only | `adventure.test.ts` | ✓ |
| main house has zero energy cost | `adventure.test.ts` | ✓ |

Total adventure tests: 14 → **17**

## Commands Run

| Command | Result |
|---------|--------|
| `npx vitest run` | 6 files, 124 tests, all passed |
| `npx tsc --noEmit` | Clean (no output) |
| `npx next build` | Compiled successfully — 114 kB first-load JS |

## Results

### Before

- 9 locations (missing Main House)
- No guest gating — `requiresAccount: true` on Market silently ignored by UI
- 14 adventure tests

### After

- 10 locations including Main House
- Guest gating: guests see only guest-accessible locations; account-only locations show gate message
- 17 adventure tests (+3), 124 total tests (+3)
- Build: 26.3 kB page, 114 kB first-load JS

## P0/P1/P2/P3 Issues

### P0
None.

### P1
None.

### P2
- `user-scalable=no` in viewport prevents zoom (WCAG 1.4.4). Intentional for game UI.

### P3
- Account gating uses a simple `setTimeout`-based message that auto-clears after 4s. Could be enhanced with a modal when auth is later implemented.

## Remaining Work

- Account creation/auth system (when ready, wire into `requiresAccount` gating)
- Home customization — decorative item placement
- Market/shop — buy/sell items
- Item usage — feed specific food, equip hats, use medicine
- Crafting system — using materials to create items
