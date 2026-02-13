resource "google_artifact_registry_repository" "docker" {
  project       = var.project_id
  location      = var.region
  repository_id = "pocket-av"
  format        = "DOCKER"

  depends_on = [google_project_service.artifactregistry]
}
