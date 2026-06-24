# Caddy WebSocket Requirements

The chat app uses Socket.io. Caddy must preserve WebSocket upgrade behavior for the Socket.io endpoint.

## Required Route

```txt
/socket.io/* -> api:4000
```

or API subdomain equivalent:

```txt
chat-api.<domain>/socket.io/* -> api:4000
```

## Validation

- Browser establishes Socket.io connection.
- No repeated WebSocket upgrade failures in DevTools.
- API logs show expected socket connection events.
- Cloudflare does not block the route.
