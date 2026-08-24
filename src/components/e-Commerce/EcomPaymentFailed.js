import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Avatar } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

// E-commerce payment failure screen. Mirrors the Saving app's PaymentFailed
// redirect pattern, with e-commerce-specific data + actions. Reached via
// navigate("/ecom/paymentfailed", { state: { reason, message, amount } }).
const EcomPaymentFailed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { message, amount } = location.state || {};

  return (
    <Box sx={{ px: 3, py: 7, textAlign: "center", maxWidth: 600, mx: "auto" }}>
      <Avatar
        sx={{ width: 88, height: 88, bgcolor: "#fdecea", mx: "auto", mb: 2.5 }}
      >
        <ErrorOutlineIcon sx={{ color: "#d32f2f", fontSize: 48 }} />
      </Avatar>

      <Typography sx={{ fontSize: 22, fontWeight: 700, mb: 1 }}>
        Payment Failed
      </Typography>
      <Typography sx={{ fontSize: 14, color: "#777", mb: 0.5 }}>
        {message || "Your payment could not be completed."}
      </Typography>
      {amount != null && (
        <Typography sx={{ fontSize: 14, color: "#777", mb: 3 }}>
          Amount: ₹{Number(amount).toLocaleString("en-IN")}
        </Typography>
      )}

      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 2, mb: 1.5, py: 1.2, borderRadius: 2, textTransform: "none", fontWeight: 700 }}
        onClick={() => navigate("/cart", { replace: true })}
      >
        Try Again
      </Button>
      <Button
        fullWidth
        variant="outlined"
        sx={{ py: 1.2, borderRadius: 2, textTransform: "none", fontWeight: 700 }}
        onClick={() => navigate("/e-com/categories", { replace: true })}
      >
        Continue Shopping
      </Button>
    </Box>
  );
};

export default EcomPaymentFailed;
