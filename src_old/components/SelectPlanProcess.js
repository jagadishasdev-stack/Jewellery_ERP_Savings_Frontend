import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import theme from "../theme";
import SelectPlan from "./SelectPlan";
import SavingsContactDetails from "./SavingsContactDetails";
import PaymentAndLedgerPage from "./PaymentAndLedgerPage";

const steps = ["Select Plan", "Contact", "Payment"];
const paths = ["", "contact", "paymentandledger"];

const SelectPlanProcess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [maxStepReached, setMaxStepReached] = useState(0);

  const currentStepIndex = paths.findIndex((p) =>
    location.pathname.endsWith(`/${p}`)
  );
  const tabIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

  // Reset maxStepReached when user navigates to a previous step manually
  useEffect(() => {
    if (tabIndex < maxStepReached) {
      setMaxStepReached(tabIndex);
    }
  }, [tabIndex, maxStepReached]);

  const handleStepClick = (index) => {
    if (index <= maxStepReached) {
      navigate(`/select-plan/${paths[index]}`);
    }
  };

  const handleStepComplete = (stepIndex) => {
    setMaxStepReached((prev) => Math.max(prev, stepIndex + 1));
  };

  return (
    <>
      {/* Step Tabs */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "center",
          width: "100vw",
          marginLeft: "-16px",
          marginRight: "-16px",
          px: "24px",
          gap: 2,
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.08)",
          backgroundColor: "#fff",
          height: "60px",
          zIndex: 1000,
        }}
      >
        {steps.map((label, i) => {
          const isActive = tabIndex === i;
          const isClickable = i <= maxStepReached;

          return (
            <Box
              key={i}
              onClick={() => handleStepClick(i)}
              sx={{
                display: "flex",
                alignItems: "center",
                cursor: isClickable ? "pointer" : "not-allowed",
                pointerEvents: isClickable ? "auto" : "none",
                flexShrink: 0,
                width: 90,
                justifyContent: "center",
                gap: 1.2,
              }}
            >
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  minWidth: 20,
                  borderRadius: "50%",
                  backgroundColor: isActive
                    ? theme.colors.primaryButton
                    : isClickable
                    ? "#ccc"
                    : "#eee",
                  color: "#fff",
                  fontSize: "11px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {i + 1}
              </Box>
              <Box
                sx={{
                  fontSize: "10px",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  fontWeight: 600,
                  letterSpacing: 0.4,
                  color: isActive
                    ? theme.colors.primaryButton
                    : isClickable
                    ? "#444"
                    : "#aaa",
                }}
              >
                {label}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Step Content */}
      <Box sx={{ width: "100%" }}>
        <Routes>
          <Route
            path="/"
            element={<SelectPlan onComplete={() => handleStepComplete(0)} />}
          />
          <Route
            path="contact"
            element={
              <SavingsContactDetails onComplete={() => handleStepComplete(1)} />
            }
          />
          <Route path="paymentandledger" element={<PaymentAndLedgerPage />} />
          <Route path="*" element={<Navigate to="/select-plan" />} />
        </Routes>
      </Box>
    </>
  );
};

export default SelectPlanProcess;
