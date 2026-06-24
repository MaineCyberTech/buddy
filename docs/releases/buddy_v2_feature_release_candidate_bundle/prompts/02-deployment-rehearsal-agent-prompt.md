# Prompt — Buddy V2 Deployment Rehearsal Agent

You are performing a deployment rehearsal for Buddy V2 RC.

## Mission

Validate that the release candidate is deployable and safe to promote.

## Tasks

1. Checkout `release/buddy-v2-rc1`.
2. Run install/lint/typecheck/test/build.
3. Verify production build output.
4. Verify environment variable documentation.
5. Verify PWA assets and service worker production behavior.
6. Verify auth/cloud-save configuration if enabled.
7. Verify no client secrets are exposed.
8. Create deployment rehearsal report.

## Required Report

```txt
docs/buddy/reports/deployment/buddy-v2-deployment-rehearsal-report.md
```

Include:

- branch
- commit
- commands
- results
- environment requirements
- deployment risks
- rollback notes
- recommendation
