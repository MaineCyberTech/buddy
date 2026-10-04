# Risk acceptance register

Dated, owned records of risks that are knowingly **accepted** rather than fixed.
Reviewed per release and at each stated expiry. An accepted finding is a
deliberate, documented decision - not a closed finding. See also the
accepted/deferred table in [`README.md`](README.md#accepted-and-deferred-risks-final-p2-002).

## RA-001 - nested `postcss@8.4.31` bundled by Next.js (`buddy-DEP-002`)

| Field | Value |
|---|---|
| Finding | `buddy-DEP-002` / deterministic `DET-P1-001`, `DET-P2-002` |
| Package | `postcss@8.4.31` at `node_modules/next/node_modules/postcss` (production) |
| Source | `next@15.5.27` pins `"postcss": "8.4.31"` exactly |
| CVEs | CVE-2026-45623 (fixed 8.5.12; arbitrary file read via `sourceMappingURL`), CVE-2026-41305 (fixed 8.5.10), CVE-2026-73646 (fixed 8.5.18), CVE-2026-69153 (fixed 8.5.19) |
| Decision | Accepted (temporary) |
| Owner | dependency owner / maintainer |
| Recorded | 2026-10-04 |
| Expires | 2027-01-04 - re-check monthly and on every Next.js release, whichever is sooner |
| Re-check commands | `npm ls postcss`, `npm audit`, `npx trivy fs --scanners vuln .` |

### Why it is not fixed in this change

- The direct `postcss` dev dependency is already `^8.5.28` (>= 8.5.19) and
  `nanoid` is pinned to `^3.3.19` (>= 3.3.18), so every non-nested copy is
  patched and cannot regress.
- The remaining vulnerable copy is **vendored inside Next.js**: `next@15.5.27`
  pins `postcss@8.4.31` exactly. A root npm `override` can force `8.5.x`, but
  npm then deduplicates postcss into a `dev`-flagged node and diverges from the
  framework's tested production dependency, risking `npm ci --omit=dev`
  dropping a package Next.js expects. A supported fix needs a Next.js major that
  bundles a patched postcss; that upgrade is tracked separately.
- Reachability today is low: the app does not process untrusted CSS and sets
  `images.unoptimized = true`. The exposure is build-time.

### Closure criteria

Close this risk when the repository resolves `postcss` >= 8.5.19 for the copy
under `next` (a Next.js bump, or a validated override), or at the expiry date,
whichever comes first.
