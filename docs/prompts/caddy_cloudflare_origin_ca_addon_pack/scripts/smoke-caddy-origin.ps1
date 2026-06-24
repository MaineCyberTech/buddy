param(
  [string]$AppUrl = "https://chat.mainecybertech.com",
  [string]$ApiHealthUrl = "https://chat-api.mainecybertech.com/healthz"
)

$ErrorActionPreference = "Stop"

Write-Host "Checking app URL: $AppUrl"
$app = Invoke-WebRequest -Uri $AppUrl -Method Head -UseBasicParsing
Write-Host "App status: $($app.StatusCode)"

Write-Host "Checking API health URL: $ApiHealthUrl"
$api = Invoke-WebRequest -Uri $ApiHealthUrl -Method Head -UseBasicParsing
Write-Host "API status: $($api.StatusCode)"
