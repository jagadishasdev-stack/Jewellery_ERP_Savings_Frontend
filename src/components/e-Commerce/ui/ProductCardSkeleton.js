import React from "react";
import { Box } from "@mui/material";
import Shimmer from "./Shimmer";
import { RADIUS, SURFACE, SHADOW } from "./ecomTokens";

// Skeleton matching the redesigned ProductCard footprint (3:4 image + 2 text
// lines). Used for first-load and pagination states so the grid never jumps.
const ProductCardSkeleton = () => (
  <Box
    sx={{
      bgcolor: SURFACE,
      borderRadius: RADIUS.card,
      overflow: "hidden",
      boxShadow: SHADOW.sm,
    }}
  >
    <Shimmer sx={{ width: "100%", height: 144.5 }} radius="0px" />
    <Box sx={{ p: 1.25 }}>
      <Shimmer sx={{ width: "80%", height: 13, mb: 1 }} radius="6px" />
      <Shimmer sx={{ width: "55%", height: 15 }} radius="6px" />
    </Box>
  </Box>
);

export default ProductCardSkeleton;
