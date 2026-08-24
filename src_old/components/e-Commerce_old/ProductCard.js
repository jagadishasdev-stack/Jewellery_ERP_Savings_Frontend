import { Box, Typography, CircularProgress } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import theme from "../../theme";

import React, { useState, useContext } from "react";
import { EcomContext } from "../../contexts/EcomContext";

const ProductCard = ({ product, onClick }) => {
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
 const { toggleWishlist, toggleCart, isInWishlist, isInCart } =
      useContext(EcomContext);

  const inWishlist = isInWishlist(product.tagno);
  const inCart = isInCart(product.tagno);

  const firstImage =
    product.images && product.images.length > 0 ? product.images[0] : null;

  const discountPercentage =
    product.actualPrice > product.currentPrice
      ? Math.round(
          ((product.actualPrice - product.currentPrice) / product.actualPrice) *
            100,
        )
      : 0;

  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    setWishlistLoading(true);
    await toggleWishlist(product.tagno);
    setWishlistLoading(false);
  };

  const handleCartToggle = async (e) => {
    e.stopPropagation();
    setCartLoading(true);
    await toggleCart(product.tagno);
    setCartLoading(false);
  };

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        bgcolor: "#fff",
        borderRadius: 2,
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        },
      }}
    >
      {/* Image Container */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: 144.5,
          bgcolor: "#000000",
          overflow: "hidden",
        }}
      >
        {/* Wishlist Icon */}
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 2,
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(255,255,255,0.95)",
            borderRadius: "50%",
            cursor: "pointer",
            transition: "transform 0.2s ease",
            "&:hover": { transform: "scale(1.1)" },
          }}
          onClick={handleWishlistToggle}
        >
          {wishlistLoading ? (
            <CircularProgress size={14} sx={{ color: "#666" }} />
          ) : inWishlist ? (
            <FavoriteIcon sx={{ fontSize: 16, color: "#e63946" }} />
          ) : (
            <FavoriteBorderIcon sx={{ fontSize: 16, color: "#666" }} />
          )}
        </Box>

        {/* Cart Icon */}
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 2,
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(255,255,255,0.95)",
            borderRadius: "50%",
            cursor: "pointer",
            transition: "transform 0.2s ease",
            "&:hover": { transform: "scale(1.1)" },
          }}
          onClick={handleCartToggle}
        >
          {cartLoading ? (
            <CircularProgress size={14} sx={{ color: "#666" }} />
          ) : inCart ? (
            <ShoppingCartIcon
              sx={{ fontSize: 16, color: theme.theme2.primaryButton }}
            />
          ) : (
            <ShoppingCartOutlinedIcon sx={{ fontSize: 16, color: "#666" }} />
          )}
        </Box>

        {/* Discount Badge */}
        {/* {discountPercentage > 0 && (
          <Box
            sx={{
              position: "absolute",
              bottom: 8,
              right: 8,
              zIndex: 2,
              bgcolor: "#000",
              color: "#fff",
              fontSize: 11,
              fontWeight: 600,
              px: 1,
              py: 0.5,
              borderRadius: 1,
            }}
          >
            -{discountPercentage}%
          </Box>
        )} */}

        {/* Low Stock Badge */}
        {/* {product.stockLeft <= 5 && (
          <Box
            sx={{
              position: "absolute",
              bottom: 8,
              left: 8,
              zIndex: 2,
              bgcolor: "#fff",
              color: "#e63946",
              fontSize: 10,
              fontWeight: 600,
              px: 1,
              py: 0.5,
              borderRadius: 1,
              border: "1px solid #e63946",
            }}
          >
            Only {product.stockLeft} left
          </Box>
        )} */}

        {/* Product Image — always first image */}
        {firstImage ? (
          <Box
            component="img"
            src={firstImage}
            alt={product.label}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        ) : (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#f0f0f0",
            }}
          >
            <Typography sx={{ fontSize: 12, color: "#999" }}>
              No Image
            </Typography>
          </Box>
        )}
      </Box>

      {/* Product Info */}
      <Box sx={{ p: 1.5, display: "flex", flexDirection: "column" }}>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 500,
            color: "#1a1a1a",
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {product.label}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>
            ₹{product.currentPrice.toLocaleString("en-IN")}
          </Typography>
          {product.actualPrice > product.currentPrice && (
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 500,
                color: "#999",
                textDecoration: "line-through",
              }}
            >
              ₹{product.actualPrice.toLocaleString("en-IN")}
            </Typography>
          )}
        </Box>

        {product.productType && (
          <Typography
            sx={{
              fontSize: 11,
              color: "#666",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              fontWeight: 500,
            }}
          >
            {product.productType}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ProductCard;
