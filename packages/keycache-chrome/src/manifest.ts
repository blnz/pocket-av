import { ManifestV3Export } from "@crxjs/vite-plugin";

const manifest: ManifestV3Export = {
  manifest_version: 3,
  name: "KeyCache",
  version: "2.0.0",
  description: "Secure, open source password manager",
  icons: {
    "16": "src/assets/img/icon_16.png",
    "32": "src/assets/img/icon_32.png",
    "48": "src/assets/img/icon_48.png",
    "128": "src/assets/img/icon_128.png",
  },
  action: {
    default_title: "KeyCache",
    default_popup: "src/popup/index.html",
  },
  background: {
    service_worker: "src/background/service-worker.ts",
    type: "module" as const,
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content/content.ts"],
    },
  ],
  permissions: [
    "contextMenus",
    "tabs",
    "storage",
    "scripting",
    "activeTab",
  ] as chrome.runtime.ManifestPermissions[],
  host_permissions: ["<all_urls>"],
  web_accessible_resources: [
    {
      resources: [],
      matches: ["<all_urls>"],
    },
  ],
};

export default manifest;
