# RC Final Validation Checklist

## Source Control

- [ ] Work committed.
- [ ] Work pushed or PR opened.
- [ ] `dev` contains final Buddy V2 implementation.
- [ ] Release branch created.
- [ ] RC tag created.

## Automated Gates

- [ ] Install passes.
- [ ] Lint passes with 0 warnings or accepted documented warnings.
- [ ] Typecheck passes.
- [ ] 178+ tests pass or updated test count documented.
- [ ] Build passes.
- [ ] Bundle/build size documented.

## Browser QA

- [ ] Core startup.
- [ ] Hatch.
- [ ] Deterministic generation.
- [ ] Care loop.
- [ ] Adventures.
- [ ] Inventory.
- [ ] Lifecycle.
- [ ] Home customization.
- [ ] Mini-games.
- [ ] Collections.
- [ ] Seasonal events.

## Extra Systems

- [ ] Breeding.
- [ ] Marketplace.
- [ ] Save slots.
- [ ] Photo capture.
- [ ] High scores.
- [ ] Sound engine.

## PWA / Offline

- [ ] Manifest.
- [ ] Service worker.
- [ ] Installability.
- [ ] Offline reload.
- [ ] Offline-to-online resume.
- [ ] Update prompt.

## Security / Data Integrity

- [ ] No P0 findings.
- [ ] No P1 findings.
- [ ] Save import validation.
- [ ] Inventory bounds checking.
- [ ] Marketplace abuse checks.
- [ ] Adventure reward duplication checks.
- [ ] Breeding impossible-state checks.
- [ ] Auth/ownership checks if backend is active.
