# Release Report — Buddy v0.1.0

**Date:** 2026-06-23
**Branch:** `develop` (98e274f)
**Status:** Ready for QA

## Summary

First playable vertical slice of Buddy — a retro ASCII virtual pet PWA. All core mechanics are implemented and tested: hatch, generation, care, adventures, items, lifecycle, achievements, home customization, auth abstraction, and persistence.

## What's Included

### Core Gameplay
- 50 species with unique ASCII sprites, 5 rarity tiers, shiny variants
- 22 personality archetypes with idle messages and stat modifiers
- 7 care actions (feed, play, wash, rest, talk, train, heal)
- 6 need stats (hunger, happiness, cleanliness, energy, social, discipline)
- 5 base stats (strength, agility, intelligence, social, vitality)
- Bond level (0–10), mood tracking, XP/leveling
- Offline decay (48h cap) when buddy is neglected

### Content
- 10 adventure locations with loot tables
- 45 items across 9 categories
- 15 achievements with rewards
- 14 home decor items for 6 placement slots
- 6 lifecycle stages (Egg → Elder)

### Tech
- Next.js 14 App Router, TypeScript strict
- Zustand state management
- IndexedDB v2 persistence with autosave (10s)
- PWA: manifest, cache-first SW, offline indicator, install prompt
- Local auth (guest/account), cloud save mock
- 163 passing tests (9 test files), typecheck clean
- 120 kB first-load JS, static generation

### Polish (Phase 10)
- Hatch reveal shows personality name, description, peak/dump stats
- First hatch memory recorded in memory album
- Personality idle messages cycle on main device
- Shiny sparkle animation on LCD display
- Memory album viewer accessible from profile
- Silent mode toggle in settings (suppresses popup messages)
- Care journal shows last 10 actions with timestamps

## Not Included (v0.2+)
- Cloud sync / Supabase auth
- Sound effects and animations
- Mini-games
- Seasonal events
- Buddy trading

## Build Verification

```bash
npm test           # 163 passing
npx tsc --noEmit   # clean
npx next build     # 120 kB first-load JS
npx next lint      # clean
```

## Known Issues

- None at P0/P1. See `docs/buddy/reports/audits/` for full audit trail.
