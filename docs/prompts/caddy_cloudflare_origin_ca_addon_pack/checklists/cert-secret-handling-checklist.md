# Cert Secret Handling Checklist

- [ ] Real `.pem` and key files are ignored by Git.
- [ ] Origin private key is never printed in logs.
- [ ] Origin private key is never uploaded as artifact.
- [ ] GitHub Secrets are used only if automated transfer is required.
- [ ] Base64 secret values are masked.
- [ ] Key written with `chmod 600`.
- [ ] Cert written with `chmod 644`.
- [ ] Caddy mount is read-only.
- [ ] Rotation and rollback are documented.
