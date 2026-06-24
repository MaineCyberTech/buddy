# Buddy Infra — Secrets Manifest

## GitHub Repository Secrets

| Secret Name | Description | Required |
|-------------|-------------|----------|
| `DO_TOKEN` | DigitalOcean personal access token (write scope) | Yes |
| `CF_API_TOKEN` | Cloudflare API token (DNS:Edit, Zone:Read) | Yes |
| `CF_ZONE_ID` | Cloudflare zone ID for the domain | Yes |
| `DROPLET_IP` | DigitalOcean Droplet public IPv4 | Yes |
| `SSH_PRIVATE_KEY` | Ed25519 private key for root SSH access | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Optional |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Optional |
| `APP_DOMAIN` | App domain (e.g. buddy.mainecybertech.us) | Yes |
| `API_DOMAIN` | API domain (e.g. buddy-api.mainecybertech.us) | Yes |

## Local `.env` File

Located at `infra/.env` (not committed):

```
DO_TOKEN=your_digitalocean_token
CF_API_TOKEN=your_cloudflare_token
CF_ZONE_ID=your_zone_id
```

## Terraform Backend

State stored in S3 bucket `buddy-terraform-state` (region: us-east-1).  
Recommended: configure bucket in AWS or use DigitalOcean Spaces as backend.

## DigitalOcean Setup

1. Create read/write API token: API → Tokens → Generate
2. Add SSH key: Settings → Security → Add SSH Key
3. Note SSH key fingerprint for `ssh_key_ids` variable

## Cloudflare Setup

1. Create API token: My Profile → API Tokens → Create (DNS:Edit, Zone:Read)
2. Get Zone ID: Overview → API Zone ID
3. Note: DNS records are managed by Terraform