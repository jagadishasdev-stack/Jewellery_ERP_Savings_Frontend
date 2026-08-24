import React, { useRef } from "react";
import {
  Box,
  Typography,
  IconButton,
  Slide,
  Button,
  Backdrop,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useSafeAreaBottom, useSafeAreaTop } from "../SafeAreaFile";
import { Capacitor } from "@capacitor/core";
import theme from "../theme";

const sortOptions = [
  "Product A-Z",
  "Product Z-A",
  "Price : Low-High",
  "Price : High-Low",
  //   "Top collections",
  //   "Trendings",
  //   "New Arrivals",
  //   "Good",
];

function SortScreen({ open, onClose, onApplySort, appliedSort }) {
  const bottomInset = useSafeAreaBottom();
  const topInset = useSafeAreaTop();
  const isIOS = Capacitor.getPlatform() === "ios";

  const safeBottom =
    typeof bottomInset === "number" ? bottomInset : parseInt(bottomInset) || 0;
  const safeTop =
    typeof topInset === "number" ? topInset : parseInt(topInset) || 0;

  const sheetRef = useRef(null);

  return (
    <>
      {/* Background Blur */}
      <Backdrop
        open={open}
        onClick={onClose}
        sx={{
          backdropFilter: "blur(8px)",
          backgroundColor: theme.sortScreen.overlayBGCol,
          zIndex: 1200,
        }}
      />

      {/* Bottom Sheet */}
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Box
          ref={sheetRef}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100%",
            bgcolor: theme.sortScreen.sortSectionBGCol,
            backdropFilter: "blur(15px)",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            boxShadow: `0 -4px 20px ${theme.sortScreen.sortSectionBoxShadow}`,
            zIndex: 1300,
            pb: `${safeBottom + 16}px`,
            pt: `${safeTop / 4}px`,
            overflow: "hidden",
          }}
          onClick={(e) => e.stopPropagation()} // prevent backdrop close when tapping inside
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              px: 3,
              py: 1,
              borderBottom: `1px solid ${theme.sortScreen.sortSectionHeaderBorderBottomCol}`,
            }}
          >
            <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
              Sortby
            </Typography>
            <IconButton onClick={onClose}>
              <CloseRoundedIcon />
            </IconButton>
          </Box>

          {/* Sort options */}
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              px: 3,
              py: 3,
              //   mb: 7,
              justifyContent: "flex-start",
            }}
          >
            {sortOptions.map((option, idx) => (
              <Button
                key={idx}
                onClick={() => {
                  onApplySort(option);
                  onClose();
                }}
                sx={{
                  borderRadius: 5,
                  border: `1px solid ${
                    appliedSort === option
                      ? theme.sortScreen.activeSortOptionBorderCol
                      : theme.sortScreen.inactiveSortOptionBorderCol
                  }`,
                  px: 3,
                  py: 1,
                  color: theme.sortScreen.activeSortOptionTextCol,
                  textTransform: "none",
                  fontSize: 16,
                  fontWeight: 500,
                }}
              >
                {option}
              </Button>
            ))}
          </Box>
        </Box>
      </Slide>
    </>
  );
}

export default SortScreen;
