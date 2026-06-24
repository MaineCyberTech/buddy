# Caddy Origin CA Rollback Runbook

## Rollback Triggers

- Caddy fails to start.
- API health endpoint unavailable.
- WebSocket route broken.
- Cloudflare Full Strict reports origin cert failure.
- Unexpected production outage after Caddy cert change.

## Rollback Options

### Option A — Restore Previous Caddyfile

```bash
cd /opt/chat
git checkout HEAD~1 -- infra/docker/Caddyfile.prod
docker compose -f infra/docker/docker-compose.prod.yml restart caddy
```

### Option B — Restore Previous Origin Cert

```bash
cp /opt/chat/certs/cloudflare-origin.pem.bak /opt/chat/certs/cloudflare-origin.pem
cp /opt/chat/certs/cloudflare-origin-key.pem.bak /opt/chat/certs/cloudflare-origin-key.pem
chmod 644 /opt/chat/certs/cloudflare-origin.pem
chmod 600 /opt/chat/certs/cloudflare-origin-key.pem
docker compose -f infra/docker/docker-compose.prod.yml restart caddy
```

## Post-Rollback Validation

```bash
curl -I https://chat.mainecybertech.com
curl -I https://chat-api.mainecybertech.com/healthz
```
