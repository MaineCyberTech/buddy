param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("dev","prod")]
    [string]$Env = "dev"
)

$ErrorActionPreference = "Stop"

Write-Host "Buddy Deployment — $Env" -ForegroundColor Green

# 1. Verify prerequisites
Write-Host "`n[1/5] Checking prerequisites..." -ForegroundColor Yellow
if (-not (Get-Command terraform -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Terraform not found. Install from https://developer.hashicorp.com/terraform/install" -ForegroundColor Red
    exit 1
}
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker not found." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Prerequisites met" -ForegroundColor Green

# 2. Terraform plan
Write-Host "`n[2/5] Running Terraform plan ($Env)..." -ForegroundColor Yellow
Push-Location infra/terraform/environments/$Env
terraform init
terraform plan
Pop-Location
Write-Host "✓ Terraform plan complete" -ForegroundColor Green

# 3. Build & test
Write-Host "`n[3/5] Running quality gates..." -ForegroundColor Yellow
npm run lint
npx tsc --noEmit
npx vitest run
npm run build
Write-Host "✓ Quality gates passed" -ForegroundColor Green

# 4. Build Docker image
Write-Host "`n[4/5] Building Docker image..." -ForegroundColor Yellow
docker build -t buddy-app:$Env -f infra/docker/app.Dockerfile .
Write-Host "✓ Docker image built" -ForegroundColor Green

# 5. Deploy instructions
Write-Host "`n[5/5] Deployment ready" -ForegroundColor Green
Write-Host @"

To deploy:
  1. Deploy infra:  cd infra/terraform/environments/$Env && terraform apply
  2. Upload certs:  scp infra/docker/certs/* root@<ip>:/opt/buddy/certs/
  3. Deploy app:    scp -r infra/docker/* root@<ip>:/opt/buddy/ && ssh root@<ip> 'cd /opt/buddy && docker compose -f docker-compose.$Env.yml up -d'
  4. Verify:        curl -I https://buddy.mainecybertech.$($Env -eq 'dev' ? 'us' : 'com')
"@