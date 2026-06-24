# Environment and Domain Matrix

| Environment | App Hostname | API Hostname | Notes |
|---|---|---|---|
| dev | chat.mainecybertech.us | chat-api.mainecybertech.us | Development environment |
| prod | chat.mainecybertech.com | chat-api.mainecybertech.com | Production environment |

All Terraform, Docker Compose, Traefik, Cloudflare DNS, and GitHub Actions configuration must preserve environment separation.
