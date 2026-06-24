# 02 — Local Browser Test Runbook

Use this to run Buddy locally and test the app in a browser.

## 1. Install Dependencies

Use the repo's package manager.

### pnpm

```bash
pnpm install
```

### npm

```bash
npm install
```

### yarn

```bash
yarn install
```

## 2. Run Quality Checks First

### pnpm

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

### npm

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

### yarn

```bash
yarn lint
yarn typecheck
yarn test
yarn build
```

If any script does not exist, document it in:

```txt
docs/buddy/reports/phases/local-test-report.md
```

Do not invent success for a missing script.

## 3. Start Local Dev Server

### pnpm

```bash
pnpm dev
```

### npm

```bash
npm run dev
```

### yarn

```bash
yarn dev
```

If the app is inside a monorepo app package, run from the correct workspace or use the repo's workspace command.

Examples:

```bash
pnpm --filter web dev
pnpm --filter @repo/web dev
npm run dev --workspace=apps/web
```

## 4. Open In Browser

Open the local URL printed by the dev server, commonly:

```txt
http://localhost:3000
```

If the dev server prints a different port, use that port.

## 5. Manual Browser Smoke Test

### First Launch / Hatch

- [ ] App loads without console crash.
- [ ] Buddy route loads.
- [ ] User can start as guest.
- [ ] Guest ID is created locally.
- [ ] User can hatch Buddy.
- [ ] Buddy has species.
- [ ] Buddy has rarity.
- [ ] Buddy has shiny status.
- [ ] Buddy has eyes.
- [ ] Buddy has hat/accessory.
- [ ] Buddy has stats.
- [ ] Buddy has personality.
- [ ] ASCII/LCD display renders.

### Deterministic Identity

- [ ] Refresh page.
- [ ] Same Buddy loads.
- [ ] Same species remains.
- [ ] Same rarity remains.
- [ ] Same stats remain.
- [ ] Same personality remains.

### Care Loop

- [ ] Feed changes hunger/satiety.
- [ ] Play changes fun and energy.
- [ ] Wash changes hygiene.
- [ ] Rest changes energy.
- [ ] Action result text displays.
- [ ] State persists after refresh.

### Guest Gating

- [ ] Guest can remain in Main House.
- [ ] Guest trying to leave Main House sees account prompt.
- [ ] Existing Buddy is not reset by account prompt.

### Local Save

- [ ] Perform care action.
- [ ] Refresh browser.
- [ ] State persists.
- [ ] Close/reopen browser.
- [ ] State persists.

## 6. DevTools PWA Check

In Chrome or Edge DevTools:

```txt
Application → Manifest
Application → Service Workers
Application → Storage / IndexedDB / Local Storage
Network → Offline mode
```

Check:

- [ ] manifest exists if PWA was implemented.
- [ ] service worker registers if PWA was implemented.
- [ ] local save exists.
- [ ] offline reload works if offline support was implemented.

## 7. Mobile Responsive Check

Use DevTools device toolbar:

- [ ] iPhone-sized viewport.
- [ ] Android-sized viewport.
- [ ] Desktop viewport.
- [ ] Portrait works.
- [ ] Landscape does not break completely.
- [ ] No major horizontal overflow.
- [ ] Buttons are large enough to tap.
- [ ] ASCII sprite is readable.

## 8. Accessibility Quick Check

- [ ] Tab navigation works.
- [ ] Focus ring is visible.
- [ ] Buttons are semantic.
- [ ] Icon-only buttons have labels.
- [ ] Meters have labels.
- [ ] No color-only status indicators.
- [ ] Reduced motion is respected if animations exist.

## 9. Record Results

Write the test result to:

```txt
docs/buddy/reports/phases/local-browser-test-report.md
```
