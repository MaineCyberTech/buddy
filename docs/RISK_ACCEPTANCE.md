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
| Source | `next@15.5.27` pins `"postcss": "8.4.31"` exactly |
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
