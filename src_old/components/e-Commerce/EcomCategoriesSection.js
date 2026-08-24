import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../../contexts/StoreContext";
import CategoryCarousel from "./CategoryCarousel";
import { useEcomCategories } from "./hooks/useEcomCategories";

// ─── EcomCategoriesSection ───────────────────────────────────────────────────
// Drop-in wrapper around CategoryCarousel for use OUTSIDE the e-commerce
// module (e.g. the app Dashboard). Strictly gated by `isEcomEnable`:
// when disabled, this renders nothing and never fetches — the fetch itself
// lives in useEcomCategories(enabled) and only fires when enabled is true.
const EcomCategoriesSection = ({ title = "Shop by Category" }) => {
  const { isEcomEnable } = useContext(StoreContext);
  const navigate = useNavigate();
  const { categories } = useEcomCategories(isEcomEnable);

  if (!isEcomEnable || categories.length === 0) return null;

  const handleCategoryClick = (category) => {
    // Land on the unfiltered e-com home first, then push the filtered view, so
    // pressing Back from the products returns to the Landing Page (not here).
    navigate("/e-com/categories");
    navigate("/e-com/categories", { state: { presetCategory: category } });
  };

  return (
    <CategoryCarousel
      categories={categories}
      onCategoryClick={handleCategoryClick}
      title={title}
    />
  );
};

export default EcomCategoriesSection;
