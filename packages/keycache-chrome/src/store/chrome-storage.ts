import type { StateStorage } from "zustand/middleware";

/**
 * Zustand StateStorage adapter backed by chrome.storage.local.
 * Falls back to localStorage when chrome.storage is unavailable (dev/test).
 */
export const chromeStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      const result = await chrome.storage.local.get(name);
      return (result[name] as string) ?? null;
    }
    return localStorage.getItem(name);
  },

  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      await chrome.storage.local.set({ [name]: value });
      return;
    }
    localStorage.setItem(name, value);
  },

  removeItem: async (name: string): Promise<void> => {
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      await chrome.storage.local.remove(name);
      return;
    }
    localStorage.removeItem(name);
  },
};
