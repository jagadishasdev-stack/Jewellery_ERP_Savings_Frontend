import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  TextField,
  Typography,
  InputAdornment,
  Button,
  Collapse,
} from "@mui/material";
import Slider from "react-slick";
import SearchIcon from "@mui/icons-material/Search";
import { StoreContext } from "../contexts/StoreContext";
import theme from "../theme";
import axios from "axios";
import APP_CONFIG from "../config/constants"; // ✅ import static storeID
import LoadingScreen from "./LoadingScreen";
import { useNavigate } from "react-router-dom";
import silverRateCoin from "../assets/img/icons/silverRateCoin.svg";
import goldRateCoin from "../assets/img/icons/goldRateCoin.svg";
import SearchCategories from "./SearchCategories";
import { IoIosArrowRoundBack } from "react-icons/io";
import { AuthContext } from "../contexts/AuthContext";
import { useSafeAreaTop, useSafeAreaBottom } from "../SafeAreaFile";
import { Capacitor } from "@capacitor/core";

function DashboardPage() {
  // const role = localStorage.getItem("loginRole");

  const topInset = useSafeAreaTop();
  const bottomInset = useSafeAreaBottom();
  const isIOS = Capacitor.getPlatform() === "ios";

  const safeAreaTop = isIOS ? 0 : topInset;
  const safeAreaBottom = isIOS ? 0 : bottomInset;

  const { loginRole, adminUser } = useContext(AuthContext);
  const role = loginRole;
  const { storeAssets } = useContext(StoreContext);
  const [searchInFocus, setSearchInFocus] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [metalRates, setMetalRates] = useState([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  const [plan, setPlan] = useState(null);
  let [userInfo, setUserInfo] = useState(null);
  const [showAllMetalRates, setShowAllMetalRates] = useState(false);

  const navigate = useNavigate();
  // console.log(storeAssets);
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

        setMetalRates(response.data);
      } catch (err) {
        console.error("Failed to fetch metal rates:", err);
        // setError('Could not fetch metal prices.');
      } finally {
        // setLoading(false);
      }
    };

    fetchMetalRates();
  }, []);

  //Getting user Data
  useEffect(() => {
    // const adminData = localStorage.getItem("adminUser");
    // const adminDataParsed = JSON.parse(adminData);
    const adminDataParsed = adminUser;
    setUserInfo(adminDataParsed);
  }, [adminUser]);

  // Getting plans data from db
  useEffect(() => {
    const plansDataFetcher = async () => {
      if (!userInfo) return;

      const { STORE_ID, BRANCH } = APP_CONFIG;
      // const url = `${process.env.REACT_APP_API_BASE_URL}/api/core/member-with-group?idAndGroup=${userInfo.mobile}&storeID=${STORE_ID}&branch=${APP_CONFIG.BRANCH}`;
      const url = `${process.env.REACT_APP_API_BASE_URL}/api/core/member-with-group?idAndGroup=${userInfo.mobile}&storeID=${STORE_ID}`;
      try {
        const { data } = await axios.get(url);

        if (data.length === 0) {
          setPlan([]); // No plans found
        } else {
          // Pick the latest created plan
          const latestPlan = data.reduce((latest, current) =>
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

    plansDataFetcher();
  }, [userInfo]);

  //metal verical slider
  const settings = {
    dots: false,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 3000,
    vertical: true,
    verticalSwiping: true,
  };
  const metalIcons = {
    gold: goldRateCoin,
    silver: silverRateCoin,
    // platinum: platinumCoin,
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

  // Slider settings for Store Images Carousel
  const storeImageSliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };
  const DEFAULT_CATEGORIES = [
    { id: "default-1", name: "Gold", image_url: "./gold.png" },
    { id: "default-2", name: "Silver", image_url: "./silver.png" },
    { id: "default-3", name: "Diamond", image_url: "./diamond.png" },
  ];

  const DEFAULT_STORE_IMAGES = [
    {
      id: "default-img-1",
      image_url:
        "https://kumuduorderapp.blob.core.windows.net/savingadmin/All%20Plans%20Banner.jpg",
    },
    {
      id: "default-img-2",
      image_url:
        "https://kumuduorderapp.blob.core.windows.net/savingadmin/Digi%20Gold%20Card.jpg",
    },
  ];
  // --- Conditional Rendering for Loading/Error States ---
  if (!storeAssets) {
    return <LoadingScreen open={true} message="Loading Dashboard..." />;
  }

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

  //  / const { categories = [], storeImages = [] } = storeAssets;
  const categories =
    storeAssets.categories && storeAssets.categories.length > 0
      ? storeAssets.categories
      : DEFAULT_CATEGORIES;

  const storeImages =
    storeAssets.storeImages && storeAssets.storeImages.length > 0
      ? storeAssets.storeImages
      : DEFAULT_STORE_IMAGES;

  // Filter categories based on search term
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // On user click, navigate to next screen with data
  const handleDataForward = (e, data) => {
    e.stopPropagation();

    // Extract user info to pass
    const userInfo = {
      name: data.name,
      email: data.email,
      address1: data.address1,
      address2: data.address2,
      mobile: data.mobile,
    };

    // Navigate to payment & ledger page with state
    navigate("/paymentandledger", {
      state: {
        data,
        userInfo,
      },
    });
  };
  return (
    // The Entire Dashboard
    <Box
      sx={{
        width: "100%",
        minHeight: "80vh",
        paddingBottom: "120px",
        // backgroundColor: theme.dashboard.dashboardScreenBg,
        marginY: 2,
      }}
    >
      <Box
        sx={{
          width: "100vw",
          minHeight: "56px",
          backgroundColor: "#fff",
          marginLeft: "-16px",
          marginRight: "-16px",
          position: "fixed",
          top: `calc(56px + ${safeAreaTop})`,
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
              const metalName = metal.charAt(0).toUpperCase() + metal.slice(1);
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
                        <Typography sx={{ fontSize: "12px", fontWeight: 600 }}>
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
            transform: searchInFocus ? "translateX(0)" : "translateX(-20px)",
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

      {/*Search screen */}
      {searchInFocus && (
        <SearchCategories
          setSearchTerm={setSearchTerm}
          searchTerm={searchTerm}
          filteredCategories={filteredCategories}
        />
      )}

      {!searchInFocus && (
        <>
          {" "}
          {/* Categories Carousel */}
          {filteredCategories.length > 0 ? (
            <Box sx={{ mt: 2 }}>
              {searchTerm === "" ? (
                // 👉 Show slider when there's no search term
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
              ) : (
                // 👉 Show flex wrap grid when searching
                <Box
                  display="flex"
                  flexWrap="wrap"
                  justifyContent="center"
                  gap={2}
                >
                  {filteredCategories.map((category) => (
                    <Box
                      key={category.id}
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      sx={{
                        p: 1,
                        width: "120px",
                      }}
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
                </Box>
              )}
            </Box>
          ) : (
            <Typography
              variant="body1"
              color="textSecondary"
              sx={{ textAlign: "center", mb: 4 }}
            >
              No categories found {searchTerm && `for "${searchTerm}"`}
            </Typography>
          )}
          {/* Store Images Carousel */}
          {storeImages.length > 0 ? (
            <Box
              sx={{
                width: "100%",
                maxWidth: "800px",
                margin: "0 auto",
                ".slick-slider": {
                  overflow: "hidden",
                },
                ".slick-list": {
                  overflow: "hidden",
                  padding: "0 !important", // Remove any default padding
                },
                ".slick-track": {
                  display: "flex",
                },
                ".slick-slide": {
                  float: "none",
                  height: "auto",
                },
                ".slick-slide > div": {
                  height: "100%",
                },
                ".slick-dots li button:before": {
                  color: "#999", // default dot color
                  fontSize: "10px",
                },
                ".slick-dots li.slick-active button:before": {
                  color: theme.colors.primaryButton, // active dot color (e.g., blue)
                },
                ".slick-dots": {
                  bottom: "1px", // optional: move dots lower
                },
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  margin: "0 auto",
                  overflow: "hidden",
                }}
              >
                <Slider {...storeImageSliderSettings}>
                  {storeImages.map((image) => (
                    <Box
                      key={image.id}
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        mb: 6,
                        outline: "none",
                      }}
                    >
                      {/* Apply border radius and overflow here */}
                      <Box
                        sx={{
                          width: "100%",
                          maxWidth: 800,
                          height: 200,
                          borderRadius: 2,
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        {/* Use an <img> tag instead of backgroundImage */}
                        <Box
                          component="img"
                          src={image.image_url}
                          alt="Store"
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Slider>
              </Box>
            </Box>
          ) : (
            <Typography
              variant="body1"
              color="textSecondary"
              sx={{ textAlign: "center" }}
            >
              No store images available.
            </Typography>
          )}
          {/* Your Investments Section */}
          {userInfo && role === "user" && (
            <Box sx={{ width: "100%", mt: 2, mb: 3 }}>
              {/* Top bar */}
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
                    variant="body2"
                    sx={{
                      cursor: "pointer",
                      color: theme.colors.subHeading,
                      textDecoration: "underline",
                    }}
                  >
                    See All
                  </Typography>
                )}
              </Box>

              {/* Investment box */}
              <Box
                onClick={(e) =>
                  plan && !Array.isArray(plan) && handleDataForward(e, plan)
                }
                sx={{
                  height: "70px",
                  width: "100%",
                  mx: "auto",
                  backgroundColor: theme.customColors.planbg,
                  borderRadius: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  px: 2,
                  color: "white",
                  border: `1px solid ${theme.colors.bordercolor}`,
                }}
              >
                {/* Loading */}
                {plan === null && (
                  <Typography sx={{ color: theme.colors.primaryHeading }}>
                    Loading your investments...
                  </Typography>
                )}

                {/* No plan found */}
                {Array.isArray(plan) && plan.length === 0 && (
                  <>
                    <Typography
                      sx={{ color: theme.colors.primaryHeading, fontSize: 14 }}
                    >
                      You haven't join any plan
                    </Typography>
                    <Button
                      onClick={() => navigate("/select-plan")}
                      sx={{
                        marginLeft: 1,
                        background: theme.colors.primaryButton,
                        width: "100px",
                        height: 35,
                        borderRadius: 2,
                        fontSize: 12,
                        padding: 0,
                        boxShadow: 0,
                      }}
                      variant="contained"
                    >
                      ENROLL NOW
                    </Button>
                  </>
                )}

                {/* Plan available */}
                {plan && !Array.isArray(plan) && (
                  <>
                    {/* Left section */}
                    <Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        sx={{ color: theme.colors.primaryButton }}
                      >
                        {plan.mgroup}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: theme.colors.primaryHeading }}
                      >
                        Investment Amount
                      </Typography>
                    </Box>

                    {/* Right section */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        color: theme.colors.primaryButton,
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        Total
                      </Typography>
                      <Typography variant="body2">
                        ₹ {plan.AMOUNT * plan.installCnt}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          )}
          {/* Current Metal Price */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography sx={{ color: "#000", fontWeight: "500" }}>
                Today's Metal Price
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  cursor: "pointer",
                  color: theme.colors.subHeading,
                  textDecoration: "underline",
                }}
              >
                See All
              </Typography>
            </Box>

            {metalRates.map((item) => {
              const isGold = item.metal.toLowerCase() === "gold";
              const imageUrl = isGold
                ? "https://kumuduorderapp.blob.core.windows.net/testing/gold.png"
                : "https://kumuduorderapp.blob.core.windows.net/testing/silver.png";

              const formattedDate = new Date(
                item.updated_on,
              ).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              });

              // ✅ Purity logic
              let purityDisplay = "-";
              if (isGold) {
                const match = item.purity?.toString().match(/^(\d{3})/);
                if (match) {
                  const numericPurity = parseFloat(match[1]);
                  const karat = Math.round((numericPurity / 1000) * 24);
                  purityDisplay = `${karat}KT`;
                }
              } else {
                purityDisplay = `${item.purity}%`;
              }

              return (
                <Box
                  key={item.Id}
                  sx={{
                    height: "90px",
                    width: "100%",
                    mx: "auto",
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "10px",
                    backgroundColor: isGold ? "#A16526" : "#9B9B99",
                  }}
                >
                  {/* Left: Image */}
                  <Box
                    sx={{
                      width: "80px",
                      height: "100%",
                      mr: 2,
                      borderRadius: "10px",
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={item.metal}
                      style={{
                        borderRadius: "10px 0 0 10px",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>

                  {/* Right: Details */}
                  <Box
                    sx={{ display: "flex", flexDirection: "column", flex: 1 }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "bold", color: "white" }}
                    >
                      {item.metal}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "white" }}>
                      ₹{item.rate} | {purityDisplay} per gram
                    </Typography>
                    <Typography variant="caption" sx={{ color: "white" }}>
                      3% GST | Updated on: {formattedDate}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
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
  );
}

export default DashboardPage;
