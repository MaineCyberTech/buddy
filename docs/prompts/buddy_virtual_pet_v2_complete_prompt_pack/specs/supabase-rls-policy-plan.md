# Supabase RLS Policy Plan

## Principles
- Users can only read/write their own saves.
- Server functions validate rewards.
- Client cannot directly insert rare rewards without validation.
- Guest state is local only until migration.

## Suggested Policies
- `user_id = auth.uid()` for user-owned rows.
- Service role only for audit/reward validation tasks.
- Edge Functions for adventure completion and reward application.
