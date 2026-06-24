# Cloudflare + DigitalOcean Infrastructure Prompt Pack

Repo-ready prompt pack for building infrastructure similar in spirit to a Cloudflare/DigitalOcean deployment stack: Terraform/OpenTofu infrastructure as code, DigitalOcean Droplet/Reserved IP/Firewall/Project resources, Cloudflare DNS/Proxy/Tunnel/Access/WAF configuration, Docker Compose application hosting, Traefik reverse proxy, cloudflared tunnel option, GitHub Actions CI/CD, secrets handling, environment separation, validation, audits, and operator runbooks.

## Important Context

The referenced `MaineCyberTech/chat` repository may be private or not publicly accessible. This pack is therefore designed as a **repo-inspection-first execution pack**. The AI agent must inspect the actual repo before implementing. Do not assume exact paths, workflows, resources, or secrets from the referenced repository.

## Recommended Repo Placement

```txt
docs/prompts/cloudflare_do_infrastructure_prompt_pack/
```

## Goal

Create infrastructure for development and production environments using patterns aligned with your existing workflow:

- dev app domain: `chat.mainecybertech.us`
- dev API domain: `chat-api.mainecybertech.us`
- production app domain: `chat.mainecybertech.com`
- production API domain: `chat-api.mainecybertech.com`
- Cloudflare DNS/proxy/security management
- DigitalOcean VM/container hosting
- Docker/Traefik/cloudflared deployment options
- GitHub Actions deploy workflows
- secure secrets and environment management

## Use Order

1. `prompts/00-master-infrastructure-build-prompt.md`
2. `prompts/01-repo-discovery-and-current-state.md`
3. `prompts/02-infrastructure-architecture-plan.md`
4. `prompts/03-terraform-opentofu-foundation.md`
5. `prompts/04-digitalocean-compute-networking.md`
6. `prompts/05-cloudflare-dns-security-tunnels.md`
7. `prompts/06-traefik-docker-compose-runtime.md`
8. `prompts/07-github-actions-cicd.md`
9. `prompts/08-secrets-env-runbooks.md`
10. `prompts/09-validation-local-and-remote-smoke-tests.md`
11. `prompts/10-security-hardening-audit.md`
12. `prompts/11-dev-prod-promotion-release.md`

## Key Rule

The agent must not apply infrastructure automatically until a plan has been generated, reviewed, and secrets are available through approved local/GitHub mechanisms. Terraform/OpenTofu `plan` is safe; `apply` must be gated.
