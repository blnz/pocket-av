import type { Card } from "../store/types";
import type { CredentialIndex } from "../background/storage-utils";

/**
 * Build and write the credential index to chrome.storage.session
 * so the service worker can handle autofill requests without the master key.
 */
export async function updateCredentialIndex(
  cards: Card[],
): Promise<void> {
  if (typeof chrome === "undefined" || !chrome.storage?.session) return;

  const index: CredentialIndex = {};

  for (const card of cards) {
    if (
      card.clear &&
      card.clear.type === "web" &&
      card.clear.url &&
      card.clear.username
    ) {
      index[card.clear.url] = {
        username: card.clear.username,
        password: card.clear.password,
      };
    }
  }

  await chrome.storage.session.set({ credentialIndex: index });
}
