#!/usr/bin/env bash
set -euo pipefail
RELEASE_BRANCH="${1:-release/buddy-v2-rc1}"
TAG="${2:-v0.1.0-buddy-rc1}"

echo "== Create Buddy V2 RC Branch =="
git fetch origin
git checkout dev
git pull origin dev
git checkout -b "$RELEASE_BRANCH"
git push -u origin "$RELEASE_BRANCH"
git tag "$TAG"
git push origin "$TAG"
echo "Created branch $RELEASE_BRANCH and tag $TAG"
