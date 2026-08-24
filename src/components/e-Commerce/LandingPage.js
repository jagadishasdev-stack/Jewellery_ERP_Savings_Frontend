import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useContext,
  useRef,
} from "react";
import { Box, InputAdornment, TextField, Typography } from "@mui/material";
import { keyframes } from "@emotion/react";
import axios from "axios";
import { Capacitor } from "@capacitor/core";
import { useSafeAreaTop } from "../../SafeAreaFile";
import { useLocation, useNavigate } from "react-router-dom";
import { ScrollContainerContext } from "../../utils/ScrollToTop";
import SectionRow from "./SectionRow";
import FullSectionPage from "./FullSectionPage";
import AllProductsSection from "./AllProductsSection";
import CategoryCarousel from "./CategoryCarousel";
import CategoryChips from "./CategoryChips";
import CategoryCarouselSkeleton from "./ui/CategoryCarouselSkeleton";
import BannerCarousel from "./BannerCarousel";
import EcomFilterSheet from "./EcomFilterSheet";
import FloatingCartButton from "./FloatingCartButton";
import SectionHeading from "./ui/SectionHeading";
import ImagePlaceholder from "./ui/ImagePlaceholder";
import useRecentlyViewed from "./hooks/useRecentlyViewed";
import mapStockItem from "./utils/mapStockItem";
import { useFilterMeta } from "./hooks/useFilterMeta";
import useEcomScrollTop from "./hooks/useEcomScrollTop";

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

