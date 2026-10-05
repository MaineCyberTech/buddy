# Focused security / supply-chain / CI deep-dive - buddy

## Findings

| ID | Severity | Title | Report |
|---|---|---|---|
| ARCH-P1-001 | P1 | Client is fully authoritative: no server trust boundary exists | lens_focused_security_supply_chain_ci.md |
| BP-P1-001 | P1 | master is unprotected: no required PR, review, or status checks | lens_focused_security_supply_chain_ci.md |
| BP-P1-002 | P1 | The `release` environment required by release.yml does not exist | lens_focused_security_supply_chain_ci.md |
| CI-P1-001 | P1 | CI is failing on master at the audited commit | lens_focused_security_supply_chain_ci.md |
| ARCH-P2-001 | P2 | Inventory item actions mutate the store but are never persisted | lens_focused_security_supply_chain_ci.md |
| CI-P2-001 | P2 | dependency-review job is skipped because the dependency graph / Dependabot is disabled | lens_focused_security_supply_chain_ci.md |
| DATA-P2-001 | P2 | Inventory item actions are not written to the save | lens_focused_security_supply_chain_ci.md |
| DOC-P2-001 | P2 | README states the stack is Next.js 14 but the repo is Next.js 15.5.27 | lens_focused_security_supply_chain_ci.md |
| DOC-P2-002 | P2 | README 'Known gaps' and testing sections contradict the current code/tests | lens_focused_security_supply_chain_ci.md |
| DR-P2-001 | P2 | No backup/restore drill and no committed evidence of one | lens_focused_security_supply_chain_ci.md |
| FILE-P2-001 | P2 | Save export uses btoa and can throw on non-Latin-1 content | lens_focused_security_supply_chain_ci.md |
| SC-P2-001 | P2 | High-severity postcss advisory remains in the production dependency tree (accepted) | lens_focused_security_supply_chain_ci.md |
| SC-P2-002 | P2 | Repository secret-scanning and Dependabot security updates are disabled | lens_focused_security_supply_chain_ci.md |
| SC-P2-003 | P2 | Vendored prompt pack authorship and licensing are unconfirmed | lens_focused_security_supply_chain_ci.md |
| SEC-P2-001 | P2 | CSP allows 'unsafe-inline' scripts and styles | lens_focused_security_supply_chain_ci.md |
| USE-P2-001 | P2 | Inventory actions are lost on reload (persistence gap visible to the player) | lens_focused_security_supply_chain_ci.md |
| UX-P2-001 | P2 | Pinch-zoom is disabled (viewport maximumScale=1, userScalable=false) | lens_focused_security_supply_chain_ci.md |
| ARCH-P3-001 | P3 | AdventureScreen mutates a state object in place instead of returning a new one | lens_focused_security_supply_chain_ci.md |
| CHAIN-P3-001 | P3 | Exploit-chain surface is limited to save import; residual risk is client respawn | lens_focused_security_supply_chain_ci.md |
| CI-P3-001 | P3 | `next lint` is deprecated and will be removed in Next.js 16 | lens_focused_security_supply_chain_ci.md |
| DATA-P3-001 | P3 | applyAdventureResult mutates item objects shared with the input inventory | lens_focused_security_supply_chain_ci.md |
| DET-P3-001 | P3 | [SEC] gitleaks not installed (secret scan skipped) | lens_focused_security_supply_chain_ci.md |
| DOC-P3-001 | P3 | README quality-gate command omits the build step used by CI | lens_focused_security_supply_chain_ci.md |
| EVOL-P3-001 | P3 | No feature-flag or plugin boundary for content/feature evolution | lens_focused_security_supply_chain_ci.md |
| HYGIENE-P3-001 | P3 | Vendored prompt pack dominates the repository tree | lens_focused_security_supply_chain_ci.md |
| HYGIENE-P3-002 | P3 | No .editorconfig; line/format policy is split across tools | lens_focused_security_supply_chain_ci.md |
| INFRA-P3-001 | P3 | Documented release/CI controls drift from the live repository configuration | lens_focused_security_supply_chain_ci.md |
| IR-P3-001 | P3 | No incident-response runbook or tabletop exercise recorded | lens_focused_security_supply_chain_ci.md |
| MOB-P3-001 | P3 | Manifest relies on SVG icons flagged maskable; no PNG/apple-touch fallback | lens_focused_security_supply_chain_ci.md |
| MOB-P3-002 | P3 | Service worker caches all runtime responses without a storage budget | lens_focused_security_supply_chain_ci.md |
| OBS-P3-001 | P3 | Client errors are only logged locally; no production error sink is wired | lens_focused_security_supply_chain_ci.md |
| PERF-P3-001 | P3 | Install-prompt detection polls on a 1s interval | lens_focused_security_supply_chain_ci.md |
| PRIV-P3-001 | P3 | No in-app privacy notice or data-management surface | lens_focused_security_supply_chain_ci.md |
| RES-P3-001 | P3 | Service worker caches every successful same-origin GET with no bound or eviction policy | lens_focused_security_supply_chain_ci.md |
| RES-P3-002 | P3 | No automated backup of the browser-local save | lens_focused_security_supply_chain_ci.md |
| SBOM-P3-001 | P3 | No license policy and no committed SBOM artifact | lens_focused_security_supply_chain_ci.md |
| SC-P3-001 | P3 | gitleaks runs with the default ruleset; no reviewed allowlist file in-repo | lens_focused_security_supply_chain_ci.md |
| SEC-P3-001 | P3 | Guest id falls back to Math.random in non-secure contexts | lens_focused_security_supply_chain_ci.md |
| TEST-P3-001 | P3 | Coverage scope excludes components/ and app/; no E2E or accessibility automation | lens_focused_security_supply_chain_ci.md |
| USE-P3-001 | P3 | Selling an item has no confirmation step | lens_focused_security_supply_chain_ci.md |
| UX-P3-001 | P3 | Install prompt and offline banner can overlay content | lens_focused_security_supply_chain_ci.md |

