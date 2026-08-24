// pushNotifications.js
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { Preferences } from "@capacitor/preferences";
import axios from "axios";
import APP_CONFIG from './config/constants'
const ENABLE_PUSH_NOTIFICATIONS = true;
const PUSH_INIT_COUNT_KEY = "push_init_count";
const MAX_PUSH_INIT = 2;


export async function initPushNotifications(startup = false) {
  if (!Capacitor.isNativePlatform()) return;
  if (!ENABLE_PUSH_NOTIFICATIONS) return;

  // ✅ Count check — startup only
  if (startup) {
    const { value: countStr } = await Preferences.get({ key: PUSH_INIT_COUNT_KEY });
    const count = parseInt(countStr || "0", 10);
    if (count >= MAX_PUSH_INIT) {
      console.log("Push already initialized max times, skipping.");
      return;
    }

    // ✅ Permission check
    let perm = await PushNotifications.requestPermissions();
    if (perm.receive === "denied") { showPermissionDeniedBanner(); return; }
    if (perm.receive !== "granted")  { showPermissionDeniedBanner(); return; }

    // ✅ Increase count only after granted
    await Preferences.set({ key: PUSH_INIT_COUNT_KEY, value: String(count + 1) });

  } else {
    // OTP login — permission check only, no count
    let perm = await PushNotifications.requestPermissions();
    if (perm.receive === "denied") { showPermissionDeniedBanner(); return; }
    if (perm.receive !== "granted") { showPermissionDeniedBanner(); return; };
  }

  // ✅ Runs for both — register and listeners
  await PushNotifications.register();

  PushNotifications.addListener("registration", async (token) => {
    await Preferences.set({ key: "fcm_token", value: token.value }); // removed unused storedToken

    const { value: adminUserData } = await Preferences.get({ key: "adminUser" });
    let userId = null;
    if (adminUserData) {
      try {
        const parsedUser = JSON.parse(adminUserData);
        userId = parsedUser?.user_id || null;
      } catch (e) { console.error(e); }
    }
    if (userId) await saveTokenToBackend(userId, token.value);
  });

  PushNotifications.addListener("tokenRefresh", async (newToken) => {
    const { value: adminUserData } = await Preferences.get({ key: "adminUser" });
    let userId = null;
    if (adminUserData) {
      try {
        const parsedUser = JSON.parse(adminUserData);
        userId = parsedUser?.user_id || null;
      } catch (e) { console.error(e); }
    }
    if (userId) {
      await saveTokenToBackend(userId, newToken.value);
      await Preferences.set({ key: "fcm_token", value: newToken.value });
    }
  });

  PushNotifications.addListener("pushNotificationReceived", () => {});
}
async function saveTokenToBackend(userId, token) {
  try {
    await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/push/save-token`, {
      user_id: userId,
      fcmToken: token,
    });
    // console.log("✅ Token saved successfully for user:", userId);
  } catch (err) {
    console.error("❌ Error saving token to backend:", err.message);
  }
}

function showPermissionDeniedBanner() {
  const existing = document.getElementById("permission-denied-banner");
  if (existing) existing.remove();

  const banner = document.createElement("div");
  banner.id = "permission-denied-banner";
  banner.innerHTML = `
    <style>
      @keyframes fadeScaleIn {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.85); }
        to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
      }
    </style>

    <!-- Dark Overlay -->
    <div style="
      position: fixed;
      top: 0; left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.6);
      z-index: 99998;
    "></div>

    <!-- Popup Card -->
    <div style="
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 88vw;
      max-width: 380px;
      background: #1a1a1a;
      border-radius: 20px;
      padding: 24px 20px 20px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.6);
      z-index: 99999;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      animation: fadeScaleIn 0.3s ease forwards;
    ">

      <!-- Bell Icon Circle -->
      <div style="
        width: 64px;
        height: 64px;
        border-radius: 50%;
        background: rgba(255,193,7,0.15);
        border: 2px solid #ffc107;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
      ">🔔</div>

      <!-- Title -->
      <span style="
        font-size: 17px;
        font-weight: 700;
        color: #ffffff;
        text-align: center;
        line-height: 1.3;
      ">
        Notifications are Turned Off
      </span>

      <!-- Divider -->
      <div style="width: 100%; height: 1px; background: rgba(255,255,255,0.1);"></div>

      <!-- Message -->
      <span style="
        font-size: 13px;
        line-height: 1.7;
        color: rgba(255,255,255,0.75);
        text-align: center;
      ">
        You will miss important updates and alerts.<br/>
        To enable, go to your phone<br/>
        <strong style="color:#ffc107;">
          Settings → Notifications →${APP_CONFIG.app_name}
        </strong><br/>
        and turn on notifications.
      </span>

      <!-- OK Button -->
      <button
        onclick="document.getElementById('permission-denied-banner').remove()"
        style="
          margin-top: 4px;
          width: 100%;
          background: #ffc107;
          color: #1a1a1a;
          border: none;
          border-radius: 12px;
          padding: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.3px;
        "
      >
        OK, Got it
      </button>

    </div>
  `;

  document.body.appendChild(banner);

  setTimeout(() => {
    const el = document.getElementById("permission-denied-banner");
    if (el) el.remove();
  }, 15000);
}