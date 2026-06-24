# Phase 09 Completion Report — Auth, Account Gating, Cloud Save

## Summary
Implemented auth abstraction layer with local mock provider, account creation/sign-in flow, guest-to-account migration, cloud save interface, conflict resolution, account gated UI enforcement, and settings screen.

## Files Created
- `lib/auth/types.ts` — AuthUser, AuthState, CloudSaveEnvelope, SyncResult types
- `lib/auth/local-auth-service.ts` — Local auth provider (localStorage-based, Supabase-ready interface)
- `lib/auth/cloud-save-service.ts` — Cloud save interface (IndexedDB-based mock, Supabase-ready)
- `lib/auth/migration.ts` — Guest→account migration (preserves buddy, inventory, placedDecor)
- `lib/auth/index.ts` — Re-exports
- `lib/auth/auth.test.ts` — 12 tests for auth, cloud save, conflict resolution
- `components/device/AccountPrompt.tsx` — Account prompt overlay (benefits, sign up, sign in, guest)
- `components/device/SettingsScreen.tsx` — Settings screen (account info, export/import, sign out)

## Files Modified
- `lib/buddy/screens.ts` — Added `'settings'` to GameScreen
- `components/device/MainDevice.tsx` — Added SETTINGS tab + SettingsScreen render + AccountPrompt overlay

## Features Implemented
- **Auth abstraction**: `LocalAuthService` with `signUp`, `signIn`, `signOut`, `getStatus`, `isGuest` — swapable for Supabase
- **Guest/account state**: Tracks auth status (`guest` | `authenticated`) via localStorage persistence
- **Account prompt**: Modal with benefits list, sign-up form (email + username), sign-in form, continue-as-guest
- **Guest→account migration**: Preserves buddy, inventory, and placedDecor on account creation
- **Cloud save interface**: `CloudSaveService.upload/download/getEnvelope/resolveConflict` — IndexedDB-based mock
- **Conflict resolution**: Version-based detection (`ok` / `conflict` / `error`)
- **Settings screen**: Account info display, create account / sign out, export/import save, guest ID display
- **Account gating**: Locked home decor slots, SETTINGS tab with account management

## Tests Added
- `lib/auth/auth.test.ts` — 12 tests: guest status, sign up, double sign-up prevention, sign out, sign in (correct/wrong email), cloud save upload/download, unknown user, envelope metadata, conflict resolution (newer local, newer cloud, missing timestamps)

## Commands Run
- `npx tsc --noEmit` — ✓ clean
- `npx vitest run` — ✓ 147 passed (8 files, +12 tests)
- `npx next build` — ✓ 118 kB first-load JS

## Results
| Check | Status |
|-------|--------|
| Typecheck | ✓ |
| Tests (147) | ✓ 8 files |
| Build (118 kB) | ✓ |

## P0/P1/P2/P3 Issues
- None introduced

## Remaining Work
- Real Supabase provider (replace `LocalAuthService` with Supabase Auth)
- Cloud sync on save (push to Supabase when online)
- Offline action queue for account users
- `POST /api/buddy/migrate-guest` API endpoint
- `POST /api/sync/resolve-conflict` API endpoint
- Server-authoritative adventure validation for account mode
