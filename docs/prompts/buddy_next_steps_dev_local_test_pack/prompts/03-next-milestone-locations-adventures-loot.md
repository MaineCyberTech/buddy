# Prompt — Milestone 2: Locations, Adventures, and Loot

Continue only after the Buddy local MVP has passed P0/P1 validation.

## Preflight

Before adding features:

1. Run lint/typecheck/test/build.
2. Confirm hatch works.
3. Confirm deterministic generation works.
4. Confirm care loop works.
5. Confirm local save works.
6. Confirm no P0/P1 findings remain.

## Use These V2 Pack Files

```txt
docs/prompts/buddy_virtual_pet_v2_complete_prompt_pack/prompts/05-locations-adventures-loot.md
docs/prompts/buddy_virtual_pet_v2_complete_prompt_pack/specs/gameplay-systems.md
docs/prompts/buddy_virtual_pet_v2_complete_prompt_pack/content/location-catalog.md
docs/prompts/buddy_virtual_pet_v2_complete_prompt_pack/content/item-catalog.md
docs/prompts/buddy_virtual_pet_v2_complete_prompt_pack/content/loot-table-design.md
```

## Scope

Implement:

- location map,
- required locations,
- guest account gating outside Main House,
- adventure action,
- energy cost,
- adventure result,
- loot award,
- inventory persistence,
- tests.

## Do Not Implement Yet

- Supabase/cloud sync,
- server-authoritative reward APIs,
- seasonal content,
- full mini-game set,
- social features.

## Required Tests

- guest cannot leave Main House,
- account state unlocks locations,
- adventure consumes energy,
- adventure returns outcome,
- loot award updates inventory,
- inventory persists.

## Required Report

Create:

```txt
docs/buddy/reports/phases/milestone-2-locations-adventures-loot-report.md
```
