# Deploy Buddy with Caddy + Cloudflare Origin CA

This runbook covers deploying the Buddy stack using Caddy with Cloudflare Origin CA certificates on a DigitalOcean Droplet.

## Prerequisites

- DigitalOcean Droplet (provisioned via Terraform)
- Cloudflare API token with Zone:Read, DNS:Edit
- Cloudflare Origin CA certificate downloaded

## 1. Obtain Cloudflare Origin CA Certificate

1. Log into Cloudflare Dashboard → SSL/TLS → Origin Server
2. Create Certificate:
   - Private key type: RSA (2048)
   - Hostnames: `buddy.mainecybertech.us`, `*.buddy.mainecybertech.us`
   - Validity: 15 years
3. Download the **Origin Certificate** and **Private Key**
4. Save them securely (lastpass, bitwarden, or GH secrets)

## 2. Upload Certs to Droplet

```powershell
$ip = "<droplet-ip>"
scp ./certs/cloudflare-origin.pem root@${ip}:/opt/buddy/certs/fullchain.pem
scp ./certs/cloudflare-origin-key.pem root@${ip}:/opt/buddy/certs/privkey.pem
ssh root@${ip} chmod 600 /opt/buddy/certs/privkey.pem
```

CERT RULE: Never commit or log origin private key material.

## 3. Deploy Stack

```powershell
cd infra/docker
docker compose -f docker-compose.yml up -d
```

## 4. Verify

```powershell
# Check Caddy is running
curl -I https://buddy.mainecybertech.us
curl -I https://buddy-api.mainecybertech.us

# Check cert details
openssl s_client -connect buddy.mainecybertech.us:443 -servername buddy.mainecybertech.us | openssl x509 -text -noout | grep "Subject:"
```

## 5. Set Cloudflare SSL/TLS to Full (Strict)

1. Cloudflare Dashboard → SSL/TLS → Overview
2. Set encryption mode to **Full (Strict)**

## 6. Verify TLS Handshake

```powershell
curl -vI https://buddy.mainecybertech.us 2>&1 | Select-String "SSL|TLS|certificate"
```