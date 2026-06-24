# 02 — Local RC Browser QA Runbook

Run this from a clean `dev` branch after Buddy V2 is merged.

## 1. Start Dev Server

pnpm:

```powershell
pnpm dev
```

npm:

```powershell
npm run dev
```

Open the local URL printed by the terminal, commonly `http://localhost:3000`.

## 2. Core Startup QA

- [ ] App loads with no console crash.
- [ ] Buddy route loads.
- [ ] Existing save loads.
- [ ] New guest save works.
- [ ] Hatch flow works.

## 3. Deterministic Generation QA

- [ ] Same guest/user ID gives same Buddy.
- [ ] Species remains stable.
- [ ] Rarity remains stable.
- [ ] Shiny status remains stable.
- [ ] Stats remain stable.
- [ ] Personality remains stable.

## 4. Gameplay QA

- [ ] Feed works.
- [ ] Play works.
- [ ] Wash works.
- [ ] Rest works.
- [ ] Talk works.
- [ ] Train works.
- [ ] Heal works.
- [ ] Adventures work.
- [ ] Loot awards correctly.
- [ ] Inventory persists.
- [ ] Skills progress.
- [ ] Lifecycle progression works.
- [ ] Home customization persists.

## 5. Extra Systems QA

- [ ] Breeding flow works.
- [ ] Marketplace flow works.
- [ ] Save slots work.
- [ ] Photo capture works.
- [ ] High scores persist.
- [ ] Sound engine can be toggled/muted.

## 6. PWA / Offline QA

Use DevTools Application tab.

- [ ] Manifest appears.
- [ ] Service worker registers.
- [ ] App can be installed.
- [ ] App shell reloads offline.
- [ ] Local save remains available offline.
- [ ] Offline-to-online resume works.
- [ ] Update prompt does not break gameplay.

## 7. Auth / Account QA

- [ ] Guest can hatch.
- [ ] Guest can play in Main House.
- [ ] Guest is blocked from gated areas.
- [ ] Account prompt appears.
- [ ] Guest Buddy is preserved after account migration.
- [ ] Account user can access advanced features.

## 8. Security / Economy Smoke QA

- [ ] Marketplace does not allow negative currency.
- [ ] Inventory cannot go below zero.
- [ ] Adventure rewards cannot duplicate from repeated clicks.
- [ ] Save import validates shape.
- [ ] Invalid save does not crash app.
- [ ] Breeding cannot create impossible state.
- [ ] High score submission validates values.

## 9. Record Results

Write results to:

```txt
docs/buddy/reports/qa/buddy-v2-rc-browser-qa-report.md
```
