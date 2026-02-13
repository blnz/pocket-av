output "cloud_run_url" {
  description = "URL of the keycache-server Cloud Run service"
  value       = module.env.cloud_run_url
}

output "db_instance_name" {
  description = "Cloud SQL instance name"
  value       = module.env.db_instance_name
}

output "db_private_ip" {
  description = "Cloud SQL private IP address"
  value       = module.env.db_private_ip
}
