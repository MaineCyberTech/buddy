# 04 — Cloudflare DNS and SSL Validation Prompt

## Mission

Validate Cloudflare DNS, proxying, and SSL/TLS assumptions for Caddy Origin CA mode.

## Required Validation Areas

- Cloudflare DNS records for development app/API domains.
- Cloudflare DNS records for production app/API domains.
- Proxied status for intended public records.
- Cloudflare SSL/TLS mode documented as Full Strict for Origin CA mode.
- Origin certificate hostname coverage.
- HTTP to HTTPS behavior.
- API health endpoint through Cloudflare.
- Socket.io/WebSocket connection through Cloudflare.

## Required Output

Create:

```txt
docs/infra/reports/caddy-origin/04-cloudflare-validation-report.md
```

## Important

Do not assume Cloudflare dashboard settings are correct. If the agent cannot query Cloudflare, it must produce an operator checklist and mark dashboard-only checks as manual.
