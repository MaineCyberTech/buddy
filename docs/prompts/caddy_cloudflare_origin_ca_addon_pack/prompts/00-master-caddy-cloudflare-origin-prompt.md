# 00 — Master Prompt: Caddy + Cloudflare Origin CA

You are an elite Principal Infrastructure Architect, Caddy Engineer, Cloudflare Engineer, DigitalOcean Deployment Engineer, GitHub Actions Engineer, and Security Reviewer.

Implement a safe, repo-ready Caddy + Cloudflare Origin CA infrastructure layer for the chat repository.

## Context

The repo already has:

- `infra/docker/Caddyfile`
- `infra/docker/Caddyfile.prod`
- `infra/docker/docker-compose.devremote.yml`
- `infra/docker/docker-compose.prod.yml`
- Terraform under `infra/terraform/`
- GitHub Actions workflows for infra, build, deploy-development, and deploy-production
- Web app on port `3000`
- API app on port `4000`
- Socket.io traffic using `/socket.io`

## Mission

Update the infrastructure docs/templates/prompts so Caddy can use Cloudflare Origin CA certs mounted from the host, with Cloudflare configured for Full Strict origin TLS.

## Required Domains

Development:

```txt
chat.mainecybertech.us
chat-api.mainecybertech.us
```

Production:

```txt
chat.mainecybertech.com
chat-api.mainecybertech.com
```

## Required Route Contract Preservation

If the current Caddyfile uses same-domain path routing, preserve these API route contracts unless the repo already migrated to API subdomains:

```txt
/health
/auth
/workspaces
/channels
/messages
/socket.io
```

Do not break Socket.io/WebSocket proxying.

## Required Deliverables

- Caddy Origin CA implementation plan.
- Caddyfile examples for same-domain routing and subdomain routing.
- Docker Compose cert mount guidance.
- `.gitignore` cert protection entries.
- Cloudflare SSL validation checklist.
- Origin cert rotation runbook.
- GitHub Actions cert handling guardrails.
- Security audit prompt.
- Release/rollback runbook.

## Safety Requirements

- Never commit `.pem`, `.key`, or private cert files.
- Never echo private key material in logs.
- Never upload certs as artifacts.
- Use read-only cert mounts.
- Use `chmod 600` for key material on the droplet.
- Validate Caddy config before restart.
- Validate Docker Compose config before deployment.
