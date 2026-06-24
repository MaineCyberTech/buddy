# Cloudflare Origin Routing Modes

## Mode A — Same-Domain Path Routing

Example:

```txt
chat.mainecybertech.us/           -> web:3000
chat.mainecybertech.us/auth/*     -> api:4000
chat.mainecybertech.us/socket.io* -> api:4000
```

Use this if the active repo Caddyfile and frontend environment assume same-domain routing.

## Mode B — App/API Subdomain Routing

Example:

```txt
chat.mainecybertech.us      -> web:3000
chat-api.mainecybertech.us  -> api:4000
chat.mainecybertech.com     -> web:3000
chat-api.mainecybertech.com -> api:4000
```

Use this if the active env vars and GitHub Actions build args point the frontend to the API subdomain.

## Rule

The implementation agent must inspect the active repo before choosing mode. Do not break existing frontend API URL assumptions.
