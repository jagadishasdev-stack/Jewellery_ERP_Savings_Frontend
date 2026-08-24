import { Box, Typography, Skeleton } from "@mui/material";
import theme from "../../theme";
import React, { useState, useContext, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Share } from "@capacitor/share";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

// Icons
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import ReplyRoundedIcon from "@mui/icons-material/ReplyRounded";
import RotateRightRoundedIcon from "@mui/icons-material/RotateRightRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import MetalDetailsIcon from "../../assets/img/icons/metal_details.svg";
import GoldCoinIcon from "../../assets/img/icons/gold-price-breakdown.svg";
import ImageViewerDialog from "../ImageViewerDialog";
import BottomSheet from "./ui/BottomSheet";

import CircularProgress from "@mui/material/CircularProgress";
import { AuthContext } from "../../contexts/AuthContext";
import APP_CONFIG from "../../config/constants";
import axios from "axios";
import { EcomContext } from "../../contexts/EcomContext";
import { useSafeAreaBottom } from "../../SafeAreaFile";
import useEcomScrollTop from "./hooks/useEcomScrollTop";

import ProductCard from "./ProductCard";
import TrustSection from "./TrustSection";
import DeliveryDetails from "./DeliveryDetails";
import ImagePlaceholder from "./ui/ImagePlaceholder";
import SectionHeading from "./ui/SectionHeading";
import Price from "./ui/Price";
import { PrimaryCTA, SecondaryCTA } from "./ui/Buttons";
import { useRelatedProducts } from "./hooks/useRelatedProducts";
import {
  GOLD,
  INK,
  INK_SOFT,
  MUTED,
  IMG_BG,
  LINE,
  SURFACE_ALT,
  FONT_DISPLAY,
  RADIUS,
  SHADOW,
  productTitle,
} from "./ui/ecomTokens";

// ── DEDUPLICATION CACHE ───────────────────────────────────────────────────────
const fetchedCache = new Map();

// ── helpers ───────────────────────────────────────────────────────────────────
// Attribute names (metal type, item type, purity, design) are resolved
// dynamically by the backend and read from `details.*_name` — no hardcoded maps.

const fmt = (n) =>
  Number(n).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// ── Component ─────────────────────────────────────────────────────────────────
