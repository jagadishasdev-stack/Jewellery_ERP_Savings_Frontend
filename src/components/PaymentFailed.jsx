// src/components/PaymentFailed.jsx
import React, { useContext } from 'react';
import { Box, Card, CardContent, Typography, Button, Divider, Paper, Chip } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from "../contexts/AuthContext";
// Map error codes to user-friendly messages
const getErrorMessage = (reason) => {
  const errorMap = {
    'CANCELLED':           'You cancelled the payment.',
    'AUTHORIZATION_ERROR': 'Payment was declined by your bank. Please try a different payment method.',
    'FAILED':              'Payment failed. Please try again.',
    'PAYMENT_ERROR':       'An error occurred during payment. Please retry.',
    'EXPIRED':             'Payment session expired. Please initiate a new payment.',
    'INSUFFICIENT_FUNDS':  'Insufficient balance. Please try with a different account.',
    'TRANSACTION_LIMIT':   'Transaction limit exceeded. Please try a smaller amount or different method.',
  };
  return errorMap[reason] || 'Payment could not be completed. Please try again.';
};

const PaymentFailed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state || {};

  const isCancelled = data.reason === 'CANCELLED';
  const userMessage = data.message || getErrorMessage(data.reason);
const { adminUser, loginRole } = useContext(AuthContext);
  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', py: 5 }}>
      <Card elevation={3}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>

          {/* Icon */}
          <CancelIcon sx={{ fontSize: 80, color: isCancelled ? 'warning.main' : 'error.main', mb: 2 }} />

          <Typography
            variant="h5"
            fontWeight="bold"
            color={isCancelled ? 'warning.main' : 'error.main'}
            gutterBottom
          >
            {isCancelled ? 'Payment Cancelled' : 'Payment Failed'}
          </Typography>

          {/* Reason message */}
          <Typography variant="body2" color="text.secondary" mb={3}>
            {userMessage}
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* Details */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', textAlign: 'left', mb: 3 }}>

            {data.amount && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Amount</Typography>
                <Typography variant="body2">₹{data.amount}</Typography>
              </Box>
            )}

            {data.merchantOrderId && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Order ID</Typography>
                <Typography variant="body2">{data.merchantOrderId}</Typography>
              </Box>
            )}

            {data.reason && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">Reason</Typography>
                <Chip
                  label={data.reason}
                  color={isCancelled ? 'warning' : 'error'}
                  size="small"
                  variant="outlined"
                />
              </Box>
            )}

          </Paper>

          {/* Buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Button
              variant="contained"
              fullWidth
              size="large"
            onClick={() => {
  if (loginRole === "agent") {
    navigate("/searchcustomers", { replace: true });
  } else {
    navigate("/savingplanslist", { replace: true });
  }
}}
              sx={{ py: 1.5 }}
            >
              Try Again
            </Button>

            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate('/dashboard')}
            >
              Go to Home
            </Button>
          </Box>

        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentFailed;