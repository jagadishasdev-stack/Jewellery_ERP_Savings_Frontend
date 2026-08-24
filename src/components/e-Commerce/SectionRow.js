import React from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import SectionHeading from "./ui/SectionHeading";
import ProductCardSkeleton from "./ui/ProductCardSkeleton";

/**
 * SectionRow — horizontal rail (Top Deals / Featured Products).
 * Same props: title, products, loading, onViewAll. Shows the first 6 as a
 * swipeable rail; "View all" appears when there are more than that. Renders
 * nothing once loaded with no products, so empty sections never show.
 * alwaysShowViewAll: show "View all" whenever the section has ANY items
 * (default off → keeps the >6 rule for the existing rails).
 */
function SectionRow({
  title,
  products,
  loading,
  onViewAll,
  hideHeading,
  alwaysShowViewAll = false,
}) {
  const navigate = useNavigate();
  const preview = products.slice(0, 6);

  // Hide the whole section when there's nothing to show (avoids empty blocks).
  if (!loading && preview.length === 0) return null;

  const showViewAll =
    !loading &&
    onViewAll &&
    (alwaysShowViewAll ? products.length > 0 : products.length > 6);

  return (
    <Box sx={{ mb: 1 }}>
      {/* hideHeading lets a parent render its own heading (e.g. the dashboard,
          which needs its heading style) while reusing this rail. */}
      {!hideHeading && (
        <SectionHeading
          title={title}
          onViewAll={showViewAll ? onViewAll : undefined}
        />
      )}

      {loading ? (
        <Box
          sx={{
            display: "flex",
            gap: 1.25,
            overflowX: "hidden",
            mx: -2,
            px: 2,
          }}
        >
          {[...Array(4)].map((_, i) => (
            <Box key={i} sx={{ width: 150, flexShrink: 0 }}>
              <ProductCardSkeleton />
            </Box>
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            gap: 1.25,
            overflowX: "auto",
            mx: -2,
            px: 2,
            pb: 0.5,
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {preview.map((product) => (
            <Box key={product.tagno} sx={{ width: 150, flexShrink: 0 }}>
              <ProductCard
                product={product}
                onClick={() =>
                  navigate("/e-com/product", { state: product })
                }
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default SectionRow;
