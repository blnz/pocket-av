import { useCallback } from "react";
import { useStore } from "../../store";
import { decryptString, encryptString } from "../../lib/crypto";
import * as syncApi from "../../lib/sync-api";
import type { Card, CardClear } from "../../store/types";

export function useSync() {
  const store = useStore();

  const pullCards = useCallback(async () => {
    const state = useStore.getState();
    if (
      !state.settings.useSyncServer ||
      !state.sessionToken ||
      !state.user.user_id ||
      !state.masterKey
    ) {
      return;
    }

    const remoteCards = await syncApi.listCards(
      state.settings.syncServerHost,
      state.sessionToken,
      state.user.user_id,
    );

    for (const remote of remoteCards) {
      const existing = state.cards.find((c) => c.id === remote.id);
      if (!existing) {
        const clear = JSON.parse(
          await decryptString(state.masterKey, remote.encrypted),
        ) as CardClear;
        store.addCard({
          id: remote.id,
          version: remote.version,
          encrypted: remote.encrypted,
          clear,
        });
      }
    }
  }, [store]);

  const pushCards = useCallback(async () => {
    const state = useStore.getState();
    if (
      !state.settings.useSyncServer ||
      !state.sessionToken ||
      !state.user.user_id ||
      !state.masterKey
    ) {
      return;
    }

    for (const card of state.cards) {
      if (card.encrypted) {
        await syncApi.createCard(
          state.settings.syncServerHost,
          state.sessionToken,
          state.user.user_id,
          card.id,
          card.encrypted,
        );
      }
    }
  }, [store]);

  return { pullCards, pushCards };
}
