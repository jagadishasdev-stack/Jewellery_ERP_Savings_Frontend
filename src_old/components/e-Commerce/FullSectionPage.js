import React from "react";
import { Box, Typography, IconButton, Grid } from "@mui/material";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ProductsList from "./ProductsList";
import ProductCardSkeleton from "./ui/ProductCardSkeleton";
import { INK, MUTED, LINE, FONT_DISPLAY } from "./ui/ecomTokens";

/**
 * FullSectionPage — full list for a section (New Arrivals / Top Deals).
 * Same props: title, products, loading, onBack.
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
          py: 1.25,
          bgcolor: "#fff",
          borderBottom: `1px solid ${LINE}`,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <IconButton onClick={onBack} size="small" sx={{ p: 0.5 }}>
          <ArrowBackIosNewRoundedIcon sx={{ fontSize: 19, color: INK }} />
        </IconButton>
        <Typography
          sx={{
            fontFamily: FONT_DISPLAY,
            fontSize: 19,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            color: INK,
          }}
        >
          {title}
        </Typography>
      </Box>

      {loading ? (
        <Grid container spacing={1.5}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={6} sm={4} key={i}>
              <ProductCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : products.length === 0 ? (
        <Typography
          sx={{ fontSize: 15, color: MUTED, textAlign: "center", mt: 4 }}
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
