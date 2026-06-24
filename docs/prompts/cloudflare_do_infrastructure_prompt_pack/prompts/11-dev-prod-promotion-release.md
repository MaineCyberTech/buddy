# 11 — Dev/Prod Promotion and Release

## Mission

Create final promote-to-dev and promote-to-prod procedures.

## Required Docs

```txt
docs/infra/runbooks/promote-dev.md
docs/infra/runbooks/promote-prod.md
docs/infra/runbooks/release-checklist.md
docs/infra/reports/infra-release-candidate-report.md
```

## Required Gate

- dev plan reviewed,
- dev apply completed,
- dev smoke tests pass,
- prod plan reviewed,
- prod approval obtained,
- prod apply gated,
- prod smoke tests pass,
- rollback steps documented.
