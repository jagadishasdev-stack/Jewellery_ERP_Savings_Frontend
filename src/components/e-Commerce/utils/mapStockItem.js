// Maps a raw stock row (from /stocks, /stocks/trending, /stocks/new-arrivals,
// /stocks/recently-viewed — all the same shape) into the product object the
// section rows / ProductCard expect. Shared so every section (All Products,
// Top Deals, New Arrivals, Trending, Recently Viewed) maps identically.
const mapStockItem = (item) => ({
  tagno: item.tagno,
  label: `Tag #${item.tagno}`,
  currentPrice: item.actual_price ?? 0,
  actualPrice: item.false_price ?? 0,
  images: item.images,
  stockLeft: item.pcs ?? 1,
  // Names resolved dynamically by the backend (no hardcoded maps)
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
  // Engagement counters — power the "Trending" section (ranked by
  // wishlist + cart adds). Kept as numbers so the sort is stable.
  wish_list_count: item.wish_list_count ?? 0,
  added_to_cart_count: item.added_to_cart_count ?? 0,
  is_wishlisted: item.is_wishlisted || false,
  is_in_cart: item.is_in_cart || false,
});

export default mapStockItem;
