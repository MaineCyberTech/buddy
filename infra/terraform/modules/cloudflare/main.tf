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

# DNS record for app
resource "cloudflare_dns_record" "app" {
  zone_id = var.zone_id
  name    = split(".", var.app_domain)[0]
  content = var.app_ip
  type    = "A"
  ttl     = 1
  proxied = var.proxied
  comment = "Buddy ${var.environment} app"
}

# DNS record for API
resource "cloudflare_dns_record" "api" {
  zone_id = var.zone_id
  name    = split(".", var.api_domain)[0]
  content = var.app_ip
  type    = "A"
  ttl     = 1
  proxied = var.proxied
  comment = "Buddy ${var.environment} API"
}