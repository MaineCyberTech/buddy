terraform {
  backend "s3" {
    bucket                      = "buddy-terraform-state"
    key                         = "dev/terraform.tfstate"
    region                      = "us-east-1"
    skip_credentials_validation = true
    skip_metadata_api_check     = true
    skip_requesting_account_id  = true
    encrypt                     = true
  }
}

module "digitalocean" {
  source               = "../../modules/digitalocean"
  do_token             = var.do_token
  project_name         = "Buddy"
  environment          = "development"
  droplet_name         = "buddy-dev-droplet"
  droplet_size         = "s-1vcpu-512mb-10gb"
  region               = "nyc3"
  tags                 = ["buddy", "dev"]
  ssh_key_fingerprint  = var.ssh_key_fingerprint
}

module "cloudflare" {
  source               = "../../modules/cloudflare"
  cloudflare_api_token = var.cloudflare_api_token
  zone_id              = var.cloudflare_zone_id
  environment          = "development"
  app_domain           = "buddy.mainecybertech.us"
  api_domain           = "buddy-api.mainecybertech.us"
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