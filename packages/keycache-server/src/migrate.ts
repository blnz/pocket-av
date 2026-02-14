import type { IDatabase } from "pg-promise";

export async function runMigrations(db: IDatabase<unknown>): Promise<void> {
  console.log("Running database migrations...");

  // Create role (idempotent — catches duplicate_object)
  await db.none(`
    DO $$ BEGIN
      CREATE ROLE ssdb WITH LOGIN PASSWORD 'ssdb';
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

  // Create schema
  await db.none(`CREATE SCHEMA IF NOT EXISTS ssdb`);

  // Grant schema access
  await db.none(`GRANT ALL PRIVILEGES ON SCHEMA ssdb TO ssdb`);

  // Create tables (matching db/initDB.sql)
  await db.none(`
    CREATE TABLE IF NOT EXISTS ssdb.user (
      user_id char(36) PRIMARY KEY,
      username varchar(64) UNIQUE,
      pword_hash_hash char(64),
      pword_salt char(64),
      wrapped_master varchar(1024),
      last_update timestamp default now()
    )
  `);

  await db.none(`
    CREATE TABLE IF NOT EXISTS ssdb.card (
      card_id char(36) PRIMARY KEY,
      user_id char(36),
      last_update timestamp default now(),
      active boolean default TRUE,
      data_blob TEXT,
      FOREIGN KEY (user_id) REFERENCES ssdb.user(user_id)
    )
  `);

  // Grant table access
  await db.none(`GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA ssdb TO ssdb`);

  console.log("Database migrations complete.");
}
