# API Contracts

Suggested endpoints:

```txt
GET /api/save
POST /api/save
POST /api/adventure/start
POST /api/adventure/complete
POST /api/inventory/use
POST /api/inventory/sell
POST /api/home/update
POST /api/buddy/migrate-guest
POST /api/sync/resolve-conflict
```

All account-mode mutation endpoints must validate ownership and payloads.
