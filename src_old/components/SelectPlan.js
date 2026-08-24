import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Snackbar,
  Alert,
  Collapse,
} from "@mui/material";
import theme from "../theme";
import { IoArrowForwardCircle, IoArrowBackCircle } from "react-icons/io5";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import braceleteImg from "../assets/img/icons/braceletImg.png";
import earringsImg from "../assets/img/icons/earringsImg.png";
import bangleImg from "../assets/img/icons/bangleImg.png";
import jeweleryImg from "../assets/img/icons/jeweleryImg.png";
import APP_CONFIG from "../config/constants";
import LoadingScreen from "./LoadingScreen";
import bannerImg from "../assets/img/icons/selectPlanBanner.png";
import storeLogo from "../assets/img/logo/logo.png";
import PlanCard from "./PlanCard";
import PlanCalculation from "./PlanCalculation";
import FallbackScreen from "./FallbackScreen";
import { AuthContext } from "../contexts/AuthContext";
import { StoreContext } from "../contexts/StoreContext";

function SelectPlan() {
  const navigate = useNavigate();
  const { loginRole } = useContext(AuthContext);
  const { storePlans, storeAssets } = useContext(StoreContext);

  const [logoOrientation, setLogoOrientation] = useState("square");

  function getLogoOrientation(width, height) {
    const ratio = width / height;
    if (ratio > 1.2) return "horizontal";
    if (ratio < 0.8) return "vertical";
    return "square";
  }

  useEffect(() => {
    const img = new Image();
    // img.src = storeLogo;
    img.src = storeLogo;
    img.onload = () => {
      const orientation = getLogoOrientation(
        img.naturalWidth,
        img.naturalHeight,
      );
      setLogoOrientation(orientation);
    };
  }, [storeLogo]);

  const [existingPlansList, setExisitingPlansList] = useState([]); //State for setting the existing plans
  const [expandedPlanId, setExpandedPlanId] = useState(null); //state for managing exppand and shrink feature
  const [fallbackOpen, setFallbackOpen] = useState(false);
  const [digiGoldPlan, setDigiGoldPlan] = useState(null);
  const [dgExpand, setDgExpand] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  //state for handling Pagination----------
  const [currentPage, setCurrentPage] = useState(1);

  const imagesArr = [braceleteImg, earringsImg, bangleImg, jeweleryImg];

  //Fetching all the available plans
  useEffect(() => {
    const fetchExistingPlans = async () => {
      // const storeID = 802;
      // const branchId = "RRG";

      const storeID = APP_CONFIG.STORE_ID;
      const branchId = APP_CONFIG.BRANCH;
      setExisitingPlansList(storePlans);
      // const dgPlan = storePlans.find((plan) => plan.gold_scheme == "1");
      const DIGI_CODES = ["DIGIG24", "DIGIG22", "DIGIS"];
      const dgPlan = storePlans.find(
        (plan) =>
          plan.gold_scheme == "1" &&
          !DIGI_CODES.includes(plan.code?.toUpperCase()),
      );

      setDigiGoldPlan(dgPlan);

      // const url = `${process.env.REACT_APP_API_BASE_URL}/api/core/getGroups?store_id=${storeID}&branch=${branchId}`;
      // try {
      //   const response = await axios.get(url);
      //   setExisitingPlansList(response?.data);
      //   const dgPlan = response?.data.find((plan) => plan.gold_scheme == "1");

      //   setDigiGoldPlan(dgPlan);

      //   window.scrollTo({ top: 0, behavior: "smooth" });
      // } catch (error) {
      //   setSnackbar({
      //     open: true,
      //     message: "Failed to fetch plans.",
      //     severity: "error",
      //   });
      //   console.error("Failed to fetch plans:", error);
      // }
    };
    fetchExistingPlans();
  }, []);

  //Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(existingPlansList?.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = existingPlansList?.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  //Go to prev page
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      setTimeout(() => {
        window.scrollTo({ top: 100, behavior: "smooth" });
      }, 50);
    }
  };

  //Go to next page
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      setTimeout(() => {
        window.scrollTo({ top: 100, behavior: "smooth" });
      }, 50);
    }
  };

  //Handle select plan
  // const handleSelectPlan = (e, data) => {
  //   e.stopPropagation();
  //   if (!data) return;

  //   if (loginRole === "guest") {
  //     setFallbackOpen(true); // show the modal
  //     return;
  //   }

  //   navigate("/select-plan/contact", { state: data });
  // };
  const DIGI_CODES = ["DIGIG24", "DIGIG22", "DIGIS"];

  const handleSelectPlan = (e, data) => {
    e.stopPropagation();
    if (!data) return;

    if (loginRole === "guest") {
      setFallbackOpen(true);
      return;
    }

    // If it's a digi plan (not yet enrolled, coming from plan list)
    // route to DigiMetalSchemes page instead of contact page
    const code = data?.code?.toUpperCase();
    if (DIGI_CODES.includes(code)) {
      const metalType = code === "DIGIS" ? "silver" : "gold";
      navigate(`/digi-metal/${metalType}`);
      return;
    }

    navigate("/select-plan/contact", { state: data });
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
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

      {/*Select plan banner */}
      {fallbackOpen === false && (
        <>
          <Box
            sx={{
              backgroundImage: `url(${
                storeAssets?.storeImages?.find(
                  (storeImg) => storeImg.type === "All Plans Banner",
                )?.image_url || bannerImg
              })`,

              backgroundSize: "cover",
              backgroundPosition: "top",
              backgroundRepeat: "no-repeat",
              width: "calc(100vw)",
              // height: "315px",
              height: "256px",
              position: "relative",
              marginLeft: "-16px",
              marginRight: "-16px",
              marginBottom: 2.5,
              // marginTop: "60px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                width: "50%",
                mx: "24px",
                // position: "absolute",
                justifyContent: "center",
              }}
            >
              {/* <img
            src={storeLogo}
            alt="Banner"
            style={{
              margin: "10px 0 ",
              width: 55,
              height: "auto",
              filter: "brightness(0) saturate(100%) invert(100%)",
            }}
          /> */}
              <Box
                sx={{
                  position: "absolute",
                  top: "5%",
                  left: "24px",
                  width:
                    logoOrientation === "vertical"
                      ? 120
                      : logoOrientation === "horizontal"
                      ? 130
                      : 40,
                  height:
                    logoOrientation === "vertical"
                      ? 45
                      : logoOrientation === "horizontal"
                      ? 50
                      : 40,
                  backgroundImage: `url(${storeLogo})`,
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                  // filter: "brightness(0) invert(1)",
                }}
              />

              <Box sx={{ mt: 6 }}>
                <Box
                  sx={{
                    position: "relative",
                    width: "120px",
                    height: "21px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 2,
                  }}
                >
                  {/* Border layer with clipped top */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      border: `1px solid ${theme.calculatePlans.mahaBenefitBgc}`,
                      clipPath:
                        "polygon(0 0, 0 0, 50% 20%, 100% 0, 100% 0, 100% 100%, 0 100%)",
                      pointerEvents: "none",
                    }}
                  />

                  {/* Text floating above */}
                  <Typography
                    sx={{
                      color: "#fff",
                      fontSize: 14,
                      px: 1,
                      position: "absolute",
                      top: -5,
                      fontWeight: 500,
                    }}
                  >
                    Join new plan
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 400,
                  }}
                >
                  {digiGoldPlan?.scheme_desc}
                </Typography>
              </Box>
            </Box>
            {/* {digiGoldPlan && (
              <Box
                sx={{
                  // position: "absolute",
                  // bottom: 24,
                  left: "24px", // same as margin used elsewhere
                  display: "flex",
                  gap: 2,
                  my: 3,
                  mx: "24px",
                }}
              >
                <Button
                  onClick={(e) => handleSelectPlan(e, digiGoldPlan)}
                  sx={{
                    background: theme.theme2.selectPlan.primaryBtn,
                    width: 120,
                    height: 40,
                    borderRadius: 2,
                    fontSize: 12,
                  }}
                  variant="contained"
                >
                  ENROLL NOW
                </Button>
                <Button
                  onClick={() => setDgExpand((prev) => !prev)}
                  sx={{
                    background: theme.theme2.selectPlan.primaryBtn,

                    width: 120,
                    height: 40,
                    borderRadius: 2,
                    fontSize: 12,

                    color: "#fff",
                  }}
                  variant="contained"
                >
                  {dgExpand ? "Close" : "Know More"}
                </Button>
              </Box>
            )} */}
          </Box>
          <Collapse in={dgExpand} timeout={500} unmountOnExit>
            <Box width="100%" maxWidth={500} borderRadius={2} p={2}>
              <PlanCalculation
                schemeAmount={digiGoldPlan?.AMOUNT}
                noOfInstallments={digiGoldPlan?.no_inst}
                paidAmount={digiGoldPlan?.amountPaid}
              />

              {/* Expanded Pay Button */}
              <Box
                onClick={(e) => handleSelectPlan(e, digiGoldPlan)}
                width="100%"
                display="flex"
                justifyContent="center"
                alignItems="center"
                bgcolor={theme.calculatePlans.enrollBtnBg}
                borderRadius="5px"
                padding="0.6rem"
                mt={2}
              >
                <Typography
                  sx={{ fontSize: 16 }}
                  color={theme.plans.enrollBtnTxt}
                >
                  Enroll Now
                </Typography>
              </Box>

              {/* Collapse Button */}
              <Box
                onClick={() => setDgExpand(false)}
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{
                  fontSize: 12,
                  width: 84,
                  height: 30,
                  margin: "auto",
                  borderRadius: "5px",
                  bgcolor: theme.calculatePlans.enrollBtnBg,
                  cursor: "pointer",
                  mt: 1.5,
                }}
              >
                <Typography
                  sx={{ fontSize: 12 }}
                  color={theme.plans.enrollBtnTxt}
                >
                  Close
                </Typography>
              </Box>
            </Box>
          </Collapse>
        </>
      )}

      {fallbackOpen === false && !existingPlansList && (
        <LoadingScreen open={true} message="Loading plans..." />
      )}

      {fallbackOpen === false &&
        existingPlansList &&
        existingPlansList.length === 0 && (
          <>
            <Box
              variant="h6"
              sx={{ textAlign: "center", color: theme.colors.primaryHeading }}
            >
              No plans available...
            </Box>
          </>
        )}

      {/*Plans List */}
      {fallbackOpen === false &&
        existingPlansList &&
        existingPlansList.length !== 0 && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap="1.2rem"
            sx={{ overflowY: "auto", marginBottom: 7, width: "100%" }}
          >
            {currentItems.map((el, index) => {
              const isExpanded = expandedPlanId === index;
              const imageUrl = el.media || null;

              return (
                <Box
                  key={index}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  width="100%"
                >
                  <PlanCard
                    handleSelectPlan={handleSelectPlan}
                    el={el}
                    index={index}
                    imageUrl={imageUrl}
                    theme={theme}
                    isExpanded={isExpanded}
                    onPayNow={(e, selectedEl) => {
                      e.stopPropagation();
                      handleSelectPlan(e, selectedEl); // Reuse your logic
                    }}
                    onExpand={(i) => setExpandedPlanId(i)}
                    onCollapse={() => setExpandedPlanId(null)}
                  />
                </Box>
              );
            })}

            {existingPlansList.length > itemsPerPage && (
              <Box display="flex" alignItems="center" gap={2} mt={2}>
                <Button onClick={handlePrevPage} disabled={currentPage === 1}>
                  <IoArrowBackCircle
                    size={32}
                    style={{
                      color:
                        currentPage !== 1 ? theme.colors.primaryButton : "#aaa",
                    }}
                  />
                </Button>
                <Typography variant="body2">
                  Page{" "}
                  <span style={{ color: theme.colors.primaryButton }}>
                    {currentPage}
                  </span>{" "}
                  of {totalPages}
                </Typography>
                <Button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  <IoArrowForwardCircle
                    size={32}
                    style={{
                      color:
                        currentPage !== totalPages
                          ? theme.colors.primaryButton
                          : "#aaa",
                    }}
                  />
                </Button>
              </Box>
            )}
          </Box>
        )}

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

export default SelectPlan;
