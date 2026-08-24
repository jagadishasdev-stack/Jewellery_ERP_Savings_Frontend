// Maps a full stock row (as returned by the cart / stock APIs) into the exact
// product shape that ProductViewer expects via navigation state — identical to
// the `mapItem` builder used by the product grids. Keeping it in one place lets
// the Cart reuse the same shape without duplicating the mapping inline.
export const mapStockToProduct = (stock = {}) => ({
  tagno: stock.tagno,
  label: `Tag #${stock.tagno}`,
  currentPrice: stock.actual_price ?? 0,
  actualPrice: stock.false_price ?? 0,
  images: stock.images,
  stockLeft: stock.pcs ?? 1,
  itemtype_name: stock.itemtype_name ?? null,
  design_name: stock.design_name ?? null,
  metaltype_name: stock.metaltype_name ?? null,
  purity_name: stock.purity_name ?? null,
  productType: stock.metaltype_name ?? stock.itemtype_name ?? null,
  gross: stock.gross,
  netwt: stock.netwt,
  purity: stock.purity,
  metaltype: stock.metaltype,
  itemtype: stock.itemtype,
  design: stock.design,
  flag: stock.flag,
  entrydate: stock.entrydate,
  category: stock.category,
  is_wishlisted: stock.is_wishlisted || false,
  is_in_cart: true,
});
