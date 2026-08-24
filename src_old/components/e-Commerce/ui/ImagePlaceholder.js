import React from "react";
import { Box, Typography } from "@mui/material";
import ImageNotSupportedRoundedIcon from "@mui/icons-material/ImageNotSupportedRounded";
import { IMG_BG, MUTED } from "./ecomTokens";

// Consistent "no image" placeholder used anywhere a product image can be
// missing (cards, gallery, rails, cart). Fills its container — the parent
// controls size/aspect-ratio. Presentational only.
const ImagePlaceholder = ({ label = "No Image", iconSize = 30, showLabel = true }) => (
  <Box
    sx={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 0.6,
      bgcolor: IMG_BG,
    }}
  >
    <ImageNotSupportedRoundedIcon sx={{ fontSize: iconSize, color: "#C9C1B2" }} />
    {showLabel && (
      <Typography
        sx={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.02em", color: MUTED }}
      >
        {label}
      </Typography>
    )}
  </Box>
);

export default ImagePlaceholder;
