import React, { useState, useContext, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSafeAreaBottom, useSafeAreaTop } from "../../SafeAreaFile";
import APP_CONFIG from "../../config/constants";
import {
  Box,
  Typography,
  Divider,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Slide,
  Paper,
  Chip,
  Avatar,
  Snackbar,
  Alert,
  CircularProgress,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import WifiIcon from "@mui/icons-material/Wifi";
import MoneyIcon from "@mui/icons-material/Money";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import ScaleOutlinedIcon from "@mui/icons-material/ScaleOutlined";
import DiamondOutlinedIcon from "@mui/icons-material/DiamondOutlined";
import DescriptionIcon from "@mui/icons-material/Description";
import theme from "../../theme";
import { StoreContext } from "../../contexts/StoreContext";
import { AuthContext } from "../../contexts/AuthContext";
import { EcomContext } from "../../contexts/EcomContext";
import { FONT_DISPLAY, GRADIENT, GOLD, INK_SOFT, LINE } from "./ui/ecomTokens";
import LegalPolicySheet from "./LegalPolicySheet";
import AddressSheet from "./AddressSheet";
import { usePaymentGateway } from "../../contexts/PaymentGatewayProvider";
import { Capacitor } from "@capacitor/core";
import { PhonePePaymentPlugin } from "ionic-capacitor-phonepe-pg";

const activeColor = theme.ecommerce.activeColor;
const textColor = theme.ecommerce.textColor;

// Shared serif section heading style for this screen
const sectionHeadingSx = {
  fontFamily: FONT_DISPLAY,
  fontSize: 16,
  fontWeight: 700,
  letterSpacing: "-0.01em",
  color: textColor,
  mt: 1,
  mb: 1.25,
};

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

// ── Order Success Screen ─────────────────────────────────────────────────────
const OrderSuccessScreen = ({ orderData, onClose }) => (
  <Box sx={{ px: 2, pb: 14, pt: 3 }}>
    <style>{`
      @keyframes ecomTickPop {
        0%   { transform: scale(0);    opacity: 0; }
        55%  { transform: scale(1.18); opacity: 1; }
        100% { transform: scale(1);    opacity: 1; }
      }
      @keyframes ecomTickRing {
        0%   { transform: scale(0.6); opacity: 0.55; }
        100% { transform: scale(1.5); opacity: 0; }
      }
    `}</style>
    <Box sx={{ textAlign: "center", py: 4 }}>
      <Box sx={{ position: "relative", width: 88, height: 88, mx: "auto", mb: 2.5 }}>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "2px solid #2E9E5B",
            animation: "ecomTickRing 0.9s ease-out forwards",
          }}
        />
        <Avatar
          sx={{
            width: 88,
            height: 88,
            background: "#E7F6EC",
            boxShadow: "0 10px 30px rgba(46,158,91,0.22)",
            animation: "ecomTickPop 0.5s ease-out both",
          }}
        >
          <CheckCircleOutlineIcon sx={{ color: "#2E9E5B", fontSize: 50 }} />
        </Avatar>
      </Box>
      <Typography
        sx={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em", color: textColor, mb: 1 }}
      >
        Order Placed Successfully
      </Typography>
      <Typography sx={{ fontSize: 14, color: "#888", mb: 0.5 }}>
        Order ID: <strong>{orderData.order_id}</strong>
      </Typography>
      <Typography sx={{ fontSize: 13, color: "#888" }}>
        Placed on {new Date(orderData.placed_at).toLocaleString("en-IN")}
      </Typography>
    </Box>

    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${activeColor}30`,
        borderRadius: 3,
        p: 2.5,
        mb: 2,
      }}
    >
      <Typography
        sx={{ fontSize: 14, fontWeight: 700, color: textColor, mb: 2 }}
      >
        Order Details
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
        <Typography sx={{ fontSize: 13, color: "#777" }}>Status</Typography>
        <Chip
          label={orderData.status.toUpperCase()}
          size="small"
          sx={{
            bgcolor: "#fff3e0",
            color: "#f57c00",
            fontWeight: 600,
            fontSize: 11,
            height: 24,
          }}
        />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
        <Typography sx={{ fontSize: 13, color: "#777" }}>
          Payment Method
        </Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: textColor }}>
          {orderData.payment_method}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
        <Typography sx={{ fontSize: 13, color: "#777" }}>
          Payment Status
        </Typography>
        <Chip
          label={orderData.payment_status.toUpperCase()}
          size="small"
          sx={{
            bgcolor: "#ffebee",
            color: "#d32f2f",
            fontWeight: 600,
            fontSize: 11,
            height: 24,
          }}
        />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
        <Typography sx={{ fontSize: 13, color: "#777" }}>Items</Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: textColor }}>
          {orderData.items_count}
        </Typography>
      </Box>

      <Divider sx={{ my: 1.5 }} />

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: textColor }}>
          Total Amount
        </Typography>
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: activeColor }}>
          {fmt(orderData.total_amount)}
        </Typography>
      </Box>
    </Paper>

    {orderData.pdf_url && (
      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${activeColor}30`,
          borderRadius: 3,
          p: 2,
          mb: 2,
          bgcolor: `${activeColor}08`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: `${activeColor}20` }}>
            <DescriptionIcon sx={{ color: activeColor, fontSize: 20 }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{ fontSize: 13, fontWeight: 600, color: textColor }}
            >
              Order Invoice
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#888" }}>
              Download your order receipt
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            href={orderData.pdf_url}
            target="_blank"
            sx={{
              borderRadius: 1.5,
              textTransform: "none",
              fontSize: 12,
              fontWeight: 600,
              borderColor: activeColor,
              color: activeColor,
              "&:hover": {
                borderColor: activeColor,
                bgcolor: `${activeColor}10`,
              },
            }}
          >
            Download
          </Button>
        </Box>
      </Paper>
    )}

    <Button
      fullWidth
      variant="contained"
      onClick={onClose}
      sx={{
        bgcolor: activeColor,
        color: "#fff",
        borderRadius: 2,
        textTransform: "none",
        fontWeight: 700,
        fontSize: 15,
        py: 1.2,
        "&:hover": {
          bgcolor: theme.ecommerce.proceedBtnHoverCol,
        },
      }}
    >
      Continue Shopping
    </Button>
  </Box>
);

