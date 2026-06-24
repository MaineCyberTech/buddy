#!/usr/bin/env bash
set -euo pipefail
echo "Validating infrastructure prompt pack structure..."
required=(
  "prompts/00-master-infrastructure-build-prompt.md"
  "prompts/01-repo-discovery-and-current-state.md"
  "specs/environment-domain-matrix.md"
  "checklists/security-checklist.md"
  "runner/prompt-manifest.json"
)
for path in "${required[@]}"; do
  test -f "$path" || { echo "Missing $path"; exit 1; }
done
echo "Pack structure OK"
