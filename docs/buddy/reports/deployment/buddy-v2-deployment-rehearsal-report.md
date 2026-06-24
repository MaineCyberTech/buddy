# Buddy V2 Deployment Rehearsal Report

**Date:** 2026-06-24
**Branch:** `release/buddy-v2-rc1` (8da84dd)
**Tag:** `v0.1.0-rc1`

## Verification Results

| Gate | Result |
|------|--------|
| `npm install` | ✅ |
| `npx next lint` | ✅ 0 warnings |
| `npx tsc --noEmit` | ✅ |
| `npx vitest run` | ✅ 178 tests, 10 files |
| `npx next build` | ✅ |

## Production Build Output

```
Route (app)                      Size     First Load JS
┌ ○ /                            33.3 kB         130 kB
└ ○ /_not-found                  872 B          88.1 kB
+ First Load JS shared by all    87.3 kB
```

## PWA Assets Verified
- `public/manifest.json` — present, correct scope, icons referenced
- `public/sw.js` — v2, cache-first + network-first strategy
- `public/icons/` — SVG + 192/512 PNG icons
- `InstallPrompt` component — handles beforeinstallprompt event
- `UpdatePrompt` component — SW update detection

## Environment Variables Required
| Variable | Purpose | Required |
|----------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | No (optional — auth falls back to LocalAuthService) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | No (optional) |

No other env vars required. App functions fully offline without Supabase.

## Secrets Exposure Check
- No API keys in source code
- No hardcoded credentials
- Supabase config is optional env-var-based only
- CSP and security headers recommended at deployment layer

## Deployment Risks
| Risk | Likelihood | Mitigation |
|------|------------|------------|
| **P0**: None | — | — |
| **P1**: None | — | — |
| IndexedDB schema migration (v2 → v3) | Low | DB upgrade handles old versions gracefully |
| Service worker v2 update caches | Low | UpdatePrompt notifies users |
| Static generation may not reflect dynamic content | Low | All dynamic content is client-side after hydration |

## Rollback Notes
- Rollback: `git checkout <previous-tag>` and redeploy
- IndexedDB data is client-side only — no server data loss risk
- Service worker cache clears on version change
- Previous SW version serves stale content during transition

## Environment Requirements
- Node.js ≥ 18
- npm ≥ 9
- Any static hosting (Vercel, Cloudflare Pages, Netlify, self-hosted)
- No database required for offline/local-only mode
- Supabase project optional for cloud features

## Recommendation

**DEPLOYMENT READY** ✅

This release candidate passes all gates. No blocking issues found. Supabase integration is optional and gracefully falls back. Recommend promoting to production after manual browser QA of 3 items (existing save load, new guest hatch, visual hatch flow).