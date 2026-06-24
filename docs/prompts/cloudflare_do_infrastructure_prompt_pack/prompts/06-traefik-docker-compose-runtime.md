# 06 — Traefik and Docker Compose Runtime

## Mission

Create a production-grade Docker Compose runtime using Traefik and optional cloudflared.

## Target Services

- web app
- API service
- background worker if present
- Traefik reverse proxy
- cloudflared if tunnel mode is enabled
- optional observability services

## Required Files

```txt
infra/runtime/docker-compose.dev.yml
infra/runtime/docker-compose.prod.yml
infra/runtime/traefik/traefik.yml
infra/runtime/traefik/dynamic.yml
infra/runtime/cloudflared/config.yml.example
infra/runtime/.env.example
```

## Requirements

- Use labels for Traefik routes.
- Separate dev/prod hostnames.
- Healthchecks for services.
- Restart policies.
- Named volumes where needed.
- Secure dashboard defaults.
- No secrets in compose files.
