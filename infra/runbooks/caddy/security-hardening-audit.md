# Buddy Caddy + Cloudflare Origin CA — Security Hardening Audit

## Audit Items

### TLS Configuration
- [x] Cloudflare SSL set to **Full (Strict)** — enforces origin cert validation
- [x] Origin certificate valid for 15 years
- [x] TLS 1.2+ enforced via Cloudflare settings
- [x] HSTS enabled via Cloudflare

### Caddy Configuration
- [x] Caddy runs as non-root container
- [x] Cert volumes mounted read-only (`:ro`)
- [x] Private key file permissions `chmod 600`
- [x] Security headers set (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- [x] Permissions-Policy restricts camera/microphone/geolocation

### Certificate Safety
- [x] PEM files never committed to git
- [x] Private keys never committed to git
- [x] GitHub Actions blocks cert leaks in PR diffs
- [x] `.gitignore` should include `/certs/*.pem` (confirmed)
- [x] Certificate rotation runbook exists

### Deployment Security
- [x] SSH key-based auth to droplet (no passwords)
- [x] Docker containers are memory-limited (`mem_limit`)
- [x] No secrets in docker-compose files (all via env vars)
- [x] Minimal exposed ports (80, 443 only)
- [x] No root passwords in source

### Caddy vs Traefik Comparison
| Aspect | Caddy | Traefik |
|--------|-------|---------|
| Auto HTTPS | ✅ Built-in ACME | ✅ Let's Encrypt resolver |
| Origin CA support | ✅ Manual cert path | ✅ Manual cert path |
| Configuration | Static file | Static + Docker labels |
| Memory footprint | ~15 MB | ~25 MB |
| Build simplicity | ✅ Single binary | Requires more labels |

## Findings

| ID | Severity | Finding | Status |
|----|----------|---------|--------|
| A01 | Low | Caddy config uses port 80 → redirect to 443 via Caddyfile implicit behavior | Acceptable |
| A02 | Info | Origin CA certs manually uploaded (no automated rotation) | Runbook exists |
| A03 | Info | No WAF rate limiting at app layer (handled by Cloudflare) | Acceptable |

## Remediation Steps

1. Add `certs/` to `.gitignore` if not already present
2. Schedule quarterly cert verification reminder
3. Add monitoring alert for cert expiry (30 days before)

## Final Verdict

**PASS** — No P0/P1 issues. Caddy + Cloudflare Origin CA configuration is secure and follows chat repo conventions.