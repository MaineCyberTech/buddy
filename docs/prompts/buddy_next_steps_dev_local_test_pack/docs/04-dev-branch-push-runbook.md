# 04 — Dev Branch Push Runbook

This runbook ensures Buddy work is pushed to the `dev` branch.

## Important

Before pushing, confirm with repo policy whether direct push to `dev` is allowed. If protected branches are enabled, create a PR into `dev` instead.

## 1. Confirm Current Branch

```bash
git branch --show-current
git status
```

PowerShell:

```powershell
git branch --show-current
git status
```

## 2. If You Are Not On Dev

If direct work on `dev` is allowed:

```bash
git fetch origin
git checkout dev
git pull origin dev
```

If you are on a feature branch and want to merge into local dev:

```bash
git fetch origin
git checkout dev
git pull origin dev
git merge --no-ff feature/buddy-virtual-pet-foundation
```

If branch protection is required, push your feature branch and open a PR into `dev`:

```bash
git push -u origin feature/buddy-virtual-pet-foundation
```

## 3. Run Checks Before Commit

Use the repo package manager.

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

or:

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

## 4. Commit

```bash
git add .
git commit -m "feat: add Buddy local MVP validation and next steps pack"
```

If only this pack is being committed:

```bash
git add docs/prompts/buddy_next_steps_dev_local_test_pack
git commit -m "docs: add Buddy next steps local test and dev push pack"
```

## 5. Push To Dev

If currently on `dev` and direct push is allowed:

```bash
git push origin dev
```

If using a PR workflow:

```bash
git push -u origin feature/buddy-virtual-pet-foundation
```

Then open a PR targeting `dev`.

## 6. Post-Push Verification

After push/merge:

```bash
git fetch origin
git checkout dev
git pull origin dev
git log --oneline -5
```

Confirm the expected commit is present on `dev`.
