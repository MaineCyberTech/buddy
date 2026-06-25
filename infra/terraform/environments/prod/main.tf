terraform {
  backend "s3" {
    bucket                      = "buddy-terraform-state"
    key                         = "prod/terraform.tfstate"
    region                      = "us-east-1"
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_requesting_account_id  = true
    encrypt                     = true
  }
}

module "digitalocean" {
  source       = "../../modules/digitalocean"
  do_token     = var.do_token
  project_name = "Buddy"
  environment  = "prod"
  droplet_name = "buddy-prod-droplet"
  droplet_size = "s-4vcpu-4gb"
  region       = "nyc3"
  tags         = ["buddy", "prod"]
}

module "cloudflare" {
  source               = "../../modules/cloudflare"
  cloudflare_api_token = var.cloudflare_api_token
  zone_id              = var.cloudflare_zone_id
  environment          = "prod"
  app_domain           = "buddy.mainecybertech.com"
  api_domain           = "buddy-api.mainecybertech.com"
  app_ip               = module.digitalocean.reserved_ip
  proxied              = true
}

output "droplet_ip" {
  description = "Droplet public IPv4 address"
  value       = module.digitalocean.droplet_ip
}

output "reserved_ip" {
  description = "Reserved IP address"
  value       = module.digitalocean.reserved_ip
}