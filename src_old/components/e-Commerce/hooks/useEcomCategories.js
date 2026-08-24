import { useEffect, useState } from "react";
import axios from "axios";
import APP_CONFIG from "../../../config/constants";

// ─── useEcomCategories ───────────────────────────────────────────────────────
// Single shared place to fetch the item-type "categories" used by the
// e-commerce category carousel. Fetches `/api/e-com/itemtype-and-designs`
// ONLY when `enabled` is true — callers that gate on `isEcomEnable` (e.g. the
// Dashboard) must pass that flag straight through so no request fires while
// e-commerce is disabled.
export function useEcomCategories(enabled) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(!!enabled);

  useEffect(() => {
    if (!enabled) {
      setCategories([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchCategories = async () => {
      try {
        setLoading(true);
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const response = await axios.get(
          `${baseURL}/api/e-com/itemtype-and-designs`,
          {
            params: {
              store_id: APP_CONFIG.STORE_ID,
              branch_id: APP_CONFIG.BRANCH,
              isUser: true,
            },
          },
        );
        if (cancelled) return;
        const raw = response.data?.data || [];
        setCategories(raw.filter((item) => item.image && item.image.trim() !== ""));
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch e-com categories:", err);
          setCategories([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCategories();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { categories, loading };
}

export default useEcomCategories;
