resource "google_compute_global_address" "private_ip_range" {
  project       = var.project_id
  name          = "private-ip-range"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = "projects/${var.project_id}/global/networks/default"

  depends_on = [google_project_service.compute]
}

resource "google_service_networking_connection" "private_vpc" {
  network                 = "projects/${var.project_id}/global/networks/default"
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_range.name]

  depends_on = [google_project_service.servicenetworking]
}

resource "google_vpc_access_connector" "connector" {
  project       = var.project_id
  name          = "cloudrun-connector"
  region        = var.region
  network       = "default"
  machine_type  = "e2-micro"
  min_instances = 2
  max_instances = 3

  depends_on = [google_project_service.vpcaccess]
}
