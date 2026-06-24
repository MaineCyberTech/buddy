# Cloudflare Origin Certificate Rotation Runbook

## Rotation Steps

1. Generate new cert in Cloudflare Dashboard (SSL/TLS → Origin Server)
2. Upload new cert to droplet BEFORE expiry:
```powershell
scp ./certs/new-origin.pem root@<ip>:/opt/buddy/certs/fullchain.pem
scp ./certs/new-origin-key.pem root@<ip>:/opt/buddy/certs/privkey.pem
ssh root@<ip> chmod 600 /opt/buddy/certs/privkey.pem
docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile
```
3. Verify:
```powershell
curl -vI https://buddy.mainecybertech.us 2>&1 | Select-String "SSL certificate verify"
```

## Rotation Safety Rules
- Never delete the old cert until rotation is verified.
- Always set `chmod 600` on private key.
- Test on dev environment first.
- Cloudflare Origin CA certs are valid 15 years — schedule rotation alerts 30 days before expiry.