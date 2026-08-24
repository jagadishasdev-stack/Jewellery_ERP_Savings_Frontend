import React, { useContext, useState, useEffect, useRef } from "react";

// Third-party libraries
import axios from "axios";
import Slider from "react-slick";
import { useNavigate } from "react-router-dom";

// MUI components
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  Collapse,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
// Contexts and configuration
import { StoreContext } from "../contexts/StoreContext";
import APP_CONFIG from "../config/constants"; // static storeID
import theme from "../theme";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
// Custom components
import LoadingScreen from "./LoadingScreen";

// Assets (images)
import metalRateBgImage from "../assets/img/icons/metal-price-bg3.png";
// import digiGoldPic1 from "../assets/img/icons/digiGoldPic1.svg";
import digiGoldPic1 from "../assets/img/logo/logo.png";
import digiGoldPic2 from "../assets/img/icons/digiGoldPic2.png";
import goldCoin from "../assets/img/icons/goldCoin.png";
import logo from "../assets/img/logo/logo.png";
import storeLogo from "../assets/img/logo/logo.png";
import goldPot from "../assets/img/icons/goldPot.svg";
import silverRateCoin from "../assets/img/icons/silverRateCoin.svg";
import goldRateCoin from "../assets/img/icons/goldRateCoin.svg";
import { IoIosArrowRoundBack } from "react-icons/io";
// Fonts
import "@fontsource/italiana";
import "@fontsource/poppins";
import SearchCategories from "./SearchCategories";
import EcomCategoriesSection from "./e-Commerce/EcomCategoriesSection";
import { App } from "@capacitor/app";
import { AuthContext } from "../contexts/AuthContext";

import { App as CapacitorApp } from "@capacitor/app";
import { useSafeAreaTop, useSafeAreaBottom } from "../SafeAreaFile";
import { Capacitor } from "@capacitor/core";
import FallbackScreen from "./FallbackScreen";
import PlanCard from "./PlanCard";

import jeweleryImg from "../assets/img/icons/jewellery.png";
import bangleImg from "../assets/img/icons/bangle.png";
import braceletImg from "../assets/img/icons/bracelet.png";
import earringsImg from "../assets/img/icons/earrings.png";
import { Brightness1 } from "@mui/icons-material";

