import React, { useState, useEffect } from "react";
import { Box, Slider, Typography } from "@mui/material";
import theme from "../theme";
import ErrorOutline from "@mui/icons-material/ErrorOutline";

function PlanCalculation({ schemeAmount, noOfInstallments, paidAmount }) {
  const [investmentAmount, setInvestmentAmount] = useState(0);
  const [installmentCnt, setInstallmentCnt] = useState(1);
  const [benefitAmount, setBenefitAmount] = useState(0);
  const [value, setValue] = useState(schemeAmount);
  const [beneftPerc, setBenefitPerc] = useState(10 / 100);

  useEffect(() => {
    if (schemeAmount && noOfInstallments) {
      const initialValue = schemeAmount;
      setValue(initialValue);
      setInvestmentAmount(initialValue);
      setInstallmentCnt(initialValue / schemeAmount);
      setBenefitAmount(Number((initialValue * beneftPerc).toFixed(2)));
    }
  }, [schemeAmount, noOfInstallments]);

  const handleSlider = (event, newValue) => {
    const minInstallment = schemeAmount;
    const step = schemeAmount;
    const clampedValue = Math.max(minInstallment, newValue);
    const roundedValue = Math.round(clampedValue / step) * step;

    setValue(roundedValue);
    setInvestmentAmount(roundedValue);
    setInstallmentCnt(roundedValue / schemeAmount);
    setBenefitAmount(roundedValue * beneftPerc);
  };

  const benefitPercent = investmentAmount
    ? (benefitAmount / investmentAmount) * 100
    : 0;

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      marginTop="1.2rem"
    >
      <Box textAlign="center">
        <Typography
          color={theme.calculatePlans.textCol}
          marginBottom="0.6rem"
          sx={{ fontSize: 18 }}
        >
          Calculate Your Plan
        </Typography>
        <Typography
          color={theme.calculatePlans.textCol}
          marginBottom="1rem"
          sx={{ fontSize: 12 }}
        >
          Enter the amount (Min ₹{schemeAmount}) you'd like to keep aside with
          us for {noOfInstallments} installments and see the benefit.
        </Typography>
      </Box>

      <Box
        width="100%"
        display="flex"
        justifyContent="space-around"
        alignItems="center"
        marginBottom="0.6rem"
      >
        <Box display="flex" flexDirection="column" alignItems="center">
          <Typography fontWeight="400" sx={{ fontSize: 11 }}>
            Maha Benefit: +10%
          </Typography>
          <Typography fontWeight="600" sx={{ fontSize: 11 }}>
            ₹{value}
          </Typography>
          <Box position="relative" height="100px" width="100px">
            <Box
              height="80px"
              width="80px"
              bgcolor={theme.calculatePlans.mahaBenefitBgc}
              borderRadius="100%"
              position="absolute"
              top="10px"
              left="10px"
              zIndex={1}
            />
            <Box
              height="100px"
              width="100px"
              borderRadius="100%"
              position="absolute"
              sx={{
                opacity: 0.75,
                zIndex: 2,
                background: `conic-gradient(
                  transparent 0% ${(
                    (installmentCnt / noOfInstallments) *
                    100
                  ).toFixed(2)}%, 
                  ${theme.calculatePlans.investmentBgc} ${(
                  (installmentCnt / noOfInstallments) *
                  100
                ).toFixed(2)}% 100%
                )`,
              }}
            />
          </Box>
        </Box>

        <Box display="flex" flexDirection="column" gap="0.4rem">
          <Box display="flex" alignItems="center" gap="0.4rem">
            <Box
              height="12px"
              width="12px"
              bgcolor={theme.calculatePlans.investmentBgc}
            />
            <Typography sx={{ fontSize: 11 }}>Total Installments</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap="0.4rem">
            <Box
              height="12px"
              width="12px"
              bgcolor={theme.calculatePlans.mahaBenefitBgc}
            />
            <Typography sx={{ fontSize: 11 }}>
              Scheduled Installments
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        width="100%"
        display="flex"
        justifyContent="space-around"
        alignItems="center"
      >
        <Box width="60%">
          <Typography
            variant="body1"
            color={theme.calculatePlans.textCol}
            sx={{ fontSize: 14 }}
          >
            Investment Value
          </Typography>
          <Box display="flex" alignItems="center">
            <ErrorOutline
              sx={{
                height: 12,
                width: 12,
                color: theme.calculatePlans.textCol,
              }}
            />
            <Typography variant="body1" sx={{ fontSize: 12 }}>
              Multiples of ₹{schemeAmount} only
            </Typography>
          </Box>
        </Box>
        <Box
          width="40%"
          display="flex"
          flexDirection="column"
          padding="0.8rem 1.2rem"
          bgcolor={theme.calculatePlans.amountBg}
          borderRadius="12px"
        >
          <Typography variant="body1" fontWeight="400" sx={{ fontSize: 12 }}>
            Amount
          </Typography>
          <Typography variant="body1" fontWeight="600" sx={{ fontSize: 12 }}>
            ₹{value}
          </Typography>
        </Box>
      </Box>

      <Box width="90%">
        <Slider
          value={value}
          onChange={handleSlider}
          step={schemeAmount}
          min={0}
          max={schemeAmount * noOfInstallments}
          sx={{
            color: theme.calculatePlans.sliderBarCol,
            "& .MuiSlider-thumb": {
              height: 24,
              width: 24,
              backgroundColor: "#FFFEFA",
              border: `3px solid ${theme.calculatePlans.sliderThumbBorderCol}`,
            },
          }}
        />
      </Box>

      <Box
        display="flex"
        justifyContent="center"
        alignItems="flex-start"
        flexDirection="column"
        width="100%"
        borderRadius="12px"
        padding="1.2rem"
        marginBottom="1.2rem"
        sx={{
          background: `linear-gradient(90deg, ${theme.calculatePlans.calculateCardGradient1}, ${theme.calculatePlans.calculateCardGradient2})`,
        }}
      >
        <Box display="flex" justifyContent="space-between" width="100%">
          <Typography
            fontWeight="600"
            variant="body1"
            color="#000"
            sx={{ fontSize: 11 }}
          >
            Number of Installments
          </Typography>
          <Typography
            fontWeight="600"
            variant="body1"
            color="#000"
            sx={{ fontSize: 12 }}
          >
            {installmentCnt}
          </Typography>
        </Box>
        <Box
          display="flex"
          justifyContent="space-between"
          width="100%"
          marginBottom="0.6rem"
        >
          <Typography
            fontWeight="600"
            variant="body1"
            color="#000"
            sx={{ fontSize: 11 }}
          >
            Maha Benefit: Get 10% Extra!
          </Typography>
          <Typography
            fontWeight="600"
            variant="body1"
            color="#000"
            sx={{ fontSize: 12 }}
          >
            ₹{benefitAmount}
          </Typography>
        </Box>
        <Box
          display="flex"
          justifyContent="space-between"
          width="100%"
          sx={{ fontSize: 11 }}
        >
          <Typography
            fontWeight="600"
            variant="body1"
            color="#000"
            sx={{ fontSize: 11 }}
          >
            Total Redeemable Amount
          </Typography>
          <Typography
            fontWeight="600"
            variant="body1"
            color="#000"
            sx={{ fontSize: 12 }}
          >
            ₹{benefitAmount + investmentAmount}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default PlanCalculation;
