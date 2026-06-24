# 07 — GitHub Actions CI/CD

## Mission

Create GitHub Actions workflows for infrastructure validation, planning, gated apply, and deployment.

## Required Workflows

```txt
.github/workflows/infra-validate.yml
.github/workflows/infra-plan-dev.yml
.github/workflows/infra-apply-dev.yml
.github/workflows/infra-plan-prod.yml
.github/workflows/deploy-dev.yml
.github/workflows/deploy-prod.yml
```

## Requirements

- Run fmt/validate/plan on PRs.
- Apply is manual/gated.
- Prod deploy requires protected environment.
- Secrets pulled from GitHub Secrets/Environments.
- Upload plan artifacts where appropriate.
- Prevent accidental prod apply from feature branches.
