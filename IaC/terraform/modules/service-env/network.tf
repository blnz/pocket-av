resource "google_vpc_access_connector" "connector" {
  project       = var.project_id
  name          = "cloudrun-connector-${var.env_name}"
  region        = var.region
  network       = "default"
  machine_type  = "e2-micro"
  min_instances = 2
  max_instances = 3
}
