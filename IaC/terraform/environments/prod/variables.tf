variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
}

variable "env_name" {
  description = "Environment name"
  type        = string
}

variable "connector_cidr" {
  description = "IP CIDR range for the VPC Access connector (/28)"
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
