import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useContext,
  useRef,
} from "react";
import { Box, InputAdornment, TextField, Typography } from "@mui/material";
import axios from "axios";
import { Capacitor } from "@capacitor/core";
import { useSafeAreaTop } from "../../SafeAreaFile";
import { useLocation, useNavigate } from "react-router-dom";
import SectionRow from "./SectionRow";
import FullSectionPage from "./FullSectionPage";
import AllProductsSection from "./AllProductsSection";
import CategoryCarousel from "./CategoryCarousel";
import BannerCarousel from "./BannerCarousel";
import EcomFilterSheet from "./EcomFilterSheet";
import FloatingCartButton from "./FloatingCartButton";
import SectionHeading from "./ui/SectionHeading";
import ImagePlaceholder from "./ui/ImagePlaceholder";
import useRecentlyViewed from "./hooks/useRecentlyViewed";
import { useFilterMeta } from "./hooks/useFilterMeta";

import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import APP_CONFIG from "../../config/constants";
import { AuthContext } from "../../contexts/AuthContext";
import { EcomContext } from "../../contexts/EcomContext";
import {
  GOLD,
  INK,
  MUTED,
  LINE,
  IMG_BG,
  SURFACE_ALT,
  RADIUS,
  SHADOW,
  productTitle,
} from "./ui/ecomTokens";

// ─── View states ─────────────────────────────────────────────────────────────
const VIEWS = {
  HOME: "home",
  NEW_ARRIVALS: "newArrivals",
  TOP_DEALS: "topDeals",
};

