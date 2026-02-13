# Temporary file — delete after first successful apply

# WIF pool
import {
  to = google_iam_workload_identity_pool.github
  id = "projects/${var.project_id}/locations/global/workloadIdentityPools/github"
}

# WIF provider
import {
  to = google_iam_workload_identity_pool_provider.github_actions
  id = "projects/${var.project_id}/locations/global/workloadIdentityPools/github/providers/github-actions"
}

# GitHub Actions service account
import {
  to = google_service_account.github_actions
  id = "projects/${var.project_id}/serviceAccounts/github-actions@${var.project_id}.iam.gserviceaccount.com"
}

# GitHub Actions viewer role
import {
  to = google_project_iam_member.github_actions_viewer
  id = "${var.project_id} roles/viewer serviceAccount:github-actions@${var.project_id}.iam.gserviceaccount.com"
}

# WIF binding
import {
  to = google_service_account_iam_member.wif_binding
  id = "projects/${var.project_id}/serviceAccounts/github-actions@${var.project_id}.iam.gserviceaccount.com roles/iam.workloadIdentityUser principalSet://iam.googleapis.com/projects/${var.project_number}/locations/global/workloadIdentityPools/github/attribute.repository/blnz/${var.github_repo}"
}

# Existing APIs
import {
  to = google_project_service.iam
  id = "${var.project_id}/iam.googleapis.com"
}

import {
  to = google_project_service.iamcredentials
  id = "${var.project_id}/iamcredentials.googleapis.com"
}

import {
  to = google_project_service.sts
  id = "${var.project_id}/sts.googleapis.com"
}

import {
  to = google_project_service.cloudresourcemanager
  id = "${var.project_id}/cloudresourcemanager.googleapis.com"
}

# Deploy roles for github-actions SA (already exist from prod flat config)
import {
  to = google_project_iam_member.github_actions_run_admin
  id = "${var.project_id} roles/run.admin serviceAccount:github-actions@${var.project_id}.iam.gserviceaccount.com"
}

import {
  to = google_project_iam_member.github_actions_ar_writer
  id = "${var.project_id} roles/artifactregistry.writer serviceAccount:github-actions@${var.project_id}.iam.gserviceaccount.com"
}

import {
  to = google_project_iam_member.github_actions_sa_user
  id = "${var.project_id} roles/iam.serviceAccountUser serviceAccount:github-actions@${var.project_id}.iam.gserviceaccount.com"
}

# Artifact Registry
import {
  to = google_artifact_registry_repository.docker
  id = "projects/${var.project_id}/locations/${var.region}/repositories/pocket-av"
}

# VPC peering
import {
  to = google_compute_global_address.private_ip_range
  id = "projects/${var.project_id}/global/addresses/private-ip-range"
}

import {
  to = google_service_networking_connection.private_vpc
  id = "projects/${var.project_id}/global/networks/default:servicenetworking.googleapis.com"
}
