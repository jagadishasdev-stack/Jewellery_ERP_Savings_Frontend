
import type { CapacitorConfig } from "@capacitor/cli";
import { KeyboardResize } from "@capacitor/keyboard";

const config: CapacitorConfig = {
  appId: "com.jewelsphere.dlj",
  appName: "Dhanalakshmi Jewellers",
  webDir: "build",
  server: {
    androidScheme: "http", // ✅ Force HTTP in Android WebView
    cleartext: true, // ✅ Allow cleartext (non-HTTPS) requests
  },
  plugins: {
    StatusBar: {
      style: "#ffff",
      backgroundColor: "#000000",
    },
    Keyboard: {
      resize: KeyboardResize.Body,
    },
    FirebaseMessaging: {
      presentationOptions: ["alert", "badge", "sound"],
    },
    // SafeArea: {
    //   enabled: true, // ✅ Turn it on
    //   customColorsForSystemBars: true, // ✅ Control system bar colors
    //   statusBarColor: "#000000",
    //   statusBarContent: "light", // light/dark
    //   navigationBarColor: "#000000",
    //   navigationBarContent: "light", // light/dark
    //   offset: 0,
    // },
  },
};

export default config;
