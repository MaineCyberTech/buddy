# Cloudflare Origin CA Certificates

This directory is for documentation and example placeholders only.

Do not commit real Cloudflare Origin CA certificates or private keys.

Runtime cert files live on the droplet:

```txt
/opt/chat/certs/cloudflare-origin.pem
/opt/chat/certs/cloudflare-origin-key.pem
```

Caddy container mount paths:

```txt
/certs/cloudflare-origin.pem
/certs/cloudflare-origin-key.pem
```
