# 09 — Validation, Local, and Remote Smoke Tests

## Mission

Create validation scripts and smoke-test docs for the infrastructure stack.

## Required Scripts

```txt
scripts/infra/validate-local.ps1
scripts/infra/validate-local.sh
scripts/infra/smoke-dev.ps1
scripts/infra/smoke-dev.sh
scripts/infra/smoke-prod.ps1
scripts/infra/smoke-prod.sh
```

## Required Checks

- Terraform/OpenTofu format.
- Terraform/OpenTofu validate.
- Plan generation.
- Docker Compose config validation.
- Traefik config validation if possible.
- DNS resolution checks.
- HTTPS response checks.
- App/API health endpoint checks.
- Cloudflare proxy/tunnel status checks where possible.
