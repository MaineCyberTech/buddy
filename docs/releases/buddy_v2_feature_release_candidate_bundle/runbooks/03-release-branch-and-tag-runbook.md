# 03 — Release Branch and Tag Runbook

Use this after `dev` is validated.

## 1. Create Release Branch

```powershell
git checkout dev
git pull origin dev
git checkout -b release/buddy-v2-rc1
git push -u origin release/buddy-v2-rc1
```

## 2. Tag Release Candidate

```powershell
git tag v0.1.0-buddy-rc1
git push origin v0.1.0-buddy-rc1
```

Alternative tag:

```powershell
git tag buddy-v2-rc1
git push origin buddy-v2-rc1
```

## 3. Post-Tag Verification

```powershell
git fetch --tags
git tag --list | Select-String "buddy"
git log --oneline -5
```
