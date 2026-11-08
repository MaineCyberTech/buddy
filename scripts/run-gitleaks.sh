#!/usr/bin/env bash
# Run the pinned, checksum-verified gitleaks scanner against the checkout.
#
# Shared by the CI security job and the release workflow so the secret gate
# cannot drift between the two. The scanner is downloaded to a temporary
# directory and removed afterwards; nothing is written into the repository.
set -euo pipefail

version="${GITLEAKS_VERSION:-8.30.1}"
sha256="${GITLEAKS_SHA256:-551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb}"
platform="${GITLEAKS_PLATFORM:-linux_x64}"
source_path="${GITLEAKS_SOURCE:-.}"

tmpdir="$(mktemp -d)"
trap 'rm -rf "${tmpdir}"' EXIT

archive="gitleaks_${version}_${platform}.tar.gz"
curl -sSfL -o "${tmpdir}/gitleaks.tar.gz" \
  "https://github.com/gitleaks/gitleaks/releases/download/v${version}/${archive}"
echo "${sha256}  ${tmpdir}/gitleaks.tar.gz" | sha256sum -c -
tar -xzf "${tmpdir}/gitleaks.tar.gz" -C "${tmpdir}" gitleaks
"${tmpdir}/gitleaks" detect --source "${source_path}" --redact --verbose "$@"
