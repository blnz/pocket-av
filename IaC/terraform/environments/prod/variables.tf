variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "project_number" {
  description = "GCP project number"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
}

variable "github_repo" {
  description = "GitHub repository name (without owner)"
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
