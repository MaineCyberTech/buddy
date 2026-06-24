# Prompt — Buddy MVP Stabilization Agent

You are operating inside this repository with full filesystem access.

The Buddy V2 implementation has already been run. Your job is not to add new features yet. Your job is to stabilize, test, and verify the local MVP.

## Required Inputs

Use these files if present:

```txt
docs/prompts/buddy_virtual_pet_v2_complete_prompt_pack/
docs/prompts/buddy_next_steps_dev_local_test_pack/
```

## Mission

Inspect the current Buddy implementation and fix all P0/P1 issues before any new feature work.

## Required Validation

- app builds,
- typecheck passes,
- tests pass,
- hatch flow works,
- deterministic generation works,
- exactly 50 species exist,
- rarity/shiny logic works,
- stats are valid,
- care actions work,
- local save persists after refresh,
- guest account gating works if implemented,
- mobile layout is usable.

## Add Missing Tests For

- deterministic generation,
- species count,
- rarity,
- shiny,
- stats,
- feed/play/wash/rest,
- save/load.

## Required Commands

Discover the package manager and available scripts from the repo.

Run the closest equivalents of:

```bash
lint
typecheck
test
build
dev
```

## Required Output File

Write:

```txt
docs/buddy/reports/remediation/mvp-stabilization-report.md
```

Include:

- summary,
- files inspected,
- files changed,
- commands run,
- results,
- P0/P1/P2/P3 findings,
- fixes applied,
- remaining risks,
- next recommended milestone.

Do not proceed to Locations/Adventures/Loot until P0/P1 issues are resolved.
