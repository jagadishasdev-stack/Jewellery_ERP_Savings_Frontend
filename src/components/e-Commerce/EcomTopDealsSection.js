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

// ─── EcomTopDealsSection ──────────────────────────────────────────────────────
// Dashboard "Top Deals": the two biggest-saving in-stock items, rendered with
// the same ProductCard UI as All Products (2 per row → fills the screen).
// Self-contained (fetches once); tapping a card / "View all" opens the same
// pages as the landing page. Renders nothing when there are no deals.
const EcomTopDealsSection = () => {
  const { isEcomEnable } = useContext(StoreContext);
  const { adminUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);

  useEffect(() => {
    if (!isEcomEnable) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/e-com/stocks`,
          {
            params: {
              store_id: APP_CONFIG.STORE_ID,
              branch_id: APP_CONFIG.BRANCH,
              user_id: adminUser?.user_id,
              is_alpha: APP_CONFIG.IS_ALPHA,
              page: 1,
              limit: 20,
            },
          },
        );
        // Same "Top Deals" rule as the landing page: has a discount, ordered
        // by biggest saving. Take the top 2 for the home preview.
        const top = (res.data?.data || [])
          .map(mapStockToProduct)
          .filter((p) => p.actualPrice > p.currentPrice)
          .sort(
            (a, b) =>
              b.actualPrice -
              b.currentPrice -
              (a.actualPrice - a.currentPrice),
          )
          .slice(0, 2);
        if (!cancelled) setDeals(top);
      } catch (e) {
        console.error("Top deals fetch failed:", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEcomEnable, adminUser?.user_id]);

  if (!isEcomEnable || deals.length === 0) return null;

  return (
    <Box sx={{ width: "100%", mt: 2 }}>
      <DashboardSectionHeading
        title="Top Deals"
        onViewAll={() => navigate("/e-com/categories")}
      />
      <Grid container spacing={1.5}>
        {deals.map((product) => (
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

export default EcomTopDealsSection;
