import { useState, useEffect } from "react";

// ─── useRecentlyViewed ───────────────────────────────────────────────────────
// Frontend-only recently-viewed list backed by device localStorage. NO backend,
// NO API calls, no contract impact. Stores a small, capped list of the same
// lightweight product objects the app already passes through router state to
// ProductViewer, so the Home rail can render them with the existing ProductCard.
const STORAGE_KEY = "ecom_recently_viewed";
const MAX_ITEMS = 12;

const readStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export function useRecentlyViewed() {
  const [items, setItems] = useState(readStore);

  // Keep in sync if another screen updated the list while this one was mounted.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setItems(readStore());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return items;
}

// Record a viewed product (call on the product detail screen). Keeps the most
// recent first, de-duplicates by tagno, and caps the list length. Stores only
// the small fields the card/nav need — never anything sensitive.
export function recordRecentlyViewed(product) {
  if (!product || product.tagno == null) return;
  try {
    const current = readStore().filter((p) => p.tagno !== product.tagno);
    const slim = {
      tagno: product.tagno,
      label: product.label ?? `Tag #${product.tagno}`,
      currentPrice: product.currentPrice ?? 0,
      actualPrice: product.actualPrice ?? 0,
      images: Array.isArray(product.images) ? product.images.slice(0, 1) : [],
      productType: product.productType,
      itemtype: product.itemtype,
      metaltype: product.metaltype,
      purity: product.purity,
      design: product.design,
      // resolved names so the Recently Viewed rail shows real labels
      itemtype_name: product.itemtype_name ?? null,
      design_name: product.design_name ?? null,
      metaltype_name: product.metaltype_name ?? null,
      purity_name: product.purity_name ?? null,
    };
    const next = [slim, ...current].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable / quota — silently ignore, it's non-critical
  }
}

export default useRecentlyViewed;
