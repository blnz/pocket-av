import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { migrateFromV2 } from "../lib/migrate";

// Run one-time v2 -> v3 migration before rendering
migrateFromV2().then((migrated) => {
  if (migrated) {
    console.log("KeyCache: migrated v2 data to chrome.storage.local");
  }

  const root = createRoot(document.getElementById("root")!);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