// ── Online Payment "receipt" screen ─────────────────────────────────────────
const OnlinePaymentScreen = ({
  items,
  totalPrice,
  totalOriginal,
  totalDiscount,
}) => (
  <Box sx={{ px: 2, pb: 14 }}>
    {/* Header */}
    <Box sx={{ textAlign: "center", py: 3 }}>
      <Avatar
        sx={{
          width: 56,
          height: 56,
          bgcolor: `${activeColor}18`,
          mx: "auto",
          mb: 1.5,
        }}
      >
        <ReceiptLongOutlinedIcon sx={{ color: activeColor, fontSize: 28 }} />
      </Avatar>
      <Typography sx={{ fontSize: 18, fontWeight: 700, color: textColor }}>
        Order Summary
      </Typography>
      <Typography sx={{ fontSize: 13, color: "#888", mt: 0.5 }}>
        Review your order before paying
      </Typography>
    </Box>

    {/* Items */}
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${activeColor}30`,
        borderRadius: 3,
        overflow: "hidden",
        mb: 2,
      }}
    >
      <Box
        sx={{
          bgcolor: `${activeColor}10`,
          px: 2,
          py: 1.2,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <LocalOfferOutlinedIcon sx={{ fontSize: 16, color: activeColor }} />
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: textColor }}>
          {items.length} Item{items.length > 1 ? "s" : ""}
        </Typography>
      </Box>

      {items.map((item, idx) => (
        <Box key={item.cart_id}>
          {idx > 0 && <Divider />}
          <Box sx={{ px: 2, py: 1.5 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}
            >
              <Typography
                sx={{ fontSize: 14, fontWeight: 600, color: textColor }}
              >
                Tag #{item.stock.tagno}
              </Typography>
              <Typography
                sx={{ fontSize: 14, fontWeight: 700, color: activeColor }}
              >
                {fmt(item.stock.actual_price * item.quantity)}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Chip
                icon={
                  <DiamondOutlinedIcon sx={{ fontSize: "14px !important" }} />
                }
                label={item.stock.metaltype_name || item.stock.itemtype_name || "—"}
                size="small"
                sx={{
                  fontSize: 11,
                  height: 22,
                  bgcolor: `${activeColor}12`,
                  color: textColor,
                  border: `0.5px solid ${activeColor}40`,
                  "& .MuiChip-icon": { color: activeColor },
                }}
              />
              <Chip
                icon={
                  <ScaleOutlinedIcon sx={{ fontSize: "14px !important" }} />
                }
                label={`${item.stock.gross}g gross · ${item.stock.netwt}g net`}
                size="small"
                sx={{
                  fontSize: 11,
                  height: 22,
                  bgcolor: "#f5f5f5",
                  color: "#666",
                  "& .MuiChip-icon": { color: "#888" },
                }}
              />
              <Chip
                label={`Purity: ${item.stock.purity_name || item.stock.purity}`}
                size="small"
                sx={{
                  fontSize: 11,
                  height: 22,
                  bgcolor: "#f5f5f5",
                  color: "#666",
                }}
              />
            </Box>

            {item.stock.actual_price !== item.stock.false_price && (
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
              >
                <Typography
                  sx={{
                    fontSize: 11,
                    color: "#aaa",
                    textDecoration: "line-through",
                  }}
                >
                  {fmt(item.stock.false_price)}
                </Typography>
                <Typography
                  sx={{ fontSize: 11, color: "green", fontWeight: 600 }}
                >
                  Save {fmt(item.stock.false_price - item.stock.actual_price)}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      ))}
    </Paper>

    {/* Bill details */}
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${activeColor}30`,
        borderRadius: 3,
        px: 2,
        py: 2,
        mb: 2,
      }}
    >
      <Typography
        sx={{ fontSize: 13, fontWeight: 700, color: textColor, mb: 1.5 }}
      >
        Bill Details
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography sx={{ fontSize: 13, color: "#777" }}>MRP Total</Typography>
        <Typography sx={{ fontSize: 13, color: "#555" }}>
          {fmt(totalOriginal)}
        </Typography>
      </Box>

      {totalDiscount > 0 && (
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography sx={{ fontSize: 13, color: "#777" }}>Discount</Typography>
          <Typography sx={{ fontSize: 13, color: "green", fontWeight: 600 }}>
            −{fmt(totalDiscount)}
          </Typography>
        </Box>
      )}

      <Divider sx={{ my: 1.2 }} />

      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: textColor }}>
          Amount to Pay
        </Typography>
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: activeColor }}>
          {fmt(totalPrice)}
        </Typography>
      </Box>
    </Paper>
  </Box>
);