// Soft fade + slide used when the category row switches between image tiles
// and name chips, so the change feels smooth instead of a sudden pop.
const catSwap = keyframes`
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ─── View states ─────────────────────────────────────────────────────────────
const VIEWS = {
  HOME: "home",
  NEW_ARRIVALS: "newArrivals",
  TOP_DEALS: "topDeals",
  TRENDING: "trending",
};

// ─── Main LandingPage ────────────────────────────────────────────────────────
// Session cache for the (rarely-changing) itemtype+designs metadata, so the
// landing page doesn't refetch it on every remount. Same data, fewer requests.
let itemtypeDesignsCache = null;

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
  const [headerBarH, setHeaderBarH] = useState(0);
  const headerRoRef = useRef(null);

  // Callback ref (not a one-time effect): the fixed header UNmounts while a
  // full-section view — "View all" for Trending / Top Deals / New Arrivals —
  // is open, then REmounts on return. A []-effect would keep observing the old
  // (detached) node and never re-measure the new one, leaving a stale spacer
  // height so the banner slid up under the category row. A callback ref
  // re-measures + re-observes every time the header (re)mounts, and disconnects
  // when it unmounts.
  const headerBarRef = useCallback((el) => {
    if (headerRoRef.current) {
      headerRoRef.current.disconnect();
      headerRoRef.current = null;
    }
    if (!el) return;
    const measure = () => setHeaderBarH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    headerRoRef.current = ro;
  }, []);

  const barTop = isIOS
    ? "calc(var(--safe-area-top) + 56px)"
    : `calc(${topInset} + 56px)`;

  // Collapse the category row from image tiles → name chips once the user
  // scrolls down, and restore it near the top. Driven by the app's scroll
  // container (same one ScrollToTop uses); hysteresis avoids flicker at the
  // threshold. Functional setState bails when unchanged → no extra re-renders.
  const scrollRef = useContext(ScrollContainerContext);
  const [catsCollapsed, setCatsCollapsed] = useState(false);
  useEffect(() => {
    const mainEl = scrollRef?.current;
    const rootEl = document.getElementById("root");
    // The real scroll container here is #root (html/body are overflow:hidden;
    // position:fixed — see index.css), NOT the window or <main>. `scroll`
    // events don't bubble, but they DO fire in the capture phase on document,
    // so one capture listener catches scrolling from ANY element. We read the
    // position from the element that actually scrolled (e.target) and also take
    // the max across the known candidates, so this is container-agnostic.
    const readY = () => {
      const vals = [
        rootEl?.scrollTop,
        mainEl?.scrollTop,
        window.scrollY,
        document.documentElement?.scrollTop,
        document.body?.scrollTop,
      ].filter((v) => typeof v === "number" && !Number.isNaN(v));
      return vals.length ? Math.max(...vals) : 0;
    };
    const onScroll = (e) => {
      const t = e && e.target;
      const targetY = t && t.nodeType === 1 ? t.scrollTop || 0 : 0;
      const y = Math.max(targetY, readY());
      setCatsCollapsed((prev) => {
        if (!prev && y > 70) return true;
        if (prev && y < 20) return false;
        return prev;
      });
    };
    onScroll();
    document.addEventListener("scroll", onScroll, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      document.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
    };
  }, [scrollRef]);

  // Section "View all" pages (Top Deals / New Arrivals / Trending) are driven
  // by navigation state — like the category preset — so the app header shows
  // the section title and its single back button returns to the landing home
  // in one step. No separate in-page header/back button.
  const activeView = location.state?.section || VIEWS.HOME;
  const openSection = (section, title) =>
    navigate("/e-com/categories", { state: { section, sectionTitle: title } });

  // Start each ecommerce view from the top on every navigation — including the
  // section "View all" pages and category selection, which re-navigate to the
  // same /e-com/categories path that the pathname-keyed global ScrollToTop
  // skips. Scoped to ecommerce; the shared saving-app scroll logic is untouched.
  useEcomScrollTop(location.key);

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
  const [loadingCategories, setLoadingCategories] = useState(true);

  // ── Fetch itemtype + designs for filter (cached across remounts) ──────────
  useEffect(() => {
    // Serve from the session cache immediately when present — avoids the repeat
    // request (and category skeleton) on every landing remount. Same data.
    if (itemtypeDesignsCache) {
      setItemtypeAndDesigns(itemtypeDesignsCache);
      setLoadingCategories(false);
      return;
    }
    const fetchItemtypeAndDesigns = async () => {
      try {
        setLoadingCategories(true);
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
        const data = response.data?.data || [];
        itemtypeDesignsCache = data;
        setItemtypeAndDesigns(data);
      } catch (err) {
        console.error("Failed to fetch itemtype and designs:", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchItemtypeAndDesigns();
  }, []);

  // ── Carousel categories — derived, not re-fetched ─────────────────────────
  // All named item types are shown. The image-tile carousel is used ONLY when
  // EVERY category has an image; if even one is missing, the name-chips UI
  // (same as the scrolled state) is shown instead — no broken/empty tiles.
  const carouselCategories = useMemo(
    () => itemtypeAndDesigns.filter((item) => item.name),
    [itemtypeAndDesigns],
  );
  const allCategoryImagesAvailable = useMemo(
    () =>
      carouselCategories.length > 0 &&
      carouselCategories.every(
        (item) => item.image && item.image.trim() !== "",
      ),
    [carouselCategories],
  );

  // ── Derive the category filter from navigation state on every navigation ──
  // Selecting a category is a real history entry (see handleCarouselCategoryClick),
  // so pressing Back returns to the unfiltered landing instead of leaving the
  // page. This effect mirrors the current entry's preset into the Category
  // filter (and clears it when Back lands on an entry without one).
  useEffect(() => {
    // Category filter value = the BUSINESS id (itemtype_id) — stocks reference
    // it via stocks.itemtype. The row `id` is just an auto-increment record no.
    const preset = location.state?.presetCategory;
    const presetId = preset?.itemtype_id ?? preset?.id;
    const next = presetId != null ? [presetId] : [];
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
            is_alpha: APP_CONFIG.IS_ALPHA,
          },
        });

        const allowedFlags = ["F", "N", "E"];
        const mapped = (response.data?.data || [])
          .filter((item) => allowedFlags.includes(item.flag))
          .map(mapStockItem);

        // De-duplicate by tagno so Featured / Top Deals / section rows never
        // render duplicate React keys if the source data repeats a tag.
        const seenTags = new Set();
        const uniqueMapped = mapped.filter((p) => {
          if (seenTags.has(p.tagno)) return false;
          seenTags.add(p.tagno);
          return true;
        });
        setStockProducts(uniqueMapped);
      } catch (err) {
        console.error("Failed to fetch stock:", err);
        setStockError("Failed to load products. Please try again.");
      } finally {
        setLoadingStock(false);
      }
    };

    fetchStock();
  }, [adminUser?.user_id]);

  // ── Fetch Trending (ranked server-side by cross-user wishlist + cart adds) ──
  // Separate from the paginated stock above so it reflects the WHOLE catalog's
  // engagement, not just the first page. Empty → the section auto-hides.
  const [trendingStock, setTrendingStock] = useState([]);
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const response = await axios.get(
          `${baseURL}/api/e-com/stocks/trending`,
          {
            params: {
              store_id: APP_CONFIG.STORE_ID,
              branch_id: APP_CONFIG.BRANCH,
              user_id: adminUser?.user_id,
              is_alpha: APP_CONFIG.IS_ALPHA,
              limit: 12,
            },
          },
        );
        const allowedFlags = ["F", "N", "E"];
        const seen = new Set();
        const mapped = (response.data?.data || [])
          .filter((item) => allowedFlags.includes(item.flag))
          .map(mapStockItem)
          .filter((p) => {
            if (seen.has(p.tagno)) return false;
            seen.add(p.tagno);
            return true;
          });
        setTrendingStock(mapped);
      } catch (err) {
        console.error("Failed to fetch trending:", err);
      }
    };
    fetchTrending();
  }, [adminUser?.user_id]);

  // ── Fetch New Arrivals (newest first by entrydate, whole catalog) ──────────
  const [newArrivalsStock, setNewArrivalsStock] = useState([]);
  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const response = await axios.get(
          `${baseURL}/api/e-com/stocks/new-arrivals`,
          {
            params: {
              store_id: APP_CONFIG.STORE_ID,
              branch_id: APP_CONFIG.BRANCH,
              user_id: adminUser?.user_id,
              is_alpha: APP_CONFIG.IS_ALPHA,
              limit: 12,
            },
          },
        );
        const allowedFlags = ["F", "N", "E"];
        const seen = new Set();
        const mapped = (response.data?.data || [])
          .filter((item) => allowedFlags.includes(item.flag))
          .map(mapStockItem)
          .filter((p) => {
            if (seen.has(p.tagno)) return false;
            seen.add(p.tagno);
            return true;
          });
        setNewArrivalsStock(mapped);
      } catch (err) {
        console.error("Failed to fetch new arrivals:", err);
      }
    };
    fetchNewArrivals();
  }, [adminUser?.user_id]);

  // ── Sync wishlist / cart into section-row products ────────────────────────
  // O(1) Set lookups, and return the SAME array when nothing actually changed
  // so an unrelated wishlist/cart update no longer re-renders every card.
  useEffect(() => {
    const wl = new Set(wishlistItems.map((w) => w.tagno));
    const ct = new Set(cartItems.map((c) => c.tagno));
    setStockProducts((prev) => {
      let changed = false;
      const next = prev.map((product) => {
        const isW = wl.has(product.tagno);
        const isC = ct.has(product.tagno);
        if (isW === product.is_wishlisted && isC === product.is_in_cart) {
          return product;
        }
        changed = true;
        return { ...product, is_wishlisted: isW, is_in_cart: isC };
      });
      return changed ? next : prev;
    });
  }, [wishlistItems, cartItems]);

  // Keep the Trending & New Arrivals rails' wishlist/cart icons in sync with
  // user actions too (same O(1)-Set, bail-when-unchanged approach as above).
  useEffect(() => {
    const wl = new Set(wishlistItems.map((w) => w.tagno));
    const ct = new Set(cartItems.map((c) => c.tagno));
    const sync = (prev) => {
      let changed = false;
      const next = prev.map((product) => {
        const isW = wl.has(product.tagno);
        const isC = ct.has(product.tagno);
        if (isW === product.is_wishlisted && isC === product.is_in_cart) {
          return product;
        }
        changed = true;
        return { ...product, is_wishlisted: isW, is_in_cart: isC };
      });
      return changed ? next : prev;
    };
    setTrendingStock(sync);
    setNewArrivalsStock(sync);
  }, [wishlistItems, cartItems]);

  // ── Carousel category click → sets Category filter ────────────────────────
  const handleCarouselCategoryClick = (category) => {
    // Compare/store by itemtype_id (business id) — matches stocks.itemtype.
    const isSelected = (appliedFilterOptions["Category"] || []).includes(
      category.itemtype_id ?? category.id,
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
  // "New Arrivals" — newest stock first, ranked server-side by entrydate across
  // the whole catalog (see the /stocks/new-arrivals fetch above). Here we only
  // apply the active filter/sort so it behaves like the other section rows.
  const filteredNewArrivals = useMemo(
    () => sortProducts(filterProducts(newArrivalsStock)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [newArrivalsStock, appliedFilterOptions, sortOption],
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

  const filteredTopDeals = useMemo(
    () => sortProducts(filterProducts(topDealsProducts)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [topDealsProducts, appliedFilterOptions, sortOption],
  );

  // "Trending" — ranked server-side by real cross-user engagement (wishlist +
  // cart adds) across the whole catalog (see the /stocks/trending fetch above).
  // Here we only apply the active filter/sort so it behaves like the other rows.
  const filteredTrending = useMemo(
    () => sortProducts(filterProducts(trendingStock)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [trendingStock, appliedFilterOptions, sortOption],
  );

  const activeFilterCount = Object.values(appliedFilterOptions).reduce(
    (n, opts) => n + (opts?.length || 0),
    0,
  );

  // ── Render: Full section views ────────────────────────────────────────────
  if (activeView === VIEWS.NEW_ARRIVALS)
    return (
      <FullSectionPage products={filteredNewArrivals} loading={loadingStock} />
    );

  if (activeView === VIEWS.TOP_DEALS)
    return (
      <FullSectionPage products={filteredTopDeals} loading={loadingStock} />
    );

  if (activeView === VIEWS.TRENDING)
    return (
      <FullSectionPage products={filteredTrending} loading={loadingStock} />
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

        {/* Categories — part of the fixed header (hidden while filtering).
            Show a skeleton while the category API loads so the header keeps a
            stable height and doesn't jump when categories arrive. */}
        {!isFilterOrSearchActive &&
          (loadingCategories && carouselCategories.length === 0 ? (
            <CategoryCarouselSkeleton />
          ) : carouselCategories.length > 0 ? (
            // key remounts on state change so the fade/slide replays each swap.
            // Chips are used when scrolled OR when any category image is
            // missing (tiles only render with a complete image set).
            <Box
              key={
                catsCollapsed || !allCategoryImagesAvailable
                  ? "chips"
                  : "tiles"
              }
              sx={{ animation: `${catSwap} 0.28s ease` }}
            >
              {catsCollapsed || !allCategoryImagesAvailable ? (
                <CategoryChips
                  categories={carouselCategories}
                  activeId={appliedFilterOptions.Category?.[0]}
                  onCategoryClick={handleCarouselCategoryClick}
                />
              ) : (
                // Top state: image tiles with auto-slide (unchanged behaviour).
                <CategoryCarousel
                  categories={carouselCategories}
                  onCategoryClick={handleCarouselCategoryClick}
                />
              )}
            </Box>
          ) : null)}
      </Box>

      {/* Spacer that reserves the fixed header's height so content sits below
          it. Transition the height so the list eases when the category row
          collapses/expands instead of snapping. */}
      <Box sx={{ height: headerBarH, transition: "height 0.28s ease" }} />

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
                const found = itemtypeAndDesigns.find(
                  (c) => c.itemtype_id === option,
                );
                displayLabel = found ? found.name : option;
              }
              if (filterName === "Design") {
                let foundDesign = null;
                for (const cat of itemtypeAndDesigns) {
                  foundDesign = cat.designs?.find(
                    (d) => d.design_id === option,
                  );
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

          {/* Recently viewed (server-backed: this user's last-24h product views) */}
          {recentlyViewed.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <SectionHeading title="Recently Viewed" />
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
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
                    sx={{ width: 106, flexShrink: 0, cursor: "pointer" }}
                  >
                    <Box
                      sx={{
                        width: "100%",
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
              onViewAll={() => openSection(VIEWS.TOP_DEALS, "Top Deals")}
            />
          </Box>

          <Box sx={{ mt: 1 }}>
            <SectionRow
              title="New Arrivals"
              products={filteredNewArrivals}
              loading={loadingStock}
              onViewAll={() => openSection(VIEWS.NEW_ARRIVALS, "New Arrivals")}
              alwaysShowViewAll
            />
          </Box>

          <Box sx={{ mt: 1 }}>
            <SectionRow
              title="Trending"
              products={filteredTrending}
              loading={loadingStock}
              onViewAll={() => openSection(VIEWS.TRENDING, "Trending")}
              alwaysShowViewAll
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
