
import { SafeArea } from "capacitor-plugin-safe-area";
import { useState, useEffect } from "react";

export const getSafeAreaInsets = async () => {
  try {
    if (window.Capacitor?.isNativePlatform) {
      const { insets } = await SafeArea.getSafeAreaInsets();
      return insets;
    }
  } catch (e) {
    console.warn("SafeArea plugin failed, using fallback:", e);
  }
  return { top: 34, bottom: 20, left: 0, right: 0 }; // fallback
};

// 🔹 Only top inset
export const useSafeAreaTop = () => {
  const [top, setTop] = useState("0px"); // fallback for iOS notch
  useEffect(() => {
    const updateTop = async () => {
      const insets = await getSafeAreaInsets();
      setTop(`${insets.top}px`);
    };
    updateTop();
    window.addEventListener("resize", updateTop);
    return () => window.removeEventListener("resize", updateTop);
  }, []);
  return top;
};

// 🔹 Only bottom inset
export const useSafeAreaBottom = () => {
  const [bottom, setBottom] = useState("0px"); // fallback for iOS bottom safe area
  useEffect(() => {
    const updateBottom = async () => {
      const insets = await getSafeAreaInsets();
      setBottom(`${insets.bottom}px`);
    };
    updateBottom();
    window.addEventListener("resize", updateBottom);
    return () => window.removeEventListener("resize", updateBottom);
  }, []);
  return bottom;
};
