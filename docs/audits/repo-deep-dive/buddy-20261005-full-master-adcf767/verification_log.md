# Verification log

| When | Finding(s) | State | Finding status | Evidence | Note |
|---|---|---|---|---|---|
| 2026-10-05T05:30:00Z | CI-P1-001, SC-P2-001 | draft PR | partially-fixed | https://github.com/MaineCyberTech/buddy/pull/35 | Root npm `overrides.postcss` pin to `^8.5.28` validated at `4b56fe1`; `npm audit --audit-level=high --omit=dev` = 0 vulnerabilities, full local gate green. Verified-fixed only once merged to master. |
| 2026-10-05T05:30:00Z | ARCH-P1-001 | owner-gated | open | docs/README.md (accepted/deferred table) | Acceptance deferred while guest-only. Residual: no server trust boundary; add one before any account/cloud mode. No infra change made. |
| 2026-10-05T05:30:00Z | BP-P1-001 | owner-gated | open | docs/release-process.md (Protected `master` branch) | Proposal recorded; not applied without owner sign-off. Residual: `master` remains directly pushable and unprotected, and no status check/review is required. |
| 2026-10-05T05:30:00Z | BP-P1-002 | owner-gated | open | docs/release-process.md (Release environment) | Proposal recorded; not applied without owner sign-off. Residual: `release.yml` build/publish has no approval gate while the `release` environment is absent. |
