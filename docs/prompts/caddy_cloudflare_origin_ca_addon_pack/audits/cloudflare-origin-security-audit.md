# Cloudflare Origin Security Audit

## Mission

Audit Caddy + Cloudflare Origin CA for TLS, secret handling, and deployment safety.

## Required Checks

- [ ] No cert/key files committed.
- [ ] `.gitignore` protects expected cert files.
- [ ] Key file permissions are restricted.
- [ ] Caddy cert mount is read-only.
- [ ] GitHub Actions do not leak cert material.
- [ ] Cloudflare Full Strict mode documented.
- [ ] Caddy admin API not exposed.
- [ ] Docker socket not exposed.
- [ ] Only required ports exposed.
- [ ] Rollback is documented.

## Output

```txt
docs/infra/reports/caddy-origin/cloudflare-origin-security-audit.md
```
