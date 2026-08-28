import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.lingbao.app",
  appName: "灵宝 AI 伴学",
  webDir: "dist",
  bundledWebRuntime: false,
  backgroundColor: "#0b0b1e",
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: "#0b0b1e",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0b0b1e",
    },
  },
};

export default config;