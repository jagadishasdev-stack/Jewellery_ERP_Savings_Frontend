import React from "react";
import { Box, Typography } from "@mui/material";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import { FONT_DISPLAY, INK, GOLD } from "./ecomTokens";

// Editorial section header: serif display title with an optional "View all" link.
const SectionHeading = ({ title, onViewAll, sx = {} }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      mb: 1.5,
      ...sx,
    }}
  >
    <Typography
      sx={{
        fontFamily: FONT_DISPLAY,
        fontSize: 17,
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: "-0.01em",
        color: INK,
      }}
    >
      {title}
    </Typography>

    {onViewAll && (
      <Box
        onClick={onViewAll}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.4,
          cursor: "pointer",
          color: GOLD,
          pb: 0.4,
          "&:active": { opacity: 0.6 },
        }}
      >
        <Typography sx={{ fontSize: 12.5, fontWeight: 600, letterSpacing: "0.02em" }}>
          View all
        </Typography>
        <ArrowForwardIosRoundedIcon sx={{ fontSize: 11 }} />
      </Box>
    )}
  </Box>
);

export default SectionHeading;
