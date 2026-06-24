$ErrorActionPreference = "Stop"
Write-Host "Validating infrastructure prompt pack structure..."
$required = @(
  "prompts/00-master-infrastructure-build-prompt.md",
  "prompts/01-repo-discovery-and-current-state.md",
  "specs/environment-domain-matrix.md",
  "checklists/security-checklist.md",
  "runner/prompt-manifest.json"
)
foreach ($path in $required) {
  if (-not (Test-Path $path)) { throw "Missing $path" }
}
Write-Host "Pack structure OK"
