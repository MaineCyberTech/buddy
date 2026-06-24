# 01 — Dev Merge and Push Runbook

Use this to get the completed Buddy V2 implementation onto `dev`.

## 1. Confirm Current State

```powershell
git status
git diff --stat
git branch --show-current
```

## 2. Run Final Local Gates

pnpm:

```powershell
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

npm:

```powershell
npm install
npm run lint
npm run typecheck
npm test
npm run build
```

## 3. Commit Completed Work

```powershell
git add .
git commit -m "feat: complete Buddy V2 feature release candidate"
```

If already committed, skip this step.

## 4. Push or PR Into Dev

If direct push to `dev` is allowed:

```powershell
git fetch origin
git checkout dev
git pull origin dev
git merge --no-ff <your-feature-branch>
git push origin dev
```

If `dev` is protected:

```powershell
git push -u origin HEAD
```

Then open a PR targeting `dev`.

## 5. Verify Dev

```powershell
git fetch origin
git checkout dev
git pull origin dev
git log --oneline -5
```

Run final gates again on clean `dev`.