// ── Cash Confirm Bottom Sheet ────────────────────────────────────────────────
const CashConfirmSheet = ({
  open,
  totalPrice,
  onClose,
  onConfirm,
  loading,
}) => (
  <Slide direction="up" in={open} mountOnEnter unmountOnExit>
    <Paper
      elevation={8}
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        p: 3,
        pb: 4,
        maxWidth: 600,
        mx: "auto",
        zIndex: 1300,
        bgcolor: "#fff",
        boxShadow: "0 -8px 32px rgba(0,0,0,0.15)",
      }}
    >
      {/* Drag handle */}
      <Box
        sx={{
          width: 36,
          height: 4,
          bgcolor: "#ddd",
          borderRadius: 2,
          mx: "auto",
          mb: 2.5,
        }}
      />

      <Box sx={{ textAlign: "center", mb: 2.5 }}>
        <Avatar
          sx={{
            width: 52,
            height: 52,
            bgcolor: `${activeColor}15`,
            mx: "auto",
            mb: 1.5,
          }}
        >
          <MoneyIcon sx={{ color: activeColor, fontSize: 26 }} />
        </Avatar>
        <Typography sx={{ fontSize: 17, fontWeight: 700, color: textColor }}>
          Confirm Cash Order
        </Typography>
        <Typography sx={{ fontSize: 13, color: "#888", mt: 0.5 }}>
          You'll pay at the time of delivery
        </Typography>
      </Box>

      <Box
        sx={{
          bgcolor: `${activeColor}0D`,
          border: `1px solid ${activeColor}30`,
          borderRadius: 2.5,
          p: 2,
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography sx={{ fontSize: 14, color: "#777" }}>
          Total payable
        </Typography>
        <Typography sx={{ fontSize: 20, fontWeight: 800, color: activeColor }}>
          {fmt(totalPrice)}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 1.5 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={onClose}
          disabled={loading}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            borderColor: "#ddd",
            color: "#666",
            "&:hover": { borderColor: "#ccc", bgcolor: "#f9f9f9" },
          }}
        >
          Cancel
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={18} sx={{ color: "#fff" }} />
            ) : (
              <CheckCircleOutlineIcon />
            )
          }
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            bgcolor: activeColor,
            color: "#fff",
            "&:hover": {
              bgcolor: theme.ecommerce.proceedBtnHoverCol,
            },
            "&:disabled": {
              bgcolor: "#ccc",
              color: "#fff",
            },
          }}
        >
          {loading ? "Placing Order..." : "Confirm Order"}
        </Button>
      </Box>
    </Paper>
  </Slide>
);

