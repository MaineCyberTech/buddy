# Plan Dev Infrastructure

```bash
cd infra/terraform/envs/dev
terraform init
terraform fmt -recursive
terraform validate
terraform plan -out=tfplan
```

Do not apply until plan is reviewed.
