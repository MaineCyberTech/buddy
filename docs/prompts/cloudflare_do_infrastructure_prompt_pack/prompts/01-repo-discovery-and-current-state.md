# 01 — Repo Discovery and Current State

## Mission

Inspect the repository and document the current application, deployment, infrastructure, and CI/CD state before adding or changing infrastructure.

## Required Inspection

Find and document:

- package manager and workspace layout,
- app/API/worker entrypoints,
- Dockerfiles,
- docker-compose files,
- existing Traefik configs,
- existing cloudflared configs,
- existing Terraform/OpenTofu files,
- GitHub Actions workflows,
- env examples,
- scripts,
- deployment docs,
- existing domain references,
- current dev/prod separation.

## Commands To Run

```bash
git status
find . -maxdepth 4 -type f | grep -Ei "docker|compose|traefik|cloudflare|cloudflared|terraform|tofu|github|workflow|deploy|infra|env|vercel|digitalocean|doctl"
find . -maxdepth 3 -name package.json -o -name pnpm-workspace.yaml -o -name turbo.json
```

PowerShell equivalent:

```powershell
git status
Get-ChildItem -Recurse -File | Where-Object { $_.FullName -match "docker|compose|traefik|cloudflare|cloudflared|terraform|tofu|github|workflow|deploy|infra|env|vercel|digitalocean|doctl" } | Select-Object FullName
Get-ChildItem -Recurse -File -Include package.json,pnpm-workspace.yaml,turbo.json | Select-Object FullName
```

## Required Output

Create:

```txt
docs/infra/reports/01-current-state-discovery.md
```

Include:

- repo structure summary,
- existing infrastructure files,
- detected gaps,
- recommended target folder structure,
- P0/P1 risks before implementation.
