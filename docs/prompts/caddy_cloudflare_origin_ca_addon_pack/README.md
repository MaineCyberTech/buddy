# Caddy + Cloudflare Origin CA Add-On Pack

Repo-ready add-on prompt pack for upgrading the chat repository infrastructure to use **Caddy with Cloudflare Origin CA certificates** behind Cloudflare proxying.

This add-on is designed for the existing MaineCyberTech chat repo structure shown in the attached Repomix XML, including:

```txt
infra/docker/Caddyfile
infra/docker/Caddyfile.prod
infra/docker/docker-compose.devremote.yml
infra/docker/docker-compose.prod.yml
infra/terraform/
.github/workflows/deploy-development.yml
.github/workflows/deploy-production.yml
.github/workflows/infra-development.yml
```

## Purpose

Use Cloudflare Origin CA certificates on the DigitalOcean origin instead of depending on public Let's Encrypt issuance at the origin. Cloudflare should connect to Caddy using **Full (strict)** TLS while users connect through Cloudflare's edge.

## Design Goals

- Preserve existing Caddy route contracts.
- Preserve dev/prod domain separation.
- Avoid committing certificates or private keys.
- Mount Cloudflare Origin cert/key into Caddy read-only.
- Keep deployment safe for Socket.io/WebSocket traffic.
- Add validation, rollback, and rotation runbooks.
- Add GitHub Actions guardrails for cert handling.

## Recommended Repo Placement

```txt
docs/prompts/caddy_cloudflare_origin_ca_addon_pack/
```

## Recommended Runtime Cert Placement On Droplet

```txt
/opt/chat/certs/cloudflare-origin.pem
/opt/chat/certs/cloudflare-origin-key.pem
```

## Use Order

1. `prompts/00-master-caddy-cloudflare-origin-prompt.md`
2. `prompts/01-repo-inspection-and-route-contract.md`
3. `prompts/02-caddy-origin-ca-implementation.md`
4. `prompts/03-docker-compose-cert-mounts.md`
5. `prompts/04-cloudflare-dns-ssl-validation.md`
6. `prompts/05-github-actions-cert-guardrails.md`
7. `prompts/06-security-hardening-and-audit.md`
8. `prompts/07-release-and-rollback.md`

## Hard Safety Rule

The implementation agent must not print, commit, artifact-upload, or log origin private key material.
