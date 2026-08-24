import React, { useState, useEffect, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import BottomSheet from "./ui/BottomSheet";
import { PrimaryCTA, SecondaryCTA } from "./ui/Buttons";
import { GOLD, INK, INK_SOFT, LINE, SURFACE_ALT, RADIUS } from "./ui/ecomTokens";

// ─── EcomFilterSheet ─────────────────────────────────────────────────────────
// Filter + sort drawer. Metal and Purity options are DYNAMIC — supplied via
// props from the backend `/api/e-com/filter-meta` endpoint (each option is
// { id, name } where id is the value stored on the stock row: metal_id /
// Purity_id). Price Range and Weight are numeric range presets. Selections are
// stored as the option VALUES (metal_id / Purity_id / numbers), which is what
// LandingPage.filterProducts and AllProductsSection.buildFilterParams consume.
const SORT_OPTIONS = [
  "Product A-Z",
  "Product Z-A",
  "Price : Low-High",
  "Price : High-Low",
];

const EcomFilterSheet = ({
  open,
  onApplyFilters,
  defaultSelectedFilters = {},
  sortOption = "",
  onApplySort,
  onClose,
  metals = [],
  purities = [],
}) => {
  // Build the filter groups; Metal/Purity come from the dynamic meta.
  const allFilters = useMemo(
    () => [
      {
        filterName: "Price Range",
        options: [10000, 20000, 30000, 40000, 50000].map((v) => ({
          value: v,
          label: `₹${v.toLocaleString("en-IN")}`,
        })),
      },
      {
        filterName: "Metal",
        options: metals.map((m) => ({ value: m.id, label: m.name })),
      },
      {
        filterName: "Purity",
        options: purities.map((p) => ({ value: p.id, label: p.name })),
      },
      {
        filterName: "Weight",
        options: [5, 10, 15, 20, 25, 30].map((v) => ({
          value: v,
          label: `${v} gm`,
        })),
      },
    ],
    [metals, purities],
  );

  const [selectedFilterName, setSelectedFilterName] = useState("Price Range");
  const [selectedFilterOptions, setSelectedFilterOptions] = useState(
    defaultSelectedFilters,
  );
  const [selectedSort, setSelectedSort] = useState(sortOption);

  // Re-sync with the applied state whenever the sheet is (re)opened.
  useEffect(() => {
    if (open) {
      setSelectedFilterOptions(defaultSelectedFilters || {});
      setSelectedSort(sortOption || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggleOption = (filterName, value) => {
    setSelectedFilterOptions((prev) => {
      const current = prev[filterName] || [];
      return current.includes(value)
        ? { ...prev, [filterName]: current.filter((o) => o !== value) }
        : { ...prev, [filterName]: [...current, value] };
    });
  };

  const selectedCount = Object.values(selectedFilterOptions).reduce(
    (n, opts) => n + (opts?.length || 0),
    0,
  );

  const handleClear = () => {
    setSelectedFilterOptions({});
    setSelectedSort("");
  };

  const handleApply = () => {
    onApplyFilters(selectedFilterOptions);
    onApplySort?.(selectedSort);
    onClose?.();
  };

  const activeGroup =
    allFilters.find((f) => f.filterName === selectedFilterName) || allFilters[0];

  return (
    <BottomSheet open={open} onClose={onClose} title="Filter & Sort" maxHeight="88vh">
      {/* Sort */}
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: INK_SOFT,
          mb: 1,
        }}
      >
        Sort By
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
        {SORT_OPTIONS.map((opt) => {
          const active = selectedSort === opt;
          return (
            <Box
              key={opt}
              onClick={() => setSelectedSort(active ? "" : opt)}
              sx={{
                px: 1.75,
                py: 0.9,
                borderRadius: RADIUS.pill,
                border: `1px solid ${active ? GOLD : LINE}`,
                bgcolor: active ? "rgba(185,138,70,0.08)" : "#fff",
                color: active ? GOLD : INK,
                fontSize: 12.5,
                fontWeight: active ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {opt}
            </Box>
          );
        })}
      </Box>

      <Box sx={{ height: "1px", bgcolor: LINE, mx: -2.5, mb: 1.5 }} />

      {/* Filters — two pane */}
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: INK_SOFT,
          mb: 1,
        }}
      >
        Filters
      </Typography>
      <Box sx={{ display: "flex", minHeight: "40vh", mx: -2.5 }}>
        {/* names */}
        <Box
          sx={{
            width: "42%",
            bgcolor: SURFACE_ALT,
            py: 0.5,
            maxHeight: "44vh",
            overflowY: "auto",
          }}
        >
          {allFilters.map((filter) => {
            const active = selectedFilterName === filter.filterName;
            const count = selectedFilterOptions[filter.filterName]?.length || 0;
            return (
              <Box
                key={filter.filterName}
                onClick={() => setSelectedFilterName(filter.filterName)}
                sx={{
                  position: "relative",
                  px: 2.5,
                  py: 1.6,
                  cursor: "pointer",
                  bgcolor: active ? "#fff" : "transparent",
                  borderLeft: active
                    ? `3px solid ${GOLD}`
                    : "3px solid transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13.5,
                    fontWeight: active ? 700 : 500,
                    color: active ? INK : INK_SOFT,
                  }}
                >
                  {filter.filterName}
                </Typography>
                {count > 0 && (
                  <Box
                    sx={{
                      minWidth: 18,
                      height: 18,
                      px: 0.5,
                      borderRadius: 999,
                      bgcolor: GOLD,
                      color: "#fff",
                      fontSize: 10,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {count}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>

        {/* options */}
        <Box
          sx={{
            flex: 1,
            px: 2,
            py: 1.5,
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            alignContent: "flex-start",
            maxHeight: "44vh",
            overflowY: "auto",
          }}
        >
          {activeGroup?.options.length ? (
            activeGroup.options.map((opt) => {
              const isSelected = (
                selectedFilterOptions[selectedFilterName] || []
              ).includes(opt.value);
              return (
                <Box
                  key={String(opt.value)}
                  onClick={() => toggleOption(selectedFilterName, opt.value)}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: RADIUS.pill,
                    border: `1px solid ${isSelected ? GOLD : LINE}`,
                    bgcolor: isSelected ? "rgba(185,138,70,0.08)" : "#fff",
                    color: isSelected ? GOLD : INK,
                    fontSize: 13,
                    fontWeight: isSelected ? 700 : 500,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {opt.label}
                </Box>
              );
            })
          ) : (
            <Typography sx={{ fontSize: 12.5, color: INK_SOFT, py: 1 }}>
              No options available
            </Typography>
          )}
        </Box>
      </Box>

      {/* actions */}
      <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
        <SecondaryCTA onClick={handleClear} height={48} sx={{ flex: 1 }}>
          Clear{selectedCount > 0 ? ` (${selectedCount})` : ""}
        </SecondaryCTA>
        <PrimaryCTA onClick={handleApply} height={48} sx={{ flex: 1.4 }}>
          Apply
        </PrimaryCTA>
      </Box>
    </BottomSheet>
  );
};

export default EcomFilterSheet;
