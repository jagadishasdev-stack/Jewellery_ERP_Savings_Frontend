// ─── E-Commerce Design Tokens ────────────────────────────────────────────────
// Thin adapter over the global theme's dedicated e-commerce section
// (`theme.ecommerce` in src/theme.js). All e-commerce colors, gradient, type,
// radius and shadow live there so the whole module is themed from one place;
// this file only re-exports them under the names the components already use and
// adds a couple of pure formatting helpers (productTitle, inr).
import theme from "../../../theme";

const ecom = theme.ecommerce;

export const GOLD = ecom.gold; // #B98A46
export const INK = ecom.ink;
export const INK_SOFT = ecom.inkSoft;
export const MUTED = ecom.muted;
export const LINE = ecom.line; // hairline on cream/white
export const SURFACE = ecom.surface;
export const SURFACE_ALT = ecom.surfaceAlt; // warm off-white section background
export const CREAM = ecom.cream;
export const IMG_BG = ecom.imgBg; // neutral behind product photos (no black bars)

// Signature red→black gradient used for primary CTAs / hero bands.
export const GRADIENT = ecom.gradient;

// Typography — clean, modern sans-serif to match the app's older UI.
export const FONT_BODY = ecom.fontBody;
export const FONT_DISPLAY = ecom.fontDisplay;

// "MetalName #TagNo" label used on product cards and the detail page.
// The metal/type name is resolved dynamically by the backend (metaltype_name),
// so there are no hardcoded ID→name maps here anymore.
export const productTitle = (product = {}) =>
  `${
    product.metaltype_name ||
    product.itemtype_name ||
    product.productType ||
    "Jewellery"
  } #${product.tagno}`;

// Radius scale
export const RADIUS = ecom.radius;

// Soft, premium shadow scale
export const SHADOW = ecom.shadow;

// Format a number as Indian rupees, no decimals (matches existing displays).
export const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const tokens = {
  GOLD,
  INK,
  INK_SOFT,
  MUTED,
  LINE,
  SURFACE,
  SURFACE_ALT,
  CREAM,
  IMG_BG,
  GRADIENT,
  FONT_DISPLAY,
  FONT_BODY,
  RADIUS,
  SHADOW,
  inr,
};

export default tokens;
