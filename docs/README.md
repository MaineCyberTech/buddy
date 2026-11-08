# Documentation

Project documentation for `buddy`, a mobile-first, offline-capable PWA virtual
pet game. This page is the entry point for the `docs/` tree: it indexes the
documentation, classifies what is product material versus vendored planning
material, and reconciles the phase reports with the `repo-deep-dive` audit.

## Contents

| Path | Description |
|---|---|
| [`buddy/reports/phases/`](buddy/reports/phases/) | Phase completion reports and phase audits (12 files). |
| [`prompts/buddy_virtual_pet_v2_complete_prompt_pack/`](prompts/buddy_virtual_pet_v2_complete_prompt_pack/) | Vendored planning/prompt pack. See provenance below. |
| `../README.md` | Root project/operator README (purpose, setup, commands, architecture). |
| `../CHANGELOG.md` | Release history. |
| `release-readiness.md` | Release gate policy and current verdict (companion doc, added by the release-readiness patch set). |
| `release-process.md` | Tag-driven release/versioning process (companion doc, added by the release-process patch set). |

## Prompt pack provenance

`docs/prompts/buddy_virtual_pet_v2_complete_prompt_pack/` is a large planning
and prompt pack (markdown files across `prompts/`, `specs/`, `content/`, `ux/`,
`integration/`, `audits/`, `checklists/`, `templates/`, and `runner/`)
committed alongside the application.

- **Role:** planning/specification material only; it contains no runnable
  product code.
- **Authorship / ownership:** not recorded in-repo and therefore **unconfirmed**
  (finding `SUPPLY-P2-003`). It must not be assumed to be third-party or
  in-house until the maintainer/legal owner confirms it.
- **Licensing:** unconfirmed. Treat as all-rights-reserved pending confirmation;
  do not redistribute the pack outside the organization.
- **Originality constraint:** the pack's own `README.md` states that Tamaweb,
  Tamagotchi, and other copyrighted/proprietary projects must not be copied, and
  the application code must be original.

## Product vs. planning material

| Kind | Location | Meaning |
|---|---|---|
| Product docs | root `README.md`, `CHANGELOG.md`, this page, `buddy/reports/phases/` | Describe what the shipped application actually does. |
| Planning material | `prompts/buddy_virtual_pet_v2_complete_prompt_pack/` | Design/spec prompts; not a description of shipped behavior. |

When the two disagree, the product code under `app/`, `components/`, `lib/`,
and `data/` is authoritative.

## Audit reconciliation (FINAL-P2-001)

> **Current run:** the latest full pass is
> `buddy-20261108-verify-master-9e3b015` against master `9e3b015`
> (4 P1 / 11 P2 / 18 P3). The matrix below is the historical reconciliation at
> `99abf29`; it is retained for context and the rows that have since changed are
> marked. The corresponding remediation pass addresses the G2 findings from
> that run.

The audited commit is `99abf29`, run `20261003-0018-master-99abf29`. Several
phase completion reports self-report **"P0/P1/P2/P3 Issues: None"** (for example
`buddy/reports/phases/phase-05-completion-report.md`), which contradicts the
audit's finding of **0 P0 / 11 P1**. This page is the addendum: the matrix below
records the delta so a reader does not over-trust the phase reports.

| Area | Phase report claim | Audit finding at `99abf29` | Status |
|---|---|---|---|
| Test/build evidence | "109/109 tests pass", "Build succeeded" (manual, unbound) | Test count supported; no commit-bound artifact (`EXEC-P2-001`) | open - see CI/release work |
| Achievements | Listed as remaining work, no P1 reported | `FEAT-P1-001` achievements implemented but unwired | verified-fixed @ `9e3b015` (`lib/actions/care.ts`, `lib/locations/adventure.ts` wire progression, skills, evolution, and achievements) |
| Evolution/skills | Implemented, no P1 reported | `FEAT-P1-002` evolution/skills unwired | verified-fixed @ `9e3b015` (same care/adventure progression paths) |
| Save version | Not reported | `DATA-P1-001` loadGame downgrades saves to v1 | verified-fixed @ `162a06d` (`SAVE_VERSION`/`MIGRATIONS` in `lib/storage/schema.ts`) |
| Save validation | Not reported | `DATA-P1-002` / `SEC-P2-001` no runtime save validation | verified-fixed @ `162a06d` (`validateSave` in `lib/storage/schema.ts`, called by `loadGame`/`importSave` in `lib/storage/indexeddb.ts`; tests in `lib/storage/schema.test.ts`) |
| Device/adventure state | Not reported | `ARCH-P1-002` adventure updates store but not device UI | open (tracked) |
| CI / governance | Not reported | `CI-P1-001` / `CI-P1-002` no CI or required checks | CI and release workflows exist; required rulesets/environments remain open (`BP-P1-001`, `BP-P1-002`) |
| License | Not reported | `SUPPLY-P1-001` no LICENSE (rights undefined) | verified-fixed: proprietary all-rights-reserved `LICENSE` and `NOTICE` |
| Release binding | Not reported | `FINAL-P1-001` releases not bound to a commit | open (tracked) |

Phase reports are historical artifacts and are left as written; this matrix is
the reconciliation. Audit statuses are authoritative until a finding is closed
with evidence bound to the commit under release.

## Accepted and deferred risks (FINAL-P2-002)

This table is the in-repo record of risks that are knowingly **accepted or
deferred**, with an owner and a date, so unresolved items are not silently
ignored. It is reviewed per release.

| Risk / finding | Severity | Decision | Owner | Date | Rationale |
|---|---|---|---|---|---|
| `ARCH-P1-001` client-authoritative, no server trust boundary | P1 | Deferred | maintainer | 2026-10-03 | Guest-only, local-first app with no server, accounts, or remote data. Must be revisited before any account/cloud mode. |
| `FINAL-P1-001` releases not bound to a commit | P1 | Deferred | maintainer | 2026-10-03 | Release automation is tracked by the release-process work; the current `v0.1.0-rc1` is a pre-`master` RC, not a bound release. |
| `SUPPLY-P1-001` target license not chosen | P1 | Deferred (current: proprietary) | maintainer / legal | 2026-10-03 | Open-source vs. proprietary remains a product/legal decision; the repository is explicitly all-rights-reserved under `LICENSE`/`NOTICE` until a different grant is chosen. |
| `EXEC-P2-001` validation evidence manual / unbound | P2 | Accepted for RC | maintainer | 2026-10-03 | The RC is guest/local; commit-bound CI evidence arrives with the CI/release work. |

Accepted/deferred is a deliberate, documented decision - not a claim that the
risk is closed. A finding moves to `verified-fixed` only with an artifact
captured at the current commit.

Supply-chain exceptions that carry an explicit expiry and CVE list are recorded
separately in [`RISK_ACCEPTANCE.md`](RISK_ACCEPTANCE.md). `RA-001` (the
Next.js-vendored `postcss@8.4.31`) is now **closed** via a validated npm
`overrides.postcss` pin to the patched 8.5.x line. `RA-002` records the
hash-based CSP residual (inline style attributes) and `RA-003` records the
time-boxed `zod@3.25.76` audit exception (expires 2026-12-15).

## Licensing

The repository is proprietary and all rights are reserved; the `LICENSE` file
records that status and `NOTICE` records the associated restrictions. No
open-source license has been granted. The target-license decision remains a
product/legal choice, but the current rights position is explicit. See also the
root `NOTICE`.

This classification originated with audit run `20261003-0018-master-99abf29`;
the current full pass is `buddy-20261108-verify-master-9e3b015`.
