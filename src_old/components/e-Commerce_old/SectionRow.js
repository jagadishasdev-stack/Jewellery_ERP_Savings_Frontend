import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import ProductsList from "./ProductsList";
import theme from "../../theme";

/**
 * SectionRow
 *
 * Props:
 *  - title       {string}    Section heading e.g. "New Arrivals"
 *  - products    {array}     Full filtered+sorted product array (component slices to 4)
 *  - loading     {boolean}
 *  - onViewAll   {function}  Called when "View all" is tapped
 */
function SectionRow({ title, products, loading, onViewAll }) {
  const preview = products.slice(0, 4);

  return (
    <Box sx={{ mb: 1 }}>
      {/* Header row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1.5,
        }}
      >
        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 600,
            color: theme.categoryProduct.selectedFilterTextCol,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </Typography>

        {!loading && products.length > 4 && (
          <Box
            onClick={onViewAll}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.3,
              cursor: "pointer",
              color: theme.categoryProduct.filterAndSortIconFillCol,
              "&:hover": { opacity: 0.7 },
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
              View all
            </Typography>
            <ArrowForwardIosRoundedIcon sx={{ fontSize: 12 }} />
          </Box>
        )}
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : preview.length === 0 ? (
        <Typography
          sx={{
            fontSize: 14,
            color: theme.categoryProduct.noProductTextCol,
            textAlign: "center",
            py: 2,
          }}
        >
          No products found
        </Typography>
      ) : (
        <ProductsList allProducts={preview} />
      )}
    </Box>
  );
}

export default SectionRow;
