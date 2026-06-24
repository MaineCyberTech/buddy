# Buddy Infrastructure

Infrastructure as Code for deploying the Buddy virtual pet PWA to DigitalOcean with Cloudflare DNS/security.

## Directory Structure

```
infra/
├── .env.example           # Environment template
├── SECRETS.md             # Secrets manifest
├── terraform/
│   ├── modules/
│   │   ├── digitalocean/  # Droplet, Reserved IP, Firewall, Project
│   │   └── cloudflare/    # DNS, SSL/TLS, WAF, Rate Limit, Tunnel
│   └── environments/
│       ├── dev/           # buddy.mainecybertech.us
│       └── prod/          # buddy.mainecybertech.com
├── docker/
│   ├── docker-compose.yml # Traefik + App + cloudflared
│   ├── app.Dockerfile     # Next.js standalone build
│   └── traefik/           # Traefik static + dynamic config
├── scripts/               # Deploy/rollback helpers
└── runbooks/              # Bootstrap/operator guides

.github/workflows/
├── validate-infra.yml     # PR validation
├── deploy-infra.yml       # Terraform plan+apply
└── deploy-app.yml         # Docker deploy
```

## Environments

| Env | Domain | Droplet Size | Terraform Env |
|-----|--------|-------------|---------------|
| dev | buddy.mainecybertech.us | s-2vcpu-2gb | `environments/dev` |
| prod | buddy.mainecybertech.com | s-4vcpu-4gb | `environments/prod` |

## Quick Start

```powershell
# 1. Configure
cp infra/terraform/environments/dev/terraform.tfvars.example infra/terraform/environments/dev/terraform.tfvars
# Edit tfvars with your tokens

# 2. Plan
cd infra/terraform/environments/dev
terraform init
terraform plan

# 3. Apply
terraform apply

# 4. Deploy app
# Follow infra/runbooks/bootstrap-runbook.md
```