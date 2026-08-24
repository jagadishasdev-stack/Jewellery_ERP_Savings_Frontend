import React, { useContext } from "react";
import { Grid, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import theme from "../../theme";
import { EcomContext } from "../../contexts/EcomContext";

const Wishlist = () => {
  const { wishlistItems, cartItems } = useContext(EcomContext);
  const navigate = useNavigate();
  console.log(wishlistItems);
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
        images: [],
        stockLeft: stock.pcs ?? 1,
        productType: stock.itemtype === 1 ? "Gold" : "Diamond",
        gross: stock.gross,
        netwt: stock.netwt,
        purity: stock.purity,
        metaltype: stock.metaltype,
        is_wishlisted: true, // Already in wishlist
        is_in_cart: cartItems.some(
          (cartItem) => cartItem.tagno === stock.tagno,
        ),
        // Additional fields from stock
        design: stock.design,
        wishlist_id: item.wishlist_id,
        added_at: item.added_at,
        images: item.stock.images,
      };
    });

  return (
    <>
      {transformedWishlistProducts.length > 0 ? (
        <Grid sx={{ mt: 2 }} container spacing={1.5}>
          {transformedWishlistProducts.map((product) => (
            <Grid
              item
              xs={6}
              key={product.tagno}
              onClick={() => navigate("/e-com/product", { state: product })}
            >
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
          }}
        >
          <Typography
            sx={{
              fontSize: 16,
              color: theme.categoryProduct?.noProductTextCol || "#666",
              textAlign: "center",
            }}
          >
            Your wishlist is empty
          </Typography>
        </Box>
      )}
    </>
  );
};

export default Wishlist;
