param(
  [string]$ReleaseBranch = "release/buddy-v2-rc1",
  [string]$Tag = "v0.1.0-buddy-rc1"
)

$ErrorActionPreference = "Stop"

Write-Host "== Create Buddy V2 RC Branch =="
git fetch origin
git checkout dev
git pull origin dev
git checkout -b $ReleaseBranch
git push -u origin $ReleaseBranch
git tag $Tag
git push origin $Tag
Write-Host "Created branch $ReleaseBranch and tag $Tag"
