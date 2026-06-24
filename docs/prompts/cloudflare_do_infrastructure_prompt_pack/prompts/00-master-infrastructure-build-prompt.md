# 00 — Master Infrastructure Build Prompt

You are an elite Principal Infrastructure Architect, DevOps Engineer, Cloudflare Engineer, DigitalOcean Engineer, Terraform/OpenTofu Engineer, Docker/Traefik Engineer, GitHub Actions Engineer, and Security Reviewer.

Build a repo-ready infrastructure layer similar to the existing Cloudflare/DigitalOcean setup in the referenced chat application, but do not assume the referenced repository is accessible or public. Inspect the actual repository first.

## Mission

Create a secure, repeatable, environment-separated infrastructure system for dev and production.

## Target Capabilities

- Infrastructure as Code with Terraform/OpenTofu.
- DigitalOcean resources for compute, networking, reserved/static IP, firewalling, project organization, SSH access, and optional volumes/backups.
- Cloudflare resources for DNS records, proxied records, SSL/TLS posture, security rules, optional Cloudflare Tunnel, optional Access policy, and environment-domain separation.
- Docker Compose runtime for app/API/worker/supporting services.
- Traefik reverse proxy for app/API routing and TLS strategy where applicable.
- cloudflared tunnel option for origin protection where applicable.
- GitHub Actions workflows for validate/plan/deploy.
- Environment-specific configs for dev and prod.
- Secrets management via GitHub Actions secrets and local `.env` templates.
- Operator runbooks for bootstrap, plan, apply, deploy, rollback, and smoke tests.

## Required Environments

Dev:
- `buddy.mainecybertech.us`
- `buddy-api.mainecybertech.us`

Production:
- `buddy.mainecybertech.com`
- `buddy-api.mainecybertech.com`

## Required Safety Rules

- Do not commit secrets.
- Do not hardcode provider tokens.
- Do not run destructive commands without explicit operator approval.
- Terraform/OpenTofu apply must be gated.
- Prefer least-privilege Cloudflare and DigitalOcean tokens.
- Preserve existing repo conventions.
- Generate plans and reports before applying changes.

## Final Deliverables

- Infrastructure folder tree.
- Terraform/OpenTofu modules or environment files.
- Docker Compose/Traefik/cloudflared deployment templates.
- GitHub Actions workflows.
- `.env.example` and secrets manifest.
- Validation scripts.
- Operator runbooks.
- Security audit checklist.
- Dev/prod promotion guide.
