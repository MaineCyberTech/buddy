variable "cloudflare_api_token" {
  description = "Cloudflare API token"
  type        = string
  sensitive   = true
}

variable "zone_id" {
  description = "Cloudflare zone ID"
  type        = string
  sensitive   = true
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "app_domain" {
  description = "App domain (e.g. buddy.mainecybertech.us)"
  type        = string
}

variable "api_domain" {
  description = "API domain (e.g. buddy-api.mainecybertech.us)"
  type        = string
}

variable "app_ip" {
  description = "App server IP address"
  type        = string
}

variable "proxied" {
  description = "Whether traffic should be proxied through Cloudflare"
  type        = bool
  default     = true
}

variable "tunnel_enabled" {
  description = "Use Cloudflare Tunnel instead of direct proxied DNS"
  type        = bool
  default     = false
}

variable "tunnel_token" {
  description = "cloudflared tunnel token"
  type        = string
  default     = ""
  sensitive   = true
}

terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# DNS records for app
resource "cloudflare_record" "app" {
  zone_id = var.zone_id
  name    = trimsuffix(replace(var.app_domain, "/^[^.]+\\.(.+)$/", "$1"), "") != "" ? split(".", var.app_domain)[0] : "@"
  value   = var.app_ip
  type    = "A"
  proxied = var.proxied
  comment = "Buddy ${var.environment} app"
}

# DNS records for API
resource "cloudflare_record" "api" {
  zone_id = var.zone_id
  name    = split(".", var.api_domain)[0]
  value   = var.app_ip
  type    = "A"
  proxied = var.proxied
  comment = "Buddy ${var.environment} API"
}

# SSL/TLS override (Full strict recommended)
resource "cloudflare_zone_settings_override" "ssl" {
  zone_id = var.zone_id
  settings {
    ssl = "strict"
    min_tls_version = "1.2"
    always_use_https = "on"
    automatic_https_rewrites = "on"
    opportunistic_encryption = "on"
    tls_1_3 = "on"
    security_level = "medium"
    brotli = "on"
    http2 = "on"
    http3 = "on"
    ipv6 = "on"
  }
}

# WAF rules
resource "cloudflare_ruleset" "waf" {
  zone_id     = var.zone_id
  name        = "Buddy ${var.environment} WAF"
  description = "WAF rules for Buddy ${var.environment}"
  kind        = "zone"
  phase       = "http_request_firewall_custom"

  rules {
    action = "block"
    expression = "(ip.geoip.country in {\"XX\"} or http.user_agent contains \"curl\" and not http.host eq \"${var.api_domain}\")"
    description = "Block unwanted traffic"
    enabled = false
  }
}

# Rate limiting rule
resource "cloudflare_ruleset" "rate_limit" {
  zone_id     = var.zone_id
  name        = "Buddy ${var.environment} Rate Limit"
  description = "Rate limit API requests"
  kind        = "zone"
  phase       = "http_ratelimit"

  rules {
    action = "block"
    expression = "(http.request.uri.path starts with \"/api/\")"
    description = "Rate limit API endpoints"
    enabled = true
    ratelimit {
      characteristics = ["cf.colo.id", "ip.src"]
      period = 60
      requests_per_period = 100
      mitigation_timeout = 60
    }
  }
}

# Cloudflare Tunnel (optional)
resource "cloudflare_tunnel" "main" {
  count    = var.tunnel_enabled ? 1 : 0
  account_id = var.zone_id
  name     = "buddy-${var.environment}-tunnel"
  secret   = var.tunnel_token
}

resource "cloudflare_tunnel_config" "main" {
  count          = var.tunnel_enabled ? 1 : 0
  tunnel_id      = cloudflare_tunnel.main[0].id
  account_id     = var.zone_id

  config {
    ingress_rule {
      hostname = var.app_domain
      service  = "http://localhost:80"
    }
    ingress_rule {
      hostname = var.api_domain
      service  = "http://localhost:80"
    }
    ingress_rule {
      service = "http_status:404"
    }
  }
}
