# 05 — GitHub Actions Origin Cert Guardrails Prompt

## Mission

If certificate deployment through GitHub Actions is required, add safe guardrails. If manual cert placement is preferred, document that and avoid workflow changes.

## Rules

- Do not echo certificate contents.
- Do not echo private key contents.
- Do not upload certs as artifacts.
- Use GitHub Secrets only if automated transfer is required.
- Prefer base64 transfer with masked secrets.
- Write cert with restrictive file permissions.
- Validate cert file exists without printing content.
- Restart Caddy only after validation.

## Recommended Secret Names If Automated

```txt
CF_ORIGIN_CERT_PEM_B64
CF_ORIGIN_CERT_KEY_B64
```

## Required Deployment Commands Shape

Use safe file handling similar to:

```bash
mkdir -p /opt/chat/certs
printf '%s' "$CF_ORIGIN_CERT_PEM_B64" | base64 -d > /opt/chat/certs/cloudflare-origin.pem
printf '%s' "$CF_ORIGIN_CERT_KEY_B64" | base64 -d > /opt/chat/certs/cloudflare-origin-key.pem
chmod 600 /opt/chat/certs/cloudflare-origin-key.pem
chmod 644 /opt/chat/certs/cloudflare-origin.pem
```

Do not include actual secret values.

## Required Output

Create:

```txt
docs/infra/reports/caddy-origin/05-github-actions-cert-guardrails-report.md
```
