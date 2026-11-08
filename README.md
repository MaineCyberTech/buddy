# buddy

`buddy` is a mobile-first, **offline-capable virtual pet PWA**. You hatch a
deterministic Buddy from a seed, care for it, take it on location adventures,
collect loot, and watch it evolve through six lifecycle stages.

The game is currently a **guest-only, local-first release candidate**
(`v0.1.0-rc1`). There is no server, account, or remote data: all state lives in
the browser (IndexedDB) and the app works offline through a service worker.

## Status

- **Release:** `0.1.0` release candidate - guest/local scope.
- **Audit:** the latest full `repo-deep-dive` pass is
  `buddy-20261108-verify-master-9e3b015` (master `9e3b015`), with 4 P1 / 11 P2 /
  18 P3 findings. The 20261108 remediation pass addresses the CI/security set;
  the reconciled status and accepted/deferred-risk record are in
  [docs/README.md](docs/README.md).
- **Progression:** achievements, lifecycle evolution, and skills are wired into
  the care and adventure flows (`lib/actions/care.ts`,
  `lib/locations/adventure.ts`). Remaining open audit items are not
  progression-completeness gaps; see the documentation index for the current
  list.

## Stack

| Area | Choice |
|---|---|
| Framework | Next.js 15 (App Router; `next` pinned to the `^15.5.28` patch line) |
| UI | React 18, Tailwind CSS |
| State | Zustand |
| Persistence | IndexedDB via `idb`; service worker + web manifest for offline/PWA |
| Validation | Zod (runtime save validation) |
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
| `npm run test:coverage` | Run tests with the coverage thresholds |
| `npm run test:watch` | Vitest watch mode |
| `npm run audit:gate` | Block HIGH/CRITICAL production advisories except dated exceptions |
| `npm run license:check` | Enforce the production dependency license allowlist |
| `npm run secret:scan` | Run the pinned gitleaks scan locally |
| `npm run format` | Prettier write |
| `npm run format:check` | Prettier check |

Before opening a PR, run the quality gate (the CI workflow is the source of
truth for the enforced checks):

```sh
npm ci
npm run lint
npm run typecheck
npm run test
npm run test:coverage
npm run build
npm run audit:gate
npm run license:check
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

The suite covers the care loop, the adventure/loot engine, deterministic
generation, lifecycle progression, and the item catalogue. It also includes
component tests under `app/` and `components/` (`app/page.test.tsx`,
`app/error.test.tsx`, `components/**/*.test.tsx`) and persistence tests under
`lib/storage/` (`indexeddb.test.ts`, `schema.test.ts`). `npm run test:coverage`
enforces the line/statement/branch/function thresholds over `lib/` and `data/`;
`app/` and `components/` are exercised but remain outside the measured coverage
scope. E2E and accessibility automation are still tracked gaps (see the audit
register in [docs/README.md](docs/README.md)).

## Documentation

- [docs/README.md](docs/README.md) - documentation index, product vs.
  prompt-pack classification, and the reconciled audit status matrix.
- [CHANGELOG.md](CHANGELOG.md) - release history.
- [`docs/buddy/reports/phases/`](docs/buddy/reports/phases/) - phase completion
  reports.

## License

`buddy` is proprietary and all rights are reserved; no open-source license has
been granted. See the repository `LICENSE` and `NOTICE` and the licensing note
in [docs/README.md](docs/README.md).
