variable "env_name" {
  description = "Environment name (e.g. prod, staging)"
  type        = string
}

variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
}

variable "db_tier" {
  description = "Cloud SQL machine tier"
  type        = string
}

variable "db_version" {
  description = "Cloud SQL database version"
  type        = string
}

variable "db_name" {
  description = "Cloud SQL database name"
  type        = string
}

variable "db_user" {
  description = "Cloud SQL database user"
  type        = string
}

variable "connector_cidr" {
  description = "IP CIDR range for the VPC Access connector (must be /28, unique per connector)"
  type        = string
}

variable "vpc_network" {
  description = "VPC network self-link or URI"
  type        = string
}

variable "private_services_connection_id" {
  description = "Private VPC connection ID (ensures shared is applied before this module)"
  type        = string
}
