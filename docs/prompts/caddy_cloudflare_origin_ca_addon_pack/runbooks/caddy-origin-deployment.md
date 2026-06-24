# Caddy Origin CA Deployment Runbook

## Preflight

- [ ] Cloudflare Origin cert/key created for required hostnames.
- [ ] Cert/key securely placed on droplet.
- [ ] Cert/key not committed to repo.
- [ ] Docker Compose mounts `/opt/chat/certs:/certs:ro`.
- [ ] Caddyfile uses `/certs/cloudflare-origin.pem` and `/certs/cloudflare-origin-key.pem`.
- [ ] Cloudflare SSL/TLS mode is Full Strict.
- [ ] DNS records are proxied where intended.

## Validate

```bash
cd /opt/chat
docker compose -f infra/docker/docker-compose.prod.yml config
docker compose -f infra/docker/docker-compose.prod.yml up -d caddy
docker compose -f infra/docker/docker-compose.prod.yml logs --tail=100 caddy
```

## Smoke

```bash
curl -I https://chat.mainecybertech.com
curl -I https://chat-api.mainecybertech.com/healthz
```

## WebSocket Smoke

Use browser DevTools to confirm Socket.io connects without repeated upgrade failures.
