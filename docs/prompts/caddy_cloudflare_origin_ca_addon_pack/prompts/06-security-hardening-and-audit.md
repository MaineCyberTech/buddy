# 06 — Caddy + Cloudflare Origin Security Hardening Audit Prompt

## Mission

Audit the Caddy + Cloudflare Origin CA implementation using P0/P1/P2/P3 severity.

## Required Audit Areas

- Real cert/private key not committed.
- `.gitignore` protects cert/key files.
- Caddy admin API not publicly exposed.
- Caddy route contract preserved.
- WebSocket route preserved.
- Cloudflare Full Strict documented.
- Origin CA cert/key mounted read-only.
- Key file permissions restricted on droplet.
- GitHub Actions do not leak cert material.
- Docker Compose does not expose unnecessary ports.
- Docker socket is not mounted unless justified.
- HTTP redirects to HTTPS where appropriate.
- Rollback path exists.

## Required Output

Create:

```txt
docs/infra/reports/caddy-origin/06-security-hardening-audit.md
```

## Severity Model

- P0: secret exposure, production outage risk, route contract broken, impossible rollback.
- P1: insecure TLS posture, missing cert validation, broken WebSocket proxying, unsafe workflow logging.
- P2: incomplete docs/checklists, minor hardening gaps.
- P3: polish improvements.
