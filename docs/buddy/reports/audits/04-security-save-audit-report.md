# Security & Save Audit Report

## Summary
Audited save validation, auth, import/export, inventory mutations, secrets exposure. No secrets exposed. Main concerns: passwordless auth, local-only cloud save, no save integrity checks — all acceptable for local-first MVP stage.

## Files Inspected
- `lib/storage/indexeddb.ts` — 120 lines
- `lib/storage/autosave.ts` — 40 lines
- `lib/auth/` — 4 files, 160 lines
- `components/device/SettingsScreen.tsx` — 154 lines
- `app/page.tsx` — 57 lines

## P0 Findings (Fixed)
- guestId not restored from save (breaks guest detection on reload) — **FIXED**

## P1 Findings
- **No password auth** — email-only sign-in. Acceptable for MVP; Supabase integration will add real auth.
- **"Cloud save" is local** — CloudSaveService uses IndexedDB, not remote. Acceptable for MVP; Supabase phase will add real sync.
- **No save integrity** — no checksum/signature on saves. Acceptable for local-first MVP.
- **Weak entropy** — `Math.random()` for IDs. Acceptable for MVP; use `crypto.randomUUID()` in future.
- **No import confirmation** — imported save silently overwrites. Minor UX gap.

## P2 Findings (Remaining)
- Autosave interval can stack (no mutex)
- No version migration infrastructure
- concurrent IndexedDB access from multiple callers

## Remediation Plan
1. (Future) Integrate Supabase Auth for real password auth
2. (Future) Wire CloudSaveService to Supabase for real cloud sync
3. (Future) Add Zod schema validation for save integrity
4. (Future) Add import confirmation dialog
