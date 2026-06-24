# Security Requirements

- No secrets committed.
- Terraform state protected.
- Provider tokens least-privilege.
- SSH constrained to allowed CIDRs.
- Only required public ports exposed.
- Prefer Cloudflare proxy/tunnel origin protection.
- Traefik dashboard must not be public without authentication.
- Docker socket must not be exposed insecurely.
- Prod GitHub Actions environment must require manual approval.
- Dev/prod resources must not share mutable state files.
