terraform {
  backend "s3" {
    bucket = "buddy-terraform-state"
    key    = "dev/terraform.tfstate"
    region = "us-east-1"
  }
}

module "digitalocean" {
  source       = "../../modules/digitalocean"
  do_token     = var.do_token
  project_name = "Buddy"
  environment  = "dev"
  droplet_name = "buddy-dev-droplet"
  droplet_size = "s-2vcpu-2gb"
  region       = "nyc3"
  tags         = ["buddy", "dev"]
}

module "cloudflare" {
  source              = "../../modules/cloudflare"
  cloudflare_api_token = var.cloudflare_api_token
  zone_id             = var.cloudflare_zone_id
  environment         = "dev"
  app_domain          = "buddy.mainecybertech.us"
  api_domain          = "buddy-api.mainecybertech.us"
  app_ip              = module.digitalocean.reserved_ip
  proxied             = true
  tunnel_enabled      = false
}