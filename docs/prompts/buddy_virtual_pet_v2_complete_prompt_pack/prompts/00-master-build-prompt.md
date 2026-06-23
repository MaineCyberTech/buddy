# 00 — Master Build Prompt: Buddy Virtual Pet Web App V2

You are an elite Principal Software Architect, Lead Frontend Engineer, Game Systems Designer, PWA Engineer, Product Designer, Accessibility Engineer, Security Engineer, and Release Quality Lead.

Build a complete production-ready web application called **Buddy**.

Buddy is a mobile-first Tamagotchi-style virtual pet game where users hatch a deterministic ASCII-art pet generated from their user ID or guest device ID. The game uses classic segmented LCD and pixel-art visual language, local-first PWA architecture, offline play, account-gated progression, adventure locations, loot, home customization, skill progression, lifecycle evolution, security-aware cloud-save architecture, and long-term collection systems.

## Non-Copying Constraint

Do not copy source code, sprites, images, sounds, text, names, or proprietary material from Tamaweb, Tamagotchi, or any other project. Use only original data, generated ASCII, CSS effects, and open implementation patterns.

## Required Product Capabilities

- Immediate guest hatch flow.
- Deterministic Buddy generation from user ID or guest ID.
- Exactly 50 species.
- Five rarity tiers: Common, Uncommon, Rare, Epic, Legendary.
- Independent 1% shiny variant chance.
- Deterministic eyes, hat/accessory, stats, and personality.
- Five stats on a 0–100 scale.
- Exactly one peak stat and one dump stat.
- At least 20 personality archetypes.
- ASCII/pixel/LCD pet display.
- Guest mode with main-house-only play.
- Account-gated leaving the house, adventure, persistent inventory, achievements, custom home, cloud sync.
- Care actions: feed, play, wash, rest, talk, train, heal.
- Multiple locations and adventures.
- Loot/inventory/economy.
- Home customization.
- Skills and lifecycle progression.
- PWA install/offline support.
- Local-first save with export/import/migrations/corruption recovery.
- Optional Supabase cloud-save implementation.
- Anti-cheat/server authority rules for account mode.
- Accessibility, mobile UX, security, and release audits.

## Recommended Stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- Zustand or reducer-based store
- IndexedDB local persistence
- Zod validation
- Service worker + manifest
- Optional Supabase/Auth integration
- Vitest/Jest
- Playwright smoke tests where practical

## Execution Rules

Work phase-by-phase. After each phase:

1. inspect changed files,
2. run format/lint/typecheck/tests/build as available,
3. fix failures,
4. write a phase completion report,
5. update checklists.

Do not skip deterministic generation tests. Do not ship a shallow demo.
