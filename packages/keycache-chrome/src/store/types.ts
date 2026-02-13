export interface EncryptedCardData {
  iv64: string;
  cipherText64: string;
}

export interface WrappedKeyData {
  wrapped: string;
  iv: string;
  salt: string;
}

export interface CardClear {
  name: string;
  url: string;
  username: string;
  password: string;
  note: string;
  type: string;
}

export interface Card {
  id: string;
  version: string;
  encrypted?: EncryptedCardData;
  clear?: CardClear;
}

export interface UserState {
  username?: string;
  wrappedKey?: WrappedKeyData;
  user_id?: string;
}

export interface SettingsState {
  syncServerHost: string;
  useSyncServer: boolean;
}

export interface SessionState {
  masterKey: CryptoKey | null;
  sessionToken: string | null;
  passphrase: string | null;
}
