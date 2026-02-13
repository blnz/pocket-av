data "terraform_remote_state" "shared" {
  backend = "gcs"

  config = {
    bucket = "pocket-av-tfstate"
    prefix = "shared"
  }
}

module "env" {
  source = "../../modules/service-env"

  env_name   = var.env_name
  project_id = var.project_id
  region     = var.region
  db_tier    = var.db_tier
  db_version = var.db_version
  db_name    = var.db_name
  db_user    = var.db_user

  connector_cidr                 = var.connector_cidr
  vpc_network                    = data.terraform_remote_state.shared.outputs.vpc_network
  private_services_connection_id = data.terraform_remote_state.shared.outputs.private_vpc_connection_id
}
