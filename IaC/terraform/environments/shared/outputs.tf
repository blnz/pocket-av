output "registry_path" {
  description = "Artifact Registry Docker repository path"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker.repository_id}"
}

output "vpc_network" {
  description = "VPC network URI for environment modules"
  value       = "projects/${var.project_id}/global/networks/default"
}

output "private_vpc_connection_id" {
  description = "Private VPC connection ID (used as dependency for Cloud SQL)"
  value       = google_service_networking_connection.private_vpc.id
}
