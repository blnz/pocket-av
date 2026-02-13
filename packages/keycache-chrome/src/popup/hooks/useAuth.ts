import { useCallback } from "react";
import { useStore } from "../../store";
import {
  generateMasterKey,
  wrapKey,
  unwrapKey,
  encryptString,
  decryptString,
  deriveBits,
  arrayBufferToHex,
} from "../../lib/crypto";
import * as syncApi from "../../lib/sync-api";
import type { CardClear } from "../../store/types";
import { updateCredentialIndex } from "../credential-index";

interface RegisterData {
  username: string;
  passphrase: string;
}

interface LoginData {
  passphrase: string;
}

export function useAuth() {
  const store = useStore();

  const register = useCallback(
    async (data: RegisterData) => {
      const masterKey = await generateMasterKey();
      const wrappedKey = await wrapKey(data.passphrase, masterKey);

      store.setUser({ username: data.username, wrappedKey });
      store.setMasterKey(masterKey);
      store.setPassphrase(data.passphrase);

      // Sync server registration
      if (store.settings.useSyncServer) {
        const bits = await deriveBits(
          data.passphrase,
          "sample-salt",
          100000,
        );
        const secret = arrayBufferToHex(bits);
        const result = await syncApi.register(
          store.settings.syncServerHost,
          secret,
          data.username,
          wrappedKey,
        );
        store.setUser({
          username: data.username,
          wrappedKey,
          user_id: result.user_id,
        });
      }
    },
    [store],
  );

  const login = useCallback(
    async (data: LoginData) => {
      const { wrappedKey } = store.user;
      if (!wrappedKey) throw new Error("No wrapped key found");

      const masterKey = await unwrapKey(data.passphrase, wrappedKey);
      store.setMasterKey(masterKey);
      store.setPassphrase(data.passphrase);

      // Decrypt all cards
      const cards = store.cards;
      for (const card of cards) {
        if (!card.clear && card.encrypted) {
          const json = await decryptString(masterKey, card.encrypted);
          const clear = JSON.parse(json) as CardClear;
          store.setCardClear(card.id, clear);
        }
      }

      // Update credential index for service worker
      await updateCredentialIndex(useStore.getState().cards);

      // Open remote session if sync enabled
      if (store.settings.useSyncServer) {
        const bits = await deriveBits(
          data.passphrase,
          "sample-salt",
          100000,
        );
        const secret = arrayBufferToHex(bits);
        const result = await syncApi.authenticate(
          store.settings.syncServerHost,
          secret,
          store.user.username!,
        );
        store.setSessionToken(result.session);
      }
    },
    [store],
  );

  const logout = useCallback(() => {
    const { sessionToken, settings } = useStore.getState();

    if (settings.useSyncServer && sessionToken) {
      syncApi
        .logout(settings.syncServerHost, sessionToken)
        .catch(console.error);
    }

    store.setMasterKey(null);
    store.setSessionToken(null);
    store.setPassphrase(null);

    // Clear decrypted card data
    const cards = useStore.getState().cards;
    store.setCards(
      cards.map((c) => ({
        id: c.id,
        version: c.version,
        encrypted: c.encrypted,
      })),
    );

    // Clear credential index
    if (typeof chrome !== "undefined" && chrome.storage?.session) {
      chrome.storage.session.remove("credentialIndex");
    }
  }, [store]);

  return { register, login, logout };
}
