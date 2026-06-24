#!/usr/bin/env bash
set -euo pipefail
APP_URL="${1:-https://chat.mainecybertech.com}"
API_HEALTH_URL="${2:-https://chat-api.mainecybertech.com/healthz}"

echo "Checking app URL: $APP_URL"
curl -I "$APP_URL"

echo "Checking API health URL: $API_HEALTH_URL"
curl -I "$API_HEALTH_URL"
