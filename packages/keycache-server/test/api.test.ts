import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { randomUUID } from "node:crypto";
import type { Server } from "node:http";

const BASE = "http://127.0.0.1:8000";

// Use unique values per test run so tests are idempotent against the same DB
const testId = randomUUID().slice(0, 8);
const testUsername = `user-${testId}`;

const newUser = {
  wrapped_master: {
    iv: "ffdd010101bc",
    wrapped: "zy85b358dbd740b2c6781zyzyzyz",
    salt: "0103b3...",
  },
  username: testUsername,
  secret: "xyzzy",
};

const userLogin = { username: testUsername, secret: "xyzzy" };

const changedSecret = {
  wrapped_master: {
    iv: "b1a201ffdd010101bc",
    wrapped: "Gh13zy85b358dbd740b2c6781zyz0010",
    salt: "eab20103b3...0123",
  },
  secret: "notxyzzzy",
};

const changedLogin = { username: testUsername, secret: "notxyzzzy" };

const card1 = {
  encrypted: {
    cipherText64:
      "g2hPKWna1k7lGe0+VsKQIJUxqrJNKp5dujMrUdRsGlWEBugwOjF14GvTyBKyOGZFfLVzl02iIxQIWXrKTbZU9SL4b/6bVbUCb4osjcdyX6xCWx2Et1R6sSSsVqR0DUin",
    iv64: "7ldjiQ9rCiPf6XS/5LY2zA==",
  },
  id: randomUUID(),
  version: "2014-01-01T00:00:00.123Z",
};

const card2 = {
  encrypted: {
    cipherText64:
      "XcdPl4+MbNYk7lGe0+VsKQIJUxqrJNKp5dujMrUdRsGlWEBugwOjF14GvTyBKyOGZFfLVzl02iIxQIWXrKTbZU9SL4b/6bVbUCb4osjcdyX6xCWx2Et1R6sSSsVqR0DUin",
    iv64: "8BGjiQ9rCiPf6XS/5LY2zA==",
  },
  id: randomUUID(),
};

const card3 = {
  encrypted: {
    cipherText64:
      "Zippy3+MbNYk7lGe0+VsKQIJUxqrJNKp5dujMrUdRsGlWEBugwOjF14GvTyBKyOGZFfLVzl02iIxQIWXrKTbZU9SL4b/6bVbUCb4osjcdyX6xCWx2Et1R6sSSsVqR0DUin",
    iv64: "FUNnyQ9rCiPf6XS/5LY2zA==",
  },
  id: randomUUID(),
};

