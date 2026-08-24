import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import ProductsList from "./ProductsList";
import ProductCardSkeleton from "./ui/ProductCardSkeleton";
import { MUTED } from "./ui/ecomTokens";

/**
 * FullSectionPage — full list for a section (New Arrivals / Top Deals /
 * Trending). The section title and back button now live in the app header
 * (driven by navigation state), so this page renders only the product list.
 */
function FullSectionPage({ products, loading }) {
  if (loading)
    return (
      <Grid container spacing={1.5}>
        {[...Array(6)].map((_, i) => (
          <Grid item xs={6} sm={4} key={i}>
            <ProductCardSkeleton />
          </Grid>
        ))}
      </Grid>
    );

  if (products.length === 0)
    return (
      <Typography sx={{ fontSize: 15, color: MUTED, textAlign: "center", mt: 4 }}>
        No products found
      </Typography>
    );

  return (
    <Box>
      <ProductsList allProducts={products} />
    </Box>
  );
}

export default FullSectionPage;
