import React, { useContext, useEffect, useState } from "react";
import { Box, Typography, Paper, Skeleton } from "@mui/material";
import { Payment as PaymentIcon, Speed as RateIcon } from "@mui/icons-material";
import axios from "axios";
import APP_CONFIG from "../config/constants";
import { AuthContext } from "../contexts/AuthContext";

const PaymentHistory = ({ scheme, userInfo, enrolledMember }) => {
  const { adminUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState([]);

  const isGold = scheme?.metal === "gold";
  const accentColor = isGold ? "#b45309" : "#475569";

  useEffect(() => {
    fetchPaymentHistory();
  }, [userInfo, enrolledMember]);

  const fetchPaymentHistory = async () => {
    setLoading(true);
    try {
      const payload = {
        mobile: userInfo?.mobile || enrolledMember?.mobile,
        mcode: enrolledMember
          ? `${enrolledMember.mgroup}-${enrolledMember.member_no}`
          : `${userInfo?.mgroup}-${userInfo?.member_no}`,
        storeID: APP_CONFIG.STORE_ID,
        branchId: scheme.plan.branch,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/core/userledger`,
        payload,
      );

      const ledgerData = response.data || [];
      setPaymentHistory(ledgerData);
    } catch (error) {
      console.error("Error fetching payment history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "--";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Box sx={{ mt: 2 }}>
        <Skeleton
          variant="rectangular"
          height={80}
          sx={{ borderRadius: 2, mb: 2 }}
        />
        <Skeleton
          variant="rectangular"
          height={80}
          sx={{ borderRadius: 2, mb: 1 }}
        />
        {/* <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2, mb: 1 }} /> */}
      </Box>
    );
  }

  // Empty state
  if (paymentHistory.length === 0) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          borderRadius: "16px",
          backgroundColor: "#f9fafb",
          my: 2,
        }}
      >
        <PaymentIcon sx={{ fontSize: 48, color: "#9ca3af", mb: 1 }} />
        <Typography sx={{ color: "#6b7280", fontWeight: 500 }}>
          No payment history yet
        </Typography>
        <Typography sx={{ color: "#9ca3af", fontSize: 14, mt: 0.5 }}>
          Your first payment will appear here
        </Typography>
      </Box>
    );
  }

  // Render payment cards with large bold amount
  return (
    <Box sx={{ px: 0.5, pb: 2 }}>
      {paymentHistory.map((payment, index) => (
        <Paper
          key={payment.voucher_no || index}
          elevation={0}
          sx={{
            backgroundColor: "#fafafa",
            borderRadius: "16px",
            marginBottom: "12px",
            padding: "16px",
            border: "1px solid #eaeaea",
            transition: "all 0.2s",
          }}
        >
          {/* Row 1: Voucher No and Date */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography
              sx={{ fontWeight: 700, fontSize: 16, color: "#111827" }}
            >
              #{payment.voucher_no}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
              {formatDate(payment.voucher_date)}
            </Typography>
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 800,
                color: accentColor,
                mb: 1,
                letterSpacing: -0.5,
              }}
            >
              ₹{Number(payment.amount).toLocaleString()}
            </Typography>
          </Box>

          {/* Row 3: Rate and Gold Weight */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <RateIcon sx={{ fontSize: 14, color: "#9ca3af" }} />
              <Typography sx={{ fontSize: 13, color: "#4b5563" }}>
                Rate: ₹{Number(payment.rate).toLocaleString()}/gm
              </Typography>
            </Box>
            {isGold && payment.gross_wt && (
              <Typography
                sx={{ fontSize: 13, color: "#4b5563", fontWeight: 500 }}
              >
                {Number(payment.gross_wt).toFixed(3)} gm
              </Typography>
            )}
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default PaymentHistory;
