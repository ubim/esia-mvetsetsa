import type { CapacitorConfig } from "@capacitor/cli";

// The Android app loads the hosted Esia Mvetsetsa site, because translation runs on the server.
const config: CapacitorConfig = {
  appId: "mw.esiamvetsetsa.app",
  appName: "Esia Mvetsetsa",
  webDir: "public",
  server: {
    url: "https://id-preview--7fa610a4-5d69-45d7-8a69-1b6c79cfe097.lovable.app?forceHideBadge=true",
    cleartext: true,
  },
};

export default config;
