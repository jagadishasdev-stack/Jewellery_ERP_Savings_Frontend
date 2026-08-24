import React, { useState, useContext, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Divider,
  Button,
  Paper,
  Chip,
  Avatar,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  Skeleton,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import ScaleOutlinedIcon from "@mui/icons-material/ScaleOutlined";
import DiamondOutlinedIcon from "@mui/icons-material/DiamondOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import { StoreContext } from "../../contexts/StoreContext";
import { AuthContext } from "../../contexts/AuthContext";
import theme from "../../theme";
import APP_CONFIG from "../../config/constants";

const activeColor = theme.cartScreen.activeColor;
const textColor = theme.cartScreen.textColor;

// ── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const STATUS_CONFIG = {
  pending: { label: "Pending", bgcolor: "#fff3e0", color: "#f57c00" },
  confirmed: { label: "Confirmed", bgcolor: "#e3f2fd", color: "#1565c0" },
  processing: { label: "Processing", bgcolor: "#f3e5f5", color: "#7b1fa2" },
  shipped: { label: "Shipped", bgcolor: "#e8f5e9", color: "#2e7d32" },
  out_for_delivery: {
    label: "Out for Delivery",
    bgcolor: "#e0f7fa",
    color: "#00838f",
  },
  delivered: { label: "Delivered", bgcolor: "#e8f5e9", color: "#1b5e20" },
  cancelled: { label: "Cancelled", bgcolor: "#ffebee", color: "#c62828" },
  rejected: { label: "Rejected", bgcolor: "#ffebee", color: "#b71c1c" },
  return_requested: {
    label: "Return Requested",
    bgcolor: "#fff8e1",
    color: "#e65100",
  },
  returned: { label: "Returned", bgcolor: "#fce4ec", color: "#880e4f" },
  refunded: { label: "Refunded", bgcolor: "#e8f5e9", color: "#2e7d32" },
};

const PAYMENT_STATUS_CONFIG = {
  unpaid: { label: "Unpaid", bgcolor: "#ffebee", color: "#d32f2f" },
  paid: { label: "Paid", bgcolor: "#e8f5e9", color: "#2e7d32" },
  partial: { label: "Partial", bgcolor: "#fff3e0", color: "#f57c00" },
  refunded: { label: "Refunded", bgcolor: "#e3f2fd", color: "#1565c0" },
};

const getStatusConfig = (status) =>
  STATUS_CONFIG[status] || {
    label: status?.toUpperCase() || "Unknown",
    bgcolor: "#f5f5f5",
    color: "#666",
  };

const getPaymentStatusConfig = (status) =>
  PAYMENT_STATUS_CONFIG[status] || {
    label: status?.toUpperCase() || "Unknown",
    bgcolor: "#f5f5f5",
    color: "#666",
  };

// ── Order List Skeleton ──────────────────────────────────────────────────────
const OrderListSkeleton = () => (
  <Box sx={{ px: 2, pt: 1 }}>
    {[1, 2, 3].map((i) => (
      <Paper
        key={i}
        elevation={0}
        sx={{
          border: "1px solid #f0f0f0",
          borderRadius: 3,
          p: 2,
          mb: 1.5,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
          <Skeleton width={140} height={20} />
          <Skeleton width={70} height={24} sx={{ borderRadius: 2 }} />
        </Box>
        <Skeleton width={100} height={16} sx={{ mb: 0.5 }} />
        <Skeleton width={80} height={16} sx={{ mb: 1.5 }} />
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Skeleton width={90} height={22} />
          <Skeleton width={60} height={16} />
        </Box>
      </Paper>
    ))}
  </Box>
);

// ── Empty Orders State ───────────────────────────────────────────────────────
const EmptyOrders = ({ onRefresh }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      py: 8,
      px: 4,
    }}
  >
    <Avatar
      sx={{
        width: 80,
        height: 80,
        bgcolor: `${activeColor}12`,
        mb: 2,
      }}
    >
      <InboxOutlinedIcon sx={{ color: activeColor, fontSize: 38 }} />
    </Avatar>
    <Typography sx={{ fontSize: 17, fontWeight: 700, color: textColor, mb: 1 }}>
      No Orders Yet
    </Typography>
    <Typography
      sx={{ fontSize: 13, color: "#888", textAlign: "center", mb: 3 }}
    >
      Your order history will appear here once you place an order.
    </Typography>
    <Button
      variant="outlined"
      startIcon={<RefreshOutlinedIcon />}
      onClick={onRefresh}
      sx={{
        borderRadius: 2,
        textTransform: "none",
        fontWeight: 600,
        borderColor: activeColor,
        color: activeColor,
        "&:hover": {
          borderColor: activeColor,
          bgcolor: `${activeColor}10`,
        },
      }}
    >
      Refresh
    </Button>
  </Box>
);

