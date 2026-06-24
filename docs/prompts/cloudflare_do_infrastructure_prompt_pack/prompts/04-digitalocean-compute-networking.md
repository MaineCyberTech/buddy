# 04 — DigitalOcean Compute and Networking

## Mission

Create prompt-guided Terraform/OpenTofu infrastructure for DigitalOcean compute/networking.

## Target Resources

- Project
- Droplet(s)
- Reserved/static IP
- Firewall
- SSH keys
- Optional volume
- Optional backups/snapshots
- Tags

## Required Variables

- do_token
- region
- droplet_size
- droplet_image
- ssh_key_fingerprints
- environment
- project_name
- allowed_ssh_cidrs
- app_ports
- enable_backups
- enable_ipv6

## Security Rules

- SSH restricted to allowed CIDRs.
- App ports limited to necessary ingress.
- If using Cloudflare Tunnel, avoid exposing app/API ports publicly.
- If using direct Traefik ingress, expose only 80/443.
- Add outputs for IPs, droplet IDs, firewall IDs.
