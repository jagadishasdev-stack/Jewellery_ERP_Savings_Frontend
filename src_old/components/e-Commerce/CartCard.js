import React, { useState, useContext } from "react";
import { Box, Typography, IconButton, CircularProgress } from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { EcomContext } from "../../contexts/EcomContext";
import Price from "./ui/Price";
import ImagePlaceholder from "./ui/ImagePlaceholder";
import { INK, INK_SOFT, MUTED, IMG_BG, LINE, RADIUS, SHADOW } from "./ui/ecomTokens";

// Premium cart line item. Behaviour unchanged: same `item` shape, same
// double-tap-guarded delete via EcomContext.toggleCart + handleToggleRefresh.
const CartCard = React.memo(({ item }) => {
  const { toggleCart, handleToggleRefresh } = useContext(EcomContext);
  const [deleting, setDeleting] = useState(false);

  const isAvailable = ["F", "N", "E"].includes(item.flag);

  const handleDelete = async () => {
    if (deleting) return;
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
        alignItems: "stretch",
        gap: 1.5,
        bgcolor: "#fff",
        borderRadius: RADIUS.card,
        border: `1px solid ${LINE}`,
        boxShadow: SHADOW.sm,
        p: 1.25,
        mb: 1.5,
        opacity: isAvailable ? 1 : 0.65,
      }}
    >
      {/* Image */}
      <Box
        sx={{
          width: 92,
          height: 92,
          flexShrink: 0,
          borderRadius: RADIUS.sm,
          overflow: "hidden",
          bgcolor: IMG_BG,
        }}
      >
        {item.images?.[0] ? (
          <Box
            component="img"
            src={item.images[0]}
            alt={item.name}
            sx={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <ImagePlaceholder iconSize={24} showLabel={false} />
        )}
      </Box>

      {/* Details */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          py: 0.25,
        }}
      >
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: INK,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {item.name}
            </Typography>
            <IconButton
              onClick={handleDelete}
              disabled={deleting}
              size="small"
              sx={{
                mt: -0.5,
                mr: -0.5,
                color: MUTED,
                "&:hover": { color: "#D32F2F", bgcolor: "rgba(211,47,47,0.06)" },
              }}
            >
              {deleting ? (
                <CircularProgress size={16} />
              ) : (
                <DeleteOutlineRoundedIcon sx={{ fontSize: 20 }} />
              )}
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", gap: 1, mt: 0.25 }}>
            {item.productType && (
              <Typography sx={{ fontSize: 11, color: INK_SOFT }}>
                {item.productType}
              </Typography>
            )}
            {item.netwt && (
              <Typography sx={{ fontSize: 11, color: INK_SOFT }}>
                • {item.netwt} g
              </Typography>
            )}
          </Box>
        </Box>

        {!isAvailable ? (
          <Box
            sx={{
              display: "inline-flex",
              alignSelf: "flex-start",
              px: 0.9,
              py: 0.3,
              borderRadius: RADIUS.sm,
              bgcolor: "rgba(211,47,47,0.08)",
            }}
          >
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#D32F2F" }}>
              Unavailable
            </Typography>
          </Box>
        ) : (
          <Price
            current={item.price}
            original={item.originalPrice}
            size={15}
            showDiscount={false}
          />
        )}
      </Box>
    </Box>
  );
});

export default CartCard;
