import React, { useContext, useState } from "react";
import { Box, Typography } from "@mui/material";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import AddressSheet from "./AddressSheet";
import { AuthContext } from "../../contexts/AuthContext";
import { FONT_DISPLAY, GOLD, INK, INK_SOFT, LINE, RADIUS } from "./ui/ecomTokens";

// ─── DeliveryDetails ──────────────────────────────────────────────────────────
// Flipkart-style delivery block on the Product page (shown after Price, before
// Trust & Assurance): current delivery pincode + "Select delivery location", and
// "Fulfilled by <jeweller>". Tapping the location row opens the shared
// AddressSheet. `branchId` is the product's stock branch (per checkout spec).
const DeliveryDetails = ({ branchId, storeName }) => {
  const { adminUser } = useContext(AuthContext);
  const [sheetOpen, setSheetOpen] = useState(false);

  const pincode = adminUser?.pincode;
  const hasLocation = !!pincode;

  return (
    <Box
      sx={{
        mt: 2.5,
        border: `1px solid ${LINE}`,
        borderRadius: RADIUS.card,
        overflow: "hidden",
      }}
    >
      <Typography
        sx={{
          fontFamily: FONT_DISPLAY,
          fontSize: 15,
          fontWeight: 700,
          color: INK,
          px: 1.75,
          pt: 1.5,
          pb: 1,
        }}
      >
        Delivery details
      </Typography>

      {/* Delivery location */}
      <Box
        onClick={() => setSheetOpen(true)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          px: 1.75,
          py: 1.25,
          bgcolor: "rgba(185,138,70,0.05)",
          cursor: "pointer",
        }}
      >
        <LocationOnOutlinedIcon sx={{ color: GOLD, fontSize: 20 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {hasLocation ? (
            <Typography sx={{ fontSize: 13.5, color: INK }}>
              Deliver to{" "}
              <Box component="span" sx={{ fontWeight: 700 }}>
                {pincode}
              </Box>
              <Box
                component="span"
                sx={{ color: GOLD, fontWeight: 700, ml: 0.75 }}
              >
                Change
              </Box>
            </Typography>
          ) : (
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: GOLD }}>
              Select delivery location
            </Typography>
          )}
        </Box>
        <ChevronRightRoundedIcon sx={{ color: GOLD }} />
      </Box>

      <Box sx={{ borderTop: `1px solid ${LINE}` }} />

      {/* Fulfilled by */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          px: 1.75,
          py: 1.25,
        }}
      >
        <StorefrontOutlinedIcon sx={{ color: INK_SOFT, fontSize: 20 }} />
        <Typography sx={{ fontSize: 13.5, color: INK }}>
          Fulfilled by{" "}
          <Box component="span" sx={{ fontWeight: 700 }}>
            {storeName}
          </Box>
        </Typography>
      </Box>

      <AddressSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        branchId={branchId}
      />
    </Box>
  );
};

export default DeliveryDetails;
