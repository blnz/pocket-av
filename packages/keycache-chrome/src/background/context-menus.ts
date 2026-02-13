export function setupContextMenus(): void {
  chrome.contextMenus.create({
    id: "keycache-open",
    title: "KeyCache",
    contexts: ["page"],
  });

  chrome.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === "keycache-open") {
      chrome.action.openPopup();
    }
  });
}
