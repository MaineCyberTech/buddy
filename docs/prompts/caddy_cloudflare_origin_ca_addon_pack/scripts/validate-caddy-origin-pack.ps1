$ErrorActionPreference = "Stop"
Write-Host "Validating Caddy + Cloudflare Origin CA add-on pack..."
$required = @(
  "README.md",
  "prompts/00-master-caddy-cloudflare-origin-prompt.md",
  "specs/caddy-cloudflare-origin-cert-layout.md",
  "templates/Caddyfile.same-domain.cloudflare-origin.example",
  "templates/Caddyfile.subdomain.cloudflare-origin.example",
  "runbooks/cloudflare-origin-cert-rotation.md",
  "checklists/cloudflare-origin-ssl-checklist.md",
  "audits/caddy-route-contract-audit.md"
)
foreach ($path in $required) {
  if (-not (Test-Path $path)) { throw "Missing $path" }
}
Write-Host "Pack structure OK"
