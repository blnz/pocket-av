output "cloud_run_url" {
  description = "URL of the keycache-server Cloud Run service"
  value       = google_cloud_run_v2_service.keycache_server.uri
}

output "db_instance_name" {
  description = "Cloud SQL instance name"
  value       = google_sql_database_instance.main.name
}

output "db_private_ip" {
  description = "Cloud SQL private IP address"
  value       = google_sql_database_instance.main.private_ip_address
}
