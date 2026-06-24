# Prompt — Buddy V2 Release Candidate Hardening Agent

Buddy V2 is feature-complete.

Reported gate:

- 178 tests passing
- typecheck passing
- build passing
- lint passing with 0 warnings
- P0 = 0
- P1 = 0

## Mission

Do not add new features. Perform a release-candidate hardening pass against the actual repo.

## Tasks

1. Pull latest `dev`.
2. Run install, lint, typecheck, tests, and build.
3. Run local browser QA.
4. Validate hatch, deterministic generation, care loop, adventures, inventory, lifecycle, home customization, mini-games, collections, seasonal events, marketplace, breeding, save slots, photo capture, high scores, sound engine, PWA/offline, and auth/account gating.
5. Check for P0/P1 regressions.
6. Add or update:

```txt
docs/buddy/reports/release/buddy-v2-release-candidate-report.md
```

7. Do not add features unless required to fix P0/P1 issues.
8. If all gates pass, prepare release branch:

```txt
release/buddy-v2-rc1
```

## Required Final Output

- Commands run
- Results
- Browser/device QA findings
- P0/P1/P2/P3 findings
- Release decision
- Recommended deployment next step
