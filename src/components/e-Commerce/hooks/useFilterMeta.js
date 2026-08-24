import { useEffect, useState } from "react";
import axios from "axios";
import APP_CONFIG from "../../../config/constants";

// ─── useFilterMeta ───────────────────────────────────────────────────────────
// Loads the store's REAL, dynamic filter options (metals + purities) from the
// backend `/api/e-com/filter-meta` endpoint. Each option is { id, name } where
// `id` is the value stored on the stock row (metal_id / Purity_id) and `name`
// is the DB display label. Fetched only when `enabled` is true.
export function useFilterMeta(enabled) {
  const [meta, setMeta] = useState({ metals: [], purities: [] });

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;

    (async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const res = await axios.get(`${baseURL}/api/e-com/filter-meta`, {
          params: {
            store_id: APP_CONFIG.STORE_ID,
            branch_id: APP_CONFIG.BRANCH,
          },
        });
        if (cancelled) return;
        setMeta({
          metals: res.data?.data?.metals || [],
          purities: res.data?.data?.purities || [],
        });
      } catch (err) {
        if (!cancelled) console.error("Failed to load filter meta:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return meta;
}

export default useFilterMeta;
