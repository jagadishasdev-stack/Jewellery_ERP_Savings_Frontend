import React, { useContext, useState, useEffect, useRef } from "react";
import { Box, Typography } from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { useLocation, useNavigate } from "react-router-dom";
import CartCard from "./CartCard";
import OrderSummary from "./OrderSummary";
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
  const { cartItems } = useContext(EcomContext);
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

  const [activeStep, setActiveStep] = useState(0);

  // Transform cart items to match CartCard expected structure
  const transformedCartItems = cartItems
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
        gross: stock.gross,
        netwt: stock.netwt,
        flag: stock.flag,
        purity: stock.purity,
        metaltype: stock.metaltype,
        design: stock.design,
        cart_id: item.cart_id,
        added_at: item.added_at,
        images: item.stock.images,
      };
    });

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
    navigate("/cart", { state: { ecomStep: "Order Summary" } });
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
    <Box sx={{ minHeight: "100vh", pb: 12 }}>
      {/* Stepper */}
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
                  bgcolor: done ? GOLD : "#fff",
                  border: `2px solid ${done ? GOLD : LINE}`,
                  color: done ? "#fff" : MUTED,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1,
                  transition: "all 0.25s ease",
                }}
              >
                {isCompleted ? (
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
              <Typography
                sx={{
                  fontFamily: FONT_DISPLAY,
                  fontSize: 19,
                  fontWeight: 700,
                  letterSpacing: "-0.01em",
                  color: INK,
                  mt: 2,
                  mb: 1.5,
                }}
              >
                Your Bag ({transformedCartItems.length})
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column" }}>
                {transformedCartItems.map((item) => (
                  <CartCard key={item.cart_id} item={item} />
                ))}
              </Box>

              {/* E‑commerce footer: sticky total + Proceed to Checkout */}
              <Box
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
            <EmptyState
              icon={
                <ShoppingBagOutlinedIcon sx={{ fontSize: 44, color: GOLD }} />
              }
              title="Your bag is empty"
              subtitle="Discover our collection and add pieces you love."
              ctaLabel="Browse Products"
              onCta={() => navigate("/e-com/categories")}
            />
          )}
        </>
      )}

      {/* Order Summary + Payment (Steps 1–2) */}
      {activeStep >= 1 && <OrderSummary />}
    </Box>
  );
};

export default CartScreen;
