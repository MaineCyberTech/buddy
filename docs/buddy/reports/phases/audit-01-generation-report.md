# Audit Report: Generation

## Summary
Generation system is fully deterministic, species data is complete, rarity/shiny logic is correct, and stats/personality engines produce valid output. All 63 tests pass.

## Files Inspected
- `data/species.ts` — 50 species, all required fields present
- `data/personalities.ts` — 22 archetypes (≥20 requirement)
- `data/eyes.ts` — 20 eye options
- `data/hats.ts` — 20 hat options
- `lib/generation/types.ts` — RARITY_WEIGHTS sum=100, SHINY_CHANCE=0.01
- `lib/generation/hash.ts` — Deterministic hash utilities
- `lib/generation/rng.ts` — Seeded PRNG with weighted pick, shuffle, bool
- `lib/generation/engine.ts` — Full generation pipeline
- `lib/stats/engine.ts` — Peak (75-100) + dump (0-30) stat generation
- `lib/personality/engine.ts` — Bias-weighted personality selection
- `lib/generation/generation.test.ts` — 38 tests

## P0 Findings
- None

## P1 Findings
- None

## P2 Findings
- None

## P3 Findings
- ASCII sprites could be more elaborate with additional rows (enhancement)

## Evidence
- `RARITY_WEIGHTS`: common=55, uncommon=25, rare=13, epic=6, legendary=1 → sum=100
- `SHINY_CHANCE`: 0.01 (tested empirically at ~1% rate over 10k trials)
- Species count: exactly 50, verified by `SPECIES.length` test
- Persona count: 22 ≥ 20 requirement
- Species IDs: all unique, lowercase alphanumeric
- Stat ranges: peak 75-100, dump 0-30, normal 35-75 per `STAT_RANGES`
- Determinism: same userId → same species, stats, personality, eyes, hat (tested)

## Remediation Plan
None required for generation.

## Acceptance Criteria
- [x] 50 species with unique IDs
- [x] 5 rarity tiers with correct weights
- [x] 1% independent shiny chance
- [x] Peak and dump stat enforcement
- [x] ≥20 personality archetypes
- [x] Deterministic output from same seed
- [x] Species have ASCII base sprites

## Verification Commands
`npx vitest run` — 63/63 tests pass
