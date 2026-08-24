import React, { useContext, useState } from "react";
import { Box, Typography, Divider, Paper, Button } from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import CartCard from "./CartCard";
import { useSafeAreaBottom, useSafeAreaTop } from "../../SafeAreaFile";
import { Capacitor } from "@capacitor/core";
import theme from "../../theme";
import OrderSummary from "./OrderSummary";
import { AuthContext } from "../../contexts/AuthContext";
import { EcomContext } from "../../contexts/EcomContext";
import APP_CONFIG from "../../config/constants";
import axios from "axios"; // 🆕

const CartScreen = () => {
  const { cartItems } = useContext(EcomContext);
  const { loginRole, adminUser } = useContext(AuthContext);

  const { address1, address2, address3 } = adminUser;
  const shipping_address = [address1, address2, address3]
    .filter(Boolean)
    .join(" ");

  const topInset = useSafeAreaTop();
  const bottomInset = useSafeAreaBottom();
  const isIOS = Capacitor.getPlatform() === "ios";
  const safeAreaTop = topInset;
  const safeAreaBottom = bottomInset;

  const steps = [
    {
      label: "Select Product",
      icon: <Inventory2OutlinedIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "Order Summary",
      icon: <ArticleOutlinedIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "Payment",
      icon: <AttachMoneyOutlinedIcon sx={{ fontSize: 18 }} />,
    },
  ];

  const [activeStep, setActiveStep] = useState(0);
  const activeColor = theme.cartScreen.activeColor;
  const textColor = theme.cartScreen.textColor;

  // Transform cart items to match CartCard expected structure
  const transformedCartItems = cartItems
    .filter((item) => !item.unavailable && item.stock)
    .map((item) => {
      const stock = item.stock;
      return {
        id: stock.tagno,
        tagno: stock.tagno,
        name: `Tag #${stock.tagno}`,
        price: stock.actual_price ?? 0,
        originalPrice: stock.false_price ?? 0,
        quantity: item.quantity,
        productType: stock.itemtype === 1 ? "Gold" : "Diamond",
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

  // 🆕 Fire checkout_start when user proceeds
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
      // non‑fatal – continue
    }
    setActiveStep(1);
  };

  return (
    <Box sx={{ minHeight: "100vh", pb: 10 }}>
      {/* --- Step Indicator --- */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          maxWidth: 600,
          margin: "16px auto",
          position: "relative",
        }}
      >
        {steps.map((step, i) => {
          const isActive = i === activeStep;
          const isCompleted = i < activeStep;

          return (
            <Box
              key={i}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
                cursor: "default",
                position: "relative",
              }}
            >
              {i < steps.length - 1 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "16px",
                    left: "50%",
                    width: "100%",
                    height: "2px",
                    backgroundColor:
                      isCompleted || isActive
                        ? activeColor
                        : theme.cartScreen.connectorLineFallbackColor,
                    zIndex: 0,
                  }}
                />
              )}

              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  backgroundColor: isActive
                    ? activeColor
                    : isCompleted
                    ? activeColor
                    : "#fff",
                  border: `2px solid ${
                    isCompleted || isActive
                      ? activeColor
                      : theme.cartScreen.circularIconFallbackColor
                  }`,
                  color: isActive || isCompleted ? "#fff" : activeColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1,
                  transition: "all 0.3s ease",
                  boxShadow: isActive ? "0 0 6px rgba(153,101,21,0.4)" : "none",
                }}
              >
                {step.icon}
              </Box>

              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: 600,
                  mt: "8px",
                  color: isActive ? activeColor : textColor,
                }}
              >
                {step.label}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* --- Cart Items (Step 0) --- */}
      {activeStep === 0 && (
        <>
          {transformedCartItems.length > 0 ? (
            <>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "100%",
                  mt: 1,
                  gap: 1.5,
                }}
              >
                {transformedCartItems.map((item) => (
                  <CartCard key={item.cart_id} item={item} />
                ))}
              </Box>

              {/* --- Total Summary Card --- */}
              <Paper
                elevation={3}
                sx={{
                  position: "fixed",
                  bottom: `calc(56px + ${safeAreaBottom})`,
                  left: 0,
                  right: 0,
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                  backgroundColor: theme.cartScreen.totalSummaryCardBgCol,
                  maxWidth: 600,
                  mx: "auto",
                  p: 2,
                  boxShadow: theme.cartScreen.totalSummaryCardBoxShadow,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    Subtotal
                  </Typography>
                  <Typography variant="subtitle2">
                    ₹{totalOriginal.toLocaleString()}
                  </Typography>
                </Box>

                {totalDiscount > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      Discount
                    </Typography>
                    <Typography variant="subtitle2" color="green">
                      -₹{totalDiscount.toLocaleString()}
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 0.5 }} />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    sx={{ fontSize: 16, fontWeight: 700, color: textColor }}
                  >
                    Total
                  </Typography>
                  <Typography
                    sx={{ fontSize: 16, fontWeight: 700, color: activeColor }}
                  >
                    ₹{totalPrice.toLocaleString()}
                  </Typography>
                </Box>

                {/* Proceed To Checkout – now fires checkout_start */}
                <Button
                  variant="contained"
                  fullWidth
                  disabled={isProceedDisabled}
                  onClick={handleProceed} // 🆕
                  sx={{
                    mt: 2,
                    backgroundColor: isProceedDisabled ? "#ccc" : activeColor,
                    color: "#fff",
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: isProceedDisabled
                        ? "#ccc"
                        : theme.cartScreen.proceedToAddressBtnHoverCol,
                    },
                    "&.Mui-disabled": {
                      backgroundColor: "#ccc",
                      color: "#fff",
                    },
                  }}
                >
                  {isProceedDisabled
                    ? "No items available to checkout"
                    : "Proceed to Checkout"}
                </Button>
              </Paper>
            </>
          ) : (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "50vh",
              }}
            >
              <Typography
                sx={{
                  fontSize: 16,
                  color: theme.categoryProduct?.noProductTextCol || "#666",
                  textAlign: "center",
                }}
              >
                Your cart is empty
              </Typography>
            </Box>
          )}
        </>
      )}

      {/* --- Order Summary Screen (Step 1) --- */}
      {activeStep === 1 && <OrderSummary />}
    </Box>
  );
};

export default CartScreen;
