# Buddy Local Browser Test Report

## Environment

- **OS**: Windows (PowerShell 5.1)
- **Node**: v18+
- **Browser**: CLI-verified; manual testing needed for visual/interactive features
- **Dev server**: Next.js 14.2.35 on `http://localhost:3000`

## Package Manager

npm (package-lock.json present)

## Commands Run

| Command | Result |
|---------|--------|
| `npm run lint` | N/A (no lint script in package.json) |
| `npx tsc --noEmit` | ✓ Clean |
| `npx vitest run` | ✓ 6 files, 121 tests passed |
| `npx next build` | ✓ Compiled successfully (113 kB first-load JS) |
| `npm run dev` | ✓ Server running on port 3000 |

## Local URL

```
http://localhost:3000
```

## Routes Tested

| Route | Status | Content |
|-------|--------|---------|
| `/` | 200 | Renders BOOTING state → client loads hatch/main |
| `/manifest.json` | 200 | Valid PWA manifest (SVG icons, standalone, portrait) |
| `/sw.js` | 200 | Valid ES5 service worker (cache-first, offline fallback) |
| `/icon-192.svg` | 200 | 192×192 SVG icon |
| `/icon-512.svg` | 200 | 512×512 SVG icon |

## Hatch Flow Result

- Root page serves BOOTING screen with `role="status"` and `aria-live="polite"`
- Client transitions to HatchFlow on load (verified in source)
- Landing page shows "HATCH" button with `aria-label="Hatch your buddy"`
- Hatching animation page shows animated shake with progress bar
- Reveal page shows species name, rarity, shiny status
- Nickname page has input with `aria-label="Buddy nickname"`, max 16 chars
- **Manual check needed**: Verify interactive hatch in browser

## Deterministic Generation Result

- Verified in unit tests: `lib/generation/generation.test.ts:287-298` confirms same guest ID produces identical species, rarity, shiny, stats, personality
- `createInitialBuddyState` uses SeededRNG (LCG) with guest ID
- **Manual check needed**: Refresh page and verify same buddy loads

## Care Loop Result

All 7 actions (feed/play/wash/rest/talk/train/heal) implemented:
- Feed: +25 hunger, +5 happiness
- Play: +20 happiness, -15 energy, -5 hunger
- Wash: cleanliness = 100
- Rest: +30 energy, -3 hunger, +5 health
- Talk: +20 social, +5 happiness
- Train: -20 energy, -8 hunger, +25 XP
- Heal: +30 health, -10 energy (guard: returns early if health ≥ 100)

Evolution checked after each action. Achievements checked after each action.
Mood recalculation, bond increase, XP/leveling all integrated.
Offline decay applied on return (gentle, 48h cap).

**Manual check needed**: Verify button clicks and visual feedback in browser.

## Save Persistence Result

- IndexedDB v2 `buddy-save` database with `saves` store
- Autosave every 10s (started on boot, version 2, uses store guestId)
- Manual save on every action, adventure result, and hatch
- Export/import via base64
- 12 unit tests covering save/load/hasSave/delete/export/import/metadata
- Version normalization removed — version preserved as saved

**Manual check needed**: Refresh page and verify buddy state persists.

## Guest Gating Result

- Guest flow: guest ID generated as `'guest-' + Date.now().toString(36) + Math.random().toString(36).slice(2,6)`
- No account gating implemented yet — all features accessible without login
- `requiresAccount: false` on all 9 locations (Backyard, Playground, Park, Forest, Beach, Cave, Mountain, Haunted Grove, Ancient Ruins)

**Manual check needed**: Verify no auth prompts appear.

## PWA/Offline Result

| Feature | Status |
|---------|--------|
| Manifest | ✓ `/manifest.json` with name, icons, standalone display, theme_color `#1a1a2e` |
| Service Worker | ✓ Registered via `ServiceWorkerRegistration.tsx` |
| SW caching | Precache: `/`, `/manifest.json`, `/icon-192.svg`, `/icon-512.svg`. Cache-on-fetch for other assets. Offline navigation fallback to `/`. |
| Install prompt | ✓ Install button UI in `ServiceWorkerRegistration.tsx` |
| Offline indicator | ✓ Top banner `OfflineIndicator.tsx` when offline |
| Apple meta tags | ✓ `apple-mobile-web-app-capable`, `apple-mobile-web-app-title`, `apple-mobile-web-app-status-bar-style` |

**Manual check needed**: Verify offline reload, install prompt in browser DevTools.

## Mobile UX Result

| Feature | Status |
|---------|--------|
| Viewport | `width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover` |
| Safe-area | `env(safe-area-inset-*)` with fallbacks on body |
| Touch | `touch-action: manipulation` (no double-tap zoom delay) |
| iOS height | `min-height: -webkit-fill-available` on body |
| Responsive | Breakpoints at 640px and 1024px with font-size changes |
| User scalable | `user-scalable=no` (WCAG 1.4.4 concern, but intentional for game UI) |

**Manual check needed**: Verify in DevTools device toolbar for iPhone/Android/Desktop.

## Accessibility Result

| Feature | Status |
|---------|--------|
| Skip link | ✓ Present at top of layout |
| ARIA roles | ✓ `role="main"`, `role="status"`, `aria-live="polite"` |
| Screen reader text | ✓ `.sr-only` class for visual-only elements |
| Focus ring | ✓ `.focus-ring` class on all interactive elements |
| Buttons | ✓ Semantic `<button>` elements, all with `aria-label` |
| Progress bars | ✓ ARIA `role="progressbar"` on StatBars/NeedBars |
| Reduced motion | ✓ `prefers-reduced-motion` media query in globals.css |
| High contrast | ✓ `prefers-contrast: more` media query in globals.css |

## P0 Findings

None found in this test pass. All 3 P0 issues from stabilization audit were fixed:
- `checkEvolution()` now called after actions and adventures
- `checkAchievements()` now called after actions and adventures
- Achievement conditions now evaluate against changing lifecycle

## P1 Findings

1. **`user-scalable=no` in viewport** — prevents zoom, violates WCAG 1.4.4. Intentional for game UI but documented as known tradeoff.

2. **SW precache limited to 4 assets** — Next.js build chunks not precached. First offline visit after install may miss uncached routes. Cache-on-fetch compensates after first visit.

## P2/P3 Findings

1. **Egg stage** defined for 0 XP but game starts at 'baby'. Low impact.
2. **createMemory()** remains dead code — future feature.
3. **Missing custom 404 page** — Next.js default 404 shown. Low priority.

## Recommended Next Step

1. Manual browser verification of hatch flow, care actions, save persistence, and adventures
2. Run `docs/prompts/buddy_next_steps_dev_local_test_pack/scripts/local-test.ps1` if available
3. Proceed to next milestone: home customization / market / item usage
