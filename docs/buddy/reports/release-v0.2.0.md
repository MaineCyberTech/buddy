# Release Report — Buddy v0.0.2.0.0

**Date:** 2026-06-23
**Branch:** `develop`
**Status:** Feature-complete for v0.2–v0.5

## Summary

Major feature expansion from v0.1.0: added Supabase cloud auth, 3 mini-games, seasonal events, species collection book, adventure lore journal, photo album, buddy trading, leaderboards, 8-bit sound effects, and mobile vibration. All offline-first, no external dependencies required for core gameplay.

## What's Included

### v0.1 Core (Recap)
- 50 species, 22 personalities, 7 care actions, 6 needs
- 10 adventures, 45 items, 15 achievements, 6 lifecycle stages
- Home customization (6 slots, 14 decor), local auth, IndexedDB persistence
- Hatch polish, idle messages, shiny sparkle, memory album, silent mode, care journal

### v0.2 Cloud & Social
- **Supabase Auth** — email/password signup/signin, guest migration, swappable provider
- **Cloud Save Sync** — Supabase-based with conflict resolution (local-first preserved)
- **Buddy Trading** — local offer/accept/decline UI, ready for server validation
- **Leaderboards** — bond level, total adventures, collection count (populate via cloud)
- **Friend Visits** — read-only home decor viewing (data structure ready)

### v0.3 Mini-Games & Events
- **Memory Match** — 4/6/8 pair grid, move/time scoring
- **Reaction Test** — 5 rounds, random delay, early-tap penalty
- **Rhythm Tap** — 6/10/16 note patterns, accuracy scoring
- **Daily Login** — 7-day streak, rotating coin/item rewards
- **Seasonal Events** — 4 hardcoded seasons with exclusive items

### v0.4 Collections & Journal
- **Species Book** — 50 entries, rarity filters, seen/hatched/shiny tracking
- **Lore Journal** — 10 locations, visit counter, personal notes
- **Photo Album** — 50 snapshots max, buddy details + location + date

### v0.5 Sound & Animation
- **15 8-bit sound effects** via Web Audio API (zero assets)
- **Vibration** on care actions (30ms)
- **Shiny sparkle** animation on LCD
- **Idle pulse** animation on personality messages

## Build Verification

```bash
npm test           # 163 passing (9 test files)
npx tsc --noEmit   # clean
npx next build     # 127 kB first-load JS
npx next lint      # warnings only (React hooks)
```

## Not Included (Future)
- Server-authoritative trading/leaderboards (needs Supabase project)
- Mini-game high score persistence to cloud
- Photo capture button (snapshot feature)
- Animated sprite transitions beyond CSS
- Breeding, marketplace, AR mode

## Known Issues
- ESLint warnings on two mini-game `useCallback` deps (non-blocking)
- Supabase auth requires env vars to function
- Leaderboards empty until cloud sync active

## Tech Debt
- MainDevice.tsx is large (400+ lines) — could split into tab components
- Minigame components could share more base logic
- Some types duplicated across lib modules
