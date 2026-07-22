import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.soulfit.dashboard",
  appName: "SoulFit",
  webDir: "out",
  server: {
    hostname: "localhost",
    androidScheme: "https",
    iosScheme: "https"
  }
};

export default config;
