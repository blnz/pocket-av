import { useCallback } from "react";
import { useStore } from "../../store";
import { encryptString } from "../../lib/crypto";
import * as syncApi from "../../lib/sync-api";
import type { Card, CardClear } from "../../store/types";
import { updateCredentialIndex } from "../credential-index";

export function useCards() {
  const store = useStore();

  const addCard = useCallback(
    async (clearData: CardClear) => {
      const { masterKey } = useStore.getState();
      if (!masterKey) throw new Error("Not authenticated");

      const encrypted = await encryptString(
        masterKey,
        JSON.stringify(clearData),
      );

      const card: Card = {
        id: crypto.randomUUID(),
        version: new Date().toISOString(),
        clear: clearData,
        encrypted,
      };

      store.addCard(card);
      await updateCredentialIndex(useStore.getState().cards);

      // Sync to server
      const state = useStore.getState();
      if (
        state.settings.useSyncServer &&
        state.sessionToken &&
        state.user.user_id
      ) {
        syncApi
          .createCard(
            state.settings.syncServerHost,
            state.sessionToken,
            state.user.user_id,
            card.id,
            encrypted,
          )
          .catch(console.error);
      }
    },
    [store],
  );

  const updateCard = useCallback(
    async (card: Card) => {
      const { masterKey } = useStore.getState();
      if (!masterKey || !card.clear) throw new Error("Not authenticated");

      const encrypted = await encryptString(
        masterKey,
        JSON.stringify(card.clear),
      );

      const updated: Card = {
        ...card,
        version: new Date().toISOString(),
        encrypted,
      };

      store.updateCard(updated);
      await updateCredentialIndex(useStore.getState().cards);

      // Sync
      const state = useStore.getState();
      if (
        state.settings.useSyncServer &&
        state.sessionToken &&
        state.user.user_id
      ) {
        syncApi
          .updateCard(
            state.settings.syncServerHost,
            state.sessionToken,
            state.user.user_id,
            card.id,
            encrypted,
            card.version,
          )
          .catch(console.error);
      }
    },
    [store],
  );

  const removeCard = useCallback(
    async (card: Card) => {
      store.deleteCard(card.id);
      await updateCredentialIndex(useStore.getState().cards);

      const state = useStore.getState();
      if (
        state.settings.useSyncServer &&
        state.sessionToken &&
        state.user.user_id
      ) {
        syncApi
          .deleteCard(
            state.settings.syncServerHost,
            state.sessionToken,
            state.user.user_id,
            card.id,
          )
          .catch(console.error);
      }
    },
    [store],
  );

  return { addCard, updateCard, removeCard };
}
