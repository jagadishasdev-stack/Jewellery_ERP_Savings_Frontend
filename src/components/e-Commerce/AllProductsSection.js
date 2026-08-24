import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Box, Typography, CircularProgress, Grid } from "@mui/material";
import axios from "axios";
import ProductsList from "./ProductsList";
import SectionHeading from "./ui/SectionHeading";
import ProductCardSkeleton from "./ui/ProductCardSkeleton";
import APP_CONFIG from "../../config/constants";
import { GOLD, MUTED } from "./ui/ecomTokens";

const PAGE_LIMIT = 20;

const sortOptionToParam = (option) => {
  switch (option) {
    case "Price : Low-High":
      return { sort_by: "price", sort_order: "asc" };
    case "Price : High-Low":
      return { sort_by: "price", sort_order: "desc" };
    case "Product A-Z":
      return { sort_by: "tagno", sort_order: "asc" };
    case "Product Z-A":
      return { sort_by: "tagno", sort_order: "desc" };
    default:
      return {};
  }
};

const mapItem = (item) => ({
  tagno: item.tagno,
  label: `Tag #${item.tagno}`,
  currentPrice: item.actual_price ?? 0,
  actualPrice: item.false_price ?? 0,
  images: item.images,
  stockLeft: item.pcs ?? 1,
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
});

const ALLOWED_FLAGS = ["F", "N", "E"];

