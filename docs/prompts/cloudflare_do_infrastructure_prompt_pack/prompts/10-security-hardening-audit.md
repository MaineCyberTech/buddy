# 10 — Security Hardening Audit

## Mission

Audit the final infrastructure for security, environment separation, rollback safety, secrets handling, and least privilege.

## Required Findings Format

Use P0/P1/P2/P3 severity.

## Required Audit Areas

- Secrets committed or exposed.
- Terraform state handling.
- Provider token permissions.
- SSH exposure.
- Firewall ingress.
- Cloudflare DNS/proxy rules.
- Cloudflare Tunnel exposure.
- Traefik dashboard exposure.
- Docker socket exposure.
- CI/CD protected environments.
- Dev/prod separation.
- Rollback procedure.

## Required Output

```txt
docs/infra/reports/security-hardening-audit.md
```
