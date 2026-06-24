# 02 — Infrastructure Architecture Plan

## Mission

Design the target Cloudflare + DigitalOcean infrastructure architecture before creating implementation files.

## Required Architecture Decisions

Document:

- public DNS model,
- dev/prod domain mapping,
- whether Cloudflare Tunnel is used,
- whether Traefik terminates TLS or Cloudflare/Tunnel handles edge routing,
- DigitalOcean region and droplet sizing variables,
- firewall model,
- SSH access model,
- Docker network model,
- deployment workflow,
- rollback model,
- secrets model.

## Required Output

Create:

```txt
docs/infra/architecture/cloudflare-digitalocean-architecture.md
```

Must include diagrams in ASCII/Markdown and a final implementation checklist.
