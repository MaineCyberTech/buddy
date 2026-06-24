# 01 — Current State Validation

Run this immediately after the V2 Buddy implementation pass.

## 1. Check Git State

```bash
git status
git diff --stat
```

PowerShell:

```powershell
git status
git diff --stat
```

## 2. Confirm Buddy Files Were Created

Bash:

```bash
find . -maxdepth 6 -type f | grep -Ei "buddy|pet|pwa|manifest|service-worker|generation|species|rarity|stats|personality|inventory|location|adventure"
```

PowerShell:

```powershell
Get-ChildItem -Recurse -File |
  Where-Object {
    $_.FullName -match "buddy|pet|pwa|manifest|service-worker|generation|species|rarity|stats|personality|inventory|location|adventure"
  } |
  Select-Object FullName
```

## 3. Inspect Package Scripts

```bash
cat package.json
```

PowerShell:

```powershell
Get-Content package.json
```

For monorepos, also inspect:

```bash
find . -maxdepth 3 -name package.json
```

PowerShell:

```powershell
Get-ChildItem -Recurse -Filter package.json -Depth 3 | Select-Object FullName
```

## 4. Identify Package Manager

Look for:

```txt
pnpm-lock.yaml → pnpm
package-lock.json → npm
yarn.lock → yarn
bun.lockb → bun
```

## 5. Required Validation Outputs

Create or update:

```txt
docs/buddy/reports/phases/current-state-validation.md
```

Include:

- current branch,
- changed files summary,
- package manager,
- available scripts,
- Buddy feature files found,
- missing expected files,
- immediate P0/P1 blockers.
