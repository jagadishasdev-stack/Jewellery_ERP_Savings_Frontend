import { useState, useEffect, useContext } from "react";
import axios from "axios";
import APP_CONFIG from "../../../config/constants";
import { AuthContext } from "../../../contexts/AuthContext";
import mapStockItem from "../utils/mapStockItem";

// ─── useRecentlyViewed ───────────────────────────────────────────────────────
// Server-backed recently-viewed list: the products this signed-in user opened
// in the last 24 hours, most-recent first. ALL the logic (which items, the 24h
// window, de-duplication, ordering) lives in the backend endpoint
// GET /api/e-com/stocks/recently-viewed — the frontend only fetches and shows.
// Views are recorded server-side when the product detail is opened, so there is
// nothing to record here. Returns [] (the section then hides) when the user
// isn't signed in or has no recent views.
export function useRecentlyViewed() {
  const { adminUser } = useContext(AuthContext);
  const userId = adminUser?.user_id;
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!userId) {
      setItems([]);
      return;
    }
    let active = true;
    (async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const res = await axios.get(
          `${baseURL}/api/e-com/stocks/recently-viewed`,
          {
            params: {
              store_id: APP_CONFIG.STORE_ID,
              branch_id: APP_CONFIG.BRANCH,
              user_id: userId,
            },
          },
        );
        if (active) setItems((res.data?.data || []).map(mapStockItem));
      } catch {
        // non-critical — just hide the section
        if (active) setItems([]);
      }
    })();
    return () => {
      active = false;
    };
  }, [userId]);

  return items;
}

export default useRecentlyViewed;
