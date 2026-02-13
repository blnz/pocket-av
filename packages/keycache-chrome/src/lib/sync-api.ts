import type { EncryptedCardData, WrappedKeyData } from "../store/types";

export interface SyncApiConfig {
  host: string;
}

export interface SessionResponse {
  session: string;
}

export interface RegisterResponse {
  user_id: string;
}

export interface RemoteCard {
  id: string;
  version: string;
  encrypted: EncryptedCardData;
}

function buildUrl(host: string, route: string, session?: string): string {
  const base = `${host}/api/${route}`;
  return session ? `${base}?session=${session}` : base;
}

async function apiRequest<T>(
  url: string,
  opts: RequestInit,
): Promise<T> {
  const response = await fetch(url, opts);
  const json = await response.json();
  if (!response.ok) {
    throw new Error(
      json.message ?? json.error ?? `HTTP ${response.status}`,
    );
  }
  return json as T;
}

function jsonOpts(method: string, body?: unknown): RequestInit {
  const opts: RequestInit = {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }
  return opts;
}

/**
 * POST /api/register
 */
export function register(
  host: string,
  secret: string,
  username: string,
  wrappedMaster: WrappedKeyData,
): Promise<RegisterResponse> {
  const url = buildUrl(host, "register");
  return apiRequest(
    url,
    jsonOpts("POST", {
      secret,
      username,
      wrapped_master: wrappedMaster,
    }),
  );
}

/**
 * POST /api/authenticate
 */
export function authenticate(
  host: string,
  secret: string,
  username: string,
): Promise<SessionResponse> {
  const url = buildUrl(host, "authenticate");
  return apiRequest(url, jsonOpts("POST", { secret, username }));
}

/**
 * POST /api/logout?session=token
 */
export function logout(
  host: string,
  session: string,
): Promise<void> {
  const url = buildUrl(host, "logout", session);
  return apiRequest(url, jsonOpts("POST"));
}

/**
 * POST /api/changeSecret?session=token
 */
export function changeSecret(
  host: string,
  session: string,
  secret: string,
  wrappedMaster: WrappedKeyData,
): Promise<void> {
  const url = buildUrl(host, "changeSecret", session);
  return apiRequest(
    url,
    jsonOpts("POST", { secret, wrapped_master: wrappedMaster }),
  );
}

/**
 * PUT /api/u/:userId/c/:cardId?session=token
 * Creates a new card on the server.
 */
export function createCard(
  host: string,
  session: string,
  userId: string,
  cardId: string,
  encrypted: EncryptedCardData,
): Promise<RemoteCard> {
  // Note: original had a bug using {card.id} instead of ${card.id}
  const url = buildUrl(host, `u/${userId}/c/${cardId}`, session);
  return apiRequest(
    url,
    jsonOpts("PUT", { encrypted, id: cardId }),
  );
}

/**
 * POST /api/u/:userId/c/:cardId?session=token
 * Updates an existing card on the server.
 */
export function updateCard(
  host: string,
  session: string,
  userId: string,
  cardId: string,
  encrypted: EncryptedCardData,
  version: string,
): Promise<RemoteCard> {
  const url = buildUrl(host, `u/${userId}/c/${cardId}`, session);
  return apiRequest(
    url,
    jsonOpts("POST", { encrypted, id: cardId, version }),
  );
}

/**
 * DELETE /api/u/:userId/c/:cardId?session=token
 */
export function deleteCard(
  host: string,
  session: string,
  userId: string,
  cardId: string,
): Promise<void> {
  const url = buildUrl(host, `u/${userId}/c/${cardId}`, session);
  return apiRequest(url, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });
}

/**
 * GET /api/u/:userId/c/?session=token
 * Lists all cards for a user.
 */
export function listCards(
  host: string,
  session: string,
  userId: string,
): Promise<RemoteCard[]> {
  const url = buildUrl(host, `u/${userId}/c/`, session);
  return apiRequest(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
}
