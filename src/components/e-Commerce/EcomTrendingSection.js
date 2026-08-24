import React, { useContext, useEffect, useState } from "react";
import { Box, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { StoreContext } from "../../contexts/StoreContext";
import { AuthContext } from "../../contexts/AuthContext";
import APP_CONFIG from "../../config/constants";
import ProductCard from "./ProductCard";
import DashboardSectionHeading from "./ui/DashboardSectionHeading";
import { mapStockToProduct } from "./mapStockToProduct";
import EcomTopDealsSection from "./EcomTopDealsSection";

// ─── EcomTrendingSection ──────────────────────────────────────────────────────
// Dashboard "Trending": the most-engaged in-stock items (wishlist + cart adds,
// ranked server-side via /stocks/trending), rendered with the same ProductCard
// UI as Top Deals (2 per row). When there is no trending data yet, it falls back
// to <EcomTopDealsSection/> so the dashboard slot is never empty. Same flow as
// Top Deals: tapping a card opens the product; "View all" opens the categories
// page. Renders nothing while loading or when e-com is disabled.
const EcomTrendingSection = () => {
  const { isEcomEnable } = useContext(StoreContext);
  const { adminUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isEcomEnable) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/e-com/stocks/trending`,
          {
            params: {
              store_id: APP_CONFIG.STORE_ID,
              branch_id: APP_CONFIG.BRANCH,
              user_id: adminUser?.user_id,
              is_alpha: APP_CONFIG.IS_ALPHA,
              limit: 2,
            },
          },
        );
        const mapped = (res.data?.data || []).map(mapStockToProduct).slice(0, 2);
        if (!cancelled) setItems(mapped);
      } catch (e) {
        console.error("Trending fetch failed:", e);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEcomEnable, adminUser?.user_id]);

  if (!isEcomEnable) return null;
  // No trending data → show Top Deals instead (same dashboard slot).
  if (loaded && items.length === 0) return <EcomTopDealsSection />;
  if (items.length === 0) return null; // still loading

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <DashboardSectionHeading
        title="Trending"
        onViewAll={() => navigate("/e-com/categories")}
      />
      <Grid container spacing={1.5}>
        {items.map((product) => (
          <Grid item xs={6} key={product.tagno}>
            <ProductCard
              product={product}
              onClick={() => navigate("/e-com/product", { state: product })}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default EcomTrendingSection;
