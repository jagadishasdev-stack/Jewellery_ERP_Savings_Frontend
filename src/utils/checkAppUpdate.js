// import { Capacitor } from "@capacitor/core";
// import { AppUpdate, AppUpdateAvailability } from "@capawesome/capacitor-app-update";
// import APP_CONFIG from "../config/constants";
// const checkAppUpdate = async () => {
//    const appleid = APP_CONFIG.appleid;
//   // Only run on real Android or iOS device, not browser
//   if (!Capacitor.isNativePlatform()) return;

//   try {
//     const result = await AppUpdate.getAppUpdateInfo();
//     console.log("App Update Info:", result);

//     const platform = Capacitor.getPlatform();

//     // ── ANDROID ──────────────────────────────────────────
//     if (platform === "android") {
//       if (result.updateAvailability === AppUpdateAvailability.UPDATE_AVAILABLE) {

//         if (result.immediateUpdateAllowed) {
//           // Full screen forced update — user CANNOT skip
//           await AppUpdate.performImmediateUpdate();
//         } else {
//           // Immediate not allowed by Play Store policy, open store instead
//           await AppUpdate.openAppStore();
//         }
//       }
//     }

//     // ── iOS ───────────────────────────────────────────────
//     // iOS does NOT support forced updates (Apple policy)
//     // So we compare version names and show a confirm alert
//    if (platform === "ios") {
//   const currentVersion = result.currentVersionName;   // from Info.plist ✅
//   const availableVersion = result.availableVersionName; // from App Store ✅

//   if (
//     result.updateAvailability === AppUpdateAvailability.UPDATE_AVAILABLE &&
//     availableVersion &&
//     currentVersion !== availableVersion
//   ) {
//     const shouldUpdate = window.confirm(
//       `A new version (${availableVersion}) is available! Please update to continue.`
//     );

//     if (shouldUpdate) {
//       // ⚠️ YOU MUST pass your Apple App ID here
//       await AppUpdate.openAppStore({
//         appId:appleid  // 👈 replace with your actual Apple App ID
//         // Find it at: https://apps.apple.com/app/id????????
//       });
//     }
//   }
// }

//   } catch (error) {
//     console.log("Update check error:", error);
//   }
// };

// export default checkAppUpdate;

// src/utils/checkAppUpdate.js

// src/utils/checkAppUpdate.js

// src/utils/checkAppUpdate.js

import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import axios from "axios";
import {
  AppUpdate,
  AppUpdateAvailability,
} from "@capawesome/capacitor-app-update";
import APP_CONFIG from "../config/constants";

// ─── Run your original @capawesome store check ───────────────────────────────
// This runs independently — does NOT block backend check
const runFrontendStoreCheck = async (platform) => {
  try {
    const result = await AppUpdate.getAppUpdateInfo();
    // console.log("[AppUpdate] Store result:", result);

    // ── ANDROID ──────────────────────────────────────────────────────────
    if (platform === "android") {
      if (result.updateAvailability === AppUpdateAvailability.UPDATE_AVAILABLE) {
        if (result.immediateUpdateAllowed) {
          await AppUpdate.performImmediateUpdate(); // native full-screen sheet
        } else {
          await AppUpdate.openAppStore();
        }
      }
    }

    // ── iOS ───────────────────────────────────────────────────────────────
    if (platform === "ios") {
      const currentVersion = result.currentVersionName;
      const availableVersion = result.availableVersionName;

      if (
        result.updateAvailability === AppUpdateAvailability.UPDATE_AVAILABLE &&
        availableVersion &&
        currentVersion !== availableVersion
      ) {
        const shouldUpdate = window.confirm(
          `A new version (${availableVersion}) is available! Please update to continue.`
        );
        if (shouldUpdate) {
          await AppUpdate.openAppStore({ appId: APP_CONFIG.appleid });
        }
      }
    }
  } catch (err) {
    // Store check failed — backend will still run independently
    console.warn("[AppUpdate] Store check failed:", err.message);
  }
};

// ─── Run backend check — always runs regardless of frontend result ────────────
const runBackendCheck = async (version, platform) => {
  try {
    const res = await axios.get(
      `${process.env.REACT_APP_API_BASE_URL}/api/core/check-app-update`,
      {
        params: { version, platform,storeId: APP_CONFIG.STORE_ID },
        timeout: 10000,
      }
    );

    const data = res.data;
    // console.log("[AppUpdate] Backend response:", data);

    if (data.force) {
      return {
        type: "force",
        message: data.message,
        url: data.store_url,
        latest_version: data.latest_version,
        source: "backend",
      };
    }

    if (data.soft) {
      return {
        type: "soft",
        message: data.message,
        url: data.store_url,
        latest_version: data.latest_version,
        source: "backend",
      };
    }

    return { type: "none" };

  } catch (err) {
    // Backend unreachable — no fallback, just do nothing
    console.warn("[AppUpdate] Backend unreachable:", err.message);
    return { type: "none" };
  }
};

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export const checkAppUpdate = async () => {
  if (!Capacitor.isNativePlatform()) {
    return { type: "none" };
  }

  const platform = Capacitor.getPlatform(); // "android" | "ios" — no Device plugin needed

  let version = "0.0.0";
  try {
    const appInfo = await App.getInfo();
    version = appInfo.version; // reads from versionName in build.gradle ✅
  } catch (e) {
    console.warn("[AppUpdate] Could not read app version:", e.message);
  }

  // ── Run BOTH independently — frontend does not block backend ─────────────
  const [, backendResult] = await Promise.all([
    runFrontendStoreCheck(platform), // fire and forget — handles its own UI
    runBackendCheck(version, platform), // always runs, returns modal state
  ]);

  return backendResult; // only backend result drives YOUR modal
};