# 08 — Secrets, Environment, and Operator Runbooks

## Mission

Create secrets documentation and operator runbooks for safe infrastructure usage.

## Required Docs

```txt
docs/infra/secrets/secrets-manifest.md
docs/infra/runbooks/bootstrap.md
docs/infra/runbooks/plan.md
docs/infra/runbooks/apply.md
docs/infra/runbooks/deploy.md
docs/infra/runbooks/rollback.md
docs/infra/runbooks/rotate-secrets.md
```

## Required Secrets Manifest

Document required secret names, where they live, and what permissions they need. Do not include values.

Minimum likely secrets:

- DIGITALOCEAN_TOKEN
- CLOUDFLARE_API_TOKEN
- CLOUDFLARE_ACCOUNT_ID
- CLOUDFLARE_ZONE_ID_DEV
- CLOUDFLARE_ZONE_ID_PROD
- SSH_PRIVATE_KEY or deploy key reference
- TRAEFIK_DASHBOARD_AUTH_HASH if used
- CLOUDFLARED_TUNNEL_TOKEN if using tokenized tunnel deployment
