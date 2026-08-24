import React, {
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { Box, Typography, IconButton } from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { useLocation, useNavigate } from "react-router-dom";
import CartCard from "./CartCard";
import OrderSummary from "./OrderSummary";
import { mapStockToProduct } from "./mapStockToProduct";
import EmptyState from "./ui/EmptyState";
import { PrimaryCTA } from "./ui/Buttons";
import { useSafeAreaBottom } from "../../SafeAreaFile";
import { AuthContext } from "../../contexts/AuthContext";
import { EcomContext } from "../../contexts/EcomContext";
import APP_CONFIG from "../../config/constants";
import axios from "axios";
import {
  GOLD,
  INK,
  INK_SOFT,
  MUTED,
  LINE,
  FONT_DISPLAY,
  RADIUS,
  SHADOW,
  inr,
} from "./ui/ecomTokens";

const CartScreen = () => {
  const { cartItems, fetchCart } = useContext(EcomContext);
  const { adminUser } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  const bottomInset = useSafeAreaBottom();
  const safeAreaBottom = bottomInset;

  const steps = [
    { label: "Bag", icon: <Inventory2OutlinedIcon sx={{ fontSize: 17 }} /> },
    { label: "Summary", icon: <ArticleOutlinedIcon sx={{ fontSize: 17 }} /> },
    { label: "Payment", icon: <AttachMoneyOutlinedIcon sx={{ fontSize: 17 }} /> },
  ];

  // Initialise the step from navigation state so a Buy-Now / summary entry
  // renders Order Summary on the FIRST paint (no one-frame Bag flash).
  const initialStep =
    location.state?.ecomStep === "Payment"
      ? 2
      : location.state?.ecomStep === "Order Summary"
      ? 1
      : 0;
  const [activeStep, setActiveStep] = useState(initialStep);
  // Payment result for the last stepper node: "idle" | "success" | "failed".
  // Driven by OrderSummary via onPaymentState.
  const [paymentState, setPaymentState] = useState("idle");

  // Measure the fixed checkout footer so the scroll content can reserve exactly
  // its height — the last cart item then never hides behind it. The footer's
  // height varies (discount row, safe-area inset), so we measure instead of
  // hardcoding. Works on Android/iOS WebViews (ResizeObserver is supported).
  const [footerHeight, setFooterHeight] = useState(0);
  const footerRef = useRef(null);

  // Refetch the cart each time the screen opens so reservation/stock status is
  // fresh — a piece another user is now paying for shows "Out of Stock"
  // without needing an app restart.
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    fetchCart?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    try {
      await fetchCart?.();
    } finally {
      setRefreshing(false);
    }
  };

  // Transform cart items to match CartCard expected structure. Memoized so it
  // only rebuilds when the cart changes (not on every render) — keeps stable
  // object refs so CartCard doesn't needlessly re-render.
  const transformedCartItems = useMemo(
    () =>
      cartItems
        .filter((item) => !item.unavailable && item.stock)
        .map((item) => {
          const stock = item.stock;
          return {
            id: stock.tagno,
            tagno: stock.tagno,
            name: `${stock.metaltype_name || stock.itemtype_name || "Item"} #${stock.tagno}`,
            price: stock.actual_price ?? 0,
            originalPrice: stock.false_price ?? 0,
            quantity: item.quantity,
            productType: stock.metaltype_name ?? stock.itemtype_name ?? null,
            metaltype_name: stock.metaltype_name ?? null,
            purity_name: stock.purity_name ?? null,
            design_name: stock.design_name ?? null,
            gross: stock.gross,
            netwt: stock.netwt,
            flag: stock.flag,
            reserved: stock.reserved, // another user's payment in progress
            purity: stock.purity,
            metaltype: stock.metaltype,
            design: stock.design,
            cart_id: item.cart_id,
            added_at: item.added_at,
            images: item.stock.images,
            stock, // full row, used to open the Product Details page
          };
        }),
    [cartItems],
  );

  const validFlags = ["F", "N", "E"];
  const validCartItems = transformedCartItems.filter((item) =>
    validFlags.includes(item.flag),
  );

  const { totalPrice, totalOriginal } = transformedCartItems.reduce(
    (acc, item) => {
      if (validFlags.includes(item.flag)) {
        acc.totalPrice += item.price * item.quantity;
        acc.totalOriginal += item.originalPrice * item.quantity;
      }
      return acc;
    },
    { totalPrice: 0, totalOriginal: 0 },
  );

  const totalDiscount = totalOriginal - totalPrice;
  const isProceedDisabled = validCartItems.length === 0;

  // Keep footerHeight in sync with the actual rendered footer bar.
  useEffect(() => {
    const el = footerRef.current;
    if (!el) {
      setFooterHeight(0);
      return;
    }
    const update = () => setFooterHeight(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [activeStep, transformedCartItems.length, totalDiscount]);

  // Fire checkout_start when user proceeds
  const handleProceed = async () => {
    if (isProceedDisabled) return;
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/e-com/checkout/start`,
        {
          store_id: APP_CONFIG.STORE_ID,
          branch_id: APP_CONFIG.BRANCH,
          user_id: adminUser?.user_id,
        },
      );
    } catch (err) {
      console.error("checkout_start log failed", err);
      // non-fatal – continue
    }
    // Push a history entry for the Summary step (route stays /cart) so the
    // header/hardware Back button returns to the Bag instead of leaving /cart.
    // Preserve buyNowTagno so a single-item "Buy Now" checkout stays scoped to
    // that product through the Summary/Payment steps.
    navigate("/cart", {
      state: { ecomStep: "Order Summary", buyNowTagno: location.state?.buyNowTagno },
    });
  };

  // Open a cart line's Product Details page — pass the full product info we
  // already have (no refetch needed here; ProductViewer loads the rest).
  const handleOpenProduct = (stock) => {
    navigate("/e-com/product", { state: mapStockToProduct(stock) });
  };

  // Derive the checkout step from navigation history so pressing Back steps
  // back through Bag → Summary → Payment (each forward step is a pushed
  // history entry). This runs on every navigation, including Back (pop).
  useEffect(() => {
    const step = location.state?.ecomStep;
    setActiveStep(step === "Payment" ? 2 : step === "Order Summary" ? 1 : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

  // "Buy Now" from the product page navigates here with { autoProceed: true }
  // — auto-advance straight to the checkout step exactly once (same
  // handleProceed the button calls). Normal entry is a no-op, as before.
  const autoProceedTriggeredRef = useRef(false);
  useEffect(() => {
    if (
      location.state?.autoProceed &&
      !autoProceedTriggeredRef.current &&
      !isProceedDisabled
    ) {
      autoProceedTriggeredRef.current = true;
      handleProceed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, isProceedDisabled]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        // Reserve the measured footer height (+ gap) at step 0 so the last
        // cart item stays fully visible above the fixed checkout bar.
        pb:
          activeStep === 0 && footerHeight
            ? `${footerHeight + 24}px`
            : 12,
      }}
    >
      {/* Stepper */}
      <style>{`
        @keyframes ecomStepPop {
          0%   { transform: scale(0.7); }
          60%  { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
      `}</style>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          maxWidth: 460,
          mx: "auto",
          mt: 2,
          mb: 1,
          px: 1,
        }}
      >
        {steps.map((step, i) => {
          const isActive = i === activeStep;
          const isCompleted = i < activeStep;
          const done = isActive || isCompleted;
          // Last node reflects the live payment result.
          const isPayment = i === steps.length - 1;
          const paySuccess = isPayment && paymentState === "success";
          const payFailed = isPayment && paymentState === "failed";
          // Circle colors: red on failure, green on success, else brand gold.
          const circleColor = payFailed
            ? "#E03131"
            : paySuccess
            ? "#2E9E5B"
            : GOLD;
          const filled = done || paySuccess || payFailed;
          return (
            <Box
              key={i}
              sx={{
                position: "relative",
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              {i < steps.length - 1 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 17,
                    left: "50%",
                    width: "100%",
                    height: 2,
                    bgcolor: isCompleted ? GOLD : LINE,
                    zIndex: 0,
                  }}
                />
              )}
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  bgcolor: filled ? circleColor : "#fff",
                  border: `2px solid ${filled ? circleColor : LINE}`,
                  color: filled ? "#fff" : MUTED,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1,
                  transition: "all 0.25s ease",
                  animation:
                    paySuccess || payFailed
                      ? "ecomStepPop 0.4s ease-out"
                      : "none",
                }}
              >
                {payFailed ? (
                  <ErrorOutlineOutlinedIcon sx={{ fontSize: 20 }} />
                ) : paySuccess || isCompleted ? (
                  <CheckRoundedIcon sx={{ fontSize: 18 }} />
                ) : (
                  step.icon
                )}
              </Box>
              <Typography
                sx={{
                  fontSize: 11.5,
                  fontWeight: isActive ? 700 : 500,
                  mt: 0.75,
                  color: isActive ? GOLD : INK_SOFT,
                }}
              >
                {step.label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Cart Items (Step 0) */}
      {activeStep === 0 && (
        <>
          {transformedCartItems.length > 0 ? (
            <>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mt: 2,
                  mb: 1.5,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: FONT_DISPLAY,
                    fontSize: 19,
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    color: INK,
                  }}
                >
                  Your Bag ({transformedCartItems.length})
                </Typography>
                <IconButton
                  onClick={handleRefresh}
                  disabled={refreshing}
                  size="small"
                  aria-label="Refresh cart"
                  sx={{ color: GOLD }}
                >
                  <RefreshRoundedIcon
                    sx={{
                      fontSize: 21,
                      animation: refreshing
                        ? "cartSpin 0.8s linear infinite"
                        : "none",
                      "@keyframes cartSpin": {
                        from: { transform: "rotate(0deg)" },
                        to: { transform: "rotate(360deg)" },
                      },
                    }}
                  />
                </IconButton>
              </Box>

              <Box sx={{ display: "flex", flexDirection: "column" }}>
                {transformedCartItems.map((item) => (
                  <CartCard
                    key={item.cart_id}
                    item={item}
                    onOpen={() => handleOpenProduct(item.stock)}
                  />
                ))}
              </Box>

              {/* E‑commerce footer: sticky total + Proceed to Checkout */}
              <Box
                ref={footerRef}
                sx={{
                  position: "fixed",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  maxWidth: 600,
                  mx: "auto",
                  bgcolor: "#fff",
                  borderTopLeftRadius: RADIUS.sheet,
                  borderTopRightRadius: RADIUS.sheet,
                  boxShadow: SHADOW.bar,
                  px: 2,
                  pt: 1.75,
                  pb: `calc(16px + ${safeAreaBottom})`,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography sx={{ fontSize: 13, color: INK_SOFT }}>
                    Subtotal
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: INK }}>
                    {inr(totalOriginal)}
                  </Typography>
                </Box>

                {totalDiscount > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography sx={{ fontSize: 13, color: INK_SOFT }}>
                      Discount
                    </Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#2E7D32" }}>
                      -{inr(totalDiscount)}
                    </Typography>
                  </Box>
                )}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    pt: 1,
                    mt: 0.5,
                    borderTop: `1px solid ${LINE}`,
                  }}
                >
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: INK }}>
                    Total
                  </Typography>
                  <Typography sx={{ fontSize: 18, fontWeight: 700, color: GOLD }}>
                    {inr(totalPrice)}
                  </Typography>
                </Box>

                <PrimaryCTA
                  onClick={handleProceed}
                  disabled={isProceedDisabled}
                  height={50}
                  sx={{ mt: 1.5 }}
                >
                  {isProceedDisabled
                    ? "No items available"
                    : "Proceed to Checkout"}
                </PrimaryCTA>
              </Box>
            </>
          ) : (
            <Box
              sx={{ textAlign: "center", py: 8, px: 3, maxWidth: 360, mx: "auto" }}
            >
              <Box
                component="svg"
                viewBox="0 0 120 120"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                sx={{
                  width: 132,
                  height: 132,
                  mb: 2,
                  animation: "bagFloat 3s ease-in-out infinite",
                  "@keyframes bagFloat": {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-8px)" },
                  },
                }}
              >
                <circle cx="60" cy="60" r="58" fill="rgba(184,138,70,0.08)" />
                <path
                  d="M38 44h44l-4.2 41a7 7 0 0 1-7 6.3H49.2a7 7 0 0 1-7-6.3L38 44Z"
                  fill="#fff"
                  stroke={GOLD}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M49 44a11 11 0 0 1 22 0"
                  stroke={GOLD}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <circle cx="52" cy="56" r="2.4" fill={GOLD} />
                <circle cx="68" cy="56" r="2.4" fill={GOLD} />
              </Box>
              <Typography
                sx={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 20,
                  fontWeight: 700,
                  color: INK,
                  mb: 0.75,
                }}
              >
                Your bag is empty
              </Typography>
              <Typography sx={{ fontSize: 13.5, color: INK_SOFT, mb: 3 }}>
                Discover our collection and add the pieces you love.
              </Typography>
              <PrimaryCTA
                onClick={() => navigate("/e-com/categories")}
                height={48}
                sx={{ maxWidth: 220, mx: "auto" }}
              >
                Browse Products
              </PrimaryCTA>
            </Box>
          )}
        </>
      )}

      {/* Order Summary + Payment (Steps 1–2) */}
      {activeStep >= 1 && <OrderSummary onPaymentState={setPaymentState} />}
    </Box>
  );
};

export default CartScreen;
