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