function DashboardPage3() {
  const topInset = useSafeAreaTop();
  const bottomInset = useSafeAreaBottom();
  const isIOS = Capacitor.getPlatform() === "ios";

  const safeAreaTop = topInset;
  const safeAreaBottom = bottomInset;

  const imagesArr = [jeweleryImg, bangleImg, braceletImg, earringsImg];

  // --- React Hooks & Context ---
  const { storeAssets, storePlans, plan, fetchUserPlan, isEcomEnable } =
    useContext(StoreContext);
  const { loginRole, adminUser } = useContext(AuthContext);
  // const userInfo = adminUser;
  const role = loginRole;
  const userInfo = {
    ...adminUser,
    role: loginRole,
  };

  const [showAllMetalRates, setShowAllMetalRates] = useState(false);
  const [searchInFocus, setSearchInFocus] = useState(false);
  const [fallbackOpen, setFallbackOpen] = useState(false);

  const [digiGoldMinAmount, setDigiGoldMinAmount] = useState(100);
  const [metalRates, setMetalRates] = useState([]); // Metal rates like gold/silver with purity
  const [existingPlansList, setExisitingPlansList] = useState([]); // Available store plans
  // const [plan, setPlan] = useState(null); // User's active plan (latest one)
  const [digiGoldPlan, setDigiGoldPlan] = useState(null);
  const [GoldPlan, setGoldPlan] = useState(null);
  const [SilverPlan, setSilverPlan] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { categories = [] } = storeAssets || {};
  const metalRateBarRef = useRef(null);
  const [metalBarHeight, setMetalBarHeight] = useState(110);
  const [popupImage, setPopupImage] = useState(null);

  //************************** app minimize after open *********************************************** */
  // useEffect(() => {
  //   let currentState = 'active'; // track state manually

  //   const listener = App.addListener('appStateChange', ({ isActive }) => {

  //     if (isActive && currentState !== 'active') {
  //       // 🔵 App came to foreground (resume)
  //       console.log('App Resumed / Opened');
  //       // alert('App Opened or Resumed');
  //       currentState = 'active';

  //     } else if (!isActive && currentState !== 'background') {
  //       // ⚫ App went to background (minimized)
  //       console.log('App Minimized');
  //       alert('App Minimized');
  //       currentState = 'background';
  //     }
  //   });

  //   return () => {
  //     listener.remove();
  //   };
  // }, []);
  //**************************************************************************************** */
  useEffect(() => {
    if (!metalRateBarRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setMetalBarHeight(entry.contentRect.height);
      }
    });

    observer.observe(metalRateBarRef.current);
    return () => observer.disconnect();
  }, [metalRates]);

  //*******************************Order-related states*************************************** */

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [showAllOrders, setShowAllOrders] = useState(false);
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "#4CAF50"; // green
      case "fresh order":
        return "#FF9800"; // orange
      case "part delivery":
        return "#FF9800"; // orange (same as pending feel)
      case "cancelled":
        return "#F44336"; // red
      default:
        return "#757575"; // grey
    }
  };

  const toggleDescription = (orderId) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const displayedOrders = showAllOrders ? orders : orders.slice(0, 1);

  // Fetch customer orders
  const fetchCustomerOrders = async () => {
    if (!userInfo || !userInfo.mobile) {
      setOrders([]);
      return;
    }

    setOrdersLoading(true);
    const { STORE_ID } = APP_CONFIG;
    const url = `${process.env.REACT_APP_API_BASE_URL}/api/core/customer-orders/${STORE_ID}/${userInfo.mobile}`;

    try {
      const { data } = await axios.get(url);

      if (data.count > 0 && data.data) {
        // Transform API data to match your component's format
        const transformedOrders = data.data.map((order) => ({
          id: order.Id,
          orderDate: new Date(order.date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }), // Format: "25 Feb 2023"
          orderNo: order.ofno,
          status: getStatusFromCode(order.ORDER_STATUS),
          description: order.ORDER_DETAILS || "",
          imageLink: order.ORDER_IMAGE_LINK || null,
        }));

        setOrders(transformedOrders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to fetch customer orders:", err);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  // Helper function to convert status codes to readable status
  const getStatusFromCode = (code) => {
    switch (code) {
      case "F":
        return "Fresh Order";
      case "D":
        return "Delivered";
      case "P":
        return "Part Delivery";
      case "C":
        return "Cancelled";
      default:
        return "Fresh Order";
    }
  };
  //************************************************************************************* */

  // Filter categories based on search term
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Snackbar state for showing success or error alerts
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const navigate = useNavigate(); // For navigating between pages

  //===================== Fetching store data and Fetch metal rates=============================
  useEffect(() => {
    const fetchMetalRates = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/core/rates`,
          {
            params: {
              store_id: APP_CONFIG.STORE_ID,
              branch: APP_CONFIG.BRANCH,
            },
          },
        );

        const ratesArray = response.data;

        // Transform the rates into an object grouped by metal and purity
        setMetalRates(ratesArray);
      } catch (err) {
        console.error("Failed to fetch metal rates:", err);
      }
    };

    // ==================== Fetch available plans =======================================
    const fetchExistingPlans = async () => {
      const DIGI_CODES = ["DIGIG24", "DIGIG22", "DIGIS"];
      const normalPlans = storePlans.filter(
        (p) => !DIGI_CODES.includes(p.code?.toUpperCase()),
      );
      setExisitingPlansList(normalPlans);

      const dgPlan = normalPlans.find((plan) => plan.gold_scheme == "1");
      setDigiGoldPlan(dgPlan);

      const plans = storePlans.reduce(
        (acc, p) => {
          if (p.gold_scheme === "1") {
            const name = p.code?.toUpperCase();
            if (["DIGIG24", "DIGIG22"].includes(name)) acc.gold = p;
            if (name === "DIGIS") acc.silver = p;
          }
          return acc;
        },
        { gold: null, silver: null },
      );

      setGoldPlan(plans.gold);
      setSilverPlan(plans.silver);
    };

    fetchUserPlan(userInfo);
    fetchExistingPlans();
    fetchMetalRates();
    fetchCustomerOrders();
  }, [adminUser, storePlans]);

  const [logoOrientation, setLogoOrientation] = useState("square");

  function getLogoOrientation(width, height) {
    const ratio = width / height;
    if (ratio > 1.2) return "horizontal";
    if (ratio < 0.8) return "vertical";
    return "square";
  }

  useEffect(() => {
    const img = new Image();
    img.src = storeLogo;
    img.onload = () => {
      const orientation = getLogoOrientation(
        img.naturalWidth,
        img.naturalHeight,
      );
      setLogoOrientation(orientation);
    };
  }, [storeLogo]);

  const metalIcons = {
    gold: goldRateCoin,
    silver: silverRateCoin,
    // platinum: platinumCoin,
  };

  //Metal vertcial slider setting
  const settings = {
    dots: false,
    infinite: true,
    speed: 800,
    slidesToShow: 1, // Number of items visible at once
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000,
    vertical: true, // 👈 Enables vertical direction
    verticalSwiping: true, // 👈 Enables vertical swipe
  };

  // Slider settings for Category Carousel
  const categorySliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
        },
      },
      // If you truly want ALL items at once, you might need to conditionally render
      // the Slider only if there are enough items, otherwise just a Flex container.
      // For a true carousel, responsive settings are generally preferred.
    ],
  };

  // ========================= Slider Settings for Displaying Store Plans =========================
  const storePlansSliderSetting = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2, slidesToScroll: 1 },
      },
      {
        breakpoint: 600,
        settings: { slidesToShow: 1, slidesToScroll: 1 },
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1, slidesToScroll: 1 },
      },
    ],
  };

  // --- Loading state before store assets load ---
  if (!storeAssets) {
    return <LoadingScreen open={true} message="Loading Dashboard..." />;
  }

  // --- Empty content fallback ---
  // if (
  //   (!storeAssets.categories || storeAssets.categories.length === 0) &&
  //   (!storeAssets.storeImages || storeAssets.storeImages.length === 0)
  // ) {
  //   return (
  //     <Box
  //       display="flex"
  //       justifyContent="center"
  //       alignItems="center"
  //       minHeight="50vh"
  //     >
  //       <Typography variant="h6" color="textSecondary">
  //         No displayable content available for this store.
  //       </Typography>
  //     </Box>
  //   );
  // }
  // ─── Gold coin SVG ────────────────────────────────────────────────────────────
  function GoldCoinIcon({ size = 24 }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="32" cy="54" rx="22" ry="6" fill="#c05e00" opacity="0.6" />
        <ellipse cx="32" cy="30" rx="22" ry="22" fill="#f59e0b" />
        <ellipse
          cx="32"
          cy="30"
          rx="22"
          ry="22"
          fill="none"
          stroke="#fcd34d"
          strokeWidth="3"
        />
        <ellipse cx="32" cy="30" rx="15" ry="15" fill="#d97706" />
        <text
          x="32"
          y="36"
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
          fill="#fef3c7"
          fontFamily="sans-serif"
        >
          ₹
        </text>
        <path
          d="M10 30 Q10 54 32 54 Q54 54 54 30"
          fill="#d97706"
          opacity="0.5"
        />
      </svg>
    );
  }

  // ─── Silver coin SVG ──────────────────────────────────────────────────────────
  function SilverCoinIcon({ size = 24 }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="32" cy="54" rx="22" ry="6" fill="#64748b" opacity="0.4" />
        <ellipse cx="32" cy="30" rx="22" ry="22" fill="#cbd5e1" />
        <ellipse
          cx="32"
          cy="30"
          rx="22"
          ry="22"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="3"
        />
        <ellipse cx="32" cy="30" rx="15" ry="15" fill="#94a3b8" />
        <text
          x="32"
          y="36"
          textAnchor="middle"
          fontSize="16"
          fontWeight="bold"
          fill="#f8fafc"
          fontFamily="sans-serif"
        >
          ₹
        </text>
        <path
          d="M10 30 Q10 54 32 54 Q54 54 54 30"
          fill="#94a3b8"
          opacity="0.5"
        />
      </svg>
    );
  }
  //Navigate to payment & ledger page on user selection
  const handleDataForward = (e, data) => {
    e.stopPropagation();

    const userInfo = {
      name: data.name,
      email: data.email,
      address1: data.address1,
      address2: data.address2,
      mobile: data.mobile,
    };

    navigate("/paymentandledger", {
      state: {
        data,
        userInfo,
      },
    });
  };

  // Navigate to contact page on plan selection
  const handleSelectPlan = (e, data) => {
    e.stopPropagation();
    if (!data) return;

    if (loginRole === "guest") {
      setFallbackOpen(true); // show the modal
      return;
    }

    navigate("/select-plan/contact", { state: data });
  };

  const handleExistingPlanDataForward = (e, data) => {
    e.stopPropagation();
    if (!data) {
      setSnackbar({
        open: true,
        message: "Could not fetch data. Please try again later!",
        severity: "warning",
      });
      return false;
    }
  };

  const digiGoldImage =
    storeAssets?.storeImages?.find((img) => img.type === "Digi Gold Card")
      ?.image_url ?? null;

  const promoOfferImages =
    storeAssets?.storeImages
      ?.filter((img) => img.type === "Promotional Offer Card")
      ?.map((img) => img.image_url) ?? [];

  const promoSliderSettings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    dotsClass: "slick-dots",
  };
  // console.log(plan);
  return (
    <>
      {/* Fallback Screen for Guest */}
      {loginRole === "guest" && fallbackOpen === true && (
        <FallbackScreen
          open={fallbackOpen}
          message={
            <>
              Don't remain a guest forever
              <br />
              Become a part of our plans family
            </>
          }
          redirectTo="log in"
          redirectToURL="/login"
        />
      )}

      {fallbackOpen === false && (
        <Box sx={{ marginTop: 2, mb: "60px" }}>
          {/* metal rate section */}
          <Box
            ref={metalRateBarRef}
            sx={{
              width: "100vw",
              minHeight: "110px",
              backgroundColor: theme.palette.background.default,
              marginLeft: "-16px",
              marginRight: "-16px",
              position: "fixed",
              // top: isIOS ? "56px" : `calc(56px + ${safeAreaTop})`,
              top: isIOS
                ? `calc(56px + var(--safe-area-top))`
                : `calc(56px + ${safeAreaTop})`,
              // boxShadow: "0 2px 5px #cccccc",
              zIndex: 1200,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
              overflowX: metalRates.length > 3 ? "auto" : "hidden", // scroll if more than 3
              px: 2,
              py: 1,
              backgroundImage: `url(${metalRateBgImage})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          >
            <Typography sx={{ fontSize: 16, fontWeight: 600 }}>
              Today’s Price
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
              {" "}
              {metalRates.map((item, index) => {
                const metal = item.metal.toLowerCase();
                const metalName =
                  metal.charAt(0).toUpperCase() + metal.slice(1);

                let karatOrPurityDisplay = "-";
                if (metal === "gold") {
                  const purityStr = item.purity?.toString() || "";
                  const match = purityStr.match(/^(\d{3})/); // e.g. 916 from 916HM
                  if (match) {
                    const numericPurity = parseFloat(match[1]);
                    const karat = Math.round((numericPurity / 1000) * 24); // 916 -> 22KT
                    karatOrPurityDisplay = `${karat}KT`;
                  }
                } else if (metal === "silver") {
                  karatOrPurityDisplay = `${item.purity}`;
                }
                const sz = metalRates.length;
                return (
                  <Box
                    key={index}
                    sx={{
                      // bgcolor: theme.palette.background.default,
                      // border: `1px solid ${theme.theme2.primaryButton}`,
                      // borderRadius: "2px",
                      width: sz > 2 ? "115px" : "150px",
                      padding: "8px 1px",
                      textAlign: "center",
                      flexShrink: 0, // prevents shrinking in scroll
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      {metalName} {karatOrPurityDisplay} / gm
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: "#db8f00",
                      }}
                    >
                      ₹ {new Intl.NumberFormat("en-IN").format(item.rate)}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/*Main dashboard */}
          {!searchInFocus && (
            <>
              {/* === Digi Gold & Digi Silver Buttons === */}

              <Box
                sx={{
                  mt: `${metalBarHeight + 20}px`,
                  display: "flex",
                  gap: 1.5,
                }}
              >
                {/* Digi Gold */}
                {GoldPlan != null && (
                  <Box
                    onClick={() => navigate("/digi-metal/gold")}
                    sx={{
                      flex: 1,
                      height: "52px",
                      borderRadius: 2,
                      cursor: "pointer",
                      background:
                        "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
                      border: "1.5px solid #f59e0b",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.8,
                      boxShadow: "0 2px 8px rgba(245,158,11,0.25)",
                      transition: "all 0.2s ease",
                      "&:active": {
                        transform: "scale(0.97)",
                        boxShadow: "none",
                      },
                    }}
                  >
                    <GoldCoinIcon size={24} />
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: 13,
                          color: "#92400e",
                          lineHeight: 1.1,
                        }}
                      >
                        Digi Gold
                      </Typography>
                      <Typography
                        sx={{ fontSize: 10, color: "#b45309", lineHeight: 2 }}
                      >
                        24KT &amp; 22KT
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Digi Silver */}
                {SilverPlan != null && (
                  <Box
                    onClick={() => navigate("/digi-metal/silver")}
                    sx={{
                      flex: 1,
                      height: "52px",
                      borderRadius: 2,
                      cursor: "pointer",
                      background:
                        "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)",
                      border: "1.5px solid #94a3b8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.8,
                      boxShadow: "0 2px 8px rgba(148,163,184,0.3)",
                      transition: "all 0.2s ease",
                      "&:active": {
                        transform: "scale(0.97)",
                        boxShadow: "none",
                      },
                    }}
                  >
                    <SilverCoinIcon size={24} />
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: 13,
                          color: "#1e293b",
                          lineHeight: 1.1,
                        }}
                      >
                        Digi Silver
                      </Typography>
                      <Typography
                        sx={{ fontSize: 10, color: "#64748b", lineHeight: 2 }}
                      >
                        Sterling 925
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
              {/*  Digi Gold Banner  */}
              <Box
                // onClick={
                //   !digiGoldImage
                //     ? (e) => handleSelectPlan(e, digiGoldPlan)
                //     : undefined
                // }
                sx={{
                  mt: "10px",

                  width: "100%",
                  height: "121px",
                  borderRadius: 2,
                  background: theme.theme2.digi_card_bg,
                  display: "flex",
                  px: !digiGoldImage ? 2 : 0,
                }}
              >
                {digiGoldImage ? (
                  // Show digi gold banner uploaded in the admin panel
                  <img
                    src={digiGoldImage}
                    alt="Digi Gold Card"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "inherit",
                    }}
                  />
                ) : (
                  // Show default digi gold banner
                  <>
                    {/* Left: Images */}
                    <Box
                      sx={{
                        width: "40%",
                        margin: "0 auto",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        style={{ width: "25px", margin: "5px 0 0 27px" }}
                        src={digiGoldPic1}
                        alt="Gold Icon"
                      />
                      <img
                        style={{
                          width: "120px",
                          position: "relative",
                          bottom: 20,
                        }}
                        src={digiGoldPic2}
                        alt="Gold Text"
                      />
                    </Box>

                    {/* Right: Text Content */}
                    <Box sx={{ width: "70%", padding: "15px 0" }}>
                      <Typography sx={{ fontSize: "12px", color: "#fff" }}>
                        Start your gold savings with just
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: "28px",
                          color: "#fff",
                        }}
                      >
                        ₹{digiGoldMinAmount}
                      </Typography>

                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Typography
                          sx={{
                            color: "#fff",
                            bgcolor: "#0000003b",
                            fontSize: 12,
                            borderRadius: 10,
                            padding: "4px 8px",
                          }}
                        >
                          Easy
                        </Typography>
                        <Typography
                          sx={{
                            color: "#fff",
                            bgcolor: "#0000003B",
                            fontSize: 12,
                            borderRadius: 10,
                            padding: "4px 8px",
                          }}
                        >
                          Flexible
                        </Typography>
                        <Typography
                          sx={{
                            color: "#fff",
                            bgcolor: "#0000003B",
                            fontSize: 12,
                            borderRadius: 10,
                            padding: "4px 8px",
                          }}
                        >
                          Accessible
                        </Typography>
                      </Box>
                    </Box>
                  </>
                )}
              </Box>

              {/* E-Commerce Categories (only loads/renders/fetches when
                  e-commerce is enabled — see EcomCategoriesSection) */}
              {isEcomEnable && <EcomCategoriesSection />}

              {/* Categories Carousel */}
              {filteredCategories.length > 0 && (
                <Box sx={{ my: 2 }}>
                  <Typography
                    sx={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: theme.theme2.primaryHeading,
                    }}
                  >
                    Trendings
                  </Typography>
                  <Slider {...categorySliderSettings}>
                    {filteredCategories.map((category) => (
                      <Box
                        key={category.id}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        sx={{ p: 1 }}
                      >
                        <Box
                          sx={{
                            width: "100px",
                            height: "100px",
                            borderRadius: 2,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            padding: 0.5,
                            boxShadow: 2,
                          }}
                        >
                          {" "}
                          <Box
                            sx={{
                              height: "76px",
                              width: "92px",
                              backgroundImage: `url(${category.image_url})`,
                              backgroundSize: "contain",
                              backgroundPosition: "center",
                              backgroundRepeat: "no-repeat",
                              borderRadius: 1,
                            }}
                          />
                          <Typography
                            variant="subtitle2"
                            sx={{
                              // mt: 1,
                              fontSize: 12,
                              color: theme.colors.subHeading,
                              p: 0.5,
                              display: "inline-block",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "110px",
                              textAlign: "center",
                              width: "100%",
                            }}
                          >
                            {category.name}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Slider>
                </Box>
              )}

              {/* Saving Plans Section */}
              <Box sx={{ width: "100%" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "16px",
                      fontWeight: 600,
                      color: theme.theme2.secondaryHeading,
                    }}
                  >
                    Saving Plans
                  </Typography>
                  <Typography
                    onClick={() => navigate("/select-plan")}
                    sx={{
                      cursor: "pointer",
                      color: theme.colors.subHeading,
                      textDecoration: "underline",
                      fontSize: "14px",
                    }}
                  >
                    See All
                  </Typography>
                </Box>

                <Box>
                  {existingPlansList.length > 0 ? (
                    <Box
                      sx={{
                        width: "100%",
                        // maxWidth: "800px",
                        margin: "0 auto",
                      }}
                    >
                      {existingPlansList.length === 1 ? (
                        // Static single plan
                        <PlanCard
                          el={existingPlansList[0]}
                          index={0}
                          imageUrl={existingPlansList[0].media}
                          theme={theme}
                          onPayNow={(e, data) =>
                            handleExistingPlanDataForward(e, data)
                          }
                          handleSelectPlan={handleSelectPlan}
                        />
                      ) : (
                        // Slider for 2 or more, max 5 slides
                        <Slider
                          {...{
                            ...storePlansSliderSetting,
                            slidesToShow: Math.min(existingPlansList.length, 5), // max 5 visible
                            slidesToScroll: 1,
                            infinite: existingPlansList.length > 5, // loop if more than 5
                            dots: true, // show dots below
                            arrows: true, // optional arrows
                            autoplay: true, // ✅ auto-slide enabled
                            autoplaySpeed: 2500, // time between slides (ms)
                            speed: 600, // animation transition speed
                            pauseOnHover: true, // pause when hovered
                            pauseOnDotsHover: true, // pause if dots are hovered
                          }}
                        >
                          {existingPlansList.slice(0, 10).map((el, index) => {
                            const imageURL = el.media || null;
                            return (
                              <PlanCard
                                el={el}
                                index={index}
                                imageUrl={imageURL}
                                theme={theme}
                                onPayNow={(e, data) =>
                                  handleExistingPlanDataForward(e, data)
                                }
                                handleSelectPlan={handleSelectPlan}
                              />
                            );
                          })}
                        </Slider>
                      )}
                    </Box>
                  ) : (
                    <Typography
                      variant="body1"
                      color="textSecondary"
                      sx={{ textAlign: "center" }}
                    >
                      No Plans available.
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Order Details Section */}
              {orders.length > 0 && (
                <Box sx={{ width: "100%", mt: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "16px",
                        fontWeight: 600,
                        color: theme.theme2.secondaryHeading,
                      }}
                    >
                      Order Details
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {displayedOrders.map((order, index) => {
                      // Check if description needs truncation (more than one line ~60 chars)
                      const needsTruncation = order.description.length > 40;

                      return (
                        <Box
                          key={order.id}
                          sx={{
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                            padding: "16px",
                            paddingBottom:
                              orders.length > 1 &&
                              index === displayedOrders.length - 1
                                ? "40px"
                                : "16px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                            border: "1px solid #e0e0e0",
                            position: "relative",
                            opacity: 0,
                            animation: "fadeInSlide 0.4s ease-out forwards",
                            animationDelay: `${index * 0.1}s`,
                            "@keyframes fadeInSlide": {
                              "0%": {
                                opacity: 0,
                                transform: "translateY(-10px)",
                              },
                              "100%": {
                                opacity: 1,
                                transform: "translateY(0)",
                              },
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 1.5,
                              gap: 1,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#555",
                                flex: 1,
                              }}
                            >
                              {order.orderDate}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#555",
                                flex: 1,
                                textAlign: "center",
                              }}
                            >
                              {order.orderNo}
                            </Typography>
                            <Box
                              sx={{
                                flex: 1,
                                display: "flex",
                                justifyContent: "flex-end",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  color: getStatusColor(order.status),
                                  backgroundColor: `${getStatusColor(
                                    order.status,
                                  )}15`,
                                  padding: "4px 12px",
                                  borderRadius: "12px",
                                  textTransform: "capitalize",
                                }}
                              >
                                {order.status}
                              </Typography>
                            </Box>
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1,
                            }}
                          >
                            <Typography
                              onClick={() =>
                                needsTruncation && toggleDescription(order.id)
                              } // ← Add this
                              sx={{
                                fontSize: "13px",
                                color: "#666",
                                flex: 1,
                                lineHeight: 1.5,
                                overflow: "hidden",
                                display: "-webkit-box",
                                WebkitLineClamp: expandedDescriptions[order.id]
                                  ? "unset"
                                  : 1,
                                WebkitBoxOrient: "vertical",
                                textOverflow: "ellipsis",
                                transition: "all 0.3s ease-in-out",
                                maxHeight: expandedDescriptions[order.id]
                                  ? "1000px"
                                  : "21px",
                                opacity: 1,
                                cursor: needsTruncation ? "pointer" : "default", // ← Add this
                                userSelect: needsTruncation ? "none" : "auto", // ← Add this (optional, prevents text selection)
                                "&:hover": needsTruncation
                                  ? {
                                      // ← Add this (optional, for hover effect)
                                      color: "#333",
                                    }
                                  : {},
                              }}
                            >
                              {order.description}
                            </Typography>

                            {needsTruncation && (
                              <Box
                                onClick={() => toggleDescription(order.id)}
                                sx={{
                                  cursor: "pointer",
                                  backgroundColor: `${
                                    theme.colors.subHeading || "#1976d2"
                                  }15`,
                                  color: theme.colors.subHeading || "#1976d2",
                                  width: "24px",
                                  height: "24px",
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  transform: expandedDescriptions[order.id]
                                    ? "rotate(180deg)"
                                    : "rotate(0deg)",
                                  transition:
                                    "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease-in-out",
                                  "&:hover": {
                                    backgroundColor: `${
                                      theme.colors.subHeading || "#1976d2"
                                    }25`,
                                  },
                                  "&:active": {
                                    transform: expandedDescriptions[order.id]
                                      ? "rotate(180deg) scale(0.95)"
                                      : "rotate(0deg) scale(0.95)",
                                  },
                                }}
                              >
                                <ExpandMoreRoundedIcon
                                  sx={{ fontSize: "18px" }}
                                />
                              </Box>
                            )}
                          </Box>

                          {orders.length > 1 &&
                            index === displayedOrders.length - 1 && (
                              <Chip
                                label={
                                  showAllOrders
                                    ? "Show Less"
                                    : `+${orders.length - 1} more`
                                }
                                onClick={() => setShowAllOrders(!showAllOrders)}
                                size="small"
                                sx={{
                                  position: "absolute",
                                  bottom: "12px",
                                  left: "16px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  backgroundColor: `${
                                    theme.colors.subHeading || "#1976d2"
                                  }15`,
                                  color: theme.colors.subHeading || "#1976d2",
                                  border: `1px solid ${
                                    theme.colors.subHeading || "#1976d2"
                                  }`,
                                  transition:
                                    "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                  "&:hover": {
                                    backgroundColor:
                                      theme.colors.subHeading || "#1976d2",
                                    color: "#fff",
                                    transform: "scale(1.05)",
                                  },
                                  "&:active": {
                                    transform: "scale(0.98)",
                                  },
                                }}
                              />
                            )}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

              {/*  Your Investments Section  */}
              {userInfo && role === "user" && (
                <Box sx={{ width: "100%", mt: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography sx={{ color: "#000", fontWeight: "500" }}>
                      Your Investments
                    </Typography>
                    {plan && !Array.isArray(plan) && (
                      <Typography
                        onClick={() => navigate("/savingplanslist")}
                        sx={{
                          cursor: "pointer",
                          color: theme.colors.subHeading,
                          textDecoration: "underline",
                          fontSize: "14px",
                        }}
                      >
                        See All
                      </Typography>
                    )}
                  </Box>

                  <Box
                    onClick={(e) =>
                      plan && !Array.isArray(plan) && handleDataForward(e, plan)
                    }
                    sx={{
                      height: "60px",
                      backgroundColor: theme.theme2.secondaryBg,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      px: 2,
                      color: "white",
                      border: `1px solid ${theme.theme2.borderCol}`,
                    }}
                  >
                    <Box
                      component="img"
                      src={goldCoin}
                      alt="Plan"
                      sx={{ height: 36, width: 36, mr: 2 }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        flex: 1,
                      }}
                    >
                      {plan === null && (
                        <Typography sx={{ color: theme.colors.primaryHeading }}>
                          Loading your investments...
                        </Typography>
                      )}

                      {Array.isArray(plan) && plan.length === 0 && (
                        <>
                          <Typography
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              color: theme.colors.primaryHeading,
                              fontSize: 14,
                            }}
                          >
                            You haven't joined any plan
                          </Typography>
                          <Button
                            onClick={() => navigate("/select-plan")}
                            variant="contained"
                            sx={{
                              marginLeft: 1,
                              background: theme.colors.primaryButton,
                              width: "100px",
                              fontSize: 10,
                              borderRadius: 2,
                              padding: 0,
                              boxShadow: 0,
                              height: "40px",
                            }}
                          >
                            ENROLL NOW
                          </Button>
                        </>
                      )}

                      {plan && !Array.isArray(plan) && (
                        <>
                          <Box>
                            <Typography
                              fontWeight="bold"
                              sx={{
                                fontSize: "16px",
                                color: theme.theme2.primaryHeading,
                              }}
                            >
                              {plan.mgroup}-{plan.member_no}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: theme.theme2.primaryHeading }}
                            >
                              Investment Amount
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              textAlign: "right",
                              color: theme.colors.primaryButton,
                            }}
                          >
                            <Typography sx={{ fontSize: "0.75rem" }}>
                              Total
                            </Typography>
                            <Typography
                              sx={{
                                color: theme.theme2.primaryHeading,
                                fontSize: "1rem",
                                fontWeight: 600,
                              }}
                            >
                              ₹ {plan.amountPaid}
                            </Typography>
                          </Box>
                        </>
                      )}
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Promotions & Offers */}
              <Box>
                {/* Heading */}
                <Typography
                  sx={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: theme.theme2.secondaryHeading,
                    mb: 1,
                    mt: 3,
                  }}
                >
                  Promotions & Offers
                </Typography>

                {/* Image */}
                <Box sx={{ width: "100%", mb: 10 }}>
                  {promoOfferImages.length > 0 ? (
                    promoOfferImages.length === 1 ? (
                      // Single image - no slider needed
                      <Box
                        sx={{
                          width: "100%",
                          height: "211px",
                          borderRadius: 2,
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={promoOfferImages[0]}
                          alt="Promotional Offer"
                          onClick={() => setPopupImage(promoOfferImages[0])}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "inherit",
                          }}
                        />
                      </Box>
                    ) : (
                      // Multiple images - horizontal slider with circle dots
                      <Box
                        sx={{
                          width: "100%",
                          "& .slick-dots": {
                            bottom: "10px",
                          },
                          "& .slick-dots li button:before": {
                            fontSize: "8px",
                            color: "#fff",
                            opacity: 0.6,
                          },
                          "& .slick-dots li.slick-active button:before": {
                            color: "#fff",
                            opacity: 1,
                          },
                        }}
                      >
                        <Slider {...promoSliderSettings}>
                          {promoOfferImages.map((imgUrl, index) => (
                            <Box
                              key={index}
                              sx={{
                                width: "100%",
                                height: "211px",
                                borderRadius: 2,
                                overflow: "hidden",
                              }}
                            >
                              <img
                                src={imgUrl}
                                alt={`Promo ${index + 1}`}
                                onClick={() => setPopupImage(imgUrl)}
                                style={{
                                  width: "100%",
                                  height: "211px",
                                  objectFit: "cover",
                                  borderRadius: "8px",
                                  cursor: "pointer",
                                }}
                              />
                            </Box>
                          ))}
                        </Slider>
                      </Box>
                    )
                  ) : (
                    // Fallback default banner
                    <Box
                      sx={{
                        width: "100%",
                        height: "211px",
                        background: theme.theme2.offersCardBg,
                        borderRadius: 2,
                        display: "flex",
                      }}
                    >
                      {/* Gold Pot Image */}
                      <Box
                        sx={{
                          width: "45%",
                          padding: "0 0 0 15px",
                          display: "flex",
                        }}
                      >
                        <img
                          src={goldPot}
                          alt="Gold Pot"
                          style={{
                            width: "130px",
                            marginTop: "auto",
                            mixBlendMode: "screen",
                          }}
                        />
                      </Box>

                      {/* The Text */}
                      <Box
                        sx={{
                          width: "60%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          color: "#fff",
                        }}
                      >
                        <img
                          src={logo}
                          alt="Logo"
                          style={{
                            width: "80px",
                            // filter: "brightness(0) invert(1)",
                          }}
                        />
                        <Typography
                          sx={{
                            textAlign: "center",
                            fontFamily: "italiana",
                            fontSize: "24px",
                          }}
                        >
                          GOLD COINS
                        </Typography>
                        <Typography
                          sx={{
                            textAlign: "center",
                            fontFamily: "monospace",
                            fontSize: "12px",
                            fontWeight: 100,
                          }}
                        >
                          For the new beginning
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Offers Card Section (Sticky Above Footer) */}
              {/* <Box
                sx={{
                  position: "fixed",
                  bottom: `calc(56px + ${safeAreaBottom})`,
                  width: "100vw",
                  left: 0,
                  right: 0,
                  // height: "150px",
                  // zIndex: 1200,
                }}
              >
                <img
                  src={
                    (storeAssets?.storeImages?.length > 0 &&
                      storeAssets?.storeImages?.find(
                        (img) => img.type === "Footer Promotional Card",
                      )?.image_url) ||
                    "https://kumuduorderapp.blob.core.windows.net/testing/offer_card.PNG"
                  }
                  alt="Footer Promotional Card"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </Box> */}
            </>
          )}
        </Box>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ bottom: "72px !important" }} // Override default MUI style
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      {/* Image Popup */}
      {/* Image Popup with Zoom */}
      {/* Image Popup with Zoom & Close Button */}
      {popupImage && (
        <Box
          onClick={() => setPopupImage(null)} // close on overlay click
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          {/* This box contains the zoomable image and the close button */}
          <Box
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
            sx={{
              position: "relative",
              width: "98vw",
              height: "55vh",
              maxWidth: "98vw",
              maxHeight: "55vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {/* Close button (X) */}
            <Box
              onClick={() => setPopupImage(null)}
              sx={{
                position: "absolute",
                top: "-10px",
                right: "-2px",
                zIndex: 10000,
                backgroundColor: "rgba(0,0,0,0.7)",
                color: "white",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "20px",
                fontWeight: "bold",
                border: "1px solid rgba(255,255,255,0.3)",
                transition: "all 0.2s",
                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.9)",
                  transform: "scale(1.05)",
                },
              }}
            >
              ✕
            </Box>

            {/* Zoomable image container */}
            <TransformWrapper
              initialScale={1}
              minScale={0.8}
              maxScale={3}
              limitToBounds={true} // prevents panning outside the container
              centerOnInit={true} // start centered
              pinch={{ step: 10 }}
              doubleClick={{ mode: "zoomIn", step: 0.5 }}
              wheel={{ disabled: true }} // disable mouse wheel on mobile (optional)
            >
              {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                <TransformComponent
                  wrapperStyle={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                  contentStyle={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={popupImage}
                    alt="Full View"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      width: "auto",
                      height: "auto",
                      objectFit: "contain",
                      borderRadius: "12px",
                      display: "block",
                    }}
                  />
                </TransformComponent>
              )}
            </TransformWrapper>
          </Box>
        </Box>
      )}
    </>
  );
}

export default DashboardPage3;
