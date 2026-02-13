import { getCredentialIndex } from "./storage-utils";

export function setupMessageHandler(): void {
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.from === "content" && msg.subject === "foundForm") {
      handleFoundForm(sender).then(sendResponse);
      return true; // async response
    }
    return false;
  });
}

async function handleFoundForm(
  sender: chrome.runtime.MessageSender,
): Promise<void> {
  if (!sender.tab?.id || !sender.url) return;

  const { hostname } = new URL(sender.url);
  const index = await getCredentialIndex();
  const cred = index[hostname];

  if (cred) {
    chrome.tabs.sendMessage(sender.tab.id, {
      subject: "fillForm",
      username: cred.username,
      password: cred.password,
    });
  }
}
