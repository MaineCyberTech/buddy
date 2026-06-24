# Phase 07 Completion Report — Home Customization

## Summary
Implemented home customization: decor slot system with 6 slots (4 free, 2 account-gated), 14 decor items across all slots, slot-based placement from inventory with preview, and IndexedDB persistence.

## Files Created
- `components/device/HomeScreen.tsx` — Home customization UI (slot grid, decor picker, preview, apply/remove)
- `data/home.test.ts` — 9 tests for slots, decor items, loot table references

## Files Modified
- `lib/generation/types.ts` — Added `HomeSlot`, `DecorPlacement`, `HOME_SLOTS`, `DEFAULT_PLACED_DECOR`, `placementSlot` on `ItemDefinition`, `placedDecor` on `GameSave`
- `data/items.ts` — Expanded decor items from 3 to 14 with `placementSlot` assignments
- `lib/buddy/store.ts` — Added `placedDecor` state, `placeDecor()`, `setPlacedDecor()` actions
- `lib/buddy/screens.ts` — Added `'home'` to `GameScreen` union
- `components/device/MainDevice.tsx` — Added HOME tab button + HomeScreen render; save `placedDecor` on actions
- `app/page.tsx` — Load `placedDecor` from save on boot; pass to autosave
- `lib/storage/autosave.ts` — Accept `getPlacedDecor` callback for autosave
- `data/items.test.ts` — Added decor items count test

## Features Implemented
- **6 decor slots**: Floor Left, Floor Right, Table, Shelf (free) + Window, Wall (account-gated, locked)
- **14 decor items**: cozy_bed, flower_rug, cozy_armchair, lava_lamp, flower_vase, tea_set, stack_of_books, crystal_ball, music_box, hanging_plant, star_mobile, framed_photo, wall_clock, fancy_chandelier
- **Slot-based placement**: Click PLACE on any unlocked slot, browse inventory decor items, preview with icon/description/rarity, confirm to apply
- **Remove/Replace**: Remove decor returns item to inventory; CHANGE opens picker for new item
- **Account gating**: Locked slots show 🔒 with "Account only" label; guest get info message about local-only save
- **Persistence**: placedDecor saved to IndexedDB via autosave + action saves; restored on boot

## Tests Added
- `data/home.test.ts` — 9 tests: slot count, locked slot count, unique IDs, default state, decor item count, placement slot validity, sell values, loot table references
- `data/items.test.ts` — 1 test: decor items >= 10

## Commands Run
- `npx tsc --noEmit` — ✓ clean
- `npx vitest run` — ✓ 135 passed (7 files, +10 tests)
- `npx next build` — ✓ 116 kB first-load JS

## Results
| Check | Status |
|-------|--------|
| Typecheck | ✓ |
| Tests (135) | ✓ 7 files |
| Build (116 kB) | ✓ |

## P0/P1/P2/P3 Issues
- None introduced

## Remaining Work
- Shop/market to buy decor items (currently only found through loot tables)
- Home preview with ASCII decor overlay on Main House background
- Guest→account migration of placed decor
- Seasonal decor items
- Decor catalog collection tracking
- Mood modifier preview per decor item
