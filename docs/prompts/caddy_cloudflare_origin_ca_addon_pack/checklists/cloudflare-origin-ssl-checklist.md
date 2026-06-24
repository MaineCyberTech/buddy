# Cloudflare Origin SSL Checklist

- [ ] Cloudflare DNS records exist for dev app domain.
- [ ] Cloudflare DNS records exist for dev API domain.
- [ ] Cloudflare DNS records exist for prod app domain.
- [ ] Cloudflare DNS records exist for prod API domain.
- [ ] Records are proxied where intended.
- [ ] Cloudflare SSL/TLS mode is Full Strict.
- [ ] Origin certificate includes required hostnames.
- [ ] Origin certificate is not expired.
- [ ] Origin private key is not committed.
- [ ] Caddy cert/key paths are mounted read-only.
- [ ] Caddy does not depend on public ACME in Origin CA mode.
- [ ] HTTP redirects or upgrades to HTTPS as intended.
- [ ] API health endpoint works through Cloudflare.
- [ ] Socket.io/WebSocket route works through Cloudflare.
- [ ] Cert rotation runbook exists.
