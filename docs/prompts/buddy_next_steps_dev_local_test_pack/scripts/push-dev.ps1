param(
  [string]$CommitMessage = "docs: add Buddy next steps local test and dev push pack",
  [switch]$DirectDevPush
)

$ErrorActionPreference = "Stop"

Write-Host "== Buddy Dev Push Helper =="
Write-Host "Checking git status..."
git status

$currentBranch = git branch --show-current
Write-Host "Current branch: $currentBranch"

Write-Host "Running git diff summary..."
git diff --stat

if ($DirectDevPush) {
  Write-Host "DirectDevPush enabled. Switching to dev and pulling latest..."
  git fetch origin
  git checkout dev
  git pull origin dev
} else {
  Write-Host "DirectDevPush not enabled. Staying on current branch. Push this branch and open PR into dev if branch protection is required."
}

Write-Host "Staging changes..."
git add .

Write-Host "Committing changes..."
git commit -m $CommitMessage

$currentBranch = git branch --show-current
if ($DirectDevPush) {
  Write-Host "Pushing dev..."
  git push origin dev
} else {
  Write-Host "Pushing current branch..."
  git push -u origin $currentBranch
  Write-Host "Open a PR targeting dev."
}

Write-Host "Done."
