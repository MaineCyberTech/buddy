#!/usr/bin/env bash
set -euo pipefail

PM="${1:-pnpm}"
SKIP_INSTALL="${SKIP_INSTALL:-false}"

echo "== Buddy Local Test Helper =="

if [ "$SKIP_INSTALL" != "true" ]; then
  if [ "$PM" = "pnpm" ]; then pnpm install; fi
  if [ "$PM" = "npm" ]; then npm install; fi
  if [ "$PM" = "yarn" ]; then yarn install; fi
fi

if [ "$PM" = "pnpm" ]; then
  pnpm lint
  pnpm typecheck
  pnpm test
  pnpm build
  pnpm dev
elif [ "$PM" = "npm" ]; then
  npm run lint
  npm run typecheck
  npm test
  npm run build
  npm run dev
elif [ "$PM" = "yarn" ]; then
  yarn lint
  yarn typecheck
  yarn test
  yarn build
  yarn dev
else
  echo "Unsupported package manager: $PM"
  exit 1
fi
