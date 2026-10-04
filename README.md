# buddy

`buddy` is a mobile-first, **offline-capable virtual pet PWA**. You hatch a
deterministic Buddy from a seed, care for it, take it on location adventures,
collect loot, and watch it evolve through six lifecycle stages.

The game is currently a **guest-only, local-first release candidate**
(`v0.1.0-rc1`). There is no server, account, or remote data: all state lives in
the browser (IndexedDB) and the app works offline through a service worker.

## Status

- **Release:** `0.1.0` release candidate - guest/local scope.
- **Audit:** a `repo-deep-dive` audit of this release (run
  `20261003-0018-master-99abf29`, commit `99abf29`) found **0 P0** and **11 P1**
  findings and returned **GO WITH CONDITIONS**. The reconciled status and the
  accepted/deferred-risk record are in
  [docs/README.md](docs/README.md).
- **Known gaps:** achievements, lifecycle evolution, and skills are implemented
  but not yet wired into the game loop; automated CI and release automation are
  tracked separately. Do not treat the current build as progression-complete.

## Stack

| Area | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18, Tailwind CSS |
| State | Zustand |
| Persistence | IndexedDB via `idb`; service worker + web manifest for offline/PWA |
| Validation | Zod (types) |
| Language | TypeScript (`strict`) |
| Tests | Vitest (with Testing Library + jsdom) |

## Quick start

Requirements: Node.js 20 LTS or newer, and npm.

```sh
npm ci
npm run dev
```

Then open <http://localhost:3000>.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (`next lint`) |
| `npm run typecheck` | Type check (`tsc --noEmit`) |
| `npm run test` | Run the Vitest suite once |
| `npm run test:watch` | Vitest watch mode |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check |

Before opening a PR, run the quality gate:

```sh
npm ci && npm run lint && npm run typecheck && npm run test
```

## Project layout

```
app/                 Next.js App Router entry (layout, page, global styles)
components/          React UI (device, hatch, ui)
data/                Content catalogues (species, items, locations, loot, achievements)
lib/
  actions/           Care-loop actions
  buddy/             Store and screen definitions
  generation/        Deterministic seed/hash/engine
  locations/         Adventure engine
  personality/       Personality engine
  progression/       Lifecycle / skills / bond
  stats/             Stat engine
  storage/           IndexedDB persistence + autosave
  offline/           Service worker
public/              PWA manifest, service worker, icons
docs/                Project documentation and reports
```

## Architecture

- **Deterministic generation.** A seed is hashed and expanded through
  `lib/generation/hash.ts`, `lib/generation/rng.ts`, and
  `lib/generation/engine.ts`, so the same seed always yields the same Buddy.
- **Offline-first persistence.** Game saves are stored in IndexedDB
  (`lib/storage/indexeddb.ts`) and migrated + runtime-validated on load and
  import (`validateSave` in `lib/storage/schema.ts`); the PWA shell is cached by
  the service worker (`public/sw.js`, `lib/offline/sw.ts`).
- **State.** Gameplay state lives in a Zustand store (`lib/buddy/store.ts`);
  actions in `lib/actions/` apply the care loop, and `lib/locations/adventure.ts`
  applies adventure outcomes.

## Testing

```sh
npm run test
```

The unit suite covers the care loop, the adventure/loot engine, deterministic
generation, lifecycle progression, and the item catalogue (see the `*.test.ts`
files). Component/E2E coverage and persistence-layer tests are tracked gaps (see
the audit register in [docs/README.md](docs/README.md)).

## Documentation

- [docs/README.md](docs/README.md) - documentation index, product vs.
  prompt-pack classification, and the reconciled audit status matrix.
- [CHANGELOG.md](CHANGELOG.md) - release history.
- [`docs/buddy/reports/phases/`](docs/buddy/reports/phases/) - phase completion
  reports.

## License

No license has been chosen yet. Absent an explicit license grant, all rights are
reserved by default (see the repository `LICENSE` and `NOTICE`, tracked
separately, and the licensing note in [docs/README.md](docs/README.md)).
