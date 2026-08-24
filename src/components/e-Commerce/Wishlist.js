import React, { useContext, useEffect, useMemo } from "react";
import { Grid, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import ProductCard from "./ProductCard";
import EmptyState from "./ui/EmptyState";
import { GOLD, INK, FONT_DISPLAY } from "./ui/ecomTokens";
import { EcomContext } from "../../contexts/EcomContext";

const Wishlist = () => {
  const { wishlistItems, cartItems, fetchWishlist } = useContext(EcomContext);
  const navigate = useNavigate();

  // Refresh wishlist on open so reservation/stock status is current.
  useEffect(() => {
    fetchWishlist?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Transform wishlist items to match the product structure expected by
  // ProductCard. Memoized so it only rebuilds when the wishlist/cart change.
  const transformedWishlistProducts = useMemo(() => {
    const cartSet = new Set(cartItems.map((c) => c.tagno));
    return wishlistItems
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
          flag: stock.flag,
          reserved: stock.reserved,
          is_wishlisted: true,
          is_in_cart: cartSet.has(stock.tagno),
          design: stock.design,
          wishlist_id: item.wishlist_id,
          added_at: item.added_at,
          images: item.stock.images,
        };
      });
  }, [wishlistItems, cartItems]);

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
        {transformedWishlistProducts.map((product) => {
          const outOfStock = !["F", "N", "E"].includes(product.flag);
          return (
            <Grid
              item
              xs={6}
              sm={4}
              key={product.tagno}
              onClick={() => navigate("/e-com/product", { state: product })}
            >
              <Box
                sx={{ position: "relative", opacity: outOfStock ? 0.55 : 1 }}
              >
                {outOfStock && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      left: 8,
                      zIndex: 2,
                      px: 1,
                      py: 0.3,
                      borderRadius: 1,
                      bgcolor: "rgba(211,47,47,0.92)",
                    }}
                  >
                    <Typography
                      sx={{ fontSize: 10.5, fontWeight: 700, color: "#fff" }}
                    >
                      Out of Stock
                    </Typography>
                  </Box>
                )}
                <ProductCard product={product} />
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default Wishlist;
