# Buddy Virtual Pet Web App — V2 Complete Prompt Pack

This is the expanded repo-ready prompt pack for building **Buddy**, a mobile-first, offline-capable, installable PWA virtual pet game with deterministic ASCII-art pets, LCD/pixel UI, lifecycle progression, skills, loot, adventures, home customization, cloud-save-ready architecture, Supabase integration guidance, anti-cheat/server-authority rules, content bibles, game balance, QA audits, and local AI-agent execution support.

## Intended Use

Drop this folder into a repo, preferably:

```txt
docs/prompts/buddy_virtual_pet_v2_complete_prompt_pack/
```

Then run the prompts in order with an execution-mode AI coding agent.

## Important Originality Constraint

The game may be inspired by the virtual pet genre and classic LCD handheld devices, but all implementation details, code, sprites, ASCII art, item names, dialogue, sounds, and assets must be original. Do not copy Tamaweb, Tamagotchi, or any other copyrighted/proprietary project.

## Pack Sections

```txt
prompts/        Implementation prompts by phase
specs/          Product, architecture, game systems, balance, security, database, PWA
content/        Species, personality, item, dialogue, location, lore/content rules
ux/             Flow maps, screen inventory, navigation, account gating
integration/    Next.js, Turborepo, Supabase, Vercel, Cloudflare integration guides
audits/         P0/P1/P2/P3 audit prompts
runner/         Prompt manifest and execution order
checklists/     Implementation, testing, accessibility, security, release checklists
templates/      Agent reports and remediation templates
```

## Recommended Execution Order

1. `prompts/00-master-build-prompt.md`
2. `prompts/01-foundation-and-architecture.md`
3. `prompts/02-deterministic-generation-engine.md`
4. `prompts/03-hatch-flow-and-main-device-ui.md`
5. `prompts/04-care-loop-needs-and-actions.md`
6. `prompts/05-locations-adventures-loot.md`
7. `prompts/06-lifecycle-skills-and-progression.md`
8. `prompts/07-home-customization-inventory-economy.md`
9. `prompts/08-pwa-offline-local-first-save.md`
10. `prompts/09-auth-account-gating-cloud-save.md`
11. `prompts/10-testing-quality-accessibility-security.md`
12. `prompts/11-polish-roadmap-and-release-readiness.md`
13. `prompts/12-ai-agent-operator-runbook.md`
14. Optional hardening expansions: prompts 13–19.
15. Run all audits in `/audits`.

## Quality Gate

No phase is complete until build, typecheck, lint, relevant tests, and the phase acceptance checklist pass.
