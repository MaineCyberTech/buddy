# Phase 13 — Collections & Journal (v0.4)

## Objective
Add species collection book, adventure lore journal, and photo album.

## Changes

### Species Collection Book
- **`lib/collections/species-book.ts`**: 
  - `SpeciesEntry`: speciesId, seen, hatched, shinySeen, count
  - `initSpeciesBook()`: creates entries for all 50 species
  - `recordSpeciesSeen()`: updates entry on hatch/encounter
  - `getSpeciesCompletion()`: stats (seen/hatched/shiny/percent)
  - `getSpeciesByRarity()`: grouped by rarity tier
- **`components/collections/SpeciesBook.tsx`**:
  - Filter tabs: All / Common / Uncommon / Rare / Epic / Legendary
  - Shows sprite, name, rarity, shiny badge, hatch count
  - Greyed out for unseen species

### Adventure Lore Journal
- **`lib/collections/lore-journal.ts`**:
  - `LoreEntry`: locationId, visits, discovered, notes
  - `initLoreJournal()`: entries for all 10 locations
  - `recordLocationVisit()`: increments visits, marks discovered
  - `updateLoreNote()`: player notes per location
  - `getDiscoveredCount()`: progress tracker
- **`components/collections/LoreJournal.tsx`**:
  - Grid of all locations with icons
  - Undiscovered shown as "???"
  - Visited shows description + visit count + account requirement badge

### Photo Album
- **`lib/collections/photo-album.ts`**:
  - `PhotoEntry`: id, timestamp, speciesName, nickname, stage, rarity, shiny, hat, location
  - `initPhotoAlbum()`: empty array
  - `addPhoto()`: prepends, caps at 50
- **`components/collections/PhotoAlbumView.tsx`**:
  - Reverse chronological list
  - Shows buddy sprite, nickname, species, stage, rarity, shiny badge, location, date
  - Delete button per entry

### Shared
- **`lib/collections/index.ts`**: exports all types + functions
- Integrated into `useGameStore` as `speciesBook`, `loreJournal`, `photoAlbum`
- MainDevice profile tab buttons: Species Book, Lore Journal, Photo Album
- Species auto-recorded on hatch via `recordSpeciesSeen()`
- Location visits auto-recorded in `AdventureScreen` (via store hook)
- Photo capture: future feature (snapshot button)

## Files Changed
| File | Change |
|------|--------|
| `lib/collections/species-book.ts` | NEW — collection logic |
| `lib/collections/lore-journal.ts` | NEW — journal logic |
| `lib/collections/photo-album.ts` | NEW — album logic |
| `lib/collections/index.ts` | NEW — exports |
| `components/collections/SpeciesBook.tsx` | NEW — UI |
| `components/collections/LoreJournal.tsx` | NEW — UI |
| `components/collections/PhotoAlbumView.tsx` | NEW — UI |
| `lib/buddy/store.ts` | Added speciesBook, loreJournal, photoAlbum state + setters |
| `components/device/MainDevice.tsx` | Wire new tabs + profile buttons |

## Quality Gate
```bash
npm test           # 163 passing
npx tsc --noEmit   # clean
npx next build     # 127 kB first-load JS
```

## Notes
- All collections persist in IndexedDB via existing save system
- Species completion percentage shown in book header
- Lore journal respects `requiresAccount` flag on locations
- Photo album capped at 50 entries (oldest auto-removed)
