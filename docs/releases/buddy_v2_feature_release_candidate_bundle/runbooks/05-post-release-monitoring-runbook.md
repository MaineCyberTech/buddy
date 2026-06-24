# 05 — Post-Release Monitoring Runbook

Use after RC promotion or public release.

## Monitor

- App load errors
- Save/load failures
- Auth migration errors
- Adventure reward failures
- Marketplace transaction anomalies
- Breeding impossible states
- PWA install/offline failures
- High score validation failures
- Client console errors
- Performance regressions

## Immediate Rollback Triggers

- Data loss
- Authentication bypass
- Cross-user save access
- Broken hatch flow
- Build or route deployment failure
- Marketplace/economy exploit in production
- Severe PWA cache corruption

## Post-Release Report

Create:

```txt
docs/buddy/reports/release/buddy-v2-post-release-report.md
```
