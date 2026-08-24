import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../contexts/StoreContext";
import CategoryCarousel from "./CategoryCarousel";
import CategoryChips from "./CategoryChips";
import CategoryCarouselSkeleton from "./ui/CategoryCarouselSkeleton";
import SectionHeading from "./ui/SectionHeading";
import { useEcomCategories } from "./hooks/useEcomCategories";
import { Box } from "@mui/material";

// ─── EcomCategoriesSection ───────────────────────────────────────────────────
// Drop-in wrapper around CategoryCarousel for use OUTSIDE the e-commerce
// module (e.g. the app Dashboard). Strictly gated by `isEcomEnable`:
// when disabled, this renders nothing and never fetches — the fetch itself
// lives in useEcomCategories(enabled) and only fires when enabled is true.
const EcomCategoriesSection = ({ title = "Shop by Category" }) => {
  const { isEcomEnable } = useContext(StoreContext);
  const navigate = useNavigate();
  const { categories, loading } = useEcomCategories(isEcomEnable);

  if (!isEcomEnable) return null;
  // Skeleton while the (slower) category API loads — keeps the same footprint
  // so the dashboard doesn't jump when the real categories arrive.
  if (loading) return <CategoryCarouselSkeleton title={title} />;
  if (categories.length === 0) return null;

  const handleCategoryClick = (category) => {
    // Land on the unfiltered e-com home first, then push the filtered view, so
    // pressing Back from the products returns to the Landing Page (not here).
    navigate("/e-com/categories");
    navigate("/e-com/categories", { state: { presetCategory: category } });
  };

  // Image tiles only when EVERY category has an image; otherwise name chips.
  const allImagesAvailable = categories.every(
    (c) => c.image && c.image.trim() !== "",
  );

  if (!allImagesAvailable) {
    return (
      <Box sx={{ mt: 2 }}>
        <SectionHeading title={title} />
        <CategoryChips
          categories={categories}
          onCategoryClick={handleCategoryClick}
        />
      </Box>
    );
  }

  return (
    <CategoryCarousel
      categories={categories}
      onCategoryClick={handleCategoryClick}
      title={title}
    />
  );
};

export default EcomCategoriesSection;
