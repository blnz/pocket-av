export interface WrappedKeyData {
  iv: string;
  wrapped: string;
  salt: string;
}

export interface EncryptedCardData {
  iv64: string;
  cipherText64: string;
}

export interface CardRow {
  card_id: string;
  user_id: string;
  last_update: string;
  data_blob: string;
  active: boolean;
}

export interface UserRow {
  user_id: string;
  username: string;
  pword_hash_hash: string;
  pword_salt: string;
  wrapped_master: string;
  last_update: string;
}

export interface RegisterRequest {
  username: string;
  secret: string;
  wrapped_master: WrappedKeyData;
}

export interface AuthenticateRequest {
  username: string;
  secret: string;
}

export interface ChangeSecretRequest {
  secret: string;
  wrapped_master: WrappedKeyData;
}

export interface CardCreateRequest {
  encrypted: EncryptedCardData;
  id: string;
}

export interface CardUpdateRequest {
  encrypted: EncryptedCardData;
  id: string;
  version: string;
}

export interface CardListItem {
  id: string;
  version: string;
  encrypted: EncryptedCardData;
}

export interface SessionData {
  user: string;
  token: string;
}

// Augment Express Request to include session data
declare global {
  namespace Express {
    interface Request {
      sessionData?: SessionData;
    }
  }
}