// ── Main OrderSummary ────────────────────────────────────────────────────────
const OrderSummary = ({ onPaymentState }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const safeAreaBottom = useSafeAreaBottom();
  const safeAreaTop = useSafeAreaTop();
  // Keep top toasts below the fixed app header (safe-area + 56px header).
  const snackbarTopSx = { top: `calc(${safeAreaTop} + 64px) !important` };
  const { storeAssets } = useContext(StoreContext);

  const { cartItems, handleToggleRefresh, fetchCart } = useContext(EcomContext);
  const { loginRole, adminUser } = useContext(AuthContext);
  // Reuse the globally-preloaded PhonePe gateway (same as the Saving app).
  const { gateway, phonePeReady } = usePaymentGateway();

  const { address1, address2, address3 } = adminUser || {};

  const shipping_address = [address1, address2, address3]
    .filter(Boolean) // removes undefined/null/empty
    .join(" ");

  // Display-only "Deliver to" details (does NOT affect the checkout payload).
  const deliverToName = adminUser?.name;
  const deliverToMobile = adminUser?.mobile;
  const deliverToAddress = [
    address1,
    address2,
    address3,
    adminUser?.place,
    adminUser?.pincode,
  ]
    .filter(Boolean)
    .join(", ");
  const hasAddress = !!deliverToAddress;

  const { store_id, branch, store_name, token } =
    storeAssets?.storeinfo?.[0] || {};

  const [addressSheetOpen, setAddressSheetOpen] = useState(false);

  const [payMode, setPayMode] = useState("online");
  const [showCashSheet, setShowCashSheet] = useState(false);
  const [proceedOnline, setProceedOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [verifying, setVerifying] = useState(false); // online-payment verification
  const [processing, setProcessing] = useState(false); // starting payment / SDK open
  const [payConfirmOpen, setPayConfirmOpen] = useState(false); // pre-payment confirm dialog
  const [reservedOpen, setReservedOpen] = useState(false); // "item reserved" dialog

  // Guards the payment-verification loop (polls up to 5 min) from continuing to
  // fetch / setState / navigate after the screen unmounts (back button, route
  // change, app backgrounding).
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Legal consent (mandatory before proceeding) + policy sheets
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // 'success' | 'error' | 'warning' | 'info'
  });

  // Derive the payment step from navigation history: "Proceed to Pay" pushes
  // a { ecomStep: "Payment" } entry, so pressing Back returns to the summary
  // (and further Back to the Bag) instead of leaving the checkout flow.
  useEffect(() => {
    setProceedOnline(location.state?.ecomStep === "Payment");
  }, [location.key]);

  // Refresh product prices once when the Payment page opens, so the amount shown
  // and charged always reflects the latest metal rate (not a stale cached price).
  useEffect(() => {
    if (proceedOnline) fetchCart();
  }, [proceedOnline, fetchCart]);

  // "Buy Now" scopes checkout to a single product; normal checkout uses the
  // whole cart. buyNowTagno is threaded through the Summary/Payment steps.
  const buyNowTagno = location.state?.buyNowTagno ?? null;
  const sourceItems = buyNowTagno
    ? cartItems.filter(
        (item) => String(item.stock?.tagno) === String(buyNowTagno),
      )
    : cartItems;

  // Filter items: must have stock AND flag must be F, N, or E
  const validItems = sourceItems.filter(
    (item) => item.stock && ["F", "N", "E"].includes(item.stock.flag),
  );

  const validTags = validItems.map((item) => item.stock.tagno);

  const totalPrice = validItems.reduce(
    (acc, item) => acc + item.stock.actual_price * item.quantity,
    0,
  );
  const totalOriginal = validItems.reduce(
    (acc, item) => acc + item.stock.false_price * item.quantity,
    0,
  );
  const totalDiscount = totalOriginal - totalPrice;

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  const handleProceed = () => {
    // Mandatory consent gate before advancing to payment/confirmation.
    // Purely a client-side guard — the existing cash/online flow below is
    // unchanged once the user has agreed.
    if (!agreedToTerms) {
      showSnackbar(
        "Please accept the Privacy Policy and Terms & Conditions to continue.",
        "warning",
      );
      return;
    }
    if (payMode === "cash") {
      setShowCashSheet(true);
    } else {
      // Online: show a short confirm dialog first, then open the PhonePe SDK.
      setPayConfirmOpen(true);
    }
  };

  const handleCashConfirm = async () => {
    setLoading(true);

    const payload = {
      user_id: adminUser?.user_id,
      store_id: store_id,
      branch_id: branch,
      store_name: store_name,
      name: adminUser?.name,
      email: adminUser?.email,
      mobile: `91${adminUser?.mobile}`,
      whatsapp_token: "60b4b91dd01e0b6610cb0c41",
      tagno_list: validTags,
      shipping_address,
      is_alpha: APP_CONFIG.IS_ALPHA,
    };

    const url = `${process.env.REACT_APP_API_BASE_URL}/api/e-com/checkout-offline`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Success
        setOrderData(result.data);
        setShowCashSheet(false);
        setOrderSuccess(true);
        onPaymentState?.("success");
        showSnackbar(result.message || "Order placed successfully!", "success");

        // Optional: Clear cart items after successful order
        // You might want to call a context method here to clear the cart
      } else {
        // API returned an error
        showSnackbar(
          result.message || "Failed to place order. Please try again.",
          "error",
        );
      }
    } catch (error) {
      console.error("Order placement error:", error);
      showSnackbar(
        "Network error. Please check your connection and try again.",
        "error",
      );
    } finally {
      setLoading(false);
      handleToggleRefresh();
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // ONLINE PAYMENT (PhonePe) — e-commerce
  // Reuses the SAME native PhonePe SDK the Saving app uses. Does NOT touch
  // SchemeDetailPageV2 or any Saving-app payment code. Prices/rate shown on
  // this screen are locked and sent to the backend as-is (no server re-calc).
  // ══════════════════════════════════════════════════════════════════════════
  const verifyEcomPhonePe = async (merchantOrderId) => {
    const API = process.env.REACT_APP_API_BASE_URL;
    const MAX_DURATION = 300000; // 5 minutes
    const INTERVAL = 5000;
    const start = Date.now();

    // Order is created by the backend finalizer right after payment succeeds;
    // fetch it (with a short retry to cover the tiny finalize window).
    const fetchOrder = async () => {
      for (let i = 0; i < 5; i++) {
        try {
          const r = await fetch(
            `${API}/api/e-com/orders/by-merchant/${merchantOrderId}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if (r.ok) {
            const d = await r.json();
            if (d.success && d.data) return d.data;
          }
        } catch (e) {}
        await new Promise((res) => setTimeout(res, 1500));
      }
      return null;
    };

    setVerifying(true);
    try {
      while (Date.now() - start < MAX_DURATION) {
        // Stop polling if the user has left the checkout screen — prevents a
        // 5-minute background fetch loop and setState/navigate after unmount.
        if (!isMountedRef.current) return;
        try {
          const r = await fetch(`${API}/api/phonepe/verify-payment`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ merchantOrderId }),
          });
          const d = await r.json();

          if (d.success) {
            const order = await fetchOrder();
            if (order) {
              setOrderData(order);
              setOrderSuccess(true);
              onPaymentState?.("success");
            } else {
              showSnackbar(
                "Payment received. Your order is being confirmed — please check My Orders.",
                "info",
              );
              navigate("/orders");
            }
            return;
          }

          if (d.status === "FAILED" || d.status === "EXPIRED") {
            onPaymentState?.("failed");
            navigate("/ecom/paymentfailed", {
              replace: true,
              state: {
                reason: d.status,
                message: d.message || "Payment failed.",
                amount: totalPrice,
              },
            });
            return;
          }
        } catch (e) {
          // transient — keep polling
        }
        await new Promise((res) => setTimeout(res, INTERVAL));
      }

      // Timed out without confirmation
      if (!isMountedRef.current) return;
      onPaymentState?.("failed");
      navigate("/ecom/paymentfailed", {
        replace: true,
        state: {
          reason: "TIMEOUT",
          message:
            "Payment could not be confirmed. Please check My Orders or contact the store.",
          amount: totalPrice,
        },
      });
    } finally {
      setVerifying(false);
      setLoading(false);
      handleToggleRefresh();
    }
  };

  const runEcomPhonePe = async () => {
    if (processing) return;
    if (!validItems.length) {
      showSnackbar("Your cart is empty.", "warning");
      return;
    }
    if (!Capacitor.isNativePlatform()) {
      showSnackbar("Online payment is available only in the mobile app.", "warning");
      return;
    }

    setProcessing(true);
    onPaymentState?.("idle");
    try {
      // Lock the exact items + prices shown on this screen (no server re-calc).
      const items = validItems.map(({ stock }) => ({
        tagno: stock.tagno,
        price_at_order: stock.actual_price,
        metal_type: stock.metaltype,
        purity: stock.purity,
        gross_wt: stock.gross,
        net_wt: stock.netwt,
        rate: stock.breakup?.rate ?? stock.rate ?? null,
        itemtype_name: stock.itemtype_name ?? null,
        design_name: stock.design_name ?? null,
        metaltype_name: stock.metaltype_name ?? null,
        purity_name: stock.purity_name ?? null,
        image: Array.isArray(stock.images) ? stock.images[0] : stock.image ?? null,
      }));

      const payload = {
        user_id: adminUser?.user_id,
        store_id,
        branch_id: branch,
        is_alpha: APP_CONFIG.IS_ALPHA,
        items,
        subtotal: totalPrice,
        discount_amount: totalDiscount,
        tax_amount: 0,
        payable_amount: totalPrice,
        // store_name + WhatsApp token are read server-side from the stores table
      };

      // 1) Start the payment (reserves stock + creates the PhonePe order)
      const createRes = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/e-com/checkout/online`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );
      const created = await createRes.json();
      if (!createRes.ok || !created.success) {
        // Another customer reserved this piece first — keep the user on the
        // Product Details page (do NOT navigate to the failed screen).
        if (createRes.status === 409 || created.code === "RESERVED") {
          setProcessing(false);
          setReservedOpen(true); // dialog → Continue Shopping → landing page
          return;
        }
        setProcessing(false);
        showSnackbar(
          created.message || "Could not start payment. Please try again.",
          "error",
        );
        return;
      }

      const { merchantOrderId, orderId, orderToken } = created;
      const merchantId = gateway?.razorpay_merchant_id || gateway?.merchant_id;
      const env = gateway?.razorpay_env || gateway?.env_ment;

      // 2) Open PhonePe via the existing native SDK (same as the Saving app)
      if (!phonePeReady) {
        const initRes = await PhonePePaymentPlugin.init({
          environment: env,
          merchantId,
          flowId: `FLOW_${Date.now()}`,
          enableLogging: false,
        });
        if (!initRes.status) {
          setProcessing(false);
          showSnackbar("PhonePe initialization failed.", "error");
          return;
        }
      }

      const result = await PhonePePaymentPlugin.startTransaction({
        request: JSON.stringify({
          merchantId,
          token: orderToken,
          orderId,
          paymentMode: { type: "PAY_PAGE" },
        }),
        appSchema: "myapp",
        showLoaderFlag: true,
      });

      // 3) Verify + show success (or release + go straight to the failed page)
      if (result.status === "SUCCESS") {
        setProcessing(false); // hand off to the "Verifying Payment…" loader
        await verifyEcomPhonePe(merchantOrderId);
      } else {
        try {
          await fetch(
            `${process.env.REACT_APP_API_BASE_URL}/api/phonepe/cancel-pending`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ merchant_order_id: merchantOrderId }),
            },
          );
        } catch (e) {}
        handleToggleRefresh();
        // Keep the loader up (processing stays true) so the summary never
        // flashes back before the failed page mounts.
        onPaymentState?.("failed");
        navigate("/ecom/paymentfailed", {
          replace: true,
          state: {
            reason: result.status,
            message:
              result.status === "FAILURE"
                ? result.error || "Payment failed."
                : "Payment was cancelled.",
            amount: totalPrice,
          },
        });
      }
    } catch (err) {
      console.error("eCom PhonePe error:", err);
      handleToggleRefresh();
      onPaymentState?.("failed");
      navigate("/ecom/paymentfailed", {
        replace: true,
        state: {
          reason: "ERROR",
          message: "Payment failed. Please try again.",
          amount: totalPrice,
        },
      });
    }
  };

  const handleCloseOrderSuccess = () => {
    setOrderSuccess(false);
    setOrderData(null);
    // Continue Shopping → back to the e-commerce landing page
    navigate("/e-com/categories");
  };

  // ── Full-screen loader: starting payment (processing) or verifying it ──
  if (processing || verifying) {
    return (
      <Box
        position="fixed"
        top="50%"
        left="50%"
        sx={{ transform: "translate(-50%, -50%)" }}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <CircularProgress size={60} sx={{ color: activeColor }} />
        <Typography variant="h7" mt={2} textAlign="center">
          {verifying ? "Verifying Payment..." : "Please wait…"}
          <br />
          Please do not press the back button.
        </Typography>
      </Box>
    );
  }

  // ── Order Success View ──
  if (orderSuccess && orderData) {
    return (
      <>
        <OrderSuccessScreen
          orderData={orderData}
          onClose={handleCloseOrderSuccess}
        />
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          sx={snackbarTopSx}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </>
    );
  }

  // ── Online "bill" screen ──
  if (proceedOnline) {
    return (
      <>
        <OnlinePaymentScreen
          items={validItems}
          totalPrice={totalPrice}
          totalOriginal={totalOriginal}
          totalDiscount={totalDiscount}
        />

        {/* Sticky pay button */}
        <Paper
          elevation={4}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            maxWidth: 600,
            mx: "auto",
            px: 2,
            pt: 2,
            pb: `calc(16px + ${safeAreaBottom})`,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            bgcolor: "#fff",
            boxShadow: theme.ecommerce.summaryCardBoxShadow,
          }}
        >
          <Button
            fullWidth
            variant="contained"
            startIcon={<WifiIcon />}
            sx={{
              bgcolor: activeColor,
              color: "#fff",
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 15,
              py: 1.2,
              "&:hover": {
                bgcolor: theme.ecommerce.proceedBtnHoverCol,
              },
            }}
            disabled={loading}
            onClick={runEcomPhonePe}
          >
            {loading ? "Processing…" : `Pay ${fmt(totalPrice)} Online`}
          </Button>
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          sx={snackbarTopSx}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </>
    );
  }

  // ── Default: pay mode selection ──
  return (
    <>
      <Box sx={{ px: 2, pb: 20 }}>
        {" "}
        <Paper
          elevation={0}
          sx={{
            border: `1px solid ${activeColor}25`,
            borderRadius: 3,
            overflow: "hidden",
            mb: 2.5,
            py: 2,
            px: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: hasAddress ? 1 : 0,
            }}
          >
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: textColor }}>
              Deliver to:
            </Typography>
            <Box
              onClick={() => setAddressSheetOpen(true)}
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                border: `1px solid ${activeColor}`,
                cursor: "pointer",
              }}
            >
              <Typography
                sx={{ fontSize: 13, fontWeight: 700, color: activeColor }}
              >
                {hasAddress ? "Change" : "Add"}
              </Typography>
            </Box>
          </Box>

          {hasAddress ? (
            <>
              {deliverToName && (
                <Typography
                  sx={{ fontSize: 14, fontWeight: 700, color: textColor }}
                >
                  {deliverToName}
                </Typography>
              )}
              <Typography
                sx={{ fontSize: 13.5, color: textColor, mt: 0.25, lineHeight: 1.5 }}
              >
                {deliverToAddress}
              </Typography>
              {deliverToMobile && (
                <Typography
                  sx={{ fontSize: 13.5, fontWeight: 600, color: textColor, mt: 0.75 }}
                >
                  {deliverToMobile}
                </Typography>
              )}
            </>
          ) : (
            <Typography
              sx={{ fontSize: 14, fontStyle: "italic", color: "#999" }}
            >
              No delivery address added yet
            </Typography>
          )}
        </Paper>
        {/* Items recap */}
        <Typography sx={sectionHeadingSx}>
          Order Items ({validItems.length})
        </Typography>
        <Paper
          elevation={0}
          sx={{
            border: `1px solid ${activeColor}25`,
            borderRadius: 3,
            overflow: "hidden",
            mb: 2.5,
          }}
        >
          {validItems.map((item, idx) => (
            <Box key={item.cart_id}>
              {idx > 0 && <Divider />}
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box>
                  <Typography
                    sx={{ fontSize: 14, fontWeight: 600, color: textColor }}
                  >
                    Tag #{item.stock.tagno}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "#888", mt: 0.3 }}>
                    {item.stock.metaltype_name || item.stock.itemtype_name || "—"}{" "}
                    · {item.stock.gross}g ·{" "}
                    {item.stock.purity_name || item.stock.purity} purity
                  </Typography>
                </Box>
                <Typography
                  sx={{ fontSize: 14, fontWeight: 700, color: activeColor }}
                >
                  {fmt(item.stock.actual_price)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Paper>
        {/* Bill details */}
        <Typography sx={sectionHeadingSx}>Bill Details</Typography>
        <Paper
          elevation={0}
          sx={{
            border: `1px solid ${activeColor}25`,
            borderRadius: 3,
            px: 2,
            py: 2,
            mb: 2.5,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography sx={{ fontSize: 13, color: "#777" }}>
              Item Total (MRP)
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#555" }}>
              {fmt(totalOriginal)}
            </Typography>
          </Box>
          {totalDiscount > 0 && (
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography sx={{ fontSize: 13, color: "#777" }}>
                Discount
              </Typography>
              <Typography
                sx={{ fontSize: 13, color: "green", fontWeight: 600 }}
              >
                −{fmt(totalDiscount)}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 1.2 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography
              sx={{ fontSize: 15, fontWeight: 700, color: textColor }}
            >
              Total
            </Typography>
            <Typography
              sx={{ fontSize: 15, fontWeight: 700, color: activeColor }}
            >
              {fmt(totalPrice)}
            </Typography>
          </Box>
        </Paper>
        {/* Payment mode */}
        <Typography sx={sectionHeadingSx}>Payment Mode</Typography>
        <FormControl component="fieldset" sx={{ width: "100%" }}>
          <RadioGroup
            value={payMode}
            onChange={(e) => setPayMode(e.target.value)}
            sx={{ gap: 1 }}
          >
            {[
              {
                value: "online",
                label: "Online Payment",
                sub: "UPI, Cards, Net Banking",
                Icon: WifiIcon,
              },
              // ── "Book Now, Pay at Store" — HIDDEN per client request ──────────
              // Commented out (not deleted) so it can be re-enabled later by
              // simply uncommenting this option. All the cash-flow logic
              // (payMode === "cash" branch in handleProceed, handleCashConfirm,
              // CashConfirmSheet, showCashSheet) is intentionally left intact.
              // {
              //   value: "cash",
              //   label: "Book Now, Pay at Store",
              //   sub: "Book this item online and pay in-store at pickup.",
              //   Icon: MoneyIcon,
              // },
            ].map(({ value, label, sub, Icon }) => (
              <Paper
                key={value}
                elevation={0}
                onClick={() => setPayMode(value)}
                sx={{
                  border: `1.5px solid ${
                    payMode === value ? activeColor : "#e0e0e0"
                  }`,
                  borderRadius: 3,
                  px: 2,
                  py: 1.5,
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  bgcolor: payMode === value ? `${activeColor}08` : "#fff",
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: payMode === value ? `${activeColor}18` : "#f5f5f5",
                    mr: 1.5,
                  }}
                >
                  <Icon
                    sx={{
                      fontSize: 18,
                      color: payMode === value ? activeColor : "#999",
                    }}
                  />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{ fontSize: 14, fontWeight: 600, color: textColor }}
                  >
                    {label}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: "#888" }}>
                    {sub}
                  </Typography>
                </Box>
                <Radio
                  value={value}
                  checked={payMode === value}
                  size="small"
                  sx={{
                    color: "#ccc",
                    "&.Mui-checked": { color: activeColor },
                    p: 0,
                  }}
                />
              </Paper>
            ))}
          </RadioGroup>
        </FormControl>
      </Box>

      {/* Sticky bottom bar */}
      <Paper
        elevation={4}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          maxWidth: 600,
          mx: "auto",
          px: 2,
          pt: 2,
          pb: `calc(16px + ${safeAreaBottom})`,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          bgcolor: "#fff",
          boxShadow: theme.ecommerce.summaryCardBoxShadow,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1.5,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 12, color: "#888" }}>
              Total Amount
            </Typography>
            <Typography
              sx={{ fontSize: 18, fontWeight: 800, color: activeColor }}
            >
              {fmt(totalPrice)}
            </Typography>
          </Box>
          {totalDiscount > 0 && (
            <Chip
              icon={<CurrencyRupeeIcon sx={{ fontSize: "12px !important" }} />}
              label={`${fmt(totalDiscount)} saved`}
              size="small"
              sx={{
                bgcolor: "#e8f5e9",
                color: "green",
                fontWeight: 600,
                fontSize: 11,
                "& .MuiChip-icon": { color: "green" },
              }}
            />
          )}
        </Box>

        {/* Mandatory consent — must be checked before proceeding */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 0.5,
            mb: 1.25,
            p: 1,
            borderRadius: 2,
            border: `1px solid ${agreedToTerms ? GOLD : LINE}`,
            bgcolor: agreedToTerms ? "rgba(185,138,70,0.06)" : "transparent",
            transition: "all 0.2s ease",
          }}
        >
          <Checkbox
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            size="small"
            sx={{
              p: 0.25,
              color: "#bbb",
              "&.Mui-checked": { color: GOLD },
            }}
          />
          <Typography sx={{ fontSize: 12, color: INK_SOFT, lineHeight: 1.45 }}>
            I have read and agree to the{" "}
            <Typography
              component="span"
              onClick={(e) => {
                e.stopPropagation();
                setShowPrivacy(true);
              }}
              sx={{
                fontSize: 12,
                fontWeight: 700,
                color: GOLD,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Privacy Policy
            </Typography>{" "}
            and{" "}
            <Typography
              component="span"
              onClick={(e) => {
                e.stopPropagation();
                setShowTerms(true);
              }}
              sx={{
                fontSize: 12,
                fontWeight: 700,
                color: GOLD,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Terms &amp; Conditions
            </Typography>
            .
          </Typography>
        </Box>

        <Button
          fullWidth
          variant="contained"
          onClick={handleProceed}
          startIcon={payMode === "online" ? <WifiIcon /> : <MoneyIcon />}
          sx={{
            bgcolor: activeColor,
            color: "#fff",
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            fontSize: 15,
            py: 1.2,
            opacity: agreedToTerms ? 1 : 0.55,
            transition: "opacity 0.2s ease",
            "&:hover": {
              bgcolor: theme.ecommerce.proceedBtnHoverCol,
            },
          }}
        >
          {payMode === "online" ? "Proceed to Pay" : "Book Order "}
        </Button>
      </Paper>

      {/* Cash confirm bottom sheet */}
      {showCashSheet && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.35)",
            zIndex: 1299,
          }}
          onClick={() => !loading && setShowCashSheet(false)}
        />
      )}
      <CashConfirmSheet
        open={showCashSheet}
        totalPrice={totalPrice}
        onClose={() => setShowCashSheet(false)}
        onConfirm={handleCashConfirm}
        loading={loading}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={snackbarTopSx}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Privacy Policy / Terms & Conditions sheets (dummy content) */}
      <LegalPolicySheet
        open={showPrivacy}
        onClose={() => setShowPrivacy(false)}
        variant="privacy"
      />
      <LegalPolicySheet
        open={showTerms}
        onClose={() => setShowTerms(false)}
        variant="terms"
      />

      {/* Delivery address picker — branch comes from the product/stock in cart */}
      <AddressSheet
        open={addressSheetOpen}
        onClose={() => setAddressSheetOpen(false)}
        branchId={validItems[0]?.stock?.branch_id || branch}
      />

      {/* Confirm before opening the PhonePe SDK (dialog, not a separate page) */}
      <Dialog
        open={payConfirmOpen}
        onClose={() => setPayConfirmOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 4, mx: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, textAlign: "center" }}>
          Proceed to Payment
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontSize: 14,
              color: INK_SOFT,
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            You are going to pay <b>{fmt(totalPrice)}</b> securely, so please
            don't close the app until it finishes.
          </Typography>
          {/* Trust badge — green tick + secure label */}
          <Box
            sx={{
              mt: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.5,
            }}
          >
            <CheckCircleOutlineIcon sx={{ fontSize: 18, color: "#2e7d32" }} />
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "#2e7d32" }}>
              100% Secure Payment
            </Typography>
          </Box>
        </DialogContent>
        {/* Cancel + Pay: rounded, side by side, filling the full row width */}
        <DialogActions
          sx={{ px: 2, pb: 2, gap: 1.25, "& > :not(:first-of-type)": { ml: 0 } }}
        >
          <Button
            onClick={() => setPayConfirmOpen(false)}
            variant="outlined"
            sx={{
              flex: 1,
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 700,
              borderColor: "#ddd",
              color: "#666",
              "&:hover": { borderColor: "#ccc", bgcolor: "#f9f9f9" },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setPayConfirmOpen(false);
              runEcomPhonePe();
            }}
            sx={{
              flex: 1,
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 700,
              bgcolor: activeColor,
              "&:hover": {
                bgcolor: theme.ecommerce.proceedBtnHoverCol,
              },
            }}
          >
            Pay {fmt(totalPrice)}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Item reserved by another customer → guide the user onward */}
      <Dialog
        open={reservedOpen}
        onClose={() => setReservedOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 4, mx: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, textAlign: "center" }}>
          Item Reserved
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontSize: 14,
              color: INK_SOFT,
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            Another customer is currently purchasing this item. If their payment
            is cancelled it will become available again — otherwise please ask
            the shop.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setReservedOpen(false);
              navigate("/e-com/categories", { replace: true });
            }}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 700,
              bgcolor: activeColor,
              "&:hover": {
                bgcolor: theme.ecommerce.proceedBtnHoverCol,
              },
            }}
          >
            Continue Shopping
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrderSummary;
