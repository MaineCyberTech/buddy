# Release and versioning process

This document records how a `buddy` release is cut and how its artifacts are bound
to the commit they were built from. It closes audit finding `FINAL-P1-001` ("No
release/versioning process binds artifacts to a commit") by providing the
tag-driven release process the finding recommends: build + test + SBOM + changelog
+ build id, with build-provenance attestation.

Before this change, releases were manual tags with no automated build/test, no
SBOM, no changelog, and no runtime build id, so a shipped artifact could not be
traced back to the commit it came from.

## Process

Every release is cut from a **tag** matching `v*` (for example `v0.1.0-rc2`). The
tag is the single source of truth for "what was released".

Publishing a tag triggers `.github/workflows/release.yml`, which, at the tagged
commit:

1. installs dependencies (`npm ci`);
2. runs the full quality gate: `npm run lint`, `npm run typecheck`, `npm run test`,
   `npm run build`;
3. records the **build id** — the full commit SHA (`git rev-parse HEAD`) — plus the
   tag name;
4. generates an **SBOM** (`npm sbom --sbom-format cyclonedx`, Software Bill of
   Materials) for the dependency set that was built;
5. generates a **changelog** (`CHANGELOG-RELEASE.md`) whose header records the
   build id and whose body lists the commits since the previous tag;
6. packages the build and the SBOM/changelog into `buddy-<tag>.tar.gz`;
7. attests the artifact's build provenance
   (`actions/attest-build-provenance`) so the artifact can be verified as produced
   by this workflow from this commit;
8. publishes a GitHub Release carrying the artifact, the SBOM, and the changelog.

Because the tag points at an immutable commit and the workflow only runs on tags,
the release notes, SBOM, changelog, and artifact all carry the same build id. Any
one of them can be used to identify the exact commit under release.

## Verifying an artifact's commit

To check which commit a release came from:

- the release notes record `Commit: <full-sha>`;
- read the tag's commit directly: `git rev-parse '<tag>^{commit}'`;
- compare against the run that published it:
  `gh run list --workflow release.yml`.

If those do not agree, the release is not trustworthy and should not be used.

## Cutting a release

```sh
git switch master
git pull
git tag -a v0.1.0-rc2 -m "buddy v0.1.0-rc2"
git push origin v0.1.0-rc2
```

Watch the `Release` workflow run; a red run blocks the release. Once it is green,
the GitHub Release is published with the artifact, SBOM, and changelog.

## Rollback

- To withdraw a release, delete the GitHub Release and the tag
  (`git push origin :refs/tags/<tag>`); do not retag the same version.
- To fix a shipped release, cut a new patch tag from the corrected commit.

## Release governance and protection (buddy-CI-002)

The workflow above is only as trustworthy as the controls around it. Repository
settings are not stored in git, so they cannot be reviewed from a clone or enforced
by a pull request; this section records the required configuration so it can be
applied and audited. The `environment: release` key is code (see
`.github/workflows/release.yml`); everything else is a GitHub setting.

### Release environment (required reviewers)

The `release` job uses the `release` GitHub Environment. Configure it with:

1. Settings -> Environments -> New environment -> name it `release`.
2. Add the release owner(s) under **Required reviewers**.
3. Under **Deployment branches and tags**, restrict to selected tags matching `v*`
   so only release tags can target the environment.
4. Do not store long-lived credentials on the environment; the workflow uses the
   short-lived `GITHUB_TOKEN`/OIDC only.

With required reviewers set, a `v*` tag push starts the run but the job waits for
approval before the build/publish steps execute. A release cannot be published by a
stolen write token alone.

### Protected version tags

Create a repository ruleset (Settings -> Rules -> Rulesets -> New tag ruleset) that
targets tags matching `v*` and:

- restricts tag **creation** to release maintainers;
- blocks tag **deletion** and **force-push** (tags are immutable release anchors).

### Protected `master` branch

Create a branch ruleset (or classic branch protection) for `master` that:

- requires a pull request before merging;
- requires the `CI` status check to pass (`.github/workflows/ci.yml`);
- requires review from the owner(s) in `.github/CODEOWNERS`;
- disallows force pushes and branch deletion.

`.github/CODEOWNERS` only *requests* review by default; automatic review and merge
blocking require the "Require review from Code Owners" and "Require a pull request
before merging" settings above.

### Verifying the controls

- Tag a throwaway commit from a non-maintainer account: the run must not publish
  until a required reviewer approves.
- Confirm `master` rejects a direct push and a pull request missing the `CI` check.

## Scope and relationship to the audit

The `repo-deep-dive` audit of `20261003-0018` (commit `99abf29`) found no release
automation and no runtime build id (`FINAL-P1-001`, P1; also `SUPPLY-P2-002`,
`OBS-P3-001`). This process addresses the release-integrity part. It does not by
itself close the other P1 governance items (`CI-P1-001`, `CI-P1-002`): the release
workflow is tag-driven and does not replace a required-checks CI gate on pull
requests.
