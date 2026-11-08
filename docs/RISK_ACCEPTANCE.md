# Risk acceptance register

Dated, owned records of risks that are knowingly **accepted** rather than fixed.
Reviewed per release and at each stated expiry. An accepted finding is a
deliberate, documented decision - not a closed finding. See also the
accepted/deferred table in [`README.md`](README.md#accepted-and-deferred-risks-final-p2-002).

## RA-001 - nested `postcss@8.4.31` bundled by Next.js (`buddy-DEP-002`) - **CLOSED**

| Field | Value |
|---|---|
| Finding | `buddy-DEP-002` / deterministic `DET-P1-001`, `DET-P2-002`; audit `CI-P1-001`, `SC-P2-001` |
| Package | `postcss@8.4.31` at `node_modules/next/node_modules/postcss` (production) |
| Source | `next@15.5.27` (the version when the finding was recorded) pinned `"postcss": "8.4.31"` exactly |
| CVEs | CVE-2026-45623 (fixed 8.5.12; arbitrary file read via `sourceMappingURL`), CVE-2026-41305 (fixed 8.5.10), CVE-2026-73646 (fixed 8.5.18), CVE-2026-69153 (fixed 8.5.19) |
| Decision | **Fixed (validated npm override)** on 2026-10-05 |
| Owner | dependency owner / maintainer |
| Recorded | 2026-10-04 |
| Closed | 2026-10-05 |
| Re-check commands | `npm ls postcss`, `npm audit`, `npx trivy fs --scanners vuln .` |

### Resolution

The root `package.json` now carries an npm `overrides` entry forcing `postcss`
to `^8.5.28`, so the copy resolved under `next` is the patched 8.5.28 rather than
the vendored 8.4.31:

```json
"overrides": {
  "nanoid": "^3.3.19",
  "postcss": "^8.5.28"
}
```

Validated locally at `4b56fe1` before opening the fix PR:

- `npm ls postcss` -> every copy resolves to `8.5.28`
  (`next -> postcss@8.5.28 deduped`); no
  `node_modules/next/node_modules/postcss` entry remains.
- `npm audit --audit-level=high --omit=dev` -> `found 0 vulnerabilities`
  (the CI `security` job gate is now green).
- `npm audit` -> the `postcss` advisory is gone from the full tree.
- `npm ci --omit=dev` -> postcss 8.5.28 is still installed and resolvable, so
  Next.js's production dependency is preserved.
- Full local gate: `npm ci` (exit 0), `tsc --noEmit` (exit 0), `vitest run`
  (185 passed), `next lint` (no warnings/errors), `next build` (success).

`postcss` 8.5.x is the same major already used by the root project, so the
override keeps Next.js on a supported, patched line while the tracked Next.js
major upgrade (to a line that vendors a patched postcss) proceeds separately.

### Closure criteria (met)

The repository now resolves `postcss` >= 8.5.19 for the copy under `next` via the
validated override above. Re-open if a future Next.js upgrade reintroduces an
unpatched vendored copy; re-check on every Next.js release.

## RA-002 - CSP inline-style residual (`SEC-P2-001`) - **OPEN (accepted residual)**

| Field | Value |
|---|---|
| Finding | `SEC-P2-001` |
| Decision | Accepted residual for the guest-only static build |
| Owner | maintainer |
| Recorded | 2026-11-08 |
| Review trigger | 2027-01-15, any move to dynamic rendering/server mode, or any change to the CSP build step |
| Production policy | `script-src 'self' <hash...>`; `script-src-attr 'none'`; `style-src 'self' <hash...>`; `style-src-attr 'unsafe-inline'` |
| Residual | Inline `style` attributes may execute/apply; inline scripts and inline `<style>` elements require a build-time hash |

### Why the residual exists

- `npm run build` runs `scripts/finalize-csp.mjs` after `next build`. It hashes
  every inline `<script>` and `<style>` in the prerendered HTML and rewrites the
  generated `routes-manifest.json` (plus the standalone copy), so production
  responses no longer contain `'unsafe-inline'` in `script-src` or `style-src`.
- A nonce-based policy would require per-request dynamic rendering. This is an
  offline-first PWA whose pages are statically prerendered and cached by the
  service worker; adding a nonce would either break cached navigation or
  require redesigning the offline cache. Hash-based CSP retains the static
  model.
- Style attributes remain because React renders a few dynamic values as
  `style={{...}}` (`components/ui/StatBars.tsx`,
  `components/hatch/HatchFlow.tsx`, `components/device/LcdDisplay.tsx`) and
  Next's not-found page includes inline style attributes. Removing
  `style-src-attr 'unsafe-inline'` requires moving those values to CSS custom
  properties/classes first; that is tracked as the exit condition, not silently
  accepted.

### Exit criteria

1. Replace the remaining inline `style` props with CSS classes/custom
   properties and drop `style-src-attr 'unsafe-inline'`.
2. If dynamic rendering or a server/account mode is introduced, re-evaluate a
   nonce-based CSP and remove this acceptance.
3. Keep `scripts/finalize-csp.mjs` in the build gate; it fails closed if the
   generated CSP shape changes.

## RA-003 - `zod@3.25.76` high advisory (`SC-P2-004`, `CI-P1-001`) - **TIME-BOXED**

| Field | Value |
|---|---|
| Finding | `SC-P2-004`; blocks the CI audit gate tracked as `CI-P1-001` |
| Package | `zod@3.25.76` (direct production dependency) |
| Advisory | `GHSA-mrhx-c7xc-m3w5` / CVE-2023-54404 (high, memory exhaustion while validating oversized arrays) |
| Fixed version | `zod@4.6.6` (no fixed 3.x release) |
| Decision | Dated exception in [`.audit-exceptions.json`](../.audit-exceptions.json) |
| Owner | maintainer |
| Recorded | 2026-11-08 |
| Expires | **2026-12-15** |
| Exit condition | Migrate `lib/storage/schema.ts` and its tests to zod >=4.6.6, remove the exception entry, and re-run `npm run audit:gate` |

### Rationale

The app is guest-only and local-first; save import is capped at
`MAX_IMPORT_LENGTH` (1 MB) and every array in `gameSaveSchema` has an explicit
`.max()` bound, so the advisory's unbounded-array precondition is not reachable
through the only untrusted input path. The exception is deliberately short-lived:
`scripts/audit-gate.mjs` fails when the entry expires, forcing either the zod 4
migration or a new reviewed decision.
