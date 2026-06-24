# 04 — Deployment Rehearsal Runbook

Use this before production promotion.

## Preflight

- [ ] Clean `release/buddy-v2-rc1` branch.
- [ ] Install passes.
- [ ] Lint passes.
- [ ] Typecheck passes.
- [ ] Tests pass.
- [ ] Build passes.
- [ ] Required environment variables documented.
- [ ] PWA assets verified.
- [ ] Service worker behavior verified.
- [ ] Auth/cloud save behavior verified if enabled.

## Deployment Rehearsal Checks

- [ ] Deploy preview builds successfully.
- [ ] Preview app loads.
- [ ] Hatch works on preview.
- [ ] Save persists on preview.
- [ ] PWA install prompt works where supported.
- [ ] Offline fallback works where supported.
- [ ] API routes respond as expected.
- [ ] No client-side secrets visible.
- [ ] Console does not show critical errors.
- [ ] Network tab does not show repeated failing requests.

## Rollback Preparation

- [ ] Previous stable release identified.
- [ ] Rollback command or process documented.
- [ ] Database migrations are reversible or forward-safe.
- [ ] Feature flags documented if used.
