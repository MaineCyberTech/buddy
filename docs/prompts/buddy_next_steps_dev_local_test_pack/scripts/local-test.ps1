param(
  [ValidateSet("pnpm", "npm", "yarn")]
  [string]$PackageManager = "pnpm",
  [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"

Write-Host "== Buddy Local Test Helper =="

if (-not $SkipInstall) {
  if ($PackageManager -eq "pnpm") { pnpm install }
  elseif ($PackageManager -eq "npm") { npm install }
  elseif ($PackageManager -eq "yarn") { yarn install }
}

if ($PackageManager -eq "pnpm") {
  pnpm lint
  pnpm typecheck
  pnpm test
  pnpm build
  pnpm dev
} elseif ($PackageManager -eq "npm") {
  npm run lint
  npm run typecheck
  npm test
  npm run build
  npm run dev
} elseif ($PackageManager -eq "yarn") {
  yarn lint
  yarn typecheck
  yarn test
  yarn build
  yarn dev
}
