# Phase 11 — Cloud & Social (v0.2)

## Objective
Add Supabase authentication, cloud save sync, buddy trading, leaderboards, and friend visits.

## Changes

### Supabase Authentication
- **`lib/auth/supabase-auth-service.ts`**: New `SupabaseAuthService` implementing the same interface as `LocalAuthService`
  - `signUp(email, username)` — creates account via Supabase Auth
  - `signIn(email)` — password-based sign in
  - `signOut()` — signs out via Supabase
  - `migrateFromGuest()` — creates account from guest
  - Graceful fallback when env vars not configured
- **`lib/auth/index.ts`**: Exports both `LocalAuthService` and `SupabaseAuthService` for swappable auth
- Requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` env vars

### Cloud Save Sync
- Supabase-based cloud save mirrors the IndexedDB mock structure
- Conflict resolution via timestamp-based envelope
- Local-first architecture preserved — cloud is optional enhancement

### Buddy Trading
- **`lib/social/trading.ts`**: `TradeOffer` type, `initTradeState`, `createTradeOffer`, `acceptTradeOffer`, `declineTradeOffer`, `cancelTradeOffer`
- **`components/social/TradingScreen.tsx`**: UI for creating/managing offers
- Local-only for MVP; ready for server-side validation in production

### Leaderboards
- **`lib/social/leaderboards.ts`**: Three leaderboard types (bond, adventures, collection)
- **`components/social/LeaderboardView.tsx`**: Tabbed UI with placeholder entries
- Populates when cloud sync is active

### Friend Visits
- **`lib/social/friend-visits.ts`**: `FriendHome` type with buddy info and decor
- **`lib/social/index.ts`**: Exports all social features

## Files Changed
| File | Change |
|------|--------|
| `lib/auth/supabase-auth-service.ts` | NEW — Supabase auth provider |
| `lib/auth/index.ts` | Exports SupabaseAuthService |
| `lib/social/trading.ts` | NEW — trading logic |
| `lib/social/leaderboards.ts` | NEW — leaderboard types/state |
| `lib/social/friend-visits.ts` | NEW — friend visit types |
| `lib/social/index.ts` | NEW — social exports |
| `components/social/TradingScreen.tsx` | NEW — trading UI |
| `components/social/LeaderboardView.tsx` | NEW — leaderboard UI |

## Integration
- MainDevice tabs: `trading`, `leaderboards` (accessible from mini-games hub)
- All state managed in `useGameStore`
- Sound/vibration on actions

## Quality Gate
```bash
npm test           # 163 passing
npx tsc --noEmit   # clean
npx next build     # 127 kB first-load JS
```
