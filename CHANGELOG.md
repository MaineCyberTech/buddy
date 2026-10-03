# Changelog

All notable changes to `buddy` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project aims to follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

Release documentation and audit reconciliation for the `0.1.0` release candidate.
No gameplay behavior changes.

### Added

- `README.md` - root project/operator documentation (purpose, stack, quick
  start, commands, layout, architecture, testing, docs index).
- `CHANGELOG.md` - this release history.
- `docs/README.md` - documentation index, product vs. vendored prompt-pack
  classification, the reconciled audit status matrix, and the
  accepted/deferred-risk record.

### Notes

- Audit: `repo-deep-dive` run `20261003-0018-master-99abf29` at commit
  `99abf29` found **0 P0** and **11 P1** findings and returned **GO WITH
  CONDITIONS** (not an unconditional GO). See `docs/README.md`.
- Validation evidence for `99abf29` was captured manually; commit-bound CI
  evidence is tracked by the CI and release-process work. The verified-repo
  gate for this documentation change is
  `npm ci && npm run lint && npm run typecheck && npm run test`.

## [0.1.0-rc1] - 2026-06-24

First release candidate (tag `v0.1.0-rc1`, commit `ce70022`). This tag predates
the current `master` line and is not bound to an automated build/attestation.
Later work (save integrity, state correctness, feature wiring, CI, and release
automation) is tracked in the `Unreleased` section and the audit register.

### Added

- Deterministic Buddy generation from a seed (species, personality, appearance,
  stats).
- Hatch flow and the LCD device UI.
- Care loop (feed, play, rest, clean) with stat decay and XP.
- Six-stage lifecycle progression (Egg -> Baby -> Child -> Teen -> Adult ->
  Elder) plus skills and bond tracking.
- Adventure system: 9 locations, stat-checked outcomes, weighted loot tables,
  and a 30+ item catalogue with inventory/coins.
- Offline PWA shell: web manifest, service worker, and IndexedDB persistence.
