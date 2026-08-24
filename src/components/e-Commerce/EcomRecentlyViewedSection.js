import React from "react";
import { Box } from "@mui/material";
import SectionRow from "./SectionRow";
import DashboardSectionHeading from "./ui/DashboardSectionHeading";
import useRecentlyViewed from "./hooks/useRecentlyViewed";

// ─── EcomRecentlyViewedSection ────────────────────────────────────────────────
// Dashboard "Recently Viewed": dashboard-styled heading + the same product rail
// as the e-com landing page (reuses SectionRow's rail with its own heading
// hidden, so tap-to-open-product behaviour is identical). Backed by the
// server-side recently-viewed list (this user's product views in the last 24h,
// via useRecentlyViewed). Renders nothing when the list is empty.
const EcomRecentlyViewedSection = () => {
  const recentlyViewed = useRecentlyViewed();
  if (!recentlyViewed.length) return null;

  return (
    <Box sx={{ width: "100%", mt: 1.5 }}>
      <DashboardSectionHeading title="Recently Viewed" />
      <SectionRow products={recentlyViewed} loading={false} hideHeading />
    </Box>
  );
};

export default EcomRecentlyViewedSection;
