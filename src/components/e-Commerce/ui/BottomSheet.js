import React from "react";
import { Box, Typography, IconButton, Slide, Backdrop } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useSafeAreaBottom } from "../../../SafeAreaFile";
import { FONT_DISPLAY, INK, LINE, RADIUS, SHADOW } from "./ecomTokens";

// Reusable premium bottom-sheet: blurred backdrop + slide-up rounded sheet with
// a grab handle and header. Handles device safe-area at the bottom (Capacitor).
const BottomSheet = ({ open, onClose, title, children, maxHeight = "82vh" }) => {
  const bottomInset = useSafeAreaBottom();
  const safeBottom =
    typeof bottomInset === "number" ? bottomInset : parseInt(bottomInset) || 0;

  return (
    <>
      <Backdrop
        open={open}
        onClick={onClose}
        sx={{
          backdropFilter: "blur(6px)",
          backgroundColor: "rgba(20,16,10,0.45)",
          zIndex: 1300,
        }}
      />
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1400,
            bgcolor: "#fff",
            borderTopLeftRadius: RADIUS.sheet,
            borderTopRightRadius: RADIUS.sheet,
            boxShadow: SHADOW.lg,
            display: "flex",
            flexDirection: "column",
            maxHeight,
            pb: `${safeBottom + 12}px`,
          }}
        >
          {/* grab handle */}
          <Box
            sx={{
              width: 42,
              height: 4,
              borderRadius: 999,
              bgcolor: "#E2DBCC",
              mx: "auto",
              mt: 1.25,
              mb: 0.5,
            }}
          />

          {/* header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2.5,
              py: 1,
              borderBottom: `1px solid ${LINE}`,
            }}
          >
            <Typography
              sx={{
                fontFamily: FONT_DISPLAY,
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                color: INK,
              }}
            >
              {title}
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseRoundedIcon sx={{ color: INK }} />
            </IconButton>
          </Box>

          {/* body */}
          <Box sx={{ overflowY: "auto", px: 2.5, py: 2 }}>{children}</Box>
        </Box>
      </Slide>
    </>
  );
};

export default BottomSheet;
