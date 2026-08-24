import React from "react";
import { Dialog, Box, Typography, IconButton, Divider } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { useSafeAreaTop } from "../../SafeAreaFile";
import { Capacitor } from "@capacitor/core";
import theme from "../../theme";
import MyOrders from "./MyOrders";

const MyOrdersPage = ({ open, onClose }) => {
  const topInset = useSafeAreaTop();
  const isIOS = Capacitor.getPlatform() === "ios";

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      sx={{
        zIndex: 10000,
        "& .MuiDialog-paper": {
          zIndex: 10000,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          bgcolor: "#fff",
          pt: isIOS
            ? `calc(56px + var(--safe-area-top))`
            : `calc(56px + ${topInset})`,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            position: "fixed",
            top: isIOS ? `var(--safe-area-top)` : topInset,
            left: 0,
            right: 0,
            zIndex: 10001,
            bgcolor: "#fff",
            borderBottom: `1px solid ${theme.cartScreen.activeColor}20`,
            display: "flex",
            alignItems: "center",
            px: 1,
            py: 1,
            height: 56,
          }}
        >
          <IconButton onClick={onClose} size="small" sx={{ mr: 0.5 }}>
            <ArrowBackIosNewIcon
              sx={{ fontSize: 16, color: theme.cartScreen.textColor }}
            />
          </IconButton>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 700,
              color: theme.cartScreen.textColor,
            }}
          >
            My Orders
          </Typography>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <MyOrders />
        </Box>
      </Box>
    </Dialog>
  );
};

export default MyOrdersPage;
