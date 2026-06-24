# 05 — Cloudflare DNS, Security, and Tunnels

## Mission

Create Cloudflare infrastructure files for DNS, proxying, TLS posture, optional Tunnel, optional Access policy, and environment routing.

## Target DNS

Dev:
- chat.mainecybertech.us
- chat-api.mainecybertech.us

Production:
- chat.mainecybertech.com
- chat-api.mainecybertech.com

## Supported Routing Modes

### Mode A — Cloudflare DNS + Traefik on Droplet

- Cloudflare A/CNAME records point to DigitalOcean reserved IP.
- Traefik routes app/API on the droplet.
- Cloudflare proxy enabled where appropriate.

### Mode B — Cloudflare Tunnel + Internal Services

- cloudflared runs on droplet.
- Public hostnames route to local services.
- Inbound app/API ports can remain closed.

## Required Security Controls

- DNS records by environment.
- SSL/TLS settings documented.
- Optional WAF/rate limiting placeholders.
- Optional Access policy placeholders for admin/internal endpoints.
- Cloudflare token permission manifest.
