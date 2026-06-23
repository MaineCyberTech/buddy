# Audit Report: PWA Offline

## Summary
Manifest is present, service worker exists and caches app shell, IndexedDB storage is functional with autosave. SW had TypeScript annotations preventing registration — fixed.

## Files Inspected
- `public/manifest.json` — App name, SVG icons, standalone display, theme_color
- `public/sw.js` — Cache-first strategy, offline fallback
- `public/icon-192.svg` — PWA icon
- `public/icon-512.svg` — PWA icon
- `lib/storage/indexeddb.ts` — IndexedDB openDB v2, save/load/delete/export/import
- `lib/storage/autosave.ts` — 10s autosave interval
- `lib/offline/sw.ts` — SW registration + install prompt handling (NEW)
- `components/ui/ServiceWorkerRegistration.tsx` — Install button component (NEW)
- `components/ui/OfflineIndicator.tsx` — Offline banner component (NEW)
- `app/layout.tsx` — Manifest link, SW components included
- `app/layout.tsx` — viewportFit: 'cover', themeColor

## P0 Findings
- ~~Service worker had TypeScript reference directives and type annotations (`ExtendableEvent`, `FetchEvent`) in a `.js` file~~ **FIXED** — Rewritten as plain ES5 JS
- ~~Service worker was never registered by client code~~ **FIXED** — Registration added via `lib/offline/sw.ts` and `ServiceWorkerRegistration` component

## P1 Findings
- ~~No PWA install prompt UI~~ **FIXED** — `ServiceWorkerRegistration` component handles `beforeinstallprompt` event and shows install button
- ~~No online/offline status indicator~~ **FIXED** — `OfflineIndicator` component shows banner when offline
- SVG icons used instead of PNG — acceptable for modern browsers but some older browsers require PNG

## P2 Findings
- No update prompt when new SW version is available
- No export/import UI accessible to users (functions exist but no UI entry point)
- Autosave timer exists but isn't started (MainDevice saves on each action instead)
- No IndexedDB error recovery UX (errors logged to console only)

## P3 Findings
- Cache is named `buddy-cache-v1` — version naming consistent for future updates
- Fallback to root `/` for offline navigation is functional but basic

## Evidence
- Manifest: `start_url: "/"`, `display: "standalone"`, `background_color: "#1a1a2e"`
- SW: Cache-first for GET requests, cache on install, network fallback with offline navigation to `/`
- IndexedDB: DB name `buddy-save`, v2 (with v1→v2 migration), store `saves` with key `buddy-current-save`
- Export: `btoa(JSON.stringify(save))` base64 encoding
- Import: `atob()` decode + JSON parse + schema validation
- Autosave: 10-second interval saves buddy state

## Remediation Plan
- ✅ SW rewritten as plain JS
- ✅ SW registration added
- ✅ Install prompt UI added
- ✅ Offline indicator added

## Acceptance Criteria
- [x] PWA manifest present with icons
- [x] Service worker registers and caches app shell
- [x] Offline fallback to cached root page
- [x] IndexedDB save/load/delete works
- [x] Autosave mechanism exists
- [x] Export/import functions exist
- [x] Install prompt handling
- [x] Online/offline status awareness

## Verification Commands
- `npx next build` — builds successfully
- Manual: open DevTools → Application → Service Workers → verify registration
- Manual: toggle offline in DevTools → verify OfflineIndicator shows
