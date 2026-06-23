# Database Schema Plan

Suggested tables:

- users
- buddies
- buddy_saves
- inventory_items
- home_customizations
- skills
- adventures
- achievements
- daily_rewards
- save_conflicts
- audit_events

Every user-owned row needs ownership validation and RLS if using Supabase.
