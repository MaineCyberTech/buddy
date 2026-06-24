# PR: Cloudflare + DigitalOcean Infrastructure Foundation

## Summary

Adds repo-ready infrastructure foundation for Cloudflare + DigitalOcean deployment.

## Includes

- Terraform/OpenTofu foundation
- DigitalOcean compute/networking modules
- Cloudflare DNS/security/tunnel modules
- Docker Compose/Traefik runtime templates
- GitHub Actions workflows
- secrets manifest
- validation scripts
- runbooks
- security audit checklist

## Validation

- [ ] terraform fmt
- [ ] terraform validate
- [ ] terraform plan dev
- [ ] docker compose config
- [ ] smoke test docs updated
- [ ] no secrets committed

## Notes

Apply is gated and should not run automatically from unreviewed branches.
