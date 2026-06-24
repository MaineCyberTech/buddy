# Rollback Buddy Caddy Stack

## Rollback Caddy Version

```powershell
ssh root@<droplet-ip>
cd /opt/buddy
docker compose down
docker compose pull caddy  # or pin to previous tag
# Restore previous Caddyfile
cp Caddyfile.bak Caddyfile
docker compose up -d
```

## Rollback to Previous App Version

```powershell
ssh root@<droplet-ip>
cd /opt/buddy
# Pull previous app image
docker compose pull app
# Recreate app container with old image
docker compose up -d --force-recreate app
# If broken, use previous docker-compose
git checkout <previous-commit> -- infra/docker/docker-compose.yml
docker compose up -d
```

## Full Infrastructure Rollback

```powershell
cd infra/terraform/environments/<env>
# Plan destruction
terraform plan -destroy -out=tfdestroy
# Apply with caution
terraform apply tfdestroy
```

## Verify Rollback

```powershell
curl -I https://buddy.mainecybertech.us
docker compose ps
docker compose logs --tail=20 caddy
```