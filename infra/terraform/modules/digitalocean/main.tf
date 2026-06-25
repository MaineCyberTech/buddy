variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
}

variable "project_name" {
  description = "DigitalOcean project name"
  type        = string
  default     = "Buddy"
}

variable "environment" {
  description = "Deployment environment (dev/prod)"
  type        = string
}

variable "droplet_name" {
  description = "Droplet hostname"
  type        = string
}

variable "droplet_size" {
  description = "Droplet size slug"
  type        = string
  default     = "s-2vcpu-2gb"
}

variable "region" {
  description = "DigitalOcean region"
  type        = string
  default     = "nyc3"
}

variable "ssh_key_ids" {
  description = "SSH key IDs to inject"
  type        = list(string)
  default     = []
}

variable "reserved_ip" {
  description = "Reserved IP to assign (empty string to allocate new)"
  type        = string
  default     = ""
}

variable "tags" {
  description = "Tags for DigitalOcean resources"
  type        = list(string)
  default     = ["buddy"]
}

terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.47"
    }
  }
}

# Provider
provider "digitalocean" {
  token = var.do_token
}

# Project
resource "digitalocean_project" "main" {
  name        = var.project_name
  description = "${var.project_name} ${var.environment} infrastructure"
  environment = var.environment
  purpose     = "Web application hosting"
}

# Firewall
resource "digitalocean_firewall" "web" {
  name = "${var.environment}-buddy-web"

  droplet_ids = digitalocean_droplet.app[*].id

  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "80"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "443"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "icmp"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "tcp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "udp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "icmp"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  tags = var.tags
}

# Droplet
resource "digitalocean_droplet" "app" {
  image      = "ubuntu-24-04-x64"
  name       = var.droplet_name
  region     = var.region
  size       = var.droplet_size
  ssh_keys   = var.ssh_key_ids
  tags       = concat(var.tags, ["${var.environment}"])
  monitoring = true

  user_data = <<-EOF
    #cloud-config
    package_update: true
    packages:
      - docker-compose-plugin
    runcmd:
      - systemctl enable docker
      - systemctl start docker
  EOF
}

# Reserved IP
resource "digitalocean_reserved_ip" "main" {
  droplet_id = digitalocean_droplet.app.id
  region     = var.region
}

# Assign project resources
resource "digitalocean_project_resources" "main" {
  project = digitalocean_project.main.id
  resources = concat(
    digitalocean_droplet.app[*].urn,
    [digitalocean_reserved_ip.main.urn],
  )
}

output "droplet_ip" {
  description = "Droplet public IPv4 address"
  value       = digitalocean_droplet.app.ipv4_address
}

output "reserved_ip" {
  description = "Reserved IP address"
  value       = digitalocean_reserved_ip.main.ip_address
}
