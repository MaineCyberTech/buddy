# Caddy WebSocket Checklist

- [ ] `/socket.io` route proxies to API service.
- [ ] WebSocket upgrade works in browser DevTools.
- [ ] No repeated failed polling/upgrade loop.
- [ ] Caddy logs do not show route mismatch.
- [ ] API logs show socket connection.
- [ ] Cloudflare proxy does not block WebSocket route.
- [ ] Route behavior is tested in dev and prod.
