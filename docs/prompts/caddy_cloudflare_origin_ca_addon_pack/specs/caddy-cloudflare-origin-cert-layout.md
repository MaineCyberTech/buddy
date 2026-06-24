# Caddy + Cloudflare Origin Certificate Layout

## Runtime Cert Files On Droplet

```txt
/opt/chat/certs/cloudflare-origin.pem
/opt/chat/certs/cloudflare-origin-key.pem
```

## Container Mount Paths

```txt
/certs/cloudflare-origin.pem
/certs/cloudflare-origin-key.pem
```

## Repo Placeholder Layout

```txt
infra/docker/cloudflare-origin/
  README.md
  origin.pem.example
  origin-key.pem.example
```

## Required `.gitignore` Entries

```gitignore
infra/docker/cloudflare-origin/*.pem
infra/docker/cloudflare-origin/*.key
infra/docker/cloudflare-origin/origin.pem
infra/docker/cloudflare-origin/origin-key.pem
*.origin.pem
*.origin-key.pem
```

## File Permission Guidance

```bash
chmod 644 /opt/chat/certs/cloudflare-origin.pem
chmod 600 /opt/chat/certs/cloudflare-origin-key.pem
```
