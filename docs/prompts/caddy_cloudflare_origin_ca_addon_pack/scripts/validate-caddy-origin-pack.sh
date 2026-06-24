#!/usr/bin/env bash
set -euo pipefail
echo "Validating Caddy + Cloudflare Origin CA add-on pack..."
required=(
  "README.md"
  "prompts/00-master-caddy-cloudflare-origin-prompt.md"
  "specs/caddy-cloudflare-origin-cert-layout.md"
  "templates/Caddyfile.same-domain.cloudflare-origin.example"
  "templates/Caddyfile.subdomain.cloudflare-origin.example"
  "runbooks/cloudflare-origin-cert-rotation.md"
  "checklists/cloudflare-origin-ssl-checklist.md"
  "audits/caddy-route-contract-audit.md"
)
for path in "${required[@]}"; do
  test -f "$path" || { echo "Missing $path"; exit 1; }
done
echo "Pack structure OK"
