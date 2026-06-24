# Caddy Route Contract Audit

## Mission

Audit Caddy route behavior after Cloudflare Origin CA changes.

## Inspect

- `infra/docker/Caddyfile`
- `infra/docker/Caddyfile.prod`
- `infra/docker/docker-compose.devremote.yml`
- `infra/docker/docker-compose.prod.yml`
- frontend API env assumptions
- Socket.io client config
- Express route prefixes

## Required Findings

Use P0/P1/P2/P3.

## Required Checks

- [ ] Frontend routes proxy to web.
- [ ] `/health` proxies to API.
- [ ] `/auth` proxies to API.
- [ ] `/workspaces` proxies to API.
- [ ] `/channels` proxies to API.
- [ ] `/messages` proxies to API.
- [ ] `/socket.io` proxies to API with WebSocket support.
- [ ] API subdomain routing works if enabled.
- [ ] No route shadowing.
- [ ] No broken CORS/cookie assumptions.

## Output

```txt
docs/infra/reports/caddy-origin/caddy-route-contract-audit.md
```
