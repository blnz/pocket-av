export interface CredentialEntry {
  username: string;
  password: string;
}

export type CredentialIndex = Record<string, CredentialEntry>;

export async function getCredentialIndex(): Promise<CredentialIndex> {
  const result = await chrome.storage.session.get("credentialIndex");
  return (result.credentialIndex as CredentialIndex) ?? {};
}

export async function setCredentialIndex(
  index: CredentialIndex,
): Promise<void> {
  await chrome.storage.session.set({ credentialIndex: index });
}
