import React from "react";
import { Box, Typography } from "@mui/material";
import theme from "../theme";

const LoadingScreen = ({ open = true, message = "Loading" }) => {
  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",

        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        textAlign: "center",
      }}
    >
      {/* Circular Loader */}
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "4px solid rgba(0,0,0,0.1)",
          borderTop: `4px solid ${theme.colors.primaryButton}`,
          animation: "spin 0.8s linear infinite",
          "@keyframes spin": {
            "0%": { transform: "rotate(0deg)" },
            "100%": { transform: "rotate(360deg)" },
          },
          mb: 2,
        }}
      />

      {/* Loading Text */}
      <Typography variant="h6" color="textDisabled">
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingScreen;
