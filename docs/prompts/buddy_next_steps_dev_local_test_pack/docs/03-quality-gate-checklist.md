# 03 — Quality Gate Checklist

Do not move to the next feature milestone until this passes.

## Required Commands

Record actual commands and outputs.

- [ ] install completed.
- [ ] lint passed or missing script documented.
- [ ] typecheck passed or missing script documented.
- [ ] tests passed or missing script documented.
- [ ] build passed.
- [ ] dev server starts.

## MVP Functional Gate

- [ ] App loads locally.
- [ ] Hatch flow works.
- [ ] Same ID generates same Buddy.
- [ ] Exactly 50 species exist.
- [ ] Five rarity tiers exist.
- [ ] Shiny field exists and is deterministic.
- [ ] Five stats exist.
- [ ] One peak stat exists.
- [ ] One dump stat exists.
- [ ] Feed works.
- [ ] Play works.
- [ ] Wash works.
- [ ] Rest works.
- [ ] Local save persists after refresh.
- [ ] Mobile layout is usable.

## PWA Gate, If Implemented

- [ ] Manifest exists.
- [ ] Service worker registration exists.
- [ ] Offline app shell works.
- [ ] Install prompt or installability baseline exists.

## P0 Blockers

Stop and fix immediately if any are true:

- [ ] app cannot build.
- [ ] app crashes on launch.
- [ ] hatch cannot complete.
- [ ] deterministic generation is broken.
- [ ] save corruption crashes app.
- [ ] copied third-party assets/code found.

## P1 Blockers

Fix before next feature milestone:

- [ ] missing generation tests.
- [ ] species count wrong.
- [ ] stat rules wrong.
- [ ] local save does not persist.
- [ ] mobile UI unusable.
- [ ] guest gating broken if implemented.
- [ ] PWA claimed but offline shell fails.