// ── Order Card ───────────────────────────────────────────────────────────────
const OrderCard = ({ order, onViewDetail }) => {
  const statusCfg = getStatusConfig(order.status);
  const paymentCfg = getPaymentStatusConfig(order.payment_status);

  return (
    <Paper
      elevation={0}
      onClick={() => onViewDetail(order)}
      sx={{
        border: `1px solid ${activeColor}20`,
        borderRadius: 3,
        p: 2,
        mb: 1.5,
        cursor: "pointer",
        transition: "all 0.2s ease",
        "&:hover": {
          border: `1px solid ${activeColor}60`,
          bgcolor: `${activeColor}04`,
          boxShadow: `0 2px 12px ${activeColor}18`,
        },
      }}
    >
      {/* Header row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 1,
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: textColor }}>
            {order.order_id}
          </Typography>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.4 }}
          >
            <AccessTimeOutlinedIcon sx={{ fontSize: 12, color: "#aaa" }} />
            <Typography sx={{ fontSize: 11, color: "#999" }}>
              {formatDate(order.placed_at)}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Chip
            label={statusCfg.label}
            size="small"
            sx={{
              bgcolor: statusCfg.bgcolor,
              color: statusCfg.color,
              fontWeight: 700,
              fontSize: 10,
              height: 22,
              border: `1px solid ${statusCfg.color}30`,
            }}
          />
          <ChevronRightIcon sx={{ fontSize: 18, color: "#ccc" }} />
        </Box>
      </Box>

      <Divider sx={{ my: 1 }} />

      {/* Tags & Amount */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}
          >
            <LocalOfferOutlinedIcon sx={{ fontSize: 13, color: activeColor }} />
            <Typography sx={{ fontSize: 12, color: "#777" }}>
              {order.tagnos?.length || 0} item
              {(order.tagnos?.length || 0) !== 1 ? "s" : ""}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <PaymentOutlinedIcon sx={{ fontSize: 13, color: "#aaa" }} />
            <Chip
              label={paymentCfg.label}
              size="small"
              sx={{
                bgcolor: paymentCfg.bgcolor,
                color: paymentCfg.color,
                fontWeight: 600,
                fontSize: 10,
                height: 20,
              }}
            />
          </Box>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography sx={{ fontSize: 11, color: "#aaa" }}>Payable</Typography>
          <Typography
            sx={{ fontSize: 16, fontWeight: 800, color: activeColor }}
          >
            {fmt(order.payable_amount)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

// ── Order Detail View ────────────────────────────────────────────────────────
const OrderDetailView = ({ order, onBack }) => {
  const statusCfg = getStatusConfig(order.status);
  const paymentCfg = getPaymentStatusConfig(order.payment_status);

  const timelineFields = [
    { label: "Placed", key: "placed_at" },
    { label: "Confirmed", key: "confirmed_at" },
    { label: "Processing", key: "processing_at" },
    { label: "Shipped", key: "shipped_at" },
    { label: "Out for Delivery", key: "out_for_delivery_at" },
    { label: "Delivered", key: "delivered_at" },
    { label: "Cancelled", key: "cancelled_at" },
    { label: "Rejected", key: "rejected_at" },
    { label: "Return Requested", key: "return_requested_at" },
    { label: "Returned", key: "returned_at" },
    { label: "Refunded", key: "refunded_at" },
  ].filter((f) => order[f.key]);

  return (
    <Box sx={{ px: 2, pb: 14, pt: 1 }}>
      {/* Order ID + Status */}
      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${activeColor}30`,
          borderRadius: 3,
          p: 2,
          mb: 2,
          bgcolor: `${activeColor}06`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1.5,
          }}
        >
          <Box>
            <Typography
              sx={{ fontSize: 15, fontWeight: 700, color: textColor }}
            >
              {order.order_id}
            </Typography>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.3 }}
            >
              <AccessTimeOutlinedIcon sx={{ fontSize: 12, color: "#aaa" }} />
              <Typography sx={{ fontSize: 11, color: "#999" }}>
                {formatDate(order.placed_at)}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={statusCfg.label}
            size="small"
            sx={{
              bgcolor: statusCfg.bgcolor,
              color: statusCfg.color,
              fontWeight: 700,
              fontSize: 11,
              height: 24,
              border: `1px solid ${statusCfg.color}30`,
            }}
          />
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {/* Bill Summary */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.8 }}>
          <Typography sx={{ fontSize: 13, color: "#777" }}>
            Total Amount
          </Typography>
          <Typography sx={{ fontSize: 13, color: textColor, fontWeight: 600 }}>
            {fmt(order.total_amount)}
          </Typography>
        </Box>
        {order.discount_amount > 0 && (
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.8 }}
          >
            <Typography sx={{ fontSize: 13, color: "#777" }}>
              Discount
            </Typography>
            <Typography sx={{ fontSize: 13, color: "green", fontWeight: 600 }}>
              −{fmt(order.discount_amount)}
            </Typography>
          </Box>
        )}
        {order.tax_amount > 0 && (
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.8 }}
          >
            <Typography sx={{ fontSize: 13, color: "#777" }}>Tax</Typography>
            <Typography sx={{ fontSize: 13, color: textColor }}>
              {fmt(order.tax_amount)}
            </Typography>
          </Box>
        )}
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: textColor }}>
            Payable Amount
          </Typography>
          <Typography
            sx={{ fontSize: 15, fontWeight: 700, color: activeColor }}
          >
            {fmt(order.payable_amount)}
          </Typography>
        </Box>
      </Paper>

      {/* Payment Info */}
      <Typography
        sx={{ fontSize: 13, fontWeight: 700, color: textColor, mb: 1 }}
      >
        Payment Info
      </Typography>
      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${activeColor}25`,
          borderRadius: 3,
          px: 2,
          py: 1.8,
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography sx={{ fontSize: 13, color: "#777" }}>Method</Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: textColor }}>
            {order.payment_method || "—"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography sx={{ fontSize: 13, color: "#777" }}>Status</Typography>
          <Chip
            label={paymentCfg.label}
            size="small"
            sx={{
              bgcolor: paymentCfg.bgcolor,
              color: paymentCfg.color,
              fontWeight: 700,
              fontSize: 11,
              height: 22,
            }}
          />
        </Box>
        {order.paid_at && (
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Typography sx={{ fontSize: 13, color: "#777" }}>
              Paid At
            </Typography>
            <Typography sx={{ fontSize: 13, color: textColor }}>
              {formatDate(order.paid_at)}
            </Typography>
          </Box>
        )}
        {order.payment_ref && (
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Typography sx={{ fontSize: 13, color: "#777" }}>Ref</Typography>
            <Typography
              sx={{ fontSize: 12, fontWeight: 600, color: textColor }}
            >
              {order.payment_ref}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Order Items */}
      {order.items && order.items.length > 0 && (
        <>
          <Typography
            sx={{ fontSize: 13, fontWeight: 700, color: textColor, mb: 1 }}
          >
            Order Items ({order.items.length})
          </Typography>
          <Paper
            elevation={0}
            sx={{
              border: `1px solid ${activeColor}25`,
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
              <LocalOfferOutlinedIcon
                sx={{ fontSize: 16, color: activeColor }}
              />
              <Typography
                sx={{ fontSize: 13, fontWeight: 600, color: textColor }}
              >
                {order.items.length} Item
                {order.items.length !== 1 ? "s" : ""}
              </Typography>
            </Box>

            {order.items.map((item, idx) => (
              <Box key={item.id}>
                {idx > 0 && <Divider />}
                <Box sx={{ px: 2, py: 1.8 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.8,
                    }}
                  >
                    <Typography
                      sx={{ fontSize: 14, fontWeight: 600, color: textColor }}
                    >
                      Tag #{item.tagno}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: activeColor,
                      }}
                    >
                      {fmt(item.price_at_order)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip
                      icon={
                        <DiamondOutlinedIcon
                          sx={{ fontSize: "14px !important" }}
                        />
                      }
                      label={item.metal_type === 1 ? "Gold" : "Diamond"}
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
                        <ScaleOutlinedIcon
                          sx={{ fontSize: "14px !important" }}
                        />
                      }
                      label={`${item.gross_wt}g gross · ${item.net_wt}g net`}
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
                      label={`Purity: ${item.purity}`}
                      size="small"
                      sx={{
                        fontSize: 11,
                        height: 22,
                        bgcolor: "#f5f5f5",
                        color: "#666",
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            ))}
          </Paper>
        </>
      )}

      {/* Shipping Info */}
      {(order.tracking_number ||
        order.courier_partner ||
        order.shipping_address) && (
        <>
          <Typography
            sx={{ fontSize: 13, fontWeight: 700, color: textColor, mb: 1 }}
          >
            Shipping Details
          </Typography>
          <Paper
            elevation={0}
            sx={{
              border: `1px solid ${activeColor}25`,
              borderRadius: 3,
              px: 2,
              py: 1.8,
              mb: 2,
            }}
          >
            {order.courier_partner && (
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography sx={{ fontSize: 13, color: "#777" }}>
                  Courier
                </Typography>
                <Typography
                  sx={{ fontSize: 13, fontWeight: 600, color: textColor }}
                >
                  {order.courier_partner}
                </Typography>
              </Box>
            )}
            {order.tracking_number && (
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography sx={{ fontSize: 13, color: "#777" }}>
                  Tracking
                </Typography>
                <Typography
                  sx={{ fontSize: 13, fontWeight: 600, color: activeColor }}
                >
                  {order.tracking_number}
                </Typography>
              </Box>
            )}
            {order.shipping_address && (
              <Box sx={{ mt: 0.5 }}>
                <Typography sx={{ fontSize: 13, color: "#777", mb: 0.3 }}>
                  Address
                </Typography>
                <Typography sx={{ fontSize: 13, color: textColor }}>
                  {order.shipping_address}
                </Typography>
              </Box>
            )}
          </Paper>
        </>
      )}

      {/* Cancellation / Rejection reason */}
      {(order.cancellation_reason || order.rejection_reason) && (
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #ffcdd2",
            borderRadius: 3,
            px: 2,
            py: 1.8,
            mb: 2,
            bgcolor: "#fff8f8",
          }}
        >
          <Typography
            sx={{ fontSize: 13, fontWeight: 600, color: "#c62828", mb: 0.5 }}
          >
            {order.cancellation_reason
              ? "Cancellation Reason"
              : "Rejection Reason"}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#555" }}>
            {order.cancellation_reason || order.rejection_reason}
          </Typography>
        </Paper>
      )}

      {/* Note */}
      {order.note && (
        <Paper
          elevation={0}
          sx={{
            border: `1px solid ${activeColor}25`,
            borderRadius: 3,
            px: 2,
            py: 1.8,
            mb: 2,
          }}
        >
          <Typography
            sx={{ fontSize: 13, fontWeight: 600, color: textColor, mb: 0.5 }}
          >
            Note
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#666" }}>
            {order.note}
          </Typography>
        </Paper>
      )}

      {/* Order Timeline */}
      {timelineFields.length > 0 && (
        <>
          <Typography
            sx={{ fontSize: 13, fontWeight: 700, color: textColor, mb: 1 }}
          >
            Timeline
          </Typography>
          <Paper
            elevation={0}
            sx={{
              border: `1px solid ${activeColor}25`,
              borderRadius: 3,
              px: 2,
              py: 1.8,
              mb: 2,
            }}
          >
            {timelineFields.map((f, idx) => (
              <Box
                key={f.key}
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  mb: idx < timelineFields.length - 1 ? 1.5 : 0,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: activeColor,
                    mt: 0.6,
                    mr: 1.5,
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{ fontSize: 13, fontWeight: 600, color: textColor }}
                  >
                    {f.label}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "#999" }}>
                    {formatDate(order[f.key])}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Paper>
        </>
      )}

      {/* Order History */}
      {order.history && order.history.length > 0 && (
        <>
          <Typography
            sx={{ fontSize: 13, fontWeight: 700, color: textColor, mb: 1 }}
          >
            Order History
          </Typography>
          <Paper
            elevation={0}
            sx={{
              border: `1px solid ${activeColor}25`,
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
              <HistoryOutlinedIcon sx={{ fontSize: 16, color: activeColor }} />
              <Typography
                sx={{ fontSize: 13, fontWeight: 600, color: textColor }}
              >
                Activity Log
              </Typography>
            </Box>
            {order.history.map((h, idx) => {
              const hStatusCfg = getStatusConfig(h.status);
              return (
                <Box key={h.id}>
                  {idx > 0 && <Divider />}
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.4,
                      }}
                    >
                      <Chip
                        label={hStatusCfg.label}
                        size="small"
                        sx={{
                          bgcolor: hStatusCfg.bgcolor,
                          color: hStatusCfg.color,
                          fontWeight: 700,
                          fontSize: 10,
                          height: 20,
                        }}
                      />
                      <Typography sx={{ fontSize: 11, color: "#999" }}>
                        {formatDate(h.changed_at)}
                      </Typography>
                    </Box>
                    {h.reason && (
                      <Typography sx={{ fontSize: 12, color: "#777", mt: 0.4 }}>
                        {h.reason}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Paper>
        </>
      )}
    </Box>
  );
};

// ── Main MyOrders ────────────────────────────────────────────────────────────
const MyOrders = () => {
  const { storeAssets } = useContext(StoreContext);
  const { adminUser } = useContext(AuthContext);

  const { store_id, token } = storeAssets.storeinfo[0];
  const branch = APP_CONFIG.BRANCH;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar({ ...snackbar, open: false });
  };

  // Fetch orders list
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const url = `${process.env.REACT_APP_API_BASE_URL}/api/e-com/orders/user?store_id=${store_id}&branch_id=${branch}&user_id=${adminUser?.user_id}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setOrders(result.data || []);
      } else {
        showSnackbar(result.message || "Failed to fetch orders.", "error");
      }
    } catch (error) {
      console.error("Fetch orders error:", error);
      showSnackbar("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  }, [store_id, branch, adminUser?.user_id, token]);

  // Fetch order detail
  const fetchOrderDetail = async (order) => {
    setDetailLoading(true);
    setSelectedOrder(order);
    try {
      const url = `${process.env.REACT_APP_API_BASE_URL}/api/e-com/orders/user/${order.order_id}?store_id=${store_id}&branch_id=${branch}&user_id=${adminUser?.user_id}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (response.ok && result.success) {
        setOrderDetail(result.data);
      } else {
        showSnackbar(
          result.message || "Failed to fetch order details.",
          "error",
        );
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error("Fetch order detail error:", error);
      showSnackbar("Network error. Please try again.", "error");
      setSelectedOrder(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedOrder(null);
    setOrderDetail(null);
  };

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ── Detail View ──
  if (selectedOrder) {
    return (
      <>
        {/* Sticky Header */}
        <Paper
          elevation={0}
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            bgcolor: "#fff",
            borderBottom: `1px solid ${activeColor}20`,
            px: 1,
            py: 1,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <IconButton onClick={handleBack} size="small">
            <ArrowBackIosNewIcon sx={{ fontSize: 16, color: textColor }} />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{ fontSize: 15, fontWeight: 700, color: textColor }}
            >
              Order Details
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#999" }}>
              {selectedOrder.order_id}
            </Typography>
          </Box>
        </Paper>

        {detailLoading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 8,
            }}
          >
            <CircularProgress size={32} sx={{ color: activeColor }} />
          </Box>
        ) : orderDetail ? (
          <OrderDetailView order={orderDetail} onBack={handleBack} />
        ) : null}

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

  // ── Orders List View ──
  return (
    <>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 2,
          pt: 2,
          pb: 1.5,
          gap: 1.5,
        }}
      >
        <Avatar
          sx={{
            width: 38,
            height: 38,
            bgcolor: `${activeColor}18`,
          }}
        >
          <ReceiptLongOutlinedIcon sx={{ color: activeColor, fontSize: 20 }} />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: textColor }}>
            My Orders
          </Typography>
          {!loading && (
            <Typography sx={{ fontSize: 12, color: "#999" }}>
              {orders.length} order{orders.length !== 1 ? "s" : ""} placed
            </Typography>
          )}
        </Box>
        <IconButton
          onClick={fetchOrders}
          disabled={loading}
          size="small"
          sx={{
            bgcolor: `${activeColor}10`,
            "&:hover": { bgcolor: `${activeColor}20` },
          }}
        >
          <RefreshOutlinedIcon
            sx={{
              fontSize: 18,
              color: activeColor,
              animation: loading ? "spin 1s linear infinite" : "none",
              "@keyframes spin": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
            }}
          />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 1.5 }} />

      {loading ? (
        <OrderListSkeleton />
      ) : orders.length === 0 ? (
        <EmptyOrders onRefresh={fetchOrders} />
      ) : (
        <Box sx={{ px: 2, pb: 4 }}>
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onViewDetail={fetchOrderDetail}
            />
          ))}
        </Box>
      )}

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

export default MyOrders;
