# Security and Economy Authority

For account mode, client state is not authoritative for rare rewards, inventory mutations, cloud saves, or adventure completion.

## Required Controls
- Server validates save envelope.
- Server validates adventure start/complete.
- Server validates inventory use/sell.
- Rate limit reward endpoints.
- Record suspicious state transitions.
- Reject impossible stats, duplicate rewards, replayed adventure completions.
