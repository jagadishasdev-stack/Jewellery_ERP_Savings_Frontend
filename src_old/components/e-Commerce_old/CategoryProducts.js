import React, { useState } from "react";
import { Box, InputAdornment, TextField, Typography } from "@mui/material";
import FilterScreen from "../FilterScreen";
import ProductsList from "./ProductsList";

// Icons
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SwapVertRoundedIcon from "@mui/icons-material/SwapVertRounded";
import prodImage1 from "../../assets/img/prodImage1.jpg";
import prodImage2 from "../../assets/img/prodImage2.jpg";
import prodImage3 from "../../assets/img/prodImage3.jpg";
import prodImage4 from "../../assets/img/prodImage4.jpg";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import SortScreen from "../SortScreen";
import { useLocation } from "react-router-dom";
import theme from "../../theme";

function CategoryProducts() {
  const location = useLocation();
  const selectedCategory = location.state?.productCategory;
  const [showFilterScreen, setShowFilterScreen] = useState(false);
  const [appliedFilterOptions, setAppliedFilterOptions] = useState({}); // store applied filters
  const [showSortScreen, setShowSortScreen] = useState(false);
  const [sortOption, setSortOption] = useState("");

  // Add filter handler
  const handleApplyFilters = (filters) => {
    setAppliedFilterOptions(filters);
    setShowFilterScreen(false);
  };

  // Remove filter handler
  const handleRemoveFilterOption = (filterName, option) => {
    setAppliedFilterOptions((prev) => ({
      ...prev,
      [filterName]: prev[filterName].filter((o) => o !== option),
    }));
  };

  // All products
  const products = [
    {
      id: 1,
      label: "Gold Chain",
      currentPrice: 34000,
      actualPrice: 34500,
      images: [prodImage1, prodImage2, prodImage3, prodImage4],
      stockLeft: 18,
      productType: "Chain",
    },
    {
      id: 2,
      label: "Silver Bracelet",
      currentPrice: 45000,
      actualPrice: 52000,
      images: [prodImage1, prodImage2, prodImage3, prodImage4],
      stockLeft: 2,
      productType: "Bracelet",
    },
    {
      id: 3,
      label: "Gold Ring",
      currentPrice: 17000,
      actualPrice: 17500,
      images: [prodImage1, prodImage2, prodImage3, prodImage4],
      stockLeft: 7,
      productType: "Ring",
    },
    {
      id: 4,
      label: "Diamond Necklace",
      currentPrice: 48000,
      actualPrice: 50000,
      images: [prodImage1, prodImage2, prodImage3, prodImage4],
      stockLeft: 14,
      productType: "Necklace",
    },
    {
      id: 5,
      label: "Platinum Earring",
      currentPrice: 25000,
      actualPrice: 26000,
      images: [prodImage1, prodImage2, prodImage3, prodImage4],
      stockLeft: 19,
      productType: "Earring",
    },
  ];

  // Product filterer
  const filterProducts = (productsArr = []) => {
    return productsArr.filter((product) => {
      // PRICE RANGE filter
      if (appliedFilterOptions["Price Range"]?.length > 0) {
        const priceOptions = appliedFilterOptions["Price Range"];
        const minSelected = Math.min(...priceOptions);
        const maxSelected = Math.max(...priceOptions);

        if (
          product.currentPrice < minSelected ||
          product.currentPrice > maxSelected
        ) {
          return false;
        }
      }

      // JEWEL TYPE filter
      if (appliedFilterOptions["Jewel Type"]?.length > 0) {
        const match = appliedFilterOptions["Jewel Type"].some((type) =>
          product.label.toLowerCase().includes(type.toLowerCase()),
        );
        if (!match) return false;
      }

      // PRODUCT filter
      if (appliedFilterOptions["Product"]?.length > 0) {
        const match = appliedFilterOptions["Product"].some((p) =>
          product.label.toLowerCase().includes(p.toLowerCase()),
        );
        if (!match) return false;
      }

      return true;
    });
  };

  // Filtered products
  const filteredProducts = filterProducts(
    selectedCategory
      ? products.filter(
          (prod) =>
            prod.productType.toLowerCase() === selectedCategory.toLowerCase(),
        )
      : products,
  );

  // Sorted products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case "Product A-Z":
        return a.label.localeCompare(b.label);
      case "Product Z-A":
        return b.label.localeCompare(a.label);
      case "Price : Low-High":
        return a.currentPrice - b.currentPrice;
      case "Price : High-Low":
        return b.currentPrice - a.currentPrice;
      default:
        return 0;
    }
  });

  return (
    <>
      {/* Sort screen conditional rendering */}
      {showSortScreen && (
        <SortScreen
          open={showSortScreen}
          onClose={() => setShowSortScreen(false)}
          onApplySort={(option) => {
            setSortOption(option);
            setShowSortScreen(false);
          }}
          appliedSort={sortOption}
        />
      )}

      {/* Filter screen conditional rendering */}
      {showFilterScreen && (
        <FilterScreen
          displayFilterScreen={setShowFilterScreen}
          onApplyFilters={handleApplyFilters}
          defaultSelectedFilters={appliedFilterOptions} // optional, keep previous selections
        />
      )}

      {!showFilterScreen && (
        <>
          {/* Search bar */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100vw",
              bgcolor: theme.categoryProduct.searchBarBGCol,
              mx: -2,
              px: 2,
              py: 1,
            }}
          >
            <TextField
              placeholder="Search..."
              variant="outlined"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon
                      sx={{
                        fontSize: 22,
                        fill: theme.categoryProduct.searchIconFillCol,
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "25px",
                  backgroundColor: theme.categoryProduct.searchBarBorderCol,
                  "& fieldset": {
                    border: `1px solid ${theme.categoryProduct.searchBarFieldsetCol} `,
                  },
                  "&:hover fieldset": {
                    border: `1px solid ${theme.categoryProduct.searchBarFieldsetCol} `,
                  },
                  "&.Mui-focused fieldset": {
                    border: `1px solid ${theme.categoryProduct.searchBarFieldsetCol} `,
                  },
                },
                "& input": { padding: "10px 14px 10px 0" },
              }}
            />
          </Box>

          {/* Sliding filters section */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              width: "100vw",
              mx: -2,
              height: 42,
              px: 2,
              mt: 0.5,
              mb: 1,
            }}
          >
            {/* Filter icon */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 36,
                px: 1.5,
                border: `0.5px solid ${theme.categoryProduct.filterAndSortIconBorderCol}`,
                borderRadius: 5,
                cursor: "pointer",
              }}
              onClick={() => setShowFilterScreen(true)}
            >
              <FilterListRoundedIcon
                sx={{
                  fontSize: 20,
                  fill: theme.categoryProduct.filterAndSortIconFillCol,
                }}
              />
            </Box>

            {/* Sort icon */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 36,
                px: 1.5,
                border: `0.5px solid ${theme.categoryProduct.filterAndSortIconBorderCol}`,
                borderRadius: 5,
                cursor: "pointer",
              }}
              onClick={() => setShowSortScreen(true)}
            >
              <SwapVertRoundedIcon
                sx={{
                  fontSize: 20,
                  fill: theme.categoryProduct.filterAndSortIconFillCol,
                }}
              />
            </Box>

            {/* Selected filters */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                width: "100%",
                height: 42,
                overflowX: "auto",
                scrollSnapType: "x mandatory",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              {Object.entries(appliedFilterOptions).map(
                ([filterName, options]) =>
                  options.map((option, idx) => (
                    <Box
                      key={`${filterName}-${idx}`}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: 36,
                        px: 1.5,
                        border: `0.5px solid ${theme.categoryProduct.selectedFilterBorderCol}`,
                        borderRadius: 5,
                        gap: 0.5,
                        color: theme.categoryProduct.selectedFilterTextCol,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        handleRemoveFilterOption(filterName, option)
                      }
                    >
                      {filterName === "Price Range" && "₹"}
                      {option}
                      {filterName === "Weight" && "g"}
                      <CancelRoundedIcon sx={{ fontSize: 20 }} />
                    </Box>
                  )),
              )}
            </Box>
          </Box>

          {/* Render products based on applied filters */}
          {sortedProducts.length > 0 ? (
            <ProductsList allProducts={sortedProducts} />
          ) : (
            <Typography
              sx={{
                fontSize: 16,
                color: theme.categoryProduct.noProductTextCol,
                textAlign: "center",
                mt: 1.5,
              }}
            >
              No products found
            </Typography>
          )}
        </>
      )}
    </>
  );
}

export default CategoryProducts;
