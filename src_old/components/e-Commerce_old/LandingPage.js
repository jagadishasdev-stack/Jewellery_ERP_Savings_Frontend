import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Box,
  InputAdornment,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import FilterScreen from "../FilterScreen";
import SortScreen from "../SortScreen";
import ProductsList from "./ProductsList";
import SectionRow from "./SectionRow";
import FullSectionPage from "./FullSectionPage";
import AllProductsSection from "./AllProductsSection";

import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import SwapVertRoundedIcon from "@mui/icons-material/SwapVertRounded";

import { StoreContext } from "../../contexts/StoreContext";
import APP_CONFIG from "../../config/constants";
import theme from "../../theme";
import { AuthContext } from "../../contexts/AuthContext";
import { EcomContext } from "../../contexts/EcomContext";

// ─── View states ─────────────────────────────────────────────────────────────
// "home"           → default landing (carousels + sections + all-products)
// "newArrivals"    → full new-arrivals list
// "topDeals"       → full top-deals list (placeholder until API is ready)
const VIEWS = {
  HOME: "home",
  NEW_ARRIVALS: "newArrivals",
  TOP_DEALS: "topDeals",
};

// ─── CategoryCarousel (unchanged) ────────────────────────────────────────────
const CategoryCarousel = React.memo(({ categories, onCategoryClick }) => {
  const trackRef = useRef(null);
  const animationRef = useRef(null);
  const offsetRef = useRef(0);

  const duplicatedCategories = [...categories, ...categories];

  useEffect(() => {
    if (categories.length === 0) return;

    const CARD_WIDTH = 108;
    const loopWidth = categories.length * CARD_WIDTH;

    const animate = () => {
      offsetRef.current += 0.5;
      if (offsetRef.current >= loopWidth) offsetRef.current -= loopWidth;
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(${-offsetRef.current}px)`;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [categories.length]);

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Typography
        sx={{
          fontSize: 16,
          fontWeight: 600,
          color: theme.categoryProduct.selectedFilterTextCol,
          letterSpacing: "-0.02em",
          mb: 1,
        }}
      >
        Categories
      </Typography>

      <Box sx={{ position: "relative", overflow: "hidden", width: "100%" }}>
        <Box
          ref={trackRef}
          sx={{ display: "flex", gap: 1, willChange: "transform" }}
        >
          {duplicatedCategories.map((category, idx) => (
            <Box
              key={`${category.id}-${idx}`}
              sx={{
                position: "relative",
                flexShrink: 0,
                width: 100,
                height: 120,
                borderRadius: 3,
                overflow: "hidden",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                },
              }}
              onClick={() => onCategoryClick(category)}
            >
              <Box
                component="img"
                src={category.image}
                alt={category.name}
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "60%",
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
                }}
              />
              <Typography
                sx={{
                  position: "absolute",
                  bottom: 8,
                  left: 0,
                  right: 0,
                  color: "white",
                  fontSize: 13,
                  fontWeight: 600,
                  textAlign: "center",
                  px: 1,
                  textShadow: "0 1px 3px rgba(0,0,0,0.3)",
                  letterSpacing: "0.02em",
                }}
              >
                {category.name}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
});

// ─── Main LandingPage ────────────────────────────────────────────────────────
function LandingPage() {
  const { adminUser } = useContext(AuthContext);
  const { storeAssets } = useContext(StoreContext);
  const { wishlistItems, cartItems } = useContext(EcomContext);

  const [activeView, setActiveView] = useState(VIEWS.HOME);

  const [showFilterScreen, setShowFilterScreen] = useState(false);
  const [appliedFilterOptions, setAppliedFilterOptions] = useState({});
  const [showSortScreen, setShowSortScreen] = useState(false);
  const [sortOption, setSortOption] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // ── First-page stock (used for New Arrivals + Top Deals sections) ─────────
  const [stockProducts, setStockProducts] = useState([]);
  const [loadingStock, setLoadingStock] = useState(true);
  const [stockError, setStockError] = useState(null);

  // ── Top Deals placeholder — replace with real API call when ready ─────────
  // For now, topDealsProducts is always empty so the section shows gracefully.
  const [topDealsProducts] = useState([]);
  const [loadingTopDeals] = useState(false);

  // ── Filter metadata ───────────────────────────────────────────────────────
  const [itemtypeAndDesigns, setItemtypeAndDesigns] = useState([]);
  const [carouselCategories, setCarouselCategories] = useState([]);

  // ── Fetch itemtype + designs for filter ───────────────────────────────────
  useEffect(() => {
    const fetchItemtypeAndDesigns = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const response = await axios.get(
          `${baseURL}/api/e-com/itemtype-and-designs`,
          {
            params: {
              store_id: APP_CONFIG.STORE_ID,
              branch_id: APP_CONFIG.BRANCH,
              isUser: true,
            },
          },
        );
        setItemtypeAndDesigns(response.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch itemtype and designs:", err);
      }
    };
    fetchItemtypeAndDesigns();
  }, []);

  // ── Fetch carousel categories (items with images) ─────────────────────────
  useEffect(() => {
    const fetchCarouselCategories = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const response = await axios.get(
          `${baseURL}/api/e-com/itemtype-and-designs`,
          {
            params: {
              store_id: APP_CONFIG.STORE_ID,
              branch_id: APP_CONFIG.BRANCH,
              isUser: true,
            },
          },
        );
        const raw = response.data?.data || [];
        setCarouselCategories(
          raw.filter((item) => item.image && item.image.trim() !== ""),
        );
      } catch (err) {
        console.error("Failed to fetch carousel categories:", err);
      }
    };
    fetchCarouselCategories();
  }, []);

  // ── Fetch first page of stock (for section rows) ──────────────────────────
  useEffect(() => {
    const fetchStock = async () => {
      try {
        setLoadingStock(true);
        setStockError(null);

        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const response = await axios.get(`${baseURL}/api/e-com/stocks`, {
          params: {
            store_id: APP_CONFIG.STORE_ID,
            branch_id: APP_CONFIG.BRANCH,
            page: 1,
            limit: 50,
            user_id: adminUser?.user_id,
          },
        });

        const allowedFlags = ["F", "N", "E"];
        const mapped = (response.data?.data || [])
          .filter((item) => allowedFlags.includes(item.flag))
          .map((item) => ({
            tagno: item.tagno,
            label: `Tag #${item.tagno}`,
            currentPrice: item.actual_price ?? 0,
            actualPrice: item.false_price ?? 0,
            images: item.images,
            stockLeft: item.pcs ?? 1,
            productType: item.itemtype === 1 ? "Gold" : "Diamond",
            gross: item.gross,
            netwt: item.netwt,
            purity: item.purity,
            metaltype: item.metaltype,
            itemtype: item.itemtype,
            design: item.design,
            flag: item.flag,
            entrydate: item.entrydate,
            category: item.category,
            is_wishlisted: item.is_wishlisted || false,
            is_in_cart: item.is_in_cart || false,
          }));

        setStockProducts(mapped);
      } catch (err) {
        console.error("Failed to fetch stock:", err);
        setStockError("Failed to load products. Please try again.");
      } finally {
        setLoadingStock(false);
      }
    };

    fetchStock();
  }, [adminUser?.user_id]);

  // ── Sync wishlist / cart into section-row products ────────────────────────
  useEffect(() => {
    setStockProducts((prev) =>
      prev.map((product) => ({
        ...product,
        is_wishlisted: wishlistItems.some((w) => w.tagno === product.tagno),
        is_in_cart: cartItems.some((c) => c.tagno === product.tagno),
      })),
    );
  }, [wishlistItems, cartItems]);

  // ── Carousel category click → sets Category filter ────────────────────────
  const handleCarouselCategoryClick = (category) => {
    setAppliedFilterOptions((prev) => {
      const current = prev["Category"] || [];
      const isSelected = current.includes(category.id);
      return { ...prev, Category: isSelected ? [] : [category.id] };
    });
  };

  // ── Filter helpers ────────────────────────────────────────────────────────
  const handleApplyFilters = (filters) => {
    setAppliedFilterOptions(filters);
    setShowFilterScreen(false);
  };

  const handleRemoveFilterOption = (filterName, option) => {
    setAppliedFilterOptions((prev) => ({
      ...prev,
      [filterName]: prev[filterName].filter((o) => o !== option),
    }));
  };

  const isFilterOrSearchActive =
    searchTerm.trim().length > 0 ||
    Object.values(appliedFilterOptions).some((opts) => opts.length > 0);

  // ── Apply filter + sort to section-row data ───────────────────────────────
  const filterProducts = (productsArr) =>
    productsArr.filter((product) => {
      if (
        searchTerm &&
        !product.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;

      if (appliedFilterOptions["Price Range"]?.length > 0) {
        const opts = appliedFilterOptions["Price Range"];
        const min = Math.min(...opts);
        const max = Math.max(...opts);
        if (product.currentPrice < min || product.currentPrice > max)
          return false;
      }

      if (appliedFilterOptions["Jewel Type"]?.length > 0) {
        const match = appliedFilterOptions["Jewel Type"].some((t) =>
          product.label.toLowerCase().includes(t.toLowerCase()),
        );
        if (!match) return false;
      }

      if (appliedFilterOptions["Category"]?.length > 0) {
        if (!appliedFilterOptions["Category"].includes(product.itemtype))
          return false;
      }

      if (appliedFilterOptions["Design"]?.length > 0) {
        if (!appliedFilterOptions["Design"].includes(product.design))
          return false;
      }

      if (appliedFilterOptions["Gender"]?.length > 0) {
        const match = appliedFilterOptions["Gender"].some((g) =>
          product.label.toLowerCase().includes(g.toLowerCase()),
        );
        if (!match) return false;
      }

      if (appliedFilterOptions["Purity"]?.length > 0) {
        const purityMap = { "22K": 916, "18K": 750 };
        const match = appliedFilterOptions["Purity"].some(
          (p) => purityMap[p] === product.purity,
        );
        if (!match) return false;
      }

      if (appliedFilterOptions["Metal"]?.length > 0) {
        const metalMap = { Gold: 1, Silver: 2, Platinum: 3 };
        const match = appliedFilterOptions["Metal"].some(
          (m) => metalMap[m] === product.metaltype,
        );
        if (!match) return false;
      }

      if (appliedFilterOptions["Weight"]?.length > 0) {
        const opts = appliedFilterOptions["Weight"];
        const minW = Math.min(...opts);
        const maxW = Math.max(...opts);
        if (product.netwt < minW || product.netwt > maxW) return false;
      }

      return true;
    });

  const sortProducts = (arr) =>
    [...arr].sort((a, b) => {
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

  // ── Derived section data ──────────────────────────────────────────────────
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 50);

  const newArrivalProducts = sortProducts(
    filterProducts(stockProducts).filter((p) => {
      if (!p.entrydate) return false;
      return new Date(p.entrydate) >= tenDaysAgo;
    }),
  );

  // Top Deals: wire up when API is ready — replace topDealsProducts with real data
  const filteredTopDeals = sortProducts(filterProducts(topDealsProducts));

  // ── Render: Filter / Sort overlays ───────────────────────────────────────
  if (showSortScreen)
    return (
      <SortScreen
        open={showSortScreen}
        onClose={() => setShowSortScreen(false)}
        onApplySort={(option) => {
          setSortOption(option);
          setShowSortScreen(false);
        }}
        appliedSort={sortOption}
      />
    );

  if (showFilterScreen)
    return (
      <FilterScreen
        displayFilterScreen={setShowFilterScreen}
        onApplyFilters={handleApplyFilters}
        defaultSelectedFilters={appliedFilterOptions}
        itemtypeAndDesigns={itemtypeAndDesigns}
      />
    );

  // ── Render: Full section views ────────────────────────────────────────────
  if (activeView === VIEWS.NEW_ARRIVALS)
    return (
      <FullSectionPage
        title="New Arrivals"
        products={newArrivalProducts}
        loading={loadingStock}
        onBack={() => setActiveView(VIEWS.HOME)}
      />
    );

  if (activeView === VIEWS.TOP_DEALS)
    return (
      <FullSectionPage
        title="Top Deals"
        products={filteredTopDeals}
        loading={loadingTopDeals}
        onBack={() => setActiveView(VIEWS.HOME)}
      />
    );

  // ── Render: Home ──────────────────────────────────────────────────────────
  return (
    <>
      {/* Search bar + Filter & Sort icons */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
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
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
                border: `1px solid ${theme.categoryProduct.searchBarFieldsetCol}`,
              },
              "&:hover fieldset": {
                border: `1px solid ${theme.categoryProduct.searchBarFieldsetCol}`,
              },
              "&.Mui-focused fieldset": {
                border: `1px solid ${theme.categoryProduct.searchBarFieldsetCol}`,
              },
            },
            "& input": { padding: "10px 14px 10px 0" },
          }}
        />

        {/* Filter icon */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 36,
            px: 1.5,
            border: `0.5px solid ${theme.categoryProduct.filterAndSortIconFillCol}`,
            borderRadius: 5,
            cursor: "pointer",
            flexShrink: 0,
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
            border: `0.5px solid ${theme.categoryProduct.filterAndSortIconFillCol}`,
            borderRadius: 5,
            cursor: "pointer",
            flexShrink: 0,
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
      </Box>

      {/* Applied filter chips */}
      {Object.values(appliedFilterOptions).some((opts) => opts.length > 0) && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            width: "100vw",
            mx: -2,
            px: 2,
            height: 42,
            mt: 0.5,
            mb: 1,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {Object.entries(appliedFilterOptions).map(([filterName, options]) =>
            options.map((option, idx) => {
              let displayLabel = option;

              if (filterName === "Category") {
                const found = itemtypeAndDesigns.find(
                  (cat) => cat.id === option,
                );
                displayLabel = found ? found.name : option;
              }

              if (filterName === "Design") {
                let foundDesign = null;
                for (const cat of itemtypeAndDesigns) {
                  foundDesign = cat.designs?.find((d) => d.id === option);
                  if (foundDesign) break;
                }
                displayLabel = foundDesign ? foundDesign.name : option;
              }

              return (
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
                  onClick={() => handleRemoveFilterOption(filterName, option)}
                >
                  {filterName === "Price Range" && "₹"}
                  {displayLabel}
                  {filterName === "Weight" && "g"}
                  <CancelRoundedIcon sx={{ fontSize: 20 }} />
                </Box>
              );
            }),
          )}
        </Box>
      )}

      {/* Categories carousel + Banner — hidden when filter/search active */}
      {!isFilterOrSearchActive && (
        <>
          {carouselCategories.length > 0 && (
            <CategoryCarousel
              categories={carouselCategories}
              onCategoryClick={handleCarouselCategoryClick}
            />
          )}

          {/* Banner */}
          <Box
            sx={{
              my: 2,
              borderRadius: 3,
              overflow: "hidden",
              background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
              color: "white",
              p: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="overline"
                sx={{
                  color: "#ffd700",
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: "0.1em",
                }}
              >
                LIMITED TIME
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 0.5,
                  fontSize: 18,
                  letterSpacing: "-0.02em",
                }}
              >
                Summer Collection 2026
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: 13 }}>
                Up to 30% off on diamond jewelry
              </Typography>
            </Box>
            <Box
              component="img"
              src="https://kumuduorderapp.blob.core.windows.net/savingadmin/Gold-Plated-Studded-Set-of-2-bangles-Designer-Bangles-Griiham-2_4_ab8d2dc4-76b6-4a10-a82b-f4d8f821302d.jpg"
              alt="offer"
              sx={{
                width: 70,
                height: 70,
                borderRadius: 2,
                objectFit: "cover",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            />
          </Box>
        </>
      )}

      {/* ── Section rows (New Arrivals + Top Deals) — hidden when filter/search active */}
      {!isFilterOrSearchActive && (
        <>
          <SectionRow
            title="New Arrivals"
            products={newArrivalProducts}
            loading={loadingStock}
            onViewAll={() => setActiveView(VIEWS.NEW_ARRIVALS)}
          />

          <SectionRow
            title="Top Deals"
            products={filteredTopDeals}
            loading={loadingTopDeals}
            onViewAll={() => setActiveView(VIEWS.TOP_DEALS)}
          />
        </>
      )}

      {/* ── All Products with infinite scroll ────────────────────────────────── */}
      {stockError ? (
        <Typography
          sx={{
            fontSize: 16,
            color: theme.categoryProduct.noProductTextCol,
            textAlign: "center",
            mt: 1.5,
          }}
        >
          {stockError}
        </Typography>
      ) : (
        <AllProductsSection
          appliedFilterOptions={appliedFilterOptions}
          sortOption={sortOption}
          searchTerm={searchTerm}
          adminUserId={adminUser?.user_id}
          wishlistItems={wishlistItems}
          cartItems={cartItems}
          itemtypeAndDesigns={itemtypeAndDesigns}
        />
      )}
    </>
  );
}

export default LandingPage;
