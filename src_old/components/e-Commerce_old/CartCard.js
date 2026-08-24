import React, { useState, useContext } from "react";
import { Box, Typography, IconButton, CircularProgress } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import dummyImage from "../../assets/img/icons/elegant-gold-chain.png";
import theme from "../../theme";
import { EcomContext } from "../../contexts/EcomContext";

const CartCard = ({ item }) => {
  const { toggleCart, handleToggleRefresh } = useContext(EcomContext);
  const [deleting, setDeleting] = useState(false); // 🆕 prevent double‑click

  const isAvailable = ["F", "N", "E"].includes(item.flag);

  const handleDelete = async () => {
    if (deleting) return; // 🆕 ignore if already deleting
    setDeleting(true);
    try {
      await toggleCart(item.tagno);
      handleToggleRefresh();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: theme.cartCard.cardBgCol,
        borderRadius: "12px",
        boxShadow: theme.cartCard.cardBoxShadow,
        p: 1,
        mb: 2,
        width: "100%",
        maxWidth: 600,
        height: "104px",
        opacity: isAvailable ? 1 : 0.6,
      }}
    >
      {/* Image */}
      <Box
        component="img"
        src={item.images?.[0] || dummyImage}
        alt={item.name}
        sx={{
          width: 86,
          height: 86,
          borderRadius: "10px",
          objectFit: "cover",
        }}
      />

      {/* Details */}
      <Box sx={{ flex: 1, ml: 2 }}>
        <Typography
          sx={{
            fontSize: "16px",
            fontWeight: 500,
            color: theme.cartCard.itemNameCol,
            mb: 0.5,
          }}
        >
          {item.name}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <Typography
            sx={{
              color: theme.cartCard.itemSalePriceCol,
              fontWeight: 600,
              fontSize: "16px",
            }}
          >
            ₹ {item.price.toLocaleString("en-IN")}
          </Typography>
          {item.originalPrice !== item.price && (
            <Typography
              sx={{
                color: theme.cartCard.itemActualPriceCol,
                textDecoration: "line-through",
                fontSize: "12px",
              }}
            >
              ₹ {item.originalPrice.toLocaleString("en-IN")}
            </Typography>
          )}
        </Box>

        {/* Product Type & Weight */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontSize: "11px", color: "#666" }}>
            {item.productType}
          </Typography>
          {item.netwt && (
            <Typography sx={{ fontSize: "11px", color: "#666" }}>
              • {item.netwt}g
            </Typography>
          )}
        </Box>

        {/* Unavailable Status */}
        {!isAvailable && (
          <Typography
            sx={{
              fontSize: "11px",
              color: "#d32f2f",
              fontWeight: 500,
              mt: 0.5,
            }}
          >
            Unavailable
          </Typography>
        )}
      </Box>

      {/* Delete Icon */}
      <IconButton
        onClick={handleDelete}
        disabled={deleting} // 🆕 disabled during API call
        sx={{
          color: "#d32f2f",
          "&:hover": {
            backgroundColor: "rgba(211, 47, 47, 0.08)",
          },
        }}
      >
        {deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
      </IconButton>
    </Box>
  );
};

export default CartCard;
