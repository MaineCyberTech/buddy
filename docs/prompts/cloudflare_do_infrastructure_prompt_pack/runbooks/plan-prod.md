# Plan Prod Infrastructure

```bash
cd infra/terraform/envs/prod
terraform init
terraform fmt -recursive
terraform validate
terraform plan -out=tfplan
```

Prod apply must be gated.
