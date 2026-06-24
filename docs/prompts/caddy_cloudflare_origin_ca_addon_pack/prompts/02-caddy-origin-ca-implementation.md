# 02 — Caddy Cloudflare Origin CA Implementation Prompt

## Mission

Implement or stage Caddy configuration for Cloudflare Origin CA certificates.

## Runtime Cert Paths

Use these runtime paths on the droplet:

```txt
/opt/chat/certs/cloudflare-origin.pem
/opt/chat/certs/cloudflare-origin-key.pem
```

Inside the Caddy container, mount them as:

```txt
/certs/cloudflare-origin.pem
/certs/cloudflare-origin-key.pem
```

## Preferred Caddy Behavior

- Caddy serves HTTPS at origin using Cloudflare Origin CA certs.
- Cloudflare SSL mode should be Full Strict.
- Caddy should not depend on public ACME for these hostnames in origin mode.
- Caddy should continue to proxy WebSocket traffic correctly.

## Implementation Requirements

1. Add Caddyfile examples or update active Caddyfiles safely.
2. Preserve route contract from prompt 01.
3. Add comments explaining Origin CA mode.
4. Add validation instructions.
5. Do not commit real certs.

## Required Output

Create or update:

```txt
docs/infra/reports/caddy-origin/02-implementation-report.md
```

Include:

- files changed,
- routing mode selected,
- cert mount paths,
- validation commands,
- rollback instructions.
