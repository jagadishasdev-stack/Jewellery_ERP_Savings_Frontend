import React from "react";
import { Box, Typography } from "@mui/material";
import { GOLD, INK, LINE } from "./ui/ecomTokens";

// ─── CategoryChips ────────────────────────────────────────────────────────────
// Compact, name-only representation of the categories shown in the Landing
// Page's collapsed (scrolled) header state. Bordered chips with slightly
// rounded corners (not pills), equal spacing, horizontally scrollable. Uses the
// SAME category data and the SAME onCategoryClick handler as CategoryCarousel —
// only the presentation differs (no images, no auto-slide).
const CategoryChips = React.memo(({ categories, activeId, onCategoryClick }) => (
  <Box
    sx={{
      display: "flex",
      gap: 1,
      mt: 1.25,
      mx: -2,
      px: 2,
      overflowX: "auto",
      WebkitOverflowScrolling: "touch",
      scrollbarWidth: "none",
      "&::-webkit-scrollbar": { display: "none" },
    }}
  >
    {categories.map((cat) => {
      // activeId holds the business id (itemtype_id), same value the filter
      // stores — the row `id` is only used as the React key.
      const active =
        activeId != null && (cat.itemtype_id ?? cat.id) === activeId;
      return (
        <Box
          key={cat.id}
          onClick={() => onCategoryClick(cat)}
          sx={{
            flexShrink: 0,
            px: 1.5,
            py: 0.65,
            borderRadius: "8px", // slightly rounded — not a pill
            border: `1px solid ${active ? GOLD : LINE}`,
            bgcolor: active ? "rgba(185,138,70,0.10)" : "#fff",
            cursor: "pointer",
            transition: "background 0.15s ease, border-color 0.15s ease",
          }}
        >
          <Typography
            sx={{
              fontSize: 12.5,
              fontWeight: 600,
              color: active ? GOLD : INK,
              whiteSpace: "nowrap",
            }}
          >
            {cat.name}
          </Typography>
        </Box>
      );
    })}
  </Box>
));

export default CategoryChips;
