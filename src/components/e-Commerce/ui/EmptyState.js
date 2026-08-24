import React from "react";
import { Box, Typography } from "@mui/material";
import { FONT_DISPLAY, INK, MUTED, IMG_BG } from "./ecomTokens";
import { PrimaryCTA } from "./Buttons";

// Consistent empty state: soft circular icon badge, serif title, subtitle,
// optional CTA. Reused by Cart / Wishlist / Orders.
const EmptyState = ({ icon, title, subtitle, ctaLabel, onCta, sx = {} }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      minHeight: "55vh",
      px: 4,
      ...sx,
    }}
  >
    <Box
      sx={{
        width: 96,
        height: 96,
        borderRadius: "50%",
        bgcolor: IMG_BG,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mb: 2.5,
      }}
    >
      {icon}
    </Box>

    <Typography
      sx={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em", color: INK, mb: 1 }}
    >
      {title}
    </Typography>

    {subtitle && (
      <Typography sx={{ fontSize: 13.5, color: MUTED, maxWidth: 280, mb: 3 }}>
        {subtitle}
      </Typography>
    )}

    {ctaLabel && onCta && (
      <PrimaryCTA onClick={onCta} height={48} sx={{ px: 4, minWidth: 200 }}>
        {ctaLabel}
      </PrimaryCTA>
    )}
  </Box>
);

export default EmptyState;
