# 07 — Caddy Origin CA Release and Rollback Prompt

## Mission

Prepare release and rollback documentation for the Caddy + Cloudflare Origin CA change.

## Required Release Steps

- Confirm cert/key exist on droplet.
- Confirm Caddyfile validates.
- Confirm Docker Compose validates.
- Restart Caddy safely.
- Test app domain.
- Test API health domain/path.
- Test WebSocket route.
- Confirm Cloudflare proxy and TLS mode.

## Required Rollback Steps

- Restore previous Caddyfile.
- Restore previous cert/key if rotating.
- Restart Caddy.
- Re-run smoke tests.
- If necessary, toggle Cloudflare SSL mode only as an emergency documented action.

## Required Output

Create:

```txt
docs/infra/runbooks/caddy-origin-release.md
docs/infra/runbooks/caddy-origin-rollback.md
docs/infra/reports/caddy-origin/07-release-readiness-report.md
```
