import React, { useState, useContext } from "react";
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

const activeColor = theme.cartScreen.activeColor;
const textColor = theme.cartScreen.textColor;

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

// ── Order Success Screen ─────────────────────────────────────────────────────
const OrderSuccessScreen = ({ orderData, onClose }) => (
  <Box sx={{ px: 2, pb: 14, pt: 3 }}>
    <Box sx={{ textAlign: "center", py: 4 }}>
      <Avatar
        sx={{
          width: 80,
          height: 80,
          bgcolor: "#e8f5e9",
          mx: "auto",
          mb: 2,
        }}
      >
        <CheckCircleOutlineIcon sx={{ color: "#4caf50", fontSize: 48 }} />
      </Avatar>
      <Typography
        sx={{ fontSize: 22, fontWeight: 700, color: textColor, mb: 1 }}
      >
        Order Placed Successfully!
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

    {orderData.notifications && (
      <Paper
        elevation={0}
        sx={{
          border: "1px solid #e0e0e0",
          borderRadius: 3,
          p: 2,
          mb: 2,
        }}
      >
        <Typography
          sx={{ fontSize: 13, fontWeight: 600, color: textColor, mb: 1.5 }}
        >
          Notifications Sent
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {orderData.notifications.whatsapp === "sent" && (
            <Chip
              label="WhatsApp ✓"
              size="small"
              sx={{
                bgcolor: "#e8f5e9",
                color: "#2e7d32",
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          )}
          {orderData.notifications.email === "sent" && (
            <Chip
              label="Email ✓"
              size="small"
              sx={{
                bgcolor: "#e3f2fd",
                color: "#1565c0",
                fontSize: 11,
                fontWeight: 600,
              }}
            />
          )}
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
          bgcolor: theme.cartScreen.proceedToAddressBtnHoverCol,
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
                label={item.stock.itemtype === 1 ? "Gold" : "Diamond"}
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
                label={`Purity: ${item.stock.purity}`}
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
              bgcolor: theme.cartScreen.proceedToAddressBtnHoverCol,
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
const OrderSummary = () => {
  const { storeAssets } = useContext(StoreContext);

  const { cartItems, handleToggleRefresh } = useContext(EcomContext);
  const { loginRole, adminUser } = useContext(AuthContext);

  const { address1, address2, address3 } = adminUser;

  const shipping_address = [address1, address2, address3]
    .filter(Boolean) // removes undefined/null/empty
    .join(" ");

  const { store_id, branch, store_name, token } = storeAssets.storeinfo[0];

  const [payMode, setPayMode] = useState("online");
  const [showCashSheet, setShowCashSheet] = useState(false);
  const [proceedOnline, setProceedOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success", // 'success' | 'error' | 'warning' | 'info'
  });

  // Filter items: must have stock AND flag must be F, N, or E
  const validItems = cartItems.filter(
    (item) => item.stock && ["F", "N", "E"].includes(item.stock.flag),
  );

  const validTags = cartItems
    .filter((item) => item.stock && ["F", "N", "E"].includes(item.stock.flag))
    .map((item) => item.stock.tagno);

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
    if (payMode === "cash") {
      setShowCashSheet(true);
    } else {
      setProceedOnline(true);
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

  const handleCloseOrderSuccess = () => {
    setOrderSuccess(false);
    setOrderData(null);
    // Optionally navigate to orders page or home
    // navigate('/orders') or similar
  };

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
            bottom: 56,
            left: 0,
            right: 0,
            maxWidth: 600,
            mx: "auto",
            p: 2,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            bgcolor: "#fff",
            boxShadow: theme.cartScreen.totalSummaryCardBoxShadow,
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
                bgcolor: theme.cartScreen.proceedToAddressBtnHoverCol,
              },
            }}
            onClick={() =>
              showSnackbar("Redirecting to payment gateway…", "info")
            }
          >
            Pay {fmt(totalPrice)} Online
          </Button>
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
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
        <Typography
          sx={{ fontSize: 13, fontWeight: 700, color: textColor, mt: 1, mb: 1 }}
        >
          Address
        </Typography>
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
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: textColor }}>
            {shipping_address}
          </Typography>
        </Paper>
        {/* Items recap */}
        <Typography
          sx={{ fontSize: 13, fontWeight: 700, color: textColor, mt: 1, mb: 1 }}
        >
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
                    {item.stock.itemtype === 1 ? "Gold" : "Diamond"} ·{" "}
                    {item.stock.gross}g · {item.stock.purity} purity
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
        <Typography
          sx={{ fontSize: 13, fontWeight: 700, color: textColor, mb: 1 }}
        >
          Bill Details
        </Typography>
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
        <Typography
          sx={{ fontSize: 13, fontWeight: 700, color: textColor, mb: 1 }}
        >
          Payment Mode
        </Typography>
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
              {
                value: "cash",
                label: "Book Now, Pay at Store",
                sub: "Book this item online and pay in-store at pickup.",
                Icon: MoneyIcon,
              },
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
          bottom: 56,
          left: 0,
          right: 0,
          maxWidth: 600,
          mx: "auto",
          p: 2,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          bgcolor: "#fff",
          boxShadow: theme.cartScreen.totalSummaryCardBoxShadow,
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
            "&:hover": {
              bgcolor: theme.cartScreen.proceedToAddressBtnHoverCol,
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
};

export default OrderSummary;
