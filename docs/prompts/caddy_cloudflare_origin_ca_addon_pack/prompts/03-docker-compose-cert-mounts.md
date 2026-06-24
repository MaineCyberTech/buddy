# 03 — Docker Compose Caddy Cert Mounts Prompt

## Mission

Update Docker Compose templates to mount Cloudflare Origin CA certificate files into Caddy read-only.

## Required Compose Shape

The Caddy service should include a read-only cert mount similar to:

```yaml
services:
  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile.prod:/etc/caddy/Caddyfile:ro
      - /opt/chat/certs:/certs:ro
      - caddy_data:/data
      - caddy_config:/config
```

## Required Checks

- Ensure cert directory exists on droplet before compose restart.
- Ensure key file permissions are restricted.
- Ensure missing certs fail clearly.
- Ensure compose file does not include cert contents.
- Ensure compose file does not mount Docker socket unnecessarily.

## Required Output

Create:

```txt
docs/infra/reports/caddy-origin/03-compose-cert-mount-report.md
```
