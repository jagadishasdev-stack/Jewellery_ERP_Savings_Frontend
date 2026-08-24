import { useState, useEffect } from "react";
import axios from "axios";
import APP_CONFIG from "../../../config/constants";

// ─── useRelatedProducts ──────────────────────────────────────────────────────
// Fetches "you may also like" products using the EXISTING endpoint
// GET /api/e-com/stocks/filter (same one AllProductsSection already calls),
// filtered to the same itemtype (category) as the current product. No new API,
// no contract change — just an additional read of an endpoint that already
// exists. Excludes the current tag and returns products mapped to the exact
// shape ProductCard / the /e-com/product route expect.
const ALLOWED_FLAGS = ["F", "N", "E"];

const mapItem = (item) => ({
  tagno: item.tagno,
  label: `Tag #${item.tagno}`,
  currentPrice: item.actual_price ?? 0,
  actualPrice: item.false_price ?? 0,
  images: item.images,
  stockLeft: item.pcs ?? 1,
  itemtype_name: item.itemtype_name ?? null,
  design_name: item.design_name ?? null,
  metaltype_name: item.metaltype_name ?? null,
  purity_name: item.purity_name ?? null,
  productType: item.metaltype_name ?? item.itemtype_name ?? null,
  gross: item.gross,
  netwt: item.netwt,
  purity: item.purity,
  metaltype: item.metaltype,
  itemtype: item.itemtype,
  design: item.design,
  flag: item.flag,
  entrydate: item.entrydate,
  category: item.category,
  is_wishlisted: item.is_wishlisted || false,
  is_in_cart: item.is_in_cart || false,
});

export function useRelatedProducts({ itemtype, excludeTagno, userId, limit = 12 }) {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (itemtype == null) {
      setRelated([]);
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const res = await axios.get(`${baseURL}/api/e-com/stocks/filter`, {
          params: {
            store_id: APP_CONFIG.STORE_ID,
            branch_id: APP_CONFIG.BRANCH,
            user_id: userId,
            page: 1,
            limit,
            itemtype,
          },
        });
        if (cancelled) return;
        const mapped = (res.data?.data || [])
          .filter((it) => ALLOWED_FLAGS.includes(it.flag))
          .filter((it) => it.tagno !== excludeTagno)
          .map(mapItem);
        setRelated(mapped);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch related products:", err);
          setRelated([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [itemtype, excludeTagno, userId, limit]);

  return { related, loading };
}

export default useRelatedProducts;
