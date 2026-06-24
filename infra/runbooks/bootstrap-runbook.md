# Buddy Infra — Bootstrap Runbook

## Prerequisites

- DigitalOcean account with API token
- Cloudflare account with API token
- Domain: buddy.mainecybertech.us (dev) / buddy.mainecybertech.com (prod)
- S3-compatible bucket for Terraform state (or use local backend)

## 1. Clone & Setup

```powershell
git clone <repo-url>
cd buddy
cp infra/terraform/environments/dev/terraform.tfvars.example infra/terraform/environments/dev/terraform.tfvars
```

Edit `terraform.tfvars`:
```
do_token           = "dop_v1_your_token"
cloudflare_api_token = "your_cf_token"
cloudflare_zone_id = "your_zone_id"
```

## 2. Terraform Plan

```powershell
cd infra/terraform/environments/dev
terraform init
terraform plan
```

Review the plan output. It should create:
- 1 DigitalOcean Droplet
- 1 Reserved IP
- 1 Firewall
- 1 Project
- 2 Cloudflare DNS A records
- SSL/TLS settings
- WAF + rate limiting rules

## 3. Terraform Apply

```powershell
terraform apply
```

Type `yes` when prompted.

## 4. Deploy Docker Stack

```powershell
# Copy infra to droplet
$ip = (terraform output -raw droplet_ip)
scp -r infra/docker/* root@${ip}:/opt/buddy/

# SSH and deploy
ssh root@${ip}
cd /opt/buddy
docker compose pull
docker compose up -d
```

## 5. Verify

```powershell
curl -I https://buddy.mainecybertech.us
curl -I https://buddy-api.mainecybertech.us
```

## Environment Separation

| Environment | Branch | Terraform Env | Domain |
|-------------|--------|---------------|--------|
| Development | develop | dev | buddy.mainecybertech.us |
| Production | main | prod | buddy.mainecybertech.com |

## Rollback

```powershell
# Revert Terraform
cd infra/terraform/environments/dev
terraform plan -destroy
terraform destroy

# Revert Docker
ssh root@$ip
cd /opt/buddy
docker compose down
docker compose pull <previous-tag>
docker compose up -d
```

## CI/CD

Push to `develop` or `main` triggers:
1. Validate Infra — format, init, validate
2. Deploy Infra — Terraform plan + apply
3. Deploy App — copy files, docker compose up