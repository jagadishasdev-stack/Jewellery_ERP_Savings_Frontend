import React, { createContext, useEffect, useState } from "react";
import { Preferences } from "@capacitor/preferences";
import { App as CapacitorApp } from "@capacitor/app";
import APP_CONFIG from "../config/constants";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [loginRole, setLoginRole] = useState(null);
  const [loginMobile, setLoginMobile] = useState(null);
  const [adminUser, setAdminUser] = useState(null);
  const [refreshDataKey, setRefreshDataKey] = useState(Date.now());
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const reloadFromPreferences = async () => {
    try {
      const [roleRes, mobileRes, adminUserRes] = await Promise.all([
        Preferences.get({ key: "loginRole" }),
        Preferences.get({ key: "loginMobile" }),
        Preferences.get({ key: "adminUser" }),
      ]);

      setLoginRole(roleRes.value || null);
      setLoginMobile(mobileRes.value || null);

      const raw = adminUserRes?.value;
      const parsed =
        raw && raw !== "undefined" && raw !== "null" ? JSON.parse(raw) : null;
      // setAdminUser(parsed);
      setAdminUser(parsed ? { ...parsed, role: roleRes.value || null } : null);
    } catch (err) {
      console.error("Error loading preferences:", err);
      setLoginRole(null);
      setLoginMobile(null);
      setAdminUser(null);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const saveLoginData = async ({ role, mobile, adminUser }) => {
    const mergedUser = { ...adminUser, role }; // bake role into the object itself
    await Preferences.set({ key: "loginRole", value: role });
    await Preferences.set({ key: "loginMobile", value: mobile });
    await Preferences.set({
      key: "adminUser",
      value: JSON.stringify(mergedUser ?? null),
    });

    // No branch saving – branch is always the default
    setLoginRole(role);
    setLoginMobile(mobile);
    setAdminUser(mergedUser);
    setRefreshDataKey(Date.now());
  };

  const clearLoginData = async () => {
    await Preferences.remove({ key: "loginRole" });
    await Preferences.remove({ key: "loginMobile" });
    await Preferences.remove({ key: "adminUser" });
    await Preferences.remove({ key: "userBranch" }); // clean up old key if present

    setLoginRole(null);
    setLoginMobile(null);
    setAdminUser(null);
    setRefreshDataKey(Date.now());
  };

  const updateAdminUser = async (updatedUser) => {
      const merged = updatedUser ? { ...updatedUser, role: loginRole } : null;
    await Preferences.set({
      key: "adminUser",
      value: JSON.stringify(merged ?? null),
    });
    setAdminUser(merged);
    setRefreshDataKey(Date.now());
  };

  useEffect(() => {
    reloadFromPreferences();
    let listener;
    const setupListener = async () => {
      listener = await CapacitorApp.addListener("appStateChange", (state) => {
        if (state.isActive) {
          reloadFromPreferences();
        }
      });
    };
    setupListener();
    return () => {
      if (listener && typeof listener.remove === "function") {
        listener.remove();
      }
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        loginRole,
        loginMobile,
        adminUser,
        refreshDataKey,
        isAuthLoading,
        saveLoginData,
        clearLoginData,
        reloadFromPreferences,
        updateAdminUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