function AllProductsSection({
  appliedFilterOptions,
  sortOption,
  searchTerm,
  adminUserId,
  wishlistItems,
  cartItems,
}) {
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  // ── Derived: are any filters / sort / search active? ─────────────────────
  const isFilterOrSortActive =
    searchTerm.trim().length > 0 ||
    sortOption !== "" ||
    Object.values(appliedFilterOptions).some((opts) => opts.length > 0);

  // ── Build params for /stocks/filter ──────────────────────────────────────
  const buildFilterParams = useCallback(
    (page) => {
      const { sort_by, sort_order } = sortOptionToParam(sortOption);

      // Metal/Purity selections are already the real DB IDs (metal_id /
      // Purity_id) coming from the dynamic filter meta — send them directly.
      const metaltypeIds = appliedFilterOptions["Metal"]
        ?.filter((v) => v !== null && v !== undefined)
        .join(",");

      const purityVals = appliedFilterOptions["Purity"]
        ?.filter((v) => v !== null && v !== undefined)
        .join(",");

      const priceOpts = appliedFilterOptions["Price Range"] ?? [];
      const weightOpts = appliedFilterOptions["Weight"] ?? [];

      return {
        store_id: APP_CONFIG.STORE_ID,
        branch_id: APP_CONFIG.BRANCH,
        user_id: adminUserId,
        is_alpha: APP_CONFIG.IS_ALPHA,
        page,
        limit: PAGE_LIMIT,
        // sort
        ...(sort_by && { sort_by }),
        ...(sort_order && { sort_order }),
        // filters — only send when values exist
        ...(appliedFilterOptions["Category"]?.length && {
          itemtype: appliedFilterOptions["Category"].join(","),
        }),
        ...(appliedFilterOptions["Design"]?.length && {
          design: appliedFilterOptions["Design"].join(","),
        }),
        ...(metaltypeIds && { metaltype: metaltypeIds }),
        ...(purityVals && { purity: purityVals }),
        ...(priceOpts.length && {
          price_min: Math.min(...priceOpts),
          price_max: Math.max(...priceOpts),
        }),
        ...(weightOpts.length && {
          netwt_min: Math.min(...weightOpts),
          netwt_max: Math.max(...weightOpts),
        }),
        // Relevance search across tagno + item name + design name (backend-ranked)
        ...(searchTerm.trim() && { search: searchTerm.trim() }),
      };
    },
    [appliedFilterOptions, sortOption, adminUserId, searchTerm],
  );

  // ── Fetch a single page ───────────────────────────────────────────────────
  const fetchPage = useCallback(
    async (page) => {
      try {
        setLoadingMore(true);
        setError(null);

        const baseURL = process.env.REACT_APP_API_BASE_URL;

        let raw = [];
        let responseTotalPages = 1;

        if (isFilterOrSortActive) {
          // ── Filtered / sorted endpoint ──────────────────────────────────
          const response = await axios.get(
            `${baseURL}/api/e-com/stocks/filter`,
            { params: buildFilterParams(page) },
          );
          raw = response.data?.data ?? [];
          responseTotalPages = response.data?.totalPages ?? 1;
        } else {
          // ── Default unfiltered infinite scroll ──────────────────────────
          const response = await axios.get(`${baseURL}/api/e-com/stocks`, {
            params: {
              store_id: APP_CONFIG.STORE_ID,
              branch_id: APP_CONFIG.BRANCH,
              page,
              limit: PAGE_LIMIT,
              user_id: adminUserId,
              is_alpha: APP_CONFIG.IS_ALPHA,
            },
          });
          raw = response.data?.data ?? [];
          responseTotalPages = response.data?.totalPages ?? 1;
        }

        const mapped = raw
          .filter((item) => ALLOWED_FLAGS.includes(item.flag))
          .map(mapItem);

        setTotalPages(responseTotalPages);
        setPages((prev) => [...prev, mapped]);
        setCurrentPage(page);
      } catch (err) {
        console.error("AllProductsSection fetch error:", err);
        setError("Failed to load products.");
      } finally {
        setLoadingMore(false);
      }
    },
    [isFilterOrSortActive, buildFilterParams, adminUserId],
  );

  // ── Reset + refetch whenever filters, sort, or search change ─────────────
  // This is the critical fix: stale pages from the previous query are wiped
  // before page 1 of the new query is fetched.
  useEffect(() => {
    setPages([]);
    setCurrentPage(1);
    setTotalPages(null);
    fetchPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilterOptions, sortOption, searchTerm, adminUserId]);

  // ── IntersectionObserver ─────────────────────────────────────────────────
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loadingMore &&
          (totalPages === null || currentPage < totalPages)
        ) {
          fetchPage(currentPage + 1);
        }
      },
      { threshold: 0.1 },
    );

    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [loadingMore, currentPage, totalPages, fetchPage]);

  // ── Sync wishlist / cart into already-fetched pages ──────────────────────
  // De-duplicate by tagno: paginated pages can occasionally overlap (or a page
  // gets appended twice), which would otherwise render duplicate React keys.
  // Memoized so the grid only recomputes when pages/wishlist/cart actually
  // change (not on every render), and O(1) membership via Sets instead of a
  // per-product .some() scan. Same output — keeps ProductCard's React.memo alive.
  const allProducts = useMemo(() => {
    const wishSet = new Set(wishlistItems.map((w) => w.tagno));
    const cartSet = new Set(cartItems.map((c) => c.tagno));
    const seenTagnos = new Set();
    return pages.flat().reduce((acc, product) => {
      if (seenTagnos.has(product.tagno)) return acc;
      seenTagnos.add(product.tagno);
      acc.push({
        ...product,
        is_wishlisted: wishSet.has(product.tagno),
        is_in_cart: cartSet.has(product.tagno),
      });
      return acc;
    }, []);
  }, [pages, wishlistItems, cartItems]);

  const hasMore = totalPages === null || currentPage < totalPages;

  const showInitialSkeleton = loadingMore && allProducts.length === 0;

  return (
    <Box>
      <SectionHeading title="All Products" />

      {showInitialSkeleton ? (
        <Grid container spacing={1.5}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={6} sm={4} key={i}>
              <ProductCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : allProducts.length === 0 && !loadingMore ? (
        <Typography
          sx={{ fontSize: 14, color: MUTED, textAlign: "center", py: 3 }}
        >
          No products found
        </Typography>
      ) : (
        <ProductsList allProducts={allProducts} />
      )}

      <Box ref={sentinelRef} sx={{ height: 40, mt: 1 }}>
        {loadingMore && allProducts.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress size={24} sx={{ color: GOLD }} />
          </Box>
        )}
        {!hasMore && allProducts.length > 0 && (
          <Typography
            sx={{ textAlign: "center", fontSize: 13, color: MUTED, py: 2 }}
          >
            You've seen it all ✨
          </Typography>
        )}
        {error && (
          <Typography
            sx={{ textAlign: "center", fontSize: 13, color: "error.main", py: 2 }}
          >
            {error}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default AllProductsSection;
