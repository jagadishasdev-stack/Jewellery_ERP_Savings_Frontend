import React from "react";
import { Box, CircularProgress } from "@mui/material";
import { GRADIENT, GOLD, RADIUS } from "./ecomTokens";

// Primary CTA — the signature black→gold gradient pill/bar button.
export const PrimaryCTA = ({
  children,
  onClick,
  loading = false,
  disabled = false,
  height = 52,
  sx = {},
}) => (
  <Box
    onClick={disabled || loading ? undefined : onClick}
    sx={{
      height,
      borderRadius: RADIUS.card,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: disabled ? "#CFC8BB" : GRADIENT,
      color: "#fff",
      fontSize: 15,
      fontWeight: 600,
      letterSpacing: "0.02em",
      cursor: disabled || loading ? "default" : "pointer",
      userSelect: "none",
      transition: "transform 0.12s ease, opacity 0.12s ease",
      "&:active": { transform: disabled || loading ? "none" : "scale(0.985)" },
      ...sx,
    }}
  >
    {loading ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : children}
  </Box>
);

// Secondary CTA — outlined gold on white.
export const SecondaryCTA = ({
  children,
  onClick,
  loading = false,
  height = 52,
  sx = {},
}) => (
  <Box
    onClick={loading ? undefined : onClick}
    sx={{
      height,
      borderRadius: RADIUS.card,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: `1.5px solid ${GOLD}`,
      color: GOLD,
      bgcolor: "#fff",
      fontSize: 15,
      fontWeight: 600,
      letterSpacing: "0.02em",
      cursor: loading ? "default" : "pointer",
      userSelect: "none",
      transition: "transform 0.12s ease",
      "&:active": { transform: loading ? "none" : "scale(0.985)" },
      ...sx,
    }}
  >
    {loading ? <CircularProgress size={20} sx={{ color: GOLD }} /> : children}
  </Box>
);

export default PrimaryCTA;
