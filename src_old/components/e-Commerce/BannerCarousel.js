import React, { useContext } from "react";
import { Box } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { StoreContext } from "../../contexts/StoreContext";
import { GOLD, RADIUS } from "./ui/ecomTokens";

// ─── BannerCarousel ──────────────────────────────────────────────────────────
// Promotional banner slider. Uses the store's real promotional image(s) from
// storeAssets.storeImages (type "Footer Promotional Card"). Auto-slides,
// supports manual swipe, shows pagination dots, and has rounded corners. Sits
// within the page padding so its width matches the other sections. Renders
// nothing if the store has no promotional image (no placeholder).
const BannerCarousel = ({ banners }) => {
  const { storeAssets } = useContext(StoreContext);

  const derived = (storeAssets?.storeImages || [])
    .filter((img) => img.type === "Footer Promotional Card" && img.image_url)
    .map((img, i) => ({ id: `promo-${i}`, image: img.image_url }));

  const slides = banners && banners.length ? banners : derived;
  if (!slides.length) return null;

  return (
    <Box sx={{ mt: 2.5 }}>
      <Swiper
        modules={[Autoplay, Pagination]}
        slidesPerView={1}
        spaceBetween={12}
        loop={slides.length > 1}
        autoHeight
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{ clickable: true }}
        speed={600}
        style={{
          paddingBottom: "26px",
          "--swiper-pagination-color": GOLD,
          "--swiper-pagination-bullet-inactive-color": "#C9C1B2",
          "--swiper-pagination-bullet-inactive-opacity": "0.7",
          "--swiper-pagination-bottom": "0px",
        }}
      >
        {slides.map((b) => (
          <SwiperSlide key={b.id}>
            <Box
              component="img"
              src={b.image}
              alt="Promotional banner"
              loading="lazy"
              sx={{
                width: "100%",
                height: "auto",
                display: "block",
                borderRadius: RADIUS.tile,
                boxShadow: "0 8px 24px rgba(24,20,12,0.16)",
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </Box>
  );
};

export default BannerCarousel;
