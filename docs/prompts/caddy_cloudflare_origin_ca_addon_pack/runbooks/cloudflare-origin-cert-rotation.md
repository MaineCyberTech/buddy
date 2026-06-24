# Cloudflare Origin CA Certificate Rotation Runbook

## Goal

Rotate the Cloudflare Origin CA certificate used by Caddy without exposing secrets or breaking Cloudflare Full Strict TLS.

## Runtime Files

```txt
/opt/chat/certs/cloudflare-origin.pem
/opt/chat/certs/cloudflare-origin-key.pem
```

## Pre-Rotation Backup

```bash
cp /opt/chat/certs/cloudflare-origin.pem /opt/chat/certs/cloudflare-origin.pem.bak
cp /opt/chat/certs/cloudflare-origin-key.pem /opt/chat/certs/cloudflare-origin-key.pem.bak
chmod 600 /opt/chat/certs/cloudflare-origin-key.pem.bak
```

## Install New Cert Files

```bash
mkdir -p /opt/chat/certs
# Place new cert/key securely using manual copy or approved secret transfer.
chmod 644 /opt/chat/certs/cloudflare-origin.pem
chmod 600 /opt/chat/certs/cloudflare-origin-key.pem
```

## Validate Caddy

```bash
cd /opt/chat
docker compose -f infra/docker/docker-compose.prod.yml config
docker compose -f infra/docker/docker-compose.prod.yml exec caddy caddy validate --config /etc/caddy/Caddyfile
```

## Restart Caddy

```bash
docker compose -f infra/docker/docker-compose.prod.yml restart caddy
```

## Smoke Tests

```bash
curl -I https://chat.mainecybertech.com
curl -I https://chat-api.mainecybertech.com/healthz
curl -I https://chat.mainecybertech.us
curl -I https://chat-api.mainecybertech.us/healthz
```

## Rollback

```bash
cp /opt/chat/certs/cloudflare-origin.pem.bak /opt/chat/certs/cloudflare-origin.pem
cp /opt/chat/certs/cloudflare-origin-key.pem.bak /opt/chat/certs/cloudflare-origin-key.pem
chmod 644 /opt/chat/certs/cloudflare-origin.pem
chmod 600 /opt/chat/certs/cloudflare-origin-key.pem
docker compose -f infra/docker/docker-compose.prod.yml restart caddy
```