// ─── Main LandingPage ────────────────────────────────────────────────────────
function LandingPage() {
  const { adminUser } = useContext(AuthContext);
  const { wishlistItems, cartItems } = useContext(EcomContext);
  const location = useLocation();
  const navigate = useNavigate();
  const recentlyViewed = useRecentlyViewed();
  const { metals: filterMetals, purities: filterPurities } = useFilterMeta(true);
  const productsRef = useRef(null);

  // Fixed top bar (search + filter + categories). We pin it just below the
  // app header (which the app offsets content by: safe-area-top + 56px) using
  // position:fixed — reliable in a normal browser AND the device WebView,
  // unlike position:sticky which needs the app's scroll container to have a
  // definite height. A ResizeObserver measures the bar so a spacer of the same
  // height keeps the page content from hiding underneath it.
  const topInset = useSafeAreaTop();
  const isIOS = Capacitor.getPlatform() === "ios";
  const headerBarRef = useRef(null);
  const [headerBarH, setHeaderBarH] = useState(0);

  useLayoutEffect(() => {
    const el = headerBarRef.current;
    if (!el) return;
    const measure = () => setHeaderBarH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const barTop = isIOS
    ? "calc(var(--safe-area-top) + 56px)"
    : `calc(${topInset} + 56px)`;

  const [activeView, setActiveView] = useState(VIEWS.HOME);

  const [showFilterScreen, setShowFilterScreen] = useState(false);
  const [appliedFilterOptions, setAppliedFilterOptions] = useState({});
  const [sortOption, setSortOption] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Debounce the search box (~250ms) so filtering doesn't re-run on every
  // keystroke — the filtered result is identical, it just recomputes less often.
  useEffect(() => {
    const id = setTimeout(() => setSearchTerm(searchInput), 250);
    return () => clearTimeout(id);
  }, [searchInput]);

  // ── First-page stock (used for Featured + Top Deals sections) ─────────────
  const [stockProducts, setStockProducts] = useState([]);
  const [loadingStock, setLoadingStock] = useState(true);
  const [stockError, setStockError] = useState(null);

  // ── Filter metadata ───────────────────────────────────────────────────────
  const [itemtypeAndDesigns, setItemtypeAndDesigns] = useState([]);

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

  // ── Carousel categories (items with images) — derived, not re-fetched ─────
  const carouselCategories = useMemo(
    () =>
      itemtypeAndDesigns.filter(
        (item) => item.image && item.image.trim() !== "",
      ),
    [itemtypeAndDesigns],
  );

  // ── Derive the category filter from navigation state on every navigation ──
  // Selecting a category is a real history entry (see handleCarouselCategoryClick),
  // so pressing Back returns to the unfiltered landing instead of leaving the
  // page. This effect mirrors the current entry's preset into the Category
  // filter (and clears it when Back lands on an entry without one).
  useEffect(() => {
    const next = location.state?.presetCategory?.id != null
      ? [location.state.presetCategory.id]
      : [];
    setAppliedFilterOptions((prev) =>
      (prev.Category || []).join() === next.join()
        ? prev
        : { ...prev, Category: next },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key]);

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
            // Names resolved dynamically by the backend (no hardcoded maps)
            itemtype_name: item.itemtype_name ?? null,
            design_name: item.design_name ?? null,
            metaltype_name: item.metaltype_name ?? null,
            purity_name: item.purity_name ?? null,
            productType: item.metaltype_name ?? item.itemtype_name ?? null,
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
    const isSelected = (appliedFilterOptions["Category"] || []).includes(
      category.id,
    );
    // Tapping the active category deselects it by stepping back to the
    // unfiltered entry; tapping a new one pushes a history entry so Back
    // returns here (the filter is applied by the location.key effect above).
    if (isSelected) {
      navigate(-1);
    } else {
      navigate("/e-com/categories", { state: { presetCategory: category } });
    }
  };

  // ── Filter helpers ────────────────────────────────────────────────────────
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

      if (appliedFilterOptions["Category"]?.length > 0) {
        if (!appliedFilterOptions["Category"].includes(product.itemtype))
          return false;
      }

      if (appliedFilterOptions["Design"]?.length > 0) {
        if (!appliedFilterOptions["Design"].includes(product.design))
          return false;
      }

      // Purity / Metal selections are the real DB IDs (Purity_id / metal_id)
      if (appliedFilterOptions["Purity"]?.length > 0) {
        if (!appliedFilterOptions["Purity"].includes(product.purity))
          return false;
      }

      if (appliedFilterOptions["Metal"]?.length > 0) {
        if (!appliedFilterOptions["Metal"].includes(product.metaltype))
          return false;
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

  // "Featured Products" — recent stock (unchanged data, just relabelled).
  const featuredProducts = sortProducts(
    filterProducts(stockProducts).filter((p) => {
      if (!p.entrydate) return false;
      return new Date(p.entrydate) >= tenDaysAgo;
    }),
  );

  // "Top Deals" — a display-only view of the SAME already-fetched stock,
  // ordered by biggest saving (MRP − selling price). No new API / no data
  // change; purely a presentational slice.
  const topDealsProducts = useMemo(
    () =>
      stockProducts
        .filter((p) => p.actualPrice > p.currentPrice)
        .slice()
        .sort(
          (a, b) =>
            b.actualPrice - b.currentPrice - (a.actualPrice - a.currentPrice),
        )
        .slice(0, 12),
    [stockProducts],
  );

  const filteredTopDeals = sortProducts(filterProducts(topDealsProducts));

  const activeFilterCount = Object.values(appliedFilterOptions).reduce(
    (n, opts) => n + (opts?.length || 0),
    0,
  );

  // ── Render: Full section views ────────────────────────────────────────────
  if (activeView === VIEWS.NEW_ARRIVALS)
    return (
      <FullSectionPage
        title="Featured Products"
        products={featuredProducts}
        loading={loadingStock}
        onBack={() => setActiveView(VIEWS.HOME)}
      />
    );

  if (activeView === VIEWS.TOP_DEALS)
    return (
      <FullSectionPage
        title="Top Deals"
        products={filteredTopDeals}
        loading={loadingStock}
        onBack={() => setActiveView(VIEWS.HOME)}
      />
    );

  // ── Render: Home ──────────────────────────────────────────────────────────
  return (
    <Box sx={{ pb: 4 }}>
      {/* ── Fixed header: Search + Filter + Categories (stays put while the
          product list scrolls beneath it, in browser and on device) ─────── */}
      <Box
        ref={headerBarRef}
        sx={{
          position: "fixed",
          top: barTop,
          left: 0,
          right: 0,
          zIndex: 1000, // above scrolling content, below the app header (2000) & drawers (1300+)
          bgcolor: "#fff",
          px: 2,
          pt: 1.5,
          pb: 1,
          boxShadow: "0 6px 14px -8px rgba(24,20,12,0.18)",
        }}
      >
        {/* Search + single Filter (sort lives inside the filter drawer) */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            placeholder="Search jewellery…"
            variant="outlined"
            fullWidth
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon sx={{ fontSize: 21, color: GOLD }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: RADIUS.pill,
                backgroundColor: SURFACE_ALT,
                "& fieldset": { border: `1px solid ${LINE}` },
                "&:hover fieldset": { border: `1px solid ${LINE}` },
                "&.Mui-focused fieldset": { border: `1px solid ${GOLD}` },
              },
              "& input": { padding: "11px 14px 11px 0", fontSize: 14 },
            }}
          />

          {/* Filter (opens Filter & Sort drawer) */}
          <Box
            onClick={() => setShowFilterScreen(true)}
            sx={{
              position: "relative",
              width: 46,
              height: 46,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              bgcolor:
                activeFilterCount > 0 || sortOption
                  ? "rgba(185,138,70,0.10)"
                  : SURFACE_ALT,
              border: `1px solid ${
                activeFilterCount > 0 || sortOption ? GOLD : LINE
              }`,
              cursor: "pointer",
            }}
          >
            <TuneRoundedIcon sx={{ fontSize: 21, color: GOLD }} />
            {activeFilterCount > 0 && (
              <Box
                sx={{
                  position: "absolute",
                  top: -3,
                  right: -3,
                  minWidth: 18,
                  height: 18,
                  px: 0.4,
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
                {activeFilterCount}
              </Box>
            )}
          </Box>
        </Box>

        {/* Categories — part of the fixed header (hidden while filtering) */}
        {!isFilterOrSearchActive && carouselCategories.length > 0 && (
          <CategoryCarousel
            categories={carouselCategories}
            onCategoryClick={handleCarouselCategoryClick}
          />
        )}
      </Box>

      {/* Spacer that reserves the fixed header's height so content sits below it */}
      <Box sx={{ height: headerBarH }} />

      {/* Applied filter chips */}
      {activeFilterCount > 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            mt: 1.5,
            mb: 1.5,
            overflowX: "auto",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {Object.entries(appliedFilterOptions).map(([filterName, options]) =>
            options.map((option, idx) => {
              let displayLabel = option;
              if (filterName === "Category") {
                const found = itemtypeAndDesigns.find((c) => c.id === option);
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
              if (filterName === "Metal") {
                const m = filterMetals.find((x) => x.id === option);
                displayLabel = m ? m.name : option;
              }
              if (filterName === "Purity") {
                const p = filterPurities.find((x) => x.id === option);
                displayLabel = p ? p.name : option;
              }
              return (
                <Box
                  key={`${filterName}-${idx}`}
                  onClick={() => handleRemoveFilterOption(filterName, option)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.4,
                    height: 32,
                    px: 1.4,
                    borderRadius: RADIUS.pill,
                    bgcolor: "rgba(185,138,70,0.10)",
                    border: `1px solid ${GOLD}`,
                    color: GOLD,
                    fontSize: 12.5,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    cursor: "pointer",
                  }}
                >
                  {filterName === "Price Range" && "₹"}
                  {displayLabel}
                  {filterName === "Weight" && "g"}
                  <CloseRoundedIcon sx={{ fontSize: 15 }} />
                </Box>
              );
            }),
          )}
        </Box>
      )}

      {/* Banner → Recently Viewed → Top Deals → Featured —
          hidden when actively filtering/searching so results stay focused */}
      {!isFilterOrSearchActive && (
        <>
          {/* Promotional banner slider */}
          <BannerCarousel />

          {/* Recently viewed (localStorage-backed) */}
          {recentlyViewed.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <SectionHeading title="Recently Viewed" />
              <Box
                sx={{
                  display: "flex",
                  gap: 1.25,
                  overflowX: "auto",
                  pb: 0.5,
                  mx: -2,
                  px: 2,
                  "&::-webkit-scrollbar": { display: "none" },
                }}
              >
                {recentlyViewed.map((product) => (
                  <Box
                    key={product.tagno}
                    onClick={() =>
                      navigate("/e-com/product", { state: product })
                    }
                    sx={{ width: 132, flexShrink: 0, cursor: "pointer" }}
                  >
                    <Box
                      sx={{
                        width: "80%",
                        height: 100.5,
                        borderRadius: RADIUS.card,
                        overflow: "hidden",
                        bgcolor: IMG_BG,
                        boxShadow: SHADOW.sm,
                        mb: 0.75,
                      }}
                    >
                      {product.images?.[0] ? (
                        <Box
                          component="img"
                          src={product.images[0]}
                          alt={productTitle(product)}
                          loading="lazy"
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <ImagePlaceholder iconSize={26} showLabel={false} />
                      )}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: INK,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {productTitle(product)}
                    </Typography>
                    <Typography
                      sx={{ fontSize: 12.5, fontWeight: 700, color: GOLD }}
                    >
                      ₹{Number(product.currentPrice || 0).toLocaleString("en-IN")}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          <Box sx={{ mt: 3 }}>
            <SectionRow
              title="Top Deals"
              products={filteredTopDeals}
              loading={loadingStock}
              onViewAll={() => setActiveView(VIEWS.TOP_DEALS)}
            />
          </Box>

          <Box sx={{ mt: 1 }}>
            <SectionRow
              title="Featured Products"
              products={featuredProducts}
              loading={loadingStock}
              onViewAll={() => setActiveView(VIEWS.NEW_ARRIVALS)}
            />
          </Box>
        </>
      )}

      {/* All Products with infinite scroll */}
      <Box ref={productsRef} sx={{ mt: 3 }}>
        {stockError ? (
          <Typography
            sx={{ fontSize: 15, color: MUTED, textAlign: "center", mt: 1.5 }}
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
      </Box>

      {/* Filter & Sort bottom sheet (sort now lives inside the drawer) */}
      <EcomFilterSheet
        open={showFilterScreen}
        onApplyFilters={(filters) => setAppliedFilterOptions(filters)}
        defaultSelectedFilters={appliedFilterOptions}
        sortOption={sortOption}
        onApplySort={(option) => setSortOption(option)}
        onClose={() => setShowFilterScreen(false)}
        metals={filterMetals}
        purities={filterPurities}
      />

      {/* Floating cart shortcut */}
      <FloatingCartButton />
    </Box>
  );
}

export default LandingPage;
