# 01 — Repo Inspection and Caddy Route Contract Prompt

## Mission

Inspect the current repo before changing Caddy, Docker Compose, Terraform, or GitHub Actions.

## Required Inspection

Inspect:

```txt
infra/docker/Caddyfile
infra/docker/Caddyfile.prod
infra/docker/docker-compose.devremote.yml
infra/docker/docker-compose.prod.yml
.github/workflows/deploy-development.yml
.github/workflows/deploy-production.yml
.github/workflows/infra-development.yml
apps/web/.env.example
apps/api/.env.example
apps/web/lib/api.ts
apps/web/lib/socket.ts
apps/api/src/app.ts
apps/api/src/server.ts
```

## Determine Current Routing Mode

Classify current routing as one of:

```txt
Mode A — same-domain path routing
Mode B — app/API subdomain routing
Mode C — mixed routing
```

## Required Report

Create:

```txt
docs/infra/reports/caddy-origin/01-route-contract-report.md
```

Include:

- active Caddyfiles found,
- active compose files found,
- domain mapping,
- route prefixes,
- WebSocket route handling,
- API health path,
- frontend origin/env assumptions,
- proposed no-break implementation plan.

## No-Break Rule

Do not change route paths or domain behavior until this report is written.
