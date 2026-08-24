import React, { useRef, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import SectionHeading from "./ui/SectionHeading";
import { INK, LINE, IMG_BG, RADIUS } from "./ui/ecomTokens";

// ─── CategoryCarousel ────────────────────────────────────────────────────────
// Continuously auto-scrolls AND lets the user swipe/scroll manually.
// A float position accumulator (posRef) is advanced every frame and written to
// the native scroller's scrollLeft — using a float avoids the browser flooring
// tiny sub-pixel increments to zero. Auto-scroll pauses only on real user
// interaction (touch / hover), then re-syncs to wherever the user left it and
// resumes. The duplicated list makes the loop seamless.
// Square-style image tiles (small, short) with the name below. `title` is
// optional (no heading on the home page; shown when passed).
const TILE_W = 80; // tile / image width
const IMG_H = 81; // image height (kept short)
const GAP = 14; // space between tiles
const STEP = TILE_W + GAP; // one card's advance distance
const SPEED = 0.6; // px per frame

const CategoryCarousel = React.memo(
  ({ categories, onCategoryClick, title }) => {
    const scrollerRef = useRef(null);
    const rafRef = useRef(null);
    const posRef = useRef(0);
    const pausedRef = useRef(false);
    const resumeTimerRef = useRef(null);

    // Duplicate the list so the loop wraps without a visible seam.
    const duplicatedCategories = categories?.length
      ? [...categories, ...categories]
      : [];

    useEffect(() => {
      if (!categories?.length) return;
      const el = scrollerRef.current;
      if (!el) return;

      const loopWidth = categories.length * STEP;

      const animate = () => {
        if (el && !pausedRef.current) {
          posRef.current += SPEED;
          if (posRef.current >= loopWidth) posRef.current -= loopWidth;
          el.scrollLeft = posRef.current;
        }
        rafRef.current = requestAnimationFrame(animate);
      };

      rafRef.current = requestAnimationFrame(animate);
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      };
    }, [categories?.length]);

    if (!categories?.length) return null;

    const pause = () => {
      pausedRef.current = true;
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
    // Re-sync to the user's scroll position, then resume after a short idle.
    const resumeSoon = () => {
      const el = scrollerRef.current;
      if (el) posRef.current = el.scrollLeft;
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = setTimeout(() => {
        pausedRef.current = false;
      }, 1200);
    };

    return (
      <Box sx={{ mt: 2 }}>
        {title ? <SectionHeading title={title} /> : null}

        {/* full-bleed native scroller — swipeable + auto-scrolling */}
        <Box
          ref={scrollerRef}
          onTouchStart={pause}
          onTouchEnd={resumeSoon}
          onTouchCancel={resumeSoon}
          onMouseEnter={pause}
          onMouseLeave={resumeSoon}
          sx={{
            display: "flex",
            mx: -2,
            px: 2,
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {duplicatedCategories.map((category, idx) => (
            <Box
              key={`${category.id}-${idx}`}
              onClick={() => onCategoryClick(category)}
              sx={{
                flexShrink: 0,
                width: TILE_W,
                mr: `${GAP}px`,
                cursor: "pointer",
                "&:active .cat-tile": { transform: "scale(0.95)" },
              }}
            >
              <Box
                className="cat-tile"
                sx={{
                  position: "relative",
                  width: TILE_W,
                  height: IMG_H,
                  borderRadius: RADIUS.card,
                  overflow: "hidden",
                  bgcolor: IMG_BG,
                  border: `1px solid ${LINE}`,
                  boxShadow: "0 2px 10px rgba(24,20,12,0.07)",
                  transition: "transform 0.18s ease",
                }}
              >
                <Box
                  component="img"
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>
              <Typography
                sx={{
                  mt: 0.6,
                  fontSize: 11,
                  fontWeight: 600,
                  color: INK,
                  textAlign: "center",
                  lineHeight: 1.2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {category.name}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  },
);

export default CategoryCarousel;
