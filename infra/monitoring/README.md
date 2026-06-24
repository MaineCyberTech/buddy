# Buddy — Monitoring & Observability Configuration

This document defines the monitoring setup for Buddy in production.

## Health Check Endpoints

The Next.js app exposes:
- `GET /` — main app (serves PWA shell)
- All endpoints are client-side rendered after hydration

## Uptime Monitoring

### Cloudflare Health Checks (Recommended)
```
Type: HTTPS
URL: https://buddy.mainecybertech.com/
Interval: 60 seconds
Expected: HTTP 200
Notifications: Email + Webhook
```

### Alternative: Uptime Robot / Better Uptime
```txt
Monitor 1: buddy.mainecybertech.com — HTTPS (60s)
Monitor 2: buddy-api.mainecybertech.com — HTTPS (60s)
```

## Certificate Expiry Monitoring

```txt
Domain: buddy.mainecybertech.com
Port: 443
Alert: 30 days before expiry
Check: openssl s_client -connect buddy.mainecybertech.com:443 -servername buddy.mainecybertech.com 2>/dev/null | openssl x509 -noout -enddate
```

## Docker Container Monitoring

```powershell
# Health check script — run via cron every 5 minutes
$containers = @("buddy-caddy", "buddy-app")
foreach ($c in $containers) {
    $status = docker inspect $c --format '{{.State.Status}}' 2>$null
    if ($status -ne "running") {
        Write-Warning "Container $c is $status — restarting..."
        docker compose -f /opt/buddy/docker-compose.yml up -d $c
    }
}
```

## Resource Alerts (DigitalOcean)

```txt
CPU usage > 80%  → Alert
Memory usage > 80% → Alert
Disk usage > 80% → Alert
```

## Logging

### Docker Logs
```powershell
# Buddy logs directory
mkdir -p /var/log/buddy
docker compose logs --tail=100 > /var/log/buddy/app.log
```

### Log Retention
- Docker logs: 7 days (default Docker log rotation)
- App logs: 30 days
- Audit logs: 90 days

## Alert Contacts

| Severity | Method | Target |
|----------|--------|--------|
| Critical | SMS + Email | admin@mainecybertech.com |
| Warning | Email | admin@mainecybertech.com |
| Info | Dashboard | Internal |

## Prometheus + Grafana (Optional)

For full observability, deploy:
```yaml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
```

Not enabled by default — add when scaling beyond single-droplet deployment.