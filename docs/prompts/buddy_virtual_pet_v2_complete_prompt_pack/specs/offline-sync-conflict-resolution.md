# Offline Sync Conflict Resolution

Use explicit conflict handling:
- compare local save version and cloud save version,
- detect divergent action logs,
- preserve safer/newer state only after validation,
- never silently discard a Buddy,
- allow manual export before resolving conflict.
