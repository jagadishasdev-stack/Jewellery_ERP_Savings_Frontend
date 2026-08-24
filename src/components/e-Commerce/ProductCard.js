import React, { useState, useContext } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/Favorite";
import AddShoppingCartRoundedIcon from "@mui/icons-material/AddShoppingCartRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCart";
import { EcomContext } from "../../contexts/EcomContext";
import Price from "./ui/Price";
import Shimmer from "./ui/Shimmer";
import ImagePlaceholder from "./ui/ImagePlaceholder";
import { INK, INK_SOFT, IMG_BG, GOLD, RADIUS, SHADOW, SURFACE, productTitle } from "./ui/ecomTokens";

// Premium product card — editorial 3:4 imagery on a soft neutral surface,
// shimmer-on-load, floating wishlist heart, and an inline add-to-bag control.
// Props/behaviour unchanged: same `product` shape, same `onClick`, same
// EcomContext wishlist/cart toggles.
const ProductCard = React.memo(({ product, onClick }) => {
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { toggleWishlist, toggleCart, isInWishlist, isInCart } =
    useContext(EcomContext);

  const inWishlist = isInWishlist(product.tagno);
  const inCart = isInCart(product.tagno);

  const firstImage =
    product.images && product.images.length > 0 ? product.images[0] : null;

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
        bgcolor: SURFACE,
        borderRadius: RADIUS.card,
        overflow: "hidden",
        cursor: "pointer",
        boxShadow: SHADOW.sm,
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        "&:active": { transform: "scale(0.985)" },
      }}
    >
      {/* Image — fixed height, matching the original product card */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: 144.5,
          bgcolor: IMG_BG,
          overflow: "hidden",
        }}
      >
        {!imgLoaded && (
          <Shimmer
            sx={{ position: "absolute", inset: 0, zIndex: 1 }}
            radius="0px"
          />
        )}

        {firstImage ? (
          <Box
            component="img"
            src={firstImage}
            alt={product.label}
            loading="lazy"
            decoding="async"
            width="150"
            height="145"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgLoaded(true)}
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: imgLoaded ? 1 : 0,
              transition: "opacity 0.4s ease",
            }}
          />
        ) : (
          <Box sx={{ position: "absolute", inset: 0 }}>
            <ImagePlaceholder iconSize={30} />
          </Box>
        )}

        {/* Wishlist heart */}
        <Box
          onClick={handleWishlistToggle}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 2,
            width: 38,
            height: 38,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(4px)",
            borderRadius: "50%",
            boxShadow: SHADOW.sm,
            cursor: "pointer",
            transition: "transform 0.15s ease",
            "&:active": { transform: "scale(0.85)" },
          }}
        >
          {wishlistLoading ? (
            <CircularProgress size={15} sx={{ color: GOLD }} />
          ) : inWishlist ? (
            <FavoriteRoundedIcon sx={{ fontSize: 19, color: "#E0526E" }} />
          ) : (
            <FavoriteBorderRoundedIcon sx={{ fontSize: 19, color: INK_SOFT }} />
          )}
        </Box>
      </Box>

      {/* Info */}
      <Box sx={{ p: 1.25, display: "flex", flexDirection: "column", gap: 0.6 }}>
        <Typography
          sx={{
            fontSize: 10.5,
            fontWeight: 500,
            color: INK,
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {productTitle(product)}
        </Typography>

        {/* Design name (dynamic, from backend) — between title and price */}
        {product.design_name && (
          <Typography
            
            sx={{
            fontSize: 13.5,
            fontWeight: 600,
            color: INK,
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          >
            {product.design_name}
          </Typography>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 0.3,
          }}
        >
          <Price
            current={product.currentPrice}
            original={product.actualPrice}
            size={15}
            showDiscount={false}
          />

          {/* Add to bag */}
          <Box
            onClick={handleCartToggle}
            sx={{
              width: 34,
              height: 34,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              bgcolor: inCart ? GOLD : "rgba(185,138,70,0.10)",
              cursor: "pointer",
              transition: "background 0.2s ease, transform 0.15s ease",
              "&:active": { transform: "scale(0.85)" },
            }}
          >
            {cartLoading ? (
              <CircularProgress
                size={15}
                sx={{ color: inCart ? "#fff" : GOLD }}
              />
            ) : inCart ? (
              <ShoppingCartRoundedIcon sx={{ fontSize: 17, color: "#fff" }} />
            ) : (
              <AddShoppingCartRoundedIcon sx={{ fontSize: 17, color: GOLD }} />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

export default ProductCard;
