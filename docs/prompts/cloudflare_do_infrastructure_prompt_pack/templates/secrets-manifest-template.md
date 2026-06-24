# Secrets Manifest

| Secret | Scope | Required For | Permissions | Stored In | Notes |
|---|---|---|---|---|---|
| DIGITALOCEAN_TOKEN | dev/prod | Terraform DigitalOcean provider | least privilege available | GitHub Environment Secret / local env | no value committed |
| CLOUDFLARE_API_TOKEN | dev/prod | Terraform Cloudflare provider | DNS/Tunnel/Access as required | GitHub Environment Secret / local env | no value committed |
| CLOUDFLARE_ACCOUNT_ID | dev/prod | Cloudflare account resources | identifier only | GitHub Secret / local env | may not be secret but keep controlled |
| CLOUDFLARE_ZONE_ID_DEV | dev | DNS | zone identifier | GitHub Environment Secret / local env | no value committed |
| CLOUDFLARE_ZONE_ID_PROD | prod | DNS | zone identifier | GitHub Environment Secret / local env | no value committed |
