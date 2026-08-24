import React from "react";
import { Box } from "@mui/material";
import { keyframes } from "@emotion/react";
import { IMG_BG } from "./ecomTokens";

// Lightweight shimmer used for skeleton placeholders. Pure CSS keyframe (via
// emotion, already a dependency) — no JS animation loop, no perf cost.
const shimmer = keyframes`
  0%   { background-position: -420px 0; }
  100% { background-position: 420px 0; }
`;

const Shimmer = ({ sx = {}, radius = "12px" }) => (
  <Box
    sx={{
      borderRadius: radius,
      background: `linear-gradient(90deg, ${IMG_BG} 25%, #ECE7DE 37%, ${IMG_BG} 63%)`,
      backgroundSize: "840px 100%",
      animation: `${shimmer} 1.4s ease-in-out infinite`,
      ...sx,
    }}
  />
);

export default Shimmer;
