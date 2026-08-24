import React, { useContext, useState, useEffect } from "react";

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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

// Contexts and configuration
import { StoreContext } from "../contexts/StoreContext";
import APP_CONFIG from "../config/constants"; // static storeID
import theme from "../theme";

// Custom components
import LoadingScreen from "./LoadingScreen";

// Assets (images)
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

import { AuthContext } from "../contexts/AuthContext";

import { App as CapacitorApp } from "@capacitor/app";
import { useSafeAreaTop, useSafeAreaBottom } from "../SafeAreaFile";
import { Capacitor } from "@capacitor/core";
import FallbackScreen from "./FallbackScreen";

function DashboardPage2() {
  const topInset = useSafeAreaTop();
  const bottomInset = useSafeAreaBottom();
  const isIOS = Capacitor.getPlatform() === "ios";

  const safeAreaTop = topInset;
  const safeAreaBottom = bottomInset;
  // --- Fetch user data from localStorage ---
  // const userInfo = JSON.parse(localStorage.getItem("adminUser"));
  // const role = localStorage.getItem("loginRole");

  // --- React Hooks & Context ---
  const { storeAssets } = useContext(StoreContext);
  const { loginRole, adminUser } = useContext(AuthContext);
  const userInfo = adminUser;
  const role = loginRole;

  const [showAllMetalRates, setShowAllMetalRates] = useState(false);
  const [searchInFocus, setSearchInFocus] = useState(false);
  const [fallbackOpen, setFallbackOpen] = useState(false);

  const [digiGoldMinAmount, setDigiGoldMinAmount] = useState(100);
  const [metalRates, setMetalRates] = useState([]); // Metal rates like gold/silver with purity
  const [existingPlansList, setExisitingPlansList] = useState([]); // Available store plans
  const [plan, setPlan] = useState(null); // User's active plan (latest one)
  const [digiGoldPlan, setDigiGoldPlan] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { categories = [] } = storeAssets || {};

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

  //Apply SAFC AREA
  // useEffect(() => {
  //   const refreshSafeArea = () => {
  //     setSafeAreaVariables();
  //     setTimeout(setSafeAreaVariables, 100);
  //     setTimeout(setSafeAreaVariables, 300);
  //     setTimeout(setSafeAreaVariables, 1000);
  //   };

  //   // Run immediately
  //   refreshSafeArea();

  //   // Listen to resize and scroll (keyboard open, etc.)
  //   window.addEventListener("resize", refreshSafeArea);
  //   window.visualViewport?.addEventListener("resize", refreshSafeArea);
  //   window.visualViewport?.addEventListener("scroll", refreshSafeArea);

  //   // Resume event from Capacitor — lock/unlock
  //   let resumeHandler;
  //   CapacitorApp.addListener("resume", () => {
  //     refreshSafeArea();
  //   }).then((handler) => {
  //     resumeHandler = handler;
  //   });

  //   return () => {
  //     window.removeEventListener("resize", refreshSafeArea);
  //     window.visualViewport?.removeEventListener("resize", refreshSafeArea);
  //     window.visualViewport?.removeEventListener("scroll", refreshSafeArea);
  //     if (resumeHandler) resumeHandler.remove();
  //   };
  // }, []);

  // --- Fetching store data

  useEffect(() => {
    // --- Fetch metal rates
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

    // --- fetch latest enrolled plan
    // const plansDataFetcher = async () => {
    //   if (!userInfo) return;

    //   const { STORE_ID, BRANCH } = APP_CONFIG;
    //   // const url = `${process.env.REACT_APP_API_BASE_URL}/api/core/member-with-group?idAndGroup=${userInfo.mobile}&storeID=${STORE_ID}&branch=${APP_CONFIG.BRANCH}`;
    //   const url = `${process.env.REACT_APP_API_BASE_URL}/api/core/member-with-group?idAndGroup=${userInfo.mobile}&storeID=${STORE_ID}`;
    //   try {
    //     const { data } = await axios.get(url);

    //     if (data.length === 0) {
    //       setPlan([]);
    //     } else {
    //       // Pick the latest created plan
    //       const latestPlan = data.reduce((latest, current) =>
    //         new Date(current.member_created_at) >
    //         new Date(latest.member_created_at)
    //           ? current
    //           : latest,
    //       );
    //       setPlan(latestPlan);
    //     }
    //   } catch (err) {
    //     console.error("Failed to fetch plans:", err);
    //     setPlan([]);
    //   }
    // };

    const plansDataFetcher = async () => {
      if (!userInfo) return;

      const { STORE_ID, BRANCH } = APP_CONFIG;
      const url = `${process.env.REACT_APP_API_BASE_URL}/api/core/member-with-group?idAndGroup=${userInfo.mobile}&storeID=${STORE_ID}`;
      try {
        const { data } = await axios.get(url);
        const currentDate = new Date();

        // Filter out plans where info === "A" AND MaturityDate < currentDate
        const filteredData = data.filter((plan) => {
          const isInfoA = plan.info === "A";
          const maturityDate = plan.MaturityDate
            ? new Date(plan.MaturityDate)
            : null;
          const isPast =
            maturityDate && !isNaN(maturityDate) && maturityDate < currentDate;
          // Keep the plan unless both conditions are true
          return !(isInfoA && isPast);
        });

        if (filteredData.length === 0) {
          setPlan([]);
        } else {
          // Pick the latest created plan from filtered data
          const latestPlan = filteredData.reduce((latest, current) =>
            new Date(current.member_created_at) >
            new Date(latest.member_created_at)
              ? current
              : latest,
          );
          setPlan(latestPlan);
        }
      } catch (err) {
        console.error("Failed to fetch plans:", err);
        setPlan([]);
      }
    };

    // --- Fetch available plans
    const fetchExistingPlans = async () => {
      const storeID = APP_CONFIG.STORE_ID;
      const branchId = APP_CONFIG.BRANCH;

      // const url = `${process.env.REACT_APP_API_BASE_URL}/api/core/getGroups?store_id=${storeID}&branch=${branchId}`;
      const url = `${process.env.REACT_APP_API_BASE_URL}/api/core/getGroups?store_id=${storeID}&branch=${branchId}`;
      try {
        const response = await axios.get(url);

        setExisitingPlansList(response?.data.slice(0, 4)); // Show top 4
        const dgPlan = response?.data.find((plan) => plan.gold_scheme == "1");

        setDigiGoldPlan(dgPlan);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Failed to fetch plans.",
          severity: "error",
        });
        console.error("Failed to fetch plans:", error);
      }
    };

    fetchMetalRates();
    plansDataFetcher();
    fetchExistingPlans();
  }, [adminUser]);

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

  // --- Slider Settings for Displaying Store Plans ---
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
    if (loginRole === "guest") {
      setFallbackOpen(true); // show the modal
      return;
    }

    if (!data) {
      setSnackbar({
        open: true,
        message: "We’re sorry, DigiGold plans are not offered right now.",
        severity: "warning",
      });
      return;
    }
    navigate("/select-plan/contact", { state: data });
  };

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
        <Box sx={{ marginTop: 2, mb: "120px" }}>
          {/* Metal Rates Section */}
          <Box
            sx={{
              width: "100vw",
              minHeight: "56px",
              backgroundColor: "#fff",
              marginLeft: "-16px",
              marginRight: "-16px",
              position: "fixed",
              // top: "56px",
              top: isIOS ? "56px" : `calc(56px + ${safeAreaTop})`,
              boxShadow: "0 2px 5px #cccccc",
              zIndex: 1200,
            }}
          >
            {/* Metal Rates Section Transition */}
            <Collapse in={showAllMetalRates} timeout={400} unmountOnExit>
              <Box
                sx={{
                  width: "100vw",
                  display: "flex",
                  flexDirection: "column",
                  px: 2,
                  py: 1,
                  backgroundColor: "#FFF",
                  maxHeight: "300px",
                  overflowY: "auto",
                }}
              >
                {metalRates.map((item, index) => {
                  const metal = item.metal.toLowerCase();
                  const metalName =
                    metal.charAt(0).toUpperCase() + metal.slice(1);
                  const iconSrc = metalIcons[metal];

                  let karatOrPurityDisplay = "-";
                  if (metal === "gold") {
                    const purityStr = item.purity?.toString() || "";
                    const match = purityStr.match(/^(\d{3})/); // e.g. 916 from 916HM
                    if (match) {
                      const numericPurity = parseFloat(match[1]);
                      const karat = Math.round((numericPurity / 1000) * 24); // 916 -> 22
                      karatOrPurityDisplay = `${karat}KT`;
                    }
                  } else if (metal === "silver") {
                    karatOrPurityDisplay = `${item.purity}%`;
                  }

                  return (
                    <Box
                      key={index}
                      sx={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        py: 1,
                        borderTop: "1px solid #E0E0E0",
                      }}
                    >
                      {iconSrc && (
                        <img
                          style={{ width: "25px", marginRight: "16px" }}
                          src={iconSrc}
                          alt={`${metalName} Icon`}
                        />
                      )}
                      <Box>
                        <Typography sx={{ fontSize: "13px", fontWeight: 600 }}>
                          {metalName} Rate
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "12px",
                            color: theme.theme2.primaryHeading,
                          }}
                        >
                          ₹ {new Intl.NumberFormat("en-IN").format(item.rate)} /{" "}
                          {karatOrPurityDisplay} per gram
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Collapse>

            <Collapse in={!showAllMetalRates} timeout={400} unmountOnExit>
              <Box
                sx={{
                  transform: "rotate(180deg)", // flip container to force downward effect
                  overflow: "hidden",
                }}
              >
                <Slider {...settings}>
                  {metalRates.map((item, index) => {
                    const metal = item.metal.toLowerCase();
                    const metalName =
                      metal.charAt(0).toUpperCase() + metal.slice(1);
                    const iconSrc = metalIcons[metal];

                    let karatOrPurityDisplay = "-";
                    if (metal === "gold") {
                      const purityStr = item.purity?.toString() || "";
                      const match = purityStr.match(/^(\d{3})/); // e.g. 916 from 916HM
                      if (match) {
                        const numericPurity = parseFloat(match[1]);
                        const karat = Math.round((numericPurity / 1000) * 24); // 916 -> 22
                        karatOrPurityDisplay = `${karat}KT`;
                      }
                    } else if (metal === "silver") {
                      karatOrPurityDisplay = `${item.purity}%`;
                    }

                    return (
                      <Box
                        key={index}
                        sx={{
                          width: "100%",
                          height: "56px",
                          display: "flex",
                          alignItems: "center",
                          transform: "rotate(180deg)",
                          paddingX: 2,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            height: "100%",
                          }}
                        >
                          {iconSrc && (
                            <img
                              style={{ width: "25px", marginRight: "20px" }}
                              src={iconSrc}
                              alt={`${metalName} Icon`}
                            />
                          )}
                          <Box>
                            <Typography
                              sx={{ fontSize: "12px", fontWeight: 600 }}
                            >
                              {metalName} Rate
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "12px",
                                color: theme.theme2.primaryHeading,
                              }}
                            >
                              ₹{" "}
                              {new Intl.NumberFormat("en-IN").format(item.rate)}{" "}
                              / {karatOrPurityDisplay} per gram
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Slider>
              </Box>
            </Collapse>

            <Typography
              onClick={() => setShowAllMetalRates(!showAllMetalRates)}
              sx={{
                position: "absolute",
                top: "23px",
                right: "0",
                marginRight: "20px",
                fontSize: "12px",
                color: theme.theme2.primaryHeading,
              }}
            >
              {showAllMetalRates ? "Close" : "View all "}
            </Typography>
          </Box>

          {/*Search bar */}
          <Box
            sx={{
              mt: "70px",
              mb: 2,
              display: "flex",
              alignItems: "center",
              width: "100%",
            }}
          >
            {/* Back Arrow – always mounted for reverse animation */}
            <Box
              sx={{
                transition: "all 0.3s ease-in-out",
                transform: searchInFocus
                  ? "translateX(0)"
                  : "translateX(-20px)",
                opacity: searchInFocus ? 1 : 0,
                pointerEvents: searchInFocus ? "auto" : "none",
                width: searchInFocus ? "40px" : "0px", // no space when hidden
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IoIosArrowRoundBack
                onClick={() => {
                  setSearchInFocus(false);
                  setSearchTerm("");
                }}
                style={{
                  fontSize: "40px",
                  color: theme.colors.primaryButton,
                  cursor: "pointer",
                  transition: "all 0.4s ease-in-out",
                }}
              />
            </Box>

            {/* Search Field – flexible width */}
            <Box
              sx={{
                flexGrow: 1,
                transition: "all 0.4s ease-in-out",
              }}
            >
              <TextField
                onFocus={() => setSearchInFocus(true)}
                variant="outlined"
                fullWidth
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Products"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "20px",
                    transition: "all 0.4s ease-in-out",
                    "& fieldset": {
                      borderColor: theme.colors.primaryButton,
                    },
                    "&:hover fieldset": {
                      borderColor: theme.colors.primaryButton,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: theme.colors.primaryButton,
                    },
                  },
                  input: {
                    color: "black",
                  },
                }}
                InputProps={{
                  sx: {
                    borderRadius: "20px",
                  },
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ mr: 1 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Box>

          {/*Search Screen */}
          {searchInFocus && (
            <SearchCategories
              setSearchTerm={setSearchTerm}
              searchTerm={searchTerm}
              filteredCategories={filteredCategories}
            />
          )}

          {/*Main dashboard */}
          {!searchInFocus && (
            <>
              {/*  Digi Gold Banner  */}
              <Box>
                <Box
                  onClick={(e) => handleSelectPlan(e, digiGoldPlan)}
                  sx={{
                    width: "100%",
                    height: "162px",
                    borderRadius: 2,
                    backgroundColor: theme.theme2.digiGoldbg,
                    display: "flex",
                    px: 2,
                  }}
                >
                  {/* Left: Images */}
                  <Box
                    sx={{ width: "40%", margin: "0 auto", overflow: "hidden" }}
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
                  <Box sx={{ width: "60%", padding: "15px 0" }}>
                    <Typography sx={{ fontSize: "12px" }}>
                      Start at a Minimum of Just
                    </Typography>
                    <Box
                      sx={{
                        borderBottom: `1px solid ${theme.colors.primaryHeading}`,
                        my: "4px",
                      }}
                    />
                    <Typography
                      sx={{
                        fontSize: "37px",
                        color: theme.theme2.primaryHeading,
                      }}
                    >
                      ₹{digiGoldMinAmount}
                    </Typography>
                    <Typography sx={{ fontSize: "10px" }}>
                      Take the first step to invest in gold in an easy way
                    </Typography>
                    <Box
                      sx={{
                        borderBottom: `1px solid ${theme.colors.primaryHeading}`,
                        my: "6px",
                      }}
                    />
                    <Typography sx={{ fontSize: "9px" }}>
                      Simple | Adaptable | Accessible
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Categories Carousel */}
              {filteredCategories.length > 0 && (
                <Box sx={{ my: 2 }}>
                  {searchTerm === "" && (
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
                              height: "123px",
                              width: "100%",
                              backgroundImage: `url(${category.image_url})`,
                              backgroundSize: "contain",
                              backgroundPosition: "center",
                              backgroundRepeat: "no-repeat",
                              borderRadius: 2,
                            }}
                          />
                          <Typography
                            variant="subtitle2"
                            sx={{
                              mt: 1,
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
                      ))}
                    </Slider>
                  )}
                </Box>
              )}

              {/* Saving Plans Section */}
              <Box>
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
                        maxWidth: "800px",
                        margin: "0 auto",
                      }}
                    >
                      {existingPlansList.length === 1 ? (
                        // ✅ Static single plan (no slider)
                        <Box>
                          <Box
                            sx={{
                              mb: 1,
                              height: "164px",
                              background: theme.theme2.gradient[0],
                              borderRadius: 2,
                              display: "flex",
                              justifyContent: "space-between",
                              px: 2,
                            }}
                          >
                            {/* Left: Plan Content */}
                            <Box
                              sx={{
                                width: "70%",
                                color: "#fff",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                              }}
                            >
                              <Box
                                sx={{
                                  width:
                                    logoOrientation === "vertical"
                                      ? 30
                                      : logoOrientation === "horizontal"
                                      ? 55
                                      : 40,
                                  height:
                                    logoOrientation === "vertical"
                                      ? 55
                                      : logoOrientation === "horizontal"
                                      ? 30
                                      : 40,
                                  backgroundImage: `url(${storeLogo})`,
                                  backgroundSize: "contain",
                                  backgroundPosition: "center",
                                  backgroundRepeat: "no-repeat",
                                  // filter: "brightness(0) invert(1)",
                                }}
                              />

                              <Typography
                                sx={{ fontSize: "16px", fontWeight: 900 }}
                              >
                                {existingPlansList[0].code}
                              </Typography>
                              <Typography sx={{ fontSize: "13px" }}>
                                {existingPlansList[0].scheme_name}
                              </Typography>
                              <Typography sx={{ fontSize: "10px", mb: 1 }}>
                                {existingPlansList[0].scheme_desc}
                              </Typography>
                              <Button
                                onClick={(e) =>
                                  handleSelectPlan(e, existingPlansList[0])
                                }
                                sx={{
                                  width: "84px",
                                  height: "30px",
                                  border: "1px solid #fff",
                                  fontSize: "11px",
                                  color: "#fff",
                                }}
                              >
                                Join Now
                              </Button>
                            </Box>

                            {/* Right: Coin Image */}
                            <Box
                              sx={{
                                width: "30%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-end",
                              }}
                            >
                              <img
                                src={goldCoin}
                                alt="gold coin"
                                style={{
                                  width: "71px",
                                  filter:
                                    "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.3))",
                                }}
                              />
                            </Box>
                          </Box>
                        </Box>
                      ) : (
                        // ✅ Slider for 2 or more
                        <Slider
                          {...{
                            ...storePlansSliderSetting,
                            slidesToShow:
                              existingPlansList.length >= 3
                                ? 3
                                : existingPlansList.length, // 2 → 2 slides, 3+ → 3 slides
                          }}
                        >
                          {existingPlansList.map((plan, key) => (
                            <Box key={key}>
                              <Box
                                sx={{
                                  mb: 1,
                                  height: "164px",
                                  background:
                                    theme.theme2.gradient[
                                      key % theme.theme2.gradient.length
                                    ],
                                  borderRadius: 2,
                                  display: "flex",
                                  justifyContent: "space-between",
                                  px: 2,
                                }}
                              >
                                {/* Left: Plan Content */}
                                <Box
                                  sx={{
                                    width: "70%",
                                    color: "#fff",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width:
                                        logoOrientation === "vertical"
                                          ? 30
                                          : logoOrientation === "horizontal"
                                          ? 55
                                          : 40,
                                      height:
                                        logoOrientation === "vertical"
                                          ? 55
                                          : logoOrientation === "horizontal"
                                          ? 30
                                          : 40,
                                      backgroundImage: `url(${storeLogo})`,
                                      backgroundSize: "contain",
                                      backgroundPosition: "center",
                                      backgroundRepeat: "no-repeat",
                                      // filter: "brightness(0) invert(1)",
                                    }}
                                  />

                                  <Typography
                                    sx={{ fontSize: "16px", fontWeight: 900 }}
                                  >
                                    {plan.code}
                                  </Typography>
                                  <Typography sx={{ fontSize: "13px" }}>
                                    {plan.scheme_name}
                                  </Typography>
                                  <Typography sx={{ fontSize: "10px", mb: 1 }}>
                                    {plan.scheme_desc}
                                  </Typography>
                                  <Button
                                    onClick={(e) => handleSelectPlan(e, plan)}
                                    sx={{
                                      width: "84px",
                                      height: "30px",
                                      border: "1px solid #fff",
                                      fontSize: "11px",
                                      color: "#fff",
                                    }}
                                  >
                                    Join Now
                                  </Button>
                                </Box>

                                {/* Right: Coin Image */}
                                <Box
                                  sx={{
                                    width: "30%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                  }}
                                >
                                  <img
                                    src={goldCoin}
                                    alt="gold coin"
                                    style={{
                                      width: "71px",
                                      filter:
                                        "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.3))",
                                    }}
                                  />
                                </Box>
                              </Box>
                            </Box>
                          ))}
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

              {/*  Promotions & Offers  */}
              <Box>
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
                <Box
                  sx={{
                    height: "211px",
                    backgroundColor: "#690B09",
                    borderRadius: 2,
                    display: "flex",
                    mb: 10,
                  }}
                >
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
                    {/* <img
                    src={logo}
                    style={{ filter: "brightness(0) invert(1)", width: "80px" }}
                    alt="Logo"
                  /> */}
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
              </Box>

              {/* Offers Card Section (Sticky Above Footer) */}
              <Box
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
                  src="https://kumuduorderapp.blob.core.windows.net/testing/offer_card.PNG"
                  alt="Bottom Banner"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </Box>
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
    </>
  );
}

export default DashboardPage2;
