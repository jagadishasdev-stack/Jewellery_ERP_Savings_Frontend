import React, { useContext } from "react";
import { Box, Badge } from "@mui/material";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import { useNavigate } from "react-router-dom";
import { useSafeAreaBottom } from "../../SafeAreaFile";
import { EcomContext } from "../../contexts/EcomContext";
import { GRADIENT, GOLD, SHADOW } from "./ui/ecomTokens";

// Floating cart shortcut for e-commerce browsing screens. Reads cartCount from
// the existing EcomContext (no new state), navigates to the existing /cart
// route. Hidden when the cart is empty to avoid clutter. Sits above the app's
// bottom nav using the device safe-area inset (Capacitor).
const FloatingCartButton = ({ bottomOffset = 84 }) => {
  const navigate = useNavigate();
  const { cartCount } = useContext(EcomContext);
  const bottomInset = useSafeAreaBottom();
  const safeBottom =
    typeof bottomInset === "number" ? bottomInset : parseInt(bottomInset) || 0;

  if (!cartCount) return null;

  return (
    <Box
      onClick={() => navigate("/cart")}
      sx={{
        position: "fixed",
        right: 16,
        bottom: `calc(${bottomOffset}px + ${safeBottom}px)`,
        zIndex: 1100,
        width: 56,
        height: 56,
        borderRadius: "50%",
        background: GRADIENT,
        boxShadow: SHADOW.lg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "transform 0.15s ease",
        "&:active": { transform: "scale(0.92)" },
      }}
    >
      <Badge
        badgeContent={cartCount}
        sx={{
          "& .MuiBadge-badge": {
            bgcolor: "#fff",
            color: GOLD,
            fontWeight: 700,
            fontSize: 11,
            minWidth: 18,
            height: 18,
          },
        }}
      >
        <ShoppingBagRoundedIcon sx={{ color: "#fff", fontSize: 26 }} />
      </Badge>
    </Box>
  );
};

export default FloatingCartButton;
