# 03 — Terraform/OpenTofu Foundation

## Mission

Create a clean IaC foundation for Cloudflare and DigitalOcean using Terraform or OpenTofu, matching repo conventions.

## Suggested Structure

```txt
infra/
  terraform/
    modules/
      digitalocean-droplet/
      digitalocean-firewall/
      cloudflare-dns/
      cloudflare-tunnel/
      github-actions-oidc-or-secrets/
    envs/
      dev/
      prod/
    scripts/
    README.md
```

## Required Files

- providers.tf
- variables.tf
- outputs.tf
- versions.tf
- main.tf
- terraform.tfvars.example
- backend.example.tf
- README.md

## Requirements

- Pin provider versions.
- Use variables for tokens, zones, account IDs, domains, regions, sizes, images, SSH keys.
- Add `.gitignore` for state files and tfvars.
- Do not commit secrets.
- Add validate/format scripts.
- Support both plan and gated apply.
