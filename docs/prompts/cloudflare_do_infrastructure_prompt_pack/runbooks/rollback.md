# Rollback Runbook

Rollback strategy must identify:

- last known good app image/tag,
- previous Terraform state/version,
- DNS rollback records,
- service restart commands,
- Cloudflare tunnel rollback config,
- database migration rollback or forward-fix process.
