import { setupContextMenus } from "./context-menus";
import { setupMessageHandler } from "./message-handler";

chrome.runtime.onInstalled.addListener(() => {
  console.log("KeyCache service worker installed");
  setupContextMenus();
});

setupMessageHandler();
