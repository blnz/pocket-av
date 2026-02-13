resource "google_sql_database_instance" "main" {
  project          = var.project_id
  name             = "pocket-av-db"
  region           = var.region
  database_version = var.db_version

  settings {
    tier              = var.db_tier
    availability_type = "ZONAL"

    ip_configuration {
      ipv4_enabled                                  = false
      private_network                               = "projects/${var.project_id}/global/networks/default"
      enable_private_path_for_google_cloud_services = true
    }

    backup_configuration {
      enabled    = true
      start_time = "03:00"
    }
  }

  deletion_protection = true

  depends_on = [google_service_networking_connection.private_vpc]
}

resource "google_sql_database" "keycache" {
  project  = var.project_id
  name     = var.db_name
  instance = google_sql_database_instance.main.name
}

resource "google_sql_user" "app" {
  project  = var.project_id
  name     = var.db_user
  instance = google_sql_database_instance.main.name
  password = random_password.db_password.result
}
