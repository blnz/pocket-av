import pgPromise from "pg-promise";
import { randomUUID } from "node:crypto";
import * as pbkdf2 from "./pbkdf2.js";
import * as session from "./session.js";
import type { CardRow, UserRow } from "./types.js";

const pgp = pgPromise();

const cn = {
  host: process.env.PGHOST || "localhost",
  port: 5432,
  database: process.env.PGDATABASE || "postgres",
  user: process.env.PGUSER || "ssdb",
  password: process.env.PGPASSWORD || "ssdb",
};

const db = pgp(cn);

export { db };

export async function createCard(
  cardId: string,
  userId: string,
  cardData: string,
): Promise<{ id: string; version: string }> {
  const query =
    "INSERT INTO ssdb.card (card_id, user_id, data_blob) VALUES ($1, $2, $3) " +
    "RETURNING card_id, date_trunc('milliseconds', last_update) AS last_update";
  const data = await db.one(query, [cardId, userId, cardData]);
  return { id: data.card_id, version: data.last_update };
}

export async function updateCard(
  cardId: string,
  userId: string,
  lastUpdate: string,
  cardData: string,
): Promise<{ id: string; version: string }> {
  const query =
    "UPDATE ssdb.card SET data_blob = $1, last_update = date_trunc('milliseconds', now()) " +
    "WHERE card_id = $2 AND date_trunc('milliseconds', last_update) = $3::timestamp AND user_id = $4 " +
    "RETURNING card_id, date_trunc('milliseconds', last_update) AS last_update";
  const data = await db.one(query, [cardData, cardId, lastUpdate, userId]);
  return { id: data.card_id, version: data.last_update };
}

export async function deleteCard(
  cardId: string,
  userId: string,
): Promise<void> {
  const query =
    "UPDATE ssdb.card SET active = FALSE, data_blob = '{}', last_update = now() " +
    "WHERE card_id = $1 AND user_id = $2";
  await db.none(query, [cardId, userId]);
}

export async function getCard(
  cardId: string,
  userId: string,
): Promise<CardRow> {
  const query =
    "SELECT card_id, user_id, date_trunc('milliseconds', last_update) AS last_update, data_blob, active " +
    "FROM ssdb.card WHERE card_id = $1 AND user_id = $2";
  return db.one<CardRow>(query, [cardId, userId]);
}

export async function listCards(
  userId: string,
  since: string | null,
): Promise<CardRow[]> {
  const effectiveSince = since || "2016-08-01T18:51:00.765Z";
  const query =
    "SELECT card_id, user_id, date_trunc('milliseconds', last_update) AS last_update, data_blob, active " +
    "FROM ssdb.card WHERE user_id = $1 AND last_update > $2";
  return db.any<CardRow>(query, [userId, effectiveSince]);
}

export async function registerUser(
  username: string,
  secret: string,
  wrappedMaster: string,
): Promise<{ user_id: string; username: string; last_updated: string }> {
  const query =
    "INSERT INTO ssdb.user (user_id, username, pword_hash_hash, pword_salt, wrapped_master, last_update) " +
    "VALUES ($1, $2, $3, $4, $5, now()) RETURNING *";

  const userId = randomUUID();
  const { hash, salt } = await pbkdf2.newPassHash(secret);
  const data = await db.one<UserRow>(query, [
    userId,
    username,
    hash,
    salt,
    wrappedMaster,
  ]);

  return {
    user_id: data.user_id,
    username: data.username,
    last_updated: data.last_update,
  };
}

export async function changeUserSecret(
  userId: string,
  secret: string,
  wrappedMaster: string,
): Promise<UserRow> {
  const query =
    "UPDATE ssdb.user SET pword_hash_hash = $1, pword_salt = $2, wrapped_master = $3, last_update = now() " +
    "WHERE user_id = $4 RETURNING *";

  const { hash, salt } = await pbkdf2.newPassHash(secret);
  return db.one<UserRow>(query, [hash, salt, wrappedMaster, userId]);
}

export async function loginUser(
  username: string,
  secret: string,
): Promise<string> {
  const query =
    "SELECT user_id, pword_hash_hash, pword_salt FROM ssdb.user WHERE username = $1";
  const data = await db.one<
    Pick<UserRow, "user_id" | "pword_hash_hash" | "pword_salt">
  >(query, username);

  await pbkdf2.testPassHash(secret, data.pword_salt, data.pword_hash_hash);
  return session.createSession(data.user_id);
}
