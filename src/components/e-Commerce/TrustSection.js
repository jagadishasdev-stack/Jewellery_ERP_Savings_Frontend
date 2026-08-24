import React from "react";
import { Box, Typography } from "@mui/material";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import PriceCheckRoundedIcon from "@mui/icons-material/PriceCheckRounded";
import AutorenewRoundedIcon from "@mui/icons-material/AutorenewRounded";
import SectionHeading from "./ui/SectionHeading";
import { GOLD, INK, MUTED, LINE, SURFACE_ALT, RADIUS } from "./ui/ecomTokens";

// ─── Trust & Assurance ───────────────────────────────────────────────────────
// Static reassurance tiles, shown as an auto-advancing + swipeable slider
// (Swiper, already installed). No data / API — dummy copy the user maintains.
const TRUST_ITEMS = [
  {
    Icon: WorkspacePremiumRoundedIcon,
    title: "Trusted & Certified Jeweller",
    text: "We are a trusted and certified jewellery retailer committed to delivering genuine and high-quality products.",
  },
  {
    Icon: PriceCheckRoundedIcon,
    title: "Fair & Transparent Pricing",
    text: "Our pricing is transparent with no hidden charges. Every cost is clearly displayed before checkout.",
  },
  {
    Icon: AutorenewRoundedIcon,
    title: "Guaranteed Buyback",
    text: "Eligible jewellery products are covered under our buyback policy as per our terms and conditions.",
  },
];

const TrustSection = () => (
  <Box sx={{ mt: 3 }}>
    <SectionHeading title="Trust & Assurance" />
    <Swiper
      modules={[Autoplay, Pagination]}
      slidesPerView={1}
      spaceBetween={12}
      loop
      autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
      pagination={{ clickable: true }}
      style={{
        paddingBottom: "26px",
        "--swiper-pagination-color": GOLD,
        "--swiper-pagination-bullet-inactive-color": "#C9C1B2",
        "--swiper-pagination-bullet-inactive-opacity": "0.7",
        "--swiper-pagination-bottom": "0px",
      }}
    >
      {TRUST_ITEMS.map(({ Icon, title, text }) => (
        <SwiperSlide key={title}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.75,
              p: 2,
              minHeight: 104,
              borderRadius: RADIUS.card,
              bgcolor: SURFACE_ALT,
              border: `1px solid ${LINE}`,
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                flexShrink: 0,
                borderRadius: "50%",
                bgcolor: "rgba(185,138,70,0.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon sx={{ fontSize: 28, color: GOLD }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                sx={{ fontSize: 14.5, fontWeight: 700, color: INK, mb: 0.4 }}
              >
                {title}
              </Typography>
              <Typography sx={{ fontSize: 12, lineHeight: 1.45, color: MUTED }}>
                {text}
              </Typography>
            </Box>
          </Box>
        </SwiperSlide>
      ))}
    </Swiper>
  </Box>
);

export default TrustSection;
