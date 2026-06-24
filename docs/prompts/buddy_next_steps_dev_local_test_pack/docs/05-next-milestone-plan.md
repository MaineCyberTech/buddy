# 05 — Next Milestone Plan

After the local MVP passes the quality gate, the next milestone is:

```txt
Milestone 2 — Locations, Adventures, and Loot
```

## Required Scope

- Add location map.
- Add Main House, Backyard, Park, Market, Training Dojo, Forest Trail, Lake Dock, Crystal Cave, Sky Garden, Ancient Ruins.
- Enforce guest gating outside Main House.
- Add adventure action.
- Consume energy for adventures.
- Generate adventure outcomes.
- Award loot.
- Add persisted inventory foundation.
- Add tests.

## Explicitly Out Of Scope For This Milestone

- Supabase cloud sync.
- Server-authoritative reward APIs.
- Seasonal events.
- Full mini-game suite.
- Full economy balancing.
- Social features.

## Required Tests

- [ ] guest cannot leave Main House.
- [ ] account user can access unlocked location.
- [ ] adventure consumes energy.
- [ ] adventure returns result.
- [ ] loot award mutates inventory.
- [ ] inventory persists after refresh.
