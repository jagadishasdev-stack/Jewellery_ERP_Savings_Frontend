import React from "react";
import { Box } from "@mui/material";
import SectionHeading from "./SectionHeading";
import Shimmer from "./Shimmer";
import { RADIUS } from "./ecomTokens";

// Skeleton placeholder for CategoryCarousel. Mirrors its exact layout (same
// tile width/height, gap, full-bleed row, optional heading) so the switch from
// skeleton → real categories causes no layout shift.
const TILE_W = 80; // matches CategoryCarousel
const IMG_H = 81;
const GAP = 14;

const CategoryCarouselSkeleton = ({ title, count = 8 }) => (
  <Box sx={{ mt: 2 }}>
    {title ? <SectionHeading title={title} /> : null}

    <Box sx={{ display: "flex", mx: -2, px: 2, overflow: "hidden" }}>
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i} sx={{ flexShrink: 0, width: TILE_W, mr: `${GAP}px` }}>
          <Shimmer sx={{ width: TILE_W, height: IMG_H }} radius={RADIUS.card} />
          <Shimmer
            sx={{ width: "72%", height: 11, mt: 0.6, mx: "auto" }}
            radius="4px"
          />
        </Box>
      ))}
    </Box>
  </Box>
);

export default CategoryCarouselSkeleton;
