import React from "react";
import { Box, Typography, IconButton, CircularProgress } from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ProductsList from "./ProductsList";
import theme from "../../theme";

/**
 * FullSectionPage
 *
 * Renders the full list for a section (New Arrivals / Top Deals).
 * Shown in-place — parent controls mounting/unmounting.
 *
 * Props:
 *  - title      {string}    Section title
 *  - products   {array}     All products for this section
 *  - loading    {boolean}
 *  - onBack     {function}  Called when back is pressed
 */
function FullSectionPage({ title, products, loading, onBack }) {
  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 2,
          mx: -2,
          px: 2,
          py: 1,
          bgcolor: theme.categoryProduct.searchBarBGCol,
          width: "100vw",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <IconButton onClick={onBack} size="small" sx={{ p: 0.5 }}>
          <ArrowBackIosNewRoundedIcon
            sx={{
              fontSize: 20,
              color: theme.categoryProduct.selectedFilterTextCol,
            }}
          />
        </IconButton>
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
      </Box>

      {/* Products */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : products.length === 0 ? (
        <Typography
          sx={{
            fontSize: 16,
            color: theme.categoryProduct.noProductTextCol,
            textAlign: "center",
            mt: 4,
          }}
        >
          No products found
        </Typography>
      ) : (
        <ProductsList allProducts={products} />
      )}
    </Box>
  );
}

export default FullSectionPage;
