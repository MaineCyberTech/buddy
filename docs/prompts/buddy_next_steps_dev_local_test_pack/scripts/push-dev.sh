#!/usr/bin/env bash
set -euo pipefail

COMMIT_MESSAGE="${1:-docs: add Buddy next steps local test and dev push pack}"
DIRECT_DEV_PUSH="${DIRECT_DEV_PUSH:-false}"

echo "== Buddy Dev Push Helper =="
git status
CURRENT_BRANCH="$(git branch --show-current)"
echo "Current branch: $CURRENT_BRANCH"
git diff --stat || true

if [ "$DIRECT_DEV_PUSH" = "true" ]; then
  echo "Direct dev push enabled. Switching to dev and pulling latest..."
  git fetch origin
  git checkout dev
  git pull origin dev
else
  echo "Direct dev push not enabled. Staying on current branch. Push branch and open PR into dev if required."
fi

git add .
git commit -m "$COMMIT_MESSAGE"
CURRENT_BRANCH="$(git branch --show-current)"

if [ "$DIRECT_DEV_PUSH" = "true" ]; then
  git push origin dev
else
  git push -u origin "$CURRENT_BRANCH"
  echo "Open a PR targeting dev."
fi
