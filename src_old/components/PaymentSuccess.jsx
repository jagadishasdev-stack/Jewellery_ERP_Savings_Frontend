// src/components/PaymentSuccess.jsx
import React from 'react';
import { Box, Card, CardContent, Typography, Button, Divider, Paper } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate, useLocation } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state || {};

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', py: 5 }}>
      <Card elevation={3}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>

          {/* Icon */}
          <CheckCircleOutlineIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />

          <Typography variant="h5" fontWeight="bold" color="success.main" gutterBottom>
            Payment Successful!
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={3}>
            Your payment has been processed successfully.
          </Typography>

          <Divider sx={{ my: 2 }} />

          {/* Details */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', textAlign: 'left', mb: 3 }}>

            {data.amount && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Amount Paid</Typography>
                <Typography variant="body1" fontWeight="bold">₹{data.amount}</Typography>
              </Box>
            )}

            {data.transactionId && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Transaction ID</Typography>
                <Typography variant="body2">{data.transactionId}</Typography>
              </Box>
            )}

            {data.merchantOrderId && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Order ID</Typography>
                <Typography variant="body2">{data.merchantOrderId}</Typography>
              </Box>
            )}

            {data.scheme_name && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Scheme</Typography>
                <Typography variant="body2">{data.scheme_name}</Typography>
              </Box>
            )}

          </Paper>

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => navigate('/dashboard')}
            sx={{ py: 1.5 }}
          >
            Go to Dashboard
          </Button>

        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentSuccess;