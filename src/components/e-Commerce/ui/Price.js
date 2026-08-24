import React from "react";
import { Box, Typography } from "@mui/material";
import { INK, MUTED, GOLD, inr } from "./ecomTokens";

// Unified price presentation: current price, optional struck original, and a
// discount % chip when the original is higher. One place so every surface
// (card, PDP, cart) renders money identically.
const Price = ({
  current,
  original,
  size = 16,
  showDiscount = true,
  align = "left",
  sx = {},
}) => {
  const hasDiscount = Number(original) > Number(current);
  const pct = hasDiscount
    ? Math.round(((original - current) / original) * 100)
    : 0;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.9,
        justifyContent: align === "center" ? "center" : "flex-start",
        flexWrap: "wrap",
        ...sx,
      }}
    >
      <Typography
        sx={{ fontSize: size, fontWeight: 700, color: INK, letterSpacing: "0.01em" }}
      >
        {inr(current)}
      </Typography>

      {hasDiscount && (
        <Typography
          sx={{
            fontSize: size - 4,
            fontWeight: 500,
            color: MUTED,
            textDecoration: "line-through",
          }}
        >
          {inr(original)}
        </Typography>
      )}

      {hasDiscount && showDiscount && (
        <Typography
          sx={{
            fontSize: size - 5,
            fontWeight: 700,
            color: GOLD,
            letterSpacing: "0.02em",
          }}
        >
          {pct}% OFF
        </Typography>
      )}
    </Box>
  );
};

export default Price;
