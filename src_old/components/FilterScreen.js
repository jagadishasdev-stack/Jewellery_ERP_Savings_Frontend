import { Box, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSafeAreaBottom, useSafeAreaTop } from "../SafeAreaFile";
import { Capacitor } from "@capacitor/core";
import theme from "../theme";

const allFilters = [
  {
    filterName: "Price Range",
    filterOptions: [10000, 20000, 30000, 40000, 50000],
  },
  {
    filterName: "Jewel Type",
    filterOptions: ["Gold", "Silver", "Platinum", "Diamond", "Bronze"],
  },
  {
    filterName: "Product",
    filterOptions: ["Ring", "Chain", "Necklace", "Bracelete", "Earring"],
  },
  { filterName: "Gender", filterOptions: ["Male", "Female"] },
  { filterName: "Purity", filterOptions: ["22K", "18K"] },
  { filterName: "Metal", filterOptions: ["Gold", "Silver", "Platinum"] },
  { filterName: "Weight", filterOptions: [5, 10, 15, 20, 25, 30] },
  {
    filterName: "Metal Color",
    filterOptions: ["Yellow", "Rose Gold", "White"],
  },
];

function FilterScreen({
  onApplyFilters,
  defaultSelectedFilters = {},
  displayFilterScreen,
}) {
  const topInset = useSafeAreaTop();
  const bottomInset = useSafeAreaBottom();
  const isIOS = Capacitor.getPlatform() === "ios";

  const toPxNumber = (v) =>
    typeof v === "number" ? v : parseInt(String(v).replace(/\D/g, ""), 10) || 0;

  const safeTop = toPxNumber(topInset);
  const safeBottom = toPxNumber(bottomInset);

  const HEADER_HEIGHT = 56;
  const FOOTER_HEIGHT = 56;

  const contentOffset = HEADER_HEIGHT + FOOTER_HEIGHT + safeTop + safeBottom;
  const contentHeight = `calc(100vh - ${contentOffset}px)`;

  const [selectedFilterName, setSelectedFilterName] = useState(null);
  const [selectedFilterOptions, setSelectedFilterOptions] = useState(
    defaultSelectedFilters
  );

  // Get existing selected filters
  useEffect(() => {
    if (!selectedFilterName) {
      setSelectedFilterName(allFilters[0].filterName);
    }
  }, [selectedFilterName]);

  // Select multiple filters handler
  const handleAddFilterOptions = (filterName, option) => {
    setSelectedFilterOptions((prev) => {
      const currentOptions = prev[filterName] || [];
      return currentOptions.includes(option)
        ? { ...prev, [filterName]: currentOptions.filter((o) => o !== option) }
        : { ...prev, [filterName]: [...currentOptions, option] };
    });
  };

  // Apply filters handler
  const handleApplyFilters = () => {
    onApplyFilters(selectedFilterOptions);
  };

  return (
    <>
      {/* Filters section */}
      <Box sx={{ display: "flex", width: "100%", height: contentHeight }}>
        {/* Filter Names */}
        <Box
          sx={{
            minWidth: "45%",
            height: "100%",
            bgcolor: theme.filterScreen.filterLabelSectionBGCol,
            ml: -2,
            p: 1,
            overflowY: "auto",
          }}
        >
          {allFilters.map((filter, index) => (
            <Box
              key={index}
              sx={{
                mb: 1,
                borderRadius: 0.5,
                bgcolor:
                  selectedFilterName === filter.filterName
                    ? theme.filterScreen.activeFilterNameBGCol
                    : theme.filterScreen.inactiveFilterNameBGCol,
                color:
                  selectedFilterName === filter.filterName
                    ? theme.filterScreen.activeFilterNameTextCol
                    : theme.filterScreen.inactiveFilterNameTextCol,
                px: 2,
                py: 1.5,
                cursor: "pointer",
              }}
              onClick={() => setSelectedFilterName(filter.filterName)}
            >
              {filter.filterName}
            </Box>
          ))}
        </Box>

        {/* Filter Options */}
        <Box
          sx={{
            flex: 1,
            height: "100%",
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            p: 1.5,
            overflowY: "auto",
            alignContent: "flex-start",
          }}
        >
          {selectedFilterName &&
            allFilters
              .find((f) => selectedFilterName === f.filterName)
              ?.filterOptions.map((filterOption, i) => {
                const isSelected =
                  selectedFilterOptions[selectedFilterName]?.includes(
                    filterOption
                  );

                return (
                  <Box
                    key={i}
                    sx={{
                      px: 2,
                      py: 1,
                      borderRadius: "999px",
                      border: `1px solid ${
                        isSelected
                          ? theme.filterScreen.activeFilterOptionBorderCol
                          : theme.filterScreen.inactiveFilterOptionBorderCol
                      }`,
                      bgcolor: theme.filterScreen.filterOptionBGCol,
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      handleAddFilterOptions(selectedFilterName, filterOption)
                    }
                  >
                    {selectedFilterName === "Price Range" && "₹"}
                    {selectedFilterName === "Price Range"
                      ? filterOption.toLocaleString("en-IN")
                      : filterOption}
                    {selectedFilterName === "Weight" && " gm"}
                  </Box>
                );
              })}
        </Box>
      </Box>

      {/* Cancel & Apply button */}
      <Box
        sx={{
          position: "fixed",
          right: 16,
          bottom: `calc(${FOOTER_HEIGHT}px + ${safeBottom}px + 12px)`,

          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
        }}
      >
        {/* Cancel button */}
        <Button
          onClick={() => displayFilterScreen(false)}
          disableRipple
          disableElevation
          variant="text"
          sx={{
            cursor: "pointer",
            color: theme.filterScreen.cancelBtnTextCol,
            bgcolor: "red",
            px: 1.5,
            py: 1,
            borderRadius: 5,
            cursor: "pointer",
            backgroundColor: theme.filterScreen.cancelBtnBGCol,
          }}
        >
          Cancel
        </Button>

        {/* Apply button */}
        <Button
          onClick={handleApplyFilters}
          disableRipple
          disableElevation
          variant="text"
          sx={{
            all: "unset", // completely removes default MUI styles
            cursor: "pointer",
            color: theme.filterScreen.applyBtnTextCol,
            // opacity: Object.values(selectedFilterOptions).some(
            //   (opts) => opts.length > 0
            // )
            //   ? 1 // fully visible when enabled
            //   : 0.5, // pale/disabled look
            // pointerEvents: Object.values(selectedFilterOptions).some(
            //   (opts) => opts.length > 0
            // )
            //   ? "auto"
            //   : "none",
            bgcolor: theme.filterScreen.applyBtnBGCol,
            px: 1.5,
            py: 1,
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          Apply
        </Button>
      </Box>
    </>
  );
}

export default FilterScreen;