const ProductViewer = () => {
  const store_id = APP_CONFIG.STORE_ID;
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state;
  const { adminUser } = useContext(AuthContext);
  const user_id = adminUser?.user_id;
  const bottomInset = useSafeAreaBottom();

  // Open every product page from the top — including a "You May Also Like" tap,
  // which re-navigates to the SAME /e-com/product path (so the pathname-keyed
  // global ScrollToTop doesn't fire). Scoped here; saving-app pages untouched.
  useEcomScrollTop(location.key);

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openViewer, setOpenViewer] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotation, setRotation] = useState(0); // visual rotate for the main image
  const swiperRef = useRef(null);
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [breakupSheetOpen, setBreakupSheetOpen] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [buyNowLoading, setBuyNowLoading] = useState(false);

  const { toggleWishlist, toggleCart, isInWishlist, isInCart } =
    useContext(EcomContext);

  const inWishlist = isInWishlist(product.tagno);
  const inCart = isInCart(product.tagno);

  // The view is recorded server-side by the /stocks/:tagno fetch below (which is
  // called with user_id) and surfaces on the Home "Recently Viewed" rail — no
  // client-side recording needed here.

  // "You may also like" — same-category products via the EXISTING filter API.
  const { related } = useRelatedProducts({
    itemtype: product.itemtype,
    excludeTagno: product.tagno,
    userId: user_id,
    limit: 12,
  });

  // ── fetch full product details ────────────────────────────────────────────
  useEffect(() => {
    const tagno = product.tagno;
    const now = Date.now();
    const lastFetch = fetchedCache.get(tagno);
    if (lastFetch && now - lastFetch < 5000) {
      // fetched within the last 5 seconds – skip duplicate
      return;
    }
    fetchedCache.set(tagno, now);

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const res = await axios.get(`${baseURL}/api/e-com/stocks/${tagno}`, {
          params: {
            store_id,
            user_id,
            branch_id: APP_CONFIG.BRANCH,
            is_alpha: APP_CONFIG.IS_ALPHA,
          },
        });
        setDetails(res.data?.data || null);
      } catch (err) {
        console.error("Failed to fetch product details:", err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [product.tagno]);

  const handleWishlistToggle = async () => {
    setWishlistLoading(true);
    await toggleWishlist(product.tagno);
    setWishlistLoading(false);
  };

  // Cart CTA: when the item isn't in the cart yet, add it (the button then
  // switches to "Go to Cart"); once it's in the cart, tapping navigates to the
  // cart screen. Removal is handled from the cart screen, not here.
  const handleCartButton = async () => {
    if (inCart) {
      navigate("/cart");
      return;
    }
    setCartLoading(true);
    await toggleCart(product.tagno);
    setCartLoading(false);
  };

  // Buy Now — add to cart if needed, then jump straight to the checkout step
  // on the Cart screen (same cart/order/payment logic as the normal flow,
  // just fewer taps to get there). See CartScreen.js's autoProceed handling.
  const handleBuyNow = async () => {
    if (buyNowLoading) return;
    setBuyNowLoading(true);
    try {
      // Add silently in the background if needed (awaited so Order Summary
      // already has the item), then jump STRAIGHT to the Order Summary step —
      // no brief Bag screen, no auto-proceed round-trip.
      if (!isInCart(product.tagno)) {
        await toggleCart(product.tagno);
      }
      // buyNowTagno scopes the checkout to just this product.
      navigate("/cart", {
        state: { ecomStep: "Order Summary", buyNowTagno: product.tagno },
      });
    } finally {
      setBuyNowLoading(false);
    }
  };

  // Native share (Capacitor Share plugin — this app runs inside a Capacitor
  // WebView on Android/iOS, so the web `navigator.share` API isn't reliable
  // here; same plugin/usage already used in Ledger.js).
  const handleShare = async () => {
    if (!Capacitor.isNativePlatform()) {
      alert("Sharing is available in the mobile app.");
      return;
    }

    const jewellerName = APP_CONFIG.STORE_NAME || "Our Store";
    const name =
      [metalType, itemType].filter((v) => v && v !== "—").join(" ").trim() ||
      `Tag #${product.tagno}`;
    const priceStr = actualPrice
      ? `₹${Number(actualPrice).toLocaleString("en-IN")}`
      : "";
    const grossVal = breakup.grossWt || (gross !== "—" ? gross : null);
    const text =
      `*${jewellerName}*\n${name}\n` +
      (priceStr ? `Price: ${priceStr}\n` : "") +
      (grossVal ? `Gross Wt: ${grossVal} g\n` : "") +
      `Tag #${product.tagno}`;

    const imageUrl = images?.[0];
    try {
      // No image → share text only.
      if (!imageUrl) {
        await Share.share({ title: name, text, dialogTitle: "Share Product" });
        return;
      }
      // Fetch the image, cache it, and share the file so it goes through on
      // WhatsApp/Instagram/etc. (same Capacitor approach used elsewhere).
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`image fetch ${response.status}`);
      const blob = await response.blob();
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      const fileName = `${product.tagno}_${Date.now()}.jpg`;
      await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Cache,
      });
      const uriResult = await Filesystem.getUri({
        directory: Directory.Cache,
        path: fileName,
      });
      await Share.share({ title: name, text, files: [uriResult.uri] });
      // Best-effort cleanup of the cached file.
      setTimeout(async () => {
        try {
          await Filesystem.deleteFile({ path: fileName, directory: Directory.Cache });
        } catch {}
      }, 3000);
    } catch (err) {
      // user cancelled the share sheet, or share isn't supported — non-fatal
      console.error("Share failed:", err);
    }
  };

  // ── derived values ────────────────────────────────────────────────────────
  const images = details?.images?.length
    ? details.images
    : product.images?.length
    ? product.images
    : [];

  const actualPrice = details?.actual_price ?? 0;
  const falsePrice = details?.false_price ?? 0;
  const isReserved = details?.reserved === true; // another user's payment in progress
  // Names resolved by the backend (fall back to the value passed via nav state)
  const metalType = details?.metaltype_name ?? product?.metaltype_name ?? "—";
  const itemType = details?.itemtype_name ?? product?.itemtype_name ?? "—";
  const design = details?.design_name ?? product?.design_name ?? "—";
  const purity = details?.purity_name ?? product?.purity_name ?? "—";
  const netwt = details?.netwt ?? "—";
  const gross = details?.gross ?? "—";
  const makingCharge = details?.makingcharge ?? "—";
  const mcpg = details?.mcpg ?? "—";
  const hasCert = details?.certificate === 1;
  const pcs = details?.pcs ?? 1;
  const custodyMap = { IN: "In Stock", OUT: "Sold" };
  const custody = custodyMap[details?.custody] ?? details?.custody ?? "—";

  // ── Price Breakup (computed server-side, from details.price_breakup) ──────
  const bk = details?.price_breakup ?? {};
  const breakup = {
    grossWt: Number(bk.gross_wt ?? details?.gross ?? 0),
    stoneWt: Number(bk.stone_wt ?? 0),
    netWt: Number(bk.net_wt ?? details?.netwt ?? 0),
    effectiveWt: Number(bk.effective_wt ?? bk.net_wt ?? details?.netwt ?? 0),
    rate: Number(bk.rate ?? 0),
    // Wastage the backend actually applied to the weight. waste_type is
    // "wasteperc" (a VA %) or "wastage" (extra grams); wasteperc takes priority
    // when both exist. Shown right after Rate in the breakup.
    wasteType: bk.waste_type ?? null,
    wasteValue: Number(bk.waste_value ?? 0),
    metalValue: Number(bk.metal_value ?? 0),
    makingCharge: Number(bk.making_charge ?? 0),
    makingChargeRate: Number(bk.making_charge_rate ?? 0),
    mcType: bk.mc_type ?? null,
    stoneCharge: Number(bk.stone_value ?? 0),
    subtotal: Number(bk.subtotal ?? 0),
    gstPct: Number(bk.gst_pct ?? 3),
    gstAmt: Number(bk.gst_amount ?? 0),
    grandTotal: Number(bk.total ?? actualPrice ?? 0),
  };

  // Short hint describing how the making charge was derived
  const mcHint = (() => {
    const t = breakup.mcType;
    const r = breakup.makingChargeRate;
    if (!t) return "";
    if (t.includes("%")) return `${r}% of metal`;
    if (t === "MC/GM") return `₹${fmt(r)} /g × ${breakup.netWt.toFixed(3)} g`;
    if (t === "PIECE MC") return `₹${fmt(r)} × ${pcs} pcs`;
    if (t === "PIECE COST") return "Flat per piece";
    return "";
  })();

  const metalValue = breakup.metalValue;
  const makingChargeAmt = breakup.makingCharge;
  const subtotal = breakup.subtotal;
  const gstAmt = breakup.gstAmt;
  const grandTotal = breakup.grandTotal;

  // ── loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ mt: 1.5 }}>
        <Skeleton
          variant="rounded"
          width="100%"
          height={300}
          sx={{ mb: 1, borderRadius: 4 }}
        />
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          {[...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rounded"
              width={68}
              height={68}
              sx={{ borderRadius: 2 }}
            />
          ))}
        </Box>
        <Skeleton variant="rounded" width="60%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="rounded" width="40%" height={28} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" width="100%" height={48} sx={{ mb: 1 }} />
        <Skeleton variant="rounded" width="100%" height={120} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography sx={{ color: "#e63946", fontSize: 14 }}>{error}</Typography>
      </Box>
    );
  }

  return (
    <>
      {/* ── Swipeable Image Gallery ──────────────────────────────────────── */}
      <Box sx={{ mx: -2, position: "relative" }}>
        {images.length > 0 ? (
          <Swiper
            modules={[Pagination]}
            pagination={{ clickable: true }}
            spaceBetween={0}
            slidesPerView={1}
            autoHeight={true}
            onSwiper={(sw) => {
              swiperRef.current = sw;
            }}
            onSlideChange={(sw) => {
              setActiveIndex(sw.activeIndex);
              setRotation(0); // start each image un-rotated
            }}
            style={{
              "--swiper-pagination-color": GOLD,
              "--swiper-pagination-bullet-inactive-color": "#C9C1B2",
              "--swiper-pagination-bullet-inactive-opacity": "0.7",
            }}
          >
            {images.map((img, index) => (
              <SwiperSlide key={index}>
                <Box
                  onClick={() => setOpenViewer(true)}
                  sx={{
                    width: "100%",
                    // Cap at a square (screen width) as before; shorter images
                    // shrink the box to their height so there's no top/bottom
                    // blank. Center taller images within the cap.
                    maxHeight: "100vw",
                    bgcolor: IMG_BG,
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Box
                    component="img"
                    src={img}
                    alt={`Tag #${product.tagno} — ${index + 1}`}
                    sx={{
                      width: "100%",
                      height: "auto",
                      maxHeight: "100vw",
                      objectFit: "contain",
                      display: "block",
                      transform: `rotate(${rotation}deg)`,
                      transition: "transform 0.3s ease",
                    }}
                  />
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <Box sx={{ width: "100%", aspectRatio: "1 / 1" }}>
            <ImagePlaceholder iconSize={40} />
          </Box>
        )}

        {/* Wishlist + Share floating over the gallery */}
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 5,
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Box
            onClick={handleWishlistToggle}
            sx={{
              width: 42,
              height: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(4px)",
              borderRadius: "50%",
              boxShadow: SHADOW.sm,
              cursor: "pointer",
            }}
          >
            {wishlistLoading ? (
              <CircularProgress size={18} sx={{ color: GOLD }} />
            ) : inWishlist ? (
              <FavoriteIcon sx={{ fontSize: 22, fill: "#E0526E" }} />
            ) : (
              <FavoriteBorderRoundedIcon sx={{ fontSize: 22, fill: INK_SOFT }} />
            )}
          </Box>
          <Box
            onClick={handleShare}
            sx={{
              width: 42,
              height: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(4px)",
              borderRadius: "50%",
              boxShadow: SHADOW.sm,
              cursor: "pointer",
            }}
          >
            <ReplyRoundedIcon
              sx={{ fontSize: 21, fill: INK_SOFT, transform: "scaleX(-1)" }}
            />
          </Box>
        </Box>

        {/* Rotate the current image — bottom-right of the gallery */}
        {images.length > 0 && (
          <Box
            onClick={(e) => {
              e.stopPropagation();
              // Keep rotating clockwise; never modulo back to 0 (which would
              // animate a reverse spin at 360).
              setRotation((r) => r + 90);
            }}
            sx={{
              position: "absolute",
              bottom: 16,
              right: 12,
              zIndex: 5,
              width: 42,
              height: 42,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(4px)",
              borderRadius: "50%",
              boxShadow: SHADOW.sm,
              cursor: "pointer",
            }}
          >
            <RotateRightRoundedIcon sx={{ fontSize: 22, fill: INK_SOFT }} />
          </Box>
        )}
      </Box>

      {/* ── Thumbnail strip (kept from the classic viewer, now synced to the
          swipeable gallery) ─────────────────────────────────────────────── */}
      {images.length > 1 && (
        <Box
          sx={{
            // Fixed 4-slot grid: thumbnails fill the full width in equal
            // columns with equal gaps. Fewer than 4 images leave the trailing
            // slots blank (same size); wider screens scale all thumbs up.
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 1,
            mt: 1.5,
            pb: 0.5,
          }}
        >
          {images.map((img, index) => (
            <Box
              key={index}
              onClick={() => {
                setActiveIndex(index);
                swiperRef.current?.slideTo(index);
              }}
              sx={{
                width: "100%",
                aspectRatio: "1 / 1",
                borderRadius: RADIUS.sm,
                overflow: "hidden",
                cursor: "pointer",
                bgcolor: IMG_BG,
                border:
                  activeIndex === index
                    ? `2px solid ${GOLD}`
                    : `1px solid ${LINE}`,
                transition: "border 0.15s ease",
              }}
            >
              <Box
                component="img"
                src={img}
                alt={`thumb-${index + 1}`}
                loading="lazy"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: activeIndex === index ? 1 : 0.7,
                  transition: "opacity 0.2s ease",
                }}
              />
            </Box>
          ))}
        </Box>
      )}

      {/* ── Fullscreen dialog ────────────────────────────────────────────── */}
      <ImageViewerDialog
        openViewer={openViewer}
        setOpenViewer={setOpenViewer}
        product={{ ...product, images }}
      />

      {/* ── Title + Price ────────────────────────────────────────────────── */}
      <Box sx={{ mt: 2, mb: 1 }}>
         <Typography
          sx={{
            fontFamily: FONT_DISPLAY,
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            lineHeight: 1.15,
            color: INK,
            mb: 1,
          }}
        >
          {productTitle({
            metaltype_name: metalType !== "—" ? metalType : null,
            itemtype_name: itemType !== "—" ? itemType : null,
            tagno: product.tagno,
            productType: product.productType,
          })}
        </Typography>
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "0.12em",
            color: GOLD,
            textTransform: "uppercase",
            mb: 0.5,
          }}
        >
          {itemType}
          {custody === "In Stock" ? " · In Stock" : ""}
        </Typography>
       
        <Price
          current={actualPrice}
          original={falsePrice}
          size={22}
          showDiscount={false}
        />
        {hasCert && (
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              mt: 1.25,
              px: 1.25,
              py: 0.5,
              borderRadius: RADIUS.pill,
              bgcolor: "rgba(46,125,50,0.08)",
            }}
          >
            <VerifiedRoundedIcon sx={{ fontSize: 16, color: "#2E7D32" }} />
            <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: "#2E7D32" }}>
              BIS Hallmarked
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Delivery Details (after Price, before Trust & Assurance) ─────── */}
      <DeliveryDetails
        branchId={details?.branch_id}
        storeName={APP_CONFIG.STORE_NAME}
      />

      {/* ── Info triggers (open premium bottom sheets) ──────────────────── */}
      <Box sx={{ mt: 3, mb: 1, display: "flex", flexDirection: "column", gap: 1.25 }}>
        <InfoTrigger
          icon={<DescriptionRoundedIcon sx={{ fontSize: 22, color: GOLD }} />}
          title="Product Details"
          subtitle="Metal, purity & certification"
          onClick={() => setDetailsSheetOpen(true)}
        />
        <InfoTrigger
          icon={<ReceiptLongRoundedIcon sx={{ fontSize: 22, color: GOLD }} />}
          title="Price Breakup"
          subtitle="How this price is calculated"
          trailing={`₹${fmt(grandTotal)}`}
          onClick={() => setBreakupSheetOpen(true)}
        />
      </Box>

      {/* ── Product Details bottom sheet ─────────────────────────────────── */}
      <BottomSheet
        open={detailsSheetOpen}
        onClose={() => setDetailsSheetOpen(false)}
        title="Product Details"
      >
        <SheetGroup
          icon={
            <DescriptionRoundedIcon sx={{ fontSize: 18, color: GOLD }} />
          }
          label="Description"
        >
          <Row label="Product ID" value={details?.tagno} />
          <Row label="Item Type" value={itemType} />
          <Row label="Design" value={design} />
          <Row label="Pieces" value={pcs} />
        </SheetGroup>

        <SheetGroup
          icon={
            <Box
              component="img"
              src={MetalDetailsIcon}
              alt="metal"
              sx={{ width: 18, height: 18 }}
            />
          }
          label="Metal Details"
          last
        >
          <Row label="Metal Type" value={metalType} />
          <Row label="Purity" value={purity} />
          <Row label="Gross Wt" value={gross ? `${gross}g` : "—"} />
          <Row label="Net Wt" value={netwt ? `${netwt}g` : "—"} />
          {details?.s_size_len && (
            <Row label="Size / Length" value={details.s_size_len} />
          )}
        </SheetGroup>
      </BottomSheet>

      {/* ── Price Breakup bottom sheet ───────────────────────────────────── */}
      <BottomSheet
        open={breakupSheetOpen}
        onClose={() => setBreakupSheetOpen(false)}
        title="Price Breakup"
      >
        <SheetGroup
          icon={
            <Box
              component="img"
              src={MetalDetailsIcon}
              alt="weight"
              sx={{ width: 18, height: 18 }}
            />
          }
          label="Weight"
        >
          <Row label="Gross Weight" value={`${breakup.grossWt.toFixed(3)} g`} />
          <Row label="Stone Weight" value={`${breakup.stoneWt.toFixed(2)} g`} />
          <Row label="Net Weight" value={`${breakup.netWt.toFixed(3)} g`} />
        </SheetGroup>

        <SheetGroup
          icon={
            <Box
              component="img"
              src={GoldCoinIcon}
              alt="price"
              sx={{ width: 18, height: 18 }}
            />
          }
          label="Price Details"
          last
        >
          <Row label="Rate" value={`₹${fmt(breakup.rate)}`} />
          {breakup.wasteType && (
            <Row
              label={
                breakup.wasteType === "wasteperc" ? "VA / Wastage" : "Wastage"
              }
              value={
                breakup.wasteType === "wasteperc"
                  ? `${breakup.wasteValue}%`
                  : `${breakup.wasteValue.toFixed(3)} g`
              }
            />
          )}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography sx={{ fontSize: 13, color: INK_SOFT }}>
                Metal Value
              </Typography>
              <Typography sx={{ fontSize: 10.5, color: MUTED }}>
                {breakup.effectiveWt.toFixed(3)} g × ₹{fmt(breakup.rate)}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: GOLD }}>
              ₹{fmt(metalValue)}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography sx={{ fontSize: 13, color: INK_SOFT }}>
                Making Charge
              </Typography>
              {mcHint && (
                <Typography sx={{ fontSize: 10.5, color: MUTED }}>
                  {mcHint}
                </Typography>
              )}
            </Box>
            <Typography sx={{ fontSize: 13, color: INK }}>
              ₹{fmt(makingChargeAmt)}
            </Typography>
          </Box>
          <Row label="Stone Charge" value={`₹${fmt(breakup.stoneCharge)}`} />
        </SheetGroup>

        {/* Subtotal + GST */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: 13, color: INK_SOFT }}>Subtotal</Typography>
            <Typography sx={{ fontSize: 13, color: INK }}>
              ₹{fmt(subtotal)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography sx={{ fontSize: 13, color: INK_SOFT }}>
                GST ({breakup.gstPct}%)
              </Typography>
              <Typography sx={{ fontSize: 10.5, color: MUTED }}>
                ₹{fmt(subtotal)} × {breakup.gstPct}%
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 13, color: INK }}>
              ₹{fmt(gstAmt)}
            </Typography>
          </Box>
        </Box>

        {/* Grand total band */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2,
            py: 1.75,
            borderRadius: RADIUS.card,
            background: theme.ecommerce.gradient ?? GOLD,
          }}
        >
          <Typography sx={{ fontSize: 14, fontWeight: 500, color: "#fff", letterSpacing: "0.04em" }}>
            TOTAL
          </Typography>
          <Typography sx={{ fontSize: 20, fontWeight: 600, color: "#fff" }}>
            ₹{fmt(grandTotal)}
          </Typography>
        </Box>
      </BottomSheet>

      {/* ── Trust & Assurance ───────────────────────────────────────────── */}
      <TrustSection />

      {/* ── You May Also Like (related, same category) ──────────────────── */}
      {related.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <SectionHeading title="You May Also Like" />
          <Box
            sx={{
              display: "flex",
              gap: 1.25,
              overflowX: "auto",
              mx: -2,
              px: 2,
              pb: 0.5,
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {related.map((rp) => (
              <Box key={rp.tagno} sx={{ width: 150, flexShrink: 0 }}>
                <ProductCard
                  product={rp}
                  onClick={() =>
                    navigate("/e-com/product", { state: rp })
                  }
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* spacer so the fixed bottom action bar never covers the last section */}
      <Box sx={{ height: 96 }} />

      {/* ── E‑commerce footer: fixed action bar (Add to Cart / Buy Now) ─────
          Replaces the global app footer on the Product page. Sits flush at the
          bottom and pads for the device safe area (home indicator). */}
      <Box
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          px: 2,
          pt: 1.25,
          pb: `calc(12px + ${bottomInset})`,
          display: "flex",
          gap: 1.25,
          bgcolor: "#fff",
          boxShadow: SHADOW.bar,
        }}
      >
        {isReserved ? (
          <Box sx={{ width: "100%", textAlign: "center", py: 0.5 }}>
            <Typography sx={{ color: "#b26a00", fontSize: 13, fontWeight: 700 }}>
              🔒 Reserved — a payment is in progress for this piece.
            </Typography>
            <Typography sx={{ color: "#888", fontSize: 12, mt: 0.5 }}>
              If it’s cancelled you can buy it; otherwise please ask the shop.
            </Typography>
          </Box>
        ) : (
          <>
            <SecondaryCTA
              onClick={handleCartButton}
              loading={cartLoading}
              height={50}
              sx={{ flex: 1 }}
            >
              {inCart ? "Go to Cart" : "Add to Cart"}
            </SecondaryCTA>
            <PrimaryCTA
              onClick={handleBuyNow}
              loading={buyNowLoading}
              height={50}
              sx={{ flex: 1.3 }}
            >
              Buy Now
            </PrimaryCTA>
          </>
        )}
      </Box>
    </>
  );
};

// ── InfoTrigger — tappable row that opens an info bottom sheet ─────────────────
const InfoTrigger = ({ icon, title, subtitle, trailing, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      px: 1.75,
      py: 1.5,
      borderRadius: RADIUS.card,
      border: `1px solid ${LINE}`,
      bgcolor: "#fff",
      boxShadow: SHADOW.sm,
      cursor: "pointer",
      transition: "transform 0.12s ease, box-shadow 0.12s ease",
      "&:active": { transform: "scale(0.99)", boxShadow: SHADOW.md },
    }}
  >
    <Box
      sx={{
        width: 42,
        height: 42,
        flexShrink: 0,
        borderRadius: "50%",
        bgcolor: "rgba(185,138,70,0.10)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography sx={{ fontSize: 14.5, fontWeight: 600, color: INK }}>
        {title}
      </Typography>
      <Typography sx={{ fontSize: 12, color: MUTED }}>{subtitle}</Typography>
    </Box>
    {trailing && (
      <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: GOLD, mr: 0.25 }}>
        {trailing}
      </Typography>
    )}
    <ChevronRightRoundedIcon sx={{ fontSize: 22, color: MUTED }} />
  </Box>
);

// ── SheetGroup — labelled group of rows inside an info sheet ───────────────────
const SheetGroup = ({ icon, label, children, last }) => (
  <Box sx={{ mb: last ? 2 : 2.5 }}>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
      {icon}
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: INK_SOFT,
        }}
      >
        {label}
      </Typography>
    </Box>
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.1,
        bgcolor: SURFACE_ALT,
        borderRadius: RADIUS.card,
        p: 1.75,
      }}
    >
      {children}
    </Box>
  </Box>
);

// ── Row helper ────────────────────────────────────────────────────────────────
const Row = ({ label, value, highlight, strike }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <Typography sx={{ fontSize: 13, color: INK_SOFT }}>{label}</Typography>
    <Typography
      sx={{
        fontSize: 13,
        fontWeight: highlight ? 700 : 500,
        color: highlight ? GOLD : strike ? MUTED : INK,
        textDecoration: strike ? "line-through" : "none",
      }}
    >
      {value ?? "—"}
    </Typography>
  </Box>
);

export default ProductViewer;