---

# Full-domain deep-dive — buddy @ adcf767

A full-domain (all 43 master-runner prompts + deterministic lens) audit of
`MaineCyberTech/buddy` at `master` `adcf76700218fff58122cf2037f65f60adcbaca9`, run
`buddy-20261005-full-master-adcf767`. Client-only Next.js PWA: no server, routes,
database, or runtime third-party calls.

## Verdict

**GO WITH CONDITIONS** — 0 P0, 4 P1, 13 P2, 24 P3.

## What was verified (deterministic, on the lab)

Lab `ci-runner` at `/var/lib/lab-repos/buddy` @ `adcf767`:

- `npm ci` — exit 0
- `npm run typecheck` (`tsc --noEmit`) — exit 0
- `npm run test` (`vitest run`) — 185/185 passed (19 files)
- `npm run lint` (`next lint`) — exit 0
- `npm run build` — exit 0 (Next.js 15.5.27)
- `npm audit --omit=dev` — exit 1 (1 high, 1 moderate: nested postcss)
- `gh` API checks: `master` unprotected; no rulesets; `release` environment absent;
  secret scanning and Dependabot security updates disabled; CI security job red on master.

## Top risks

| ID | Sev | Title |
|---|---|---|
| ARCH-P1-001 | P1 | Client is fully authoritative: no server trust boundary (deferred, guest-only) |
| BP-P1-001 | P1 | master is unprotected: no required PR, review, or status checks |
| BP-P1-002 | P1 | The `release` environment required by release.yml does not exist |
| CI-P1-001 | P1 | CI is failing on master (security job: npm audit) |
| SC-P2-001 | P2 | High nested postcss advisory in production deps (accepted RA-001) |
| SC-P2-002 | P2 | Secret scanning / Dependabot security updates / push protection disabled |
| DATA-P2-001 | P2 | Inventory item actions are not persisted |
| FILE-P2-001 | P2 | Save export uses btoa and fails on non-Latin-1 content |
| UX-P2-001 | P2 | Pinch-zoom disabled (WCAG 1.4.4) |
| DR-P2-001 | P2 | No backup/restore drill for the browser-local save |
| DOC-P2-001 | P2 | README says Next.js 14; repo is Next.js 15.5.27 |
| USE-P2-001 | P2 | Inventory actions lost on reload |

## Domains covered

All 43 prompts in `MASTER_RUNNER_FULL_HARDENING.md` plus the deterministic lens. Domains
that are genuinely **not applicable** for a guest-only, serverless PWA (access-control
matrix, multi-tenancy, admin console, API contracts, webhooks, billing, notifications,
search, Supabase RLS, containers, secret rotation, analytics, AI) are recorded as
"not applicable / future readiness" with evidence rather than forced findings; see the
per-domain reports in the portable pack run `runs/buddy-20261005-full-master-adcf767/`.

## Recommended patch set

1. Persist inventory item actions (`DATA-P2-001` / `USE-P2-001`).
2. Unicode-safe save export/import (`FILE-P2-001`).
3. Allow pinch-zoom (`UX-P2-001`).
4. Correct README stack/testing/known-gaps text (`DOC-P2-001`, `DOC-P2-002`).
5. Resolve or formally register the nested postcss CI failure (`CI-P1-001`, `SC-P2-001`).
6. Enable master protection + `release` environment + Dependabot security updates + secret
   scanning (`BP-P1-001`, `BP-P1-002`, `SC-P2-002`).

## Reconciliation

This run records a delta against the prior `20261003-0018-master-99abf29` audit. It neither
grants nor revokes any existing verdict. Machine register: `findings.json`.