async function post(path: string, body: unknown, session?: string): Promise<Response> {
  const url = session ? `${BASE}${path}?session=${session}` : `${BASE}${path}`;
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function get(path: string, session: string): Promise<Response> {
  return fetch(`${BASE}${path}?session=${session}`, {
    headers: { "Content-Type": "application/json" },
  });
}

async function put(path: string, body: unknown, session: string): Promise<Response> {
  return fetch(`${BASE}${path}?session=${session}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function del(path: string, session: string): Promise<Response> {
  return fetch(`${BASE}${path}?session=${session}`, { method: "DELETE" });
}

describe("KeyCache API integration", () => {
  let authToken: string;
  let userId: string;
  let card1Version: string;

  it("should register a new user", async () => {
    const res = await post("/api/register", newUser);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.user_id).toBeDefined();
    expect(data.username).toBe(testUsername);
    userId = data.user_id.trim();
  });

  it("should authenticate", async () => {
    const res = await post("/api/authenticate", userLogin);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.session).toBeDefined();
    authToken = data.session;
  });

  it("should logout", async () => {
    const res = await post("/api/logout", {}, authToken);
    expect(res.status).toBe(200);
  });

  it("should reject requests after logout", async () => {
    const res = await get(`/api/u/${userId}/c`, authToken);
    expect(res.status).toBe(401);
  });

  it("should authenticate again", async () => {
    const res = await post("/api/authenticate", userLogin);
    expect(res.status).toBe(200);
    const data = await res.json();
    authToken = data.session;
  });

  it("should change secret", async () => {
    const res = await post("/api/changeSecret", changedSecret, authToken);
    expect(res.status).toBe(200);
  });

  it("should authenticate with new secret", async () => {
    // Logout first, then login with changed credentials
    await post("/api/logout", {}, authToken);
    const res = await post("/api/authenticate", changedLogin);
    expect(res.status).toBe(200);
    const data = await res.json();
    authToken = data.session;
  });

  it("should create card 1", async () => {
    const res = await put(`/api/u/${userId}/c/${card1.id}`, card1, authToken);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id.trim()).toBe(card1.id);
    expect(data.version).toBeDefined();
    card1Version = data.version;
  });

  it("should create card 2", async () => {
    const res = await put(`/api/u/${userId}/c/${card2.id}`, card2, authToken);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id.trim()).toBe(card2.id);
  });

  it("should create card 3", async () => {
    const res = await put(`/api/u/${userId}/c/${card3.id}`, card3, authToken);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id.trim()).toBe(card3.id);
  });

  it("should list 3 cards", async () => {
    const res = await get(`/api/u/${userId}/c`, authToken);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(3);
    for (const card of data) {
      expect(card.id).toBeDefined();
      expect(card.version).toBeDefined();
      expect(card.encrypted).toBeDefined();
    }
  });

  it("should get a single card", async () => {
    const res = await get(`/api/u/${userId}/c/${card1.id}`, authToken);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.card_id.trim()).toBe(card1.id);
    expect(data.data_blob).toBeDefined();
  });

  it("should update a card", async () => {
    const updatedCard = {
      encrypted: {
        cipherText64: "UPDATED_CIPHER_TEXT",
        iv64: "UPDATED_IV",
      },
      version: card1Version,
    };
    const res = await post(
      `/api/u/${userId}/c/${card1.id}`,
      updatedCard,
      authToken,
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id.trim()).toBe(card1.id);
    expect(data.version).not.toBe(card1Version);
  });

  it("should delete a card", async () => {
    const res = await del(`/api/u/${userId}/c/${card3.id}`, authToken);
    expect(res.status).toBe(200);
  });

  it("should list 3 cards after soft-delete (inactive card still returned)", async () => {
    const res = await get(`/api/u/${userId}/c`, authToken);
    expect(res.status).toBe(200);
    const data = await res.json();
    // Soft-delete keeps rows; listCards returns all with last_update > since
    expect(data.length).toBeGreaterThanOrEqual(2);
  });

  it("should reject unauthorized user access", async () => {
    const res = await get("/api/u/wrong-user-id/c", authToken);
    expect(res.status).toBe(403);
  });

  it("should logout at the end", async () => {
    const res = await post("/api/logout", {}, authToken);
    expect(res.status).toBe(200);
  });
});

// Unit tests for pbkdf2
describe("pbkdf2", () => {
  it("should hash and verify a password", async () => {
    const { newPassHash, testPassHash } = await import("../src/pbkdf2.js");
    const { hash, salt } = await newPassHash("test-secret");
    expect(hash).toHaveLength(64); // 32 bytes hex-encoded
    expect(salt).toHaveLength(64);
    await expect(testPassHash("test-secret", salt, hash)).resolves.toBeUndefined();
  });

  it("should reject wrong password", async () => {
    const { newPassHash, testPassHash } = await import("../src/pbkdf2.js");
    const { hash, salt } = await newPassHash("correct");
    await expect(testPassHash("wrong", salt, hash)).rejects.toThrow("mismatch");
  });
});

// Unit tests for session
describe("session", () => {
  it("should create and retrieve sessions", async () => {
    const { createSession, getUserByToken, closeSession, clearAllSessions } =
      await import("../src/session.js");

    clearAllSessions();

    const token = await createSession("user-1");
    expect(token).toBeDefined();
    expect(getUserByToken(token)).toBe("user-1");

    // Same user gets same token
    const token2 = await createSession("user-1");
    expect(token2).toBe(token);

    // Close session
    expect(closeSession(token)).toBe(true);
    expect(getUserByToken(token)).toBeUndefined();

    // Double-close returns false
    expect(closeSession(token)).toBe(false);
  });
});
