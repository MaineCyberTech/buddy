# Buddy

A retro ASCII virtual pet that lives in your browser. Hatch, care for, and adventure with a uniquely generated buddy — no accounts required.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and tap "Hatch a Buddy".

## Features

- **50 species** with ASCII sprites, 5 rarity tiers + shiny variants
- **Deterministic generation** — same guest ID = same buddy every time
- **22 personality archetypes** with idle messages and care modifiers
- **7 care actions** that affect 6 need stats + mood + bond + XP
- **Adventures** across 10 locations with loot and rewards
- **45 items** across 9 categories, coin economy, inventory
- **Lifecycle** — Egg → Baby → Child → Teen → Adult → Elder
- **15 achievements** with coin/item rewards
- **Home customization** — 6 decor slots, 14 decor items
- **Local auth** — guest or account mode (cloud save coming)
- **Offline-first PWA** — works without internet, installable

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npx vitest run` | Run all tests |
| `npx tsc --noEmit` | Type check |
| `npx next lint` | Lint check |

## Tech Stack

Next.js 14 App Router, TypeScript, Tailwind CSS, Zustand, IndexedDB, Vitest

## Project Structure

```
app/              — Next.js pages, layout, globals.css
components/       — React components (device, hatch, ui)
data/             — Species, items, locations, achievements
lib/              — Core logic (generation, care, auth, storage, progression)
public/           — PWA assets (manifest, SW, icons)
docs/             — Reports, audits, runbooks
```

## License

MIT
