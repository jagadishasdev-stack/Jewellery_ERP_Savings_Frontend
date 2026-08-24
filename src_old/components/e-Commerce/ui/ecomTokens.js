// ─── E-Commerce Design Tokens ────────────────────────────────────────────────
// Single source of truth for the redesigned "premium jewellery editorial" look.
// Everything keys off the existing global brand palette in src/theme.js so the
// module stays visually consistent with the rest of the app (gold #B98A46 /
// black / cream) — this file only adds the layout language (type, radius,
// shadow, spacing) on top of those brand colors.
import theme from "../../../theme";

export const GOLD = theme.colors.primaryButton; // #B98A46
export const INK = "#1A1A1A";
export const INK_SOFT = "#565350";
export const MUTED = "#8A8A8A";
export const LINE = "#ECE6DB"; // hairline on cream/white
export const SURFACE = "#FFFFFF";
export const SURFACE_ALT = "#FAF7F1"; // warm off-white section background
export const CREAM = "#FFFDF9";
export const IMG_BG = "#F4F1EC"; // neutral behind product photos (no black bars)

// Signature black→gold gradient used for primary CTAs / hero bands.
export const GRADIENT = theme.theme2.gradient?.[0] || theme.theme2.loginBtn;

// Typography — clean, modern sans-serif to match the app's older UI. (The
// previous serif display face read as too decorative; headings now use a
// simple elegant sans with heavier weight for hierarchy — see SectionHeading.)
export const FONT_BODY = "Inter, system-ui, sans-serif";
export const FONT_DISPLAY = FONT_BODY;

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
export const RADIUS = {
  card: "16px",
  tile: "20px",
  sheet: "24px",
  pill: "999px",
  sm: "10px",
};

// Soft, premium shadow scale
export const SHADOW = {
  sm: "0 1px 4px rgba(24,20,12,0.06)",
  md: "0 4px 16px rgba(24,20,12,0.08)",
  lg: "0 10px 30px rgba(24,20,12,0.12)",
  bar: "0 -6px 24px rgba(24,20,12,0.10)",
};

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
