/**
 * One-time migration from v2 (localStorage-based) to v3 (chrome.storage.local).
 *
 * The old extension stored state in localStorage under key 'state' with shape:
 * { user: { username, wrappedKey }, cards: [...], settings: { syncServerHost, useSyncServer } }
 *
 * Cards were stored as: { id, version, encrypted: { iv64, cipherText64 } }
 * (clear data was stripped before persistence)
 */

interface OldCard {
  id: string;
  version: string;
  encrypted?: {
    iv64: string;
    cipherText64: string;
  };
}

interface OldState {
  user?: {
    username?: string;
    wrappedKey?: {
      wrapped: string;
      iv: string;
      salt: string;
    };
    user_id?: string;
  };
  cards?: OldCard[];
  settings?: {
    syncServerHost?: string;
    useSyncServer?: boolean;
  };
}

const MIGRATION_FLAG = "keycache-v3-migrated";

export async function migrateFromV2(): Promise<boolean> {
  // Only run in popup context where localStorage is available
  if (typeof localStorage === "undefined") return false;
  if (typeof chrome === "undefined" || !chrome.storage?.local) return false;

  // Check if already migrated
  const flagResult = await chrome.storage.local.get(MIGRATION_FLAG);
  if (flagResult[MIGRATION_FLAG]) return false;

  const raw = localStorage.getItem("state");
  if (!raw) {
    await chrome.storage.local.set({ [MIGRATION_FLAG]: true });
    return false;
  }

  let oldState: OldState;
  try {
    oldState = JSON.parse(raw);
  } catch {
    await chrome.storage.local.set({ [MIGRATION_FLAG]: true });
    return false;
  }

  // Build the new Zustand-compatible persisted state
  const newState = {
    state: {
      user: oldState.user ?? {},
      cards: (oldState.cards ?? []).map((c) => ({
        id: c.id,
        version: c.version,
        encrypted: c.encrypted,
      })),
      settings: {
        syncServerHost:
          oldState.settings?.syncServerHost ?? "http://localhost:8000",
        useSyncServer: oldState.settings?.useSyncServer ?? false,
      },
    },
    version: 0,
  };

  await chrome.storage.local.set({
    "keycache-store": JSON.stringify(newState),
    [MIGRATION_FLAG]: true,
  });

  return true;
}
