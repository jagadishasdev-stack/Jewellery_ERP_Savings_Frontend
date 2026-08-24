import React, { useContext } from "react";
import { Grid, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import ProductCard from "./ProductCard";
import EmptyState from "./ui/EmptyState";
import { GOLD, INK, FONT_DISPLAY } from "./ui/ecomTokens";
import { EcomContext } from "../../contexts/EcomContext";

const Wishlist = () => {
  const { wishlistItems, cartItems } = useContext(EcomContext);
  const navigate = useNavigate();

  // Transform wishlist items to match the product structure expected by ProductCard
  const transformedWishlistProducts = wishlistItems
    .filter((item) => !item.unavailable && item.stock)
    .map((item) => {
      const stock = item.stock;
      return {
        tagno: stock.tagno,
        label: `Tag #${stock.tagno}`,
        currentPrice: stock.actual_price ?? 0,
        actualPrice: stock.false_price ?? 0,
        stockLeft: stock.pcs ?? 1,
        itemtype_name: stock.itemtype_name ?? null,
        design_name: stock.design_name ?? null,
        metaltype_name: stock.metaltype_name ?? null,
        purity_name: stock.purity_name ?? null,
        productType: stock.metaltype_name ?? stock.itemtype_name ?? null,
        gross: stock.gross,
        netwt: stock.netwt,
        purity: stock.purity,
        metaltype: stock.metaltype,
        is_wishlisted: true,
        is_in_cart: cartItems.some((cartItem) => cartItem.tagno === stock.tagno),
        design: stock.design,
        wishlist_id: item.wishlist_id,
        added_at: item.added_at,
        images: item.stock.images,
      };
    });

  if (transformedWishlistProducts.length === 0) {
    return (
      <EmptyState
        icon={<FavoriteBorderRoundedIcon sx={{ fontSize: 44, color: GOLD }} />}
        title="Your wishlist is empty"
        subtitle="Tap the heart on any piece to save it here for later."
        ctaLabel="Browse Products"
        onCta={() => navigate("/e-com/categories")}
      />
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      <Typography
        sx={{ fontFamily: FONT_DISPLAY, fontSize: 19, fontWeight: 700, letterSpacing: "-0.01em", color: INK, mt: 2, mb: 1.5 }}
      >
        Wishlist ({transformedWishlistProducts.length})
      </Typography>
      <Grid container spacing={1.5}>
        {transformedWishlistProducts.map((product) => (
          <Grid
            item
            xs={6}
            sm={4}
            key={product.tagno}
            onClick={() => navigate("/e-com/product", { state: product })}
          >
            <ProductCard product={product} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Wishlist;
