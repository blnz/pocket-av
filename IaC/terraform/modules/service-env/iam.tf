resource "google_service_account" "keycache_server" {
  project      = var.project_id
  account_id   = "keycache-server-${var.env_name}"
  display_name = "KeyCache Server (${var.env_name})"
}

resource "google_project_iam_member" "keycache_server_sql" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.keycache_server.email}"
}

resource "google_project_iam_member" "keycache_server_secrets" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.keycache_server.email}"
}
