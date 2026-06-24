# Buddy Next Steps Pack — Dev Push + Local Browser Testing

This pack is meant to be added into the current Buddy setup after the V2 prompt pack has been run.

It gives repo operators and AI coding agents a concrete next-step workflow for:

- validating the first local MVP,
- running the app locally in a browser,
- testing deterministic generation, care actions, save persistence, PWA/offline behavior, mobile UX, and accessibility,
- fixing P0/P1 issues before new feature work,
- pushing work to the `dev` branch,
- preparing the next implementation milestone: Locations, Adventures, and Loot.

Recommended destination in the repo:

```txt
docs/prompts/buddy_next_steps_dev_local_test_pack/
```

## Use Order

```txt
1. docs/01-current-state-validation.md
2. docs/02-local-browser-test-runbook.md
3. docs/03-quality-gate-checklist.md
4. docs/04-dev-branch-push-runbook.md
5. prompts/01-mvp-stabilization-agent-prompt.md
6. prompts/02-local-test-assistant-prompt.md
7. prompts/03-next-milestone-locations-adventures-loot.md
```

## Primary Rule

Do not move into new features until the local MVP passes:

- build,
- typecheck,
- lint,
- tests,
- hatch flow,
- deterministic generation,
- care loop,
- local save,
- mobile smoke test,
- PWA/offline smoke test if PWA was implemented.
