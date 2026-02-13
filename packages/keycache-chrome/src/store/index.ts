import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { chromeStorage } from "./chrome-storage";
import type {
  Card,
  CardClear,
  EncryptedCardData,
  UserState,
  SettingsState,
  WrappedKeyData,
} from "./types";

export interface KeyCacheStore {
  // Persisted slices
  user: UserState;
  cards: Card[];
  settings: SettingsState;

  // Session-only (never persisted)
  masterKey: CryptoKey | null;
  sessionToken: string | null;
  passphrase: string | null;
  hydrated: boolean;

  // User actions
  setUser: (user: UserState) => void;
  clearUser: () => void;

  // Card actions
  addCard: (card: Card) => void;
  updateCard: (card: Card) => void;
  deleteCard: (id: string) => void;
  setCardClear: (id: string, clear: CardClear) => void;
  setCards: (cards: Card[]) => void;

  // Session actions
  setMasterKey: (key: CryptoKey | null) => void;
  setSessionToken: (token: string | null) => void;
  setPassphrase: (passphrase: string | null) => void;

  // Settings actions
  toggleSyncServer: () => void;
  setSyncServerHost: (host: string) => void;

  // Wipe
  wipeAll: () => void;
}

const initialSettings: SettingsState = {
  syncServerHost: "http://localhost:8000",
  useSyncServer: false,
};

export const useStore = create<KeyCacheStore>()(
  persist(
    (set) => ({
      // Persisted state
      user: {},
      cards: [],
      settings: { ...initialSettings },

      // Session state (not persisted)
      masterKey: null,
      sessionToken: null,
      passphrase: null,
      hydrated: false,

      // User
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: {} }),

      // Cards
      addCard: (card) =>
        set((state) => ({ cards: [card, ...state.cards] })),

      updateCard: (card) =>
        set((state) => ({
          cards: [
            card,
            ...state.cards.filter((c) => c.id !== card.id),
          ],
        })),

      deleteCard: (id) =>
        set((state) => ({
          cards: state.cards.filter((c) => c.id !== id),
        })),

      setCardClear: (id, clear) =>
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === id ? { ...c, clear } : c,
          ),
        })),

      setCards: (cards) => set({ cards }),

      // Session
      setMasterKey: (masterKey) => set({ masterKey }),
      setSessionToken: (sessionToken) => set({ sessionToken }),
      setPassphrase: (passphrase) => set({ passphrase }),

      // Settings
      toggleSyncServer: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            useSyncServer: !state.settings.useSyncServer,
          },
        })),

      setSyncServerHost: (host) =>
        set((state) => ({
          settings: { ...state.settings, syncServerHost: host },
        })),

      // Wipe
      wipeAll: () =>
        set({
          user: {},
          cards: [],
          settings: { ...initialSettings },
          masterKey: null,
          sessionToken: null,
          passphrase: null,
        }),
    }),
    {
      name: "keycache-store",
      storage: createJSONStorage(() => chromeStorage),
      partialize: (state) => ({
        user: state.user,
        cards: state.cards.map((c) => ({
          id: c.id,
          version: c.version,
          encrypted: c.encrypted,
        })),
        settings: state.settings,
      }),
      onRehydrateStorage: () => () => {
        useStore.setState({ hydrated: true });
      },
    },
  ),
);
