resource "google_vpc_access_connector" "connector" {
  project       = var.project_id
  name          = "run-connector-${var.env_name}"
  region        = var.region
  network       = "default"
  ip_cidr_range = var.connector_cidr
  machine_type  = "e2-micro"
  min_instances = 2
  max_instances = 3
}
