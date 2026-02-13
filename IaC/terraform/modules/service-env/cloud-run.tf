resource "google_cloud_run_v2_service" "keycache_server" {
  project  = var.project_id
  name     = "keycache-server-${var.env_name}"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.keycache_server.email

    scaling {
      min_instance_count = 0
      max_instance_count = 2
    }

    vpc_access {
      connector = google_vpc_access_connector.connector.id
      egress    = "PRIVATE_RANGES_ONLY"
    }

    containers {
      image = "us-docker.pkg.dev/cloudrun/container/hello"

      ports {
        container_port = 8000
      }

      env {
        name  = "PGHOST"
        value = google_sql_database_instance.main.private_ip_address
      }

      env {
        name  = "PGDATABASE"
        value = var.db_name
      }

      env {
        name  = "PGUSER"
        value = var.db_user
      }

      env {
        name = "PGPASSWORD"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.db_password.secret_id
            version = "latest"
          }
        }
      }
    }
  }

  depends_on = [
    google_secret_manager_secret_version.db_password,
  ]
}

resource "google_cloud_run_v2_service_iam_member" "public" {
  project  = var.project_id
  name     = google_cloud_run_v2_service.keycache_server.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}
