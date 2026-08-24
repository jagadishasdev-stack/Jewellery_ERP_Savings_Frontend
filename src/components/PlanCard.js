import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Collapse,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
} from "@mui/material";
import PlanCalculation from "./PlanCalculation";
import APP_CONFIG from "../config/constants";
import storeLogo from "../assets/img/logo/logo.png";
import goldPot from "../assets/img/icons/Plan Card Gold Pot.png";
import { useLocation, useNavigate } from "react-router-dom";
import ImageViewer from "../utils/ImageViewer";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// PlanCard Component
const PlanCard = ({
  el,
  index,
  imageUrl,
  theme,
  isExpanded,
  onPayNow,
  onExpand,
  onCollapse,
  handleSelectPlan,
}) => {
  const theme_id = APP_CONFIG.THEME_ID;
  const isEnrolledPlan = el.hasOwnProperty("member_id");
  const [logoOrientation, setLogoOrientation] = useState("square");
  const [confirmDialog, setConfirmDialog] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  // const showKnowMore = location.pathname !== "/dashboard";
  let showKnowMore =
    location.pathname === "/dashboard"
      ? Array.isArray(el.detail_images) && el.detail_images.length > 0
      : true;

  // ----- Image dialog state (no carousel) -----
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [detailImagesArray, setDetailImagesArray] = useState([]);

  // Parse detail_images (could be JSON string or already array)
  const getDetailImages = () => {
    if (!el.detail_images) return [];
    if (Array.isArray(el.detail_images)) return el.detail_images;
    try {
      const parsed = JSON.parse(el.detail_images);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  };

  // Handle "Know More" click
  const handleKnowMoreClick = (e, idx) => {
    e.stopPropagation();
    const images = getDetailImages();
    if (images && images.length > 0) {
      setDetailImagesArray(images);
      setImageDialogOpen(true);
    } else {
      onExpand(idx);
    }
  };

  // Helper for logo orientation
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

  const plan_status = el.info;
  const totalpaidamount = el.amountPaid;

  // Digi plan code
  const DIGI_MGROUPS = ["DIGIG24", "DIGIG22", "DIGIS"];
  const isDigiPlan = DIGI_MGROUPS.includes(el?.mgroup?.toUpperCase());

  const digiSchemeMap = {
    DIGIG24: {
      metal: "gold",
      label: "Digi Gold 24KT",
      purity: "999",
      kt: "24KT",
    },
    DIGIG22: {
      metal: "gold",
      label: "Digi Gold 22KT",
      purity: "916",
      kt: "22KT",
    },
    DIGIS: {
      metal: "silver",
      label: "Digi Silver 925",
      purity: "925",
      kt: "Sterling",
    },
  };

  const digiScheme = isDigiPlan
    ? {
        ...digiSchemeMap[el?.mgroup?.toUpperCase()],
        id: el?.mgroup,
        rate: el?.store_gold_rate || 0,
        plan: el,
      }
    : null;

  const handleDigiNavigate = (e) => {
    e.stopPropagation();
    navigate("/buy-metal", {
      state: {
        scheme: digiScheme,
        initialRate: digiScheme?.rate || 0,
        alreadyEnrolled: true,
        enrolledMember: el,
      },
    });
  };

  // Parse description lines
  const rawDescription = el?.description || "";
  const hasFormattedDescription =
    rawDescription.trim() !== "" && rawDescription.includes("=>");
  const descriptionLines = hasFormattedDescription
    ? rawDescription
        .split("=>")
        .map((line) => line.trim())
        .filter(Boolean)
    : [];

  const DescriptionContent = () => (
    <Box sx={{ p: 2 }}>
      {descriptionLines.map((line, i) => (
        <Typography
          key={i}
          sx={{
            fontSize: 13,
            mb: 0.8,
            color: theme.colors?.subHeading || "#333",
          }}
        >
          {line}
        </Typography>
      ))}
    </Box>
  );

  // Theme 1 Layout
  if (theme_id === 1) {
    return (
      <>
        <Box
          display="flex"
          width="100%"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            height: 157,
            px: 2,
            background: theme.plans.cardBg,
            border: `1px solid ${theme.plans.cardBorderCol}`,
            borderRadius: "10px",
          }}
        >
          <Box
            display="flex"
            justifyContent="center"
            flexDirection="column"
            gap="0.6rem"
            sx={{ width: "80%" }}
          >
            <Typography
              color={theme.colors.primaryHeading}
              sx={{ fontSize: 20 }}
            >
              {el?.code}
              {isEnrolledPlan && `-${el?.member_no}`}
            </Typography>
            <Typography color={theme.colors.subHeading} sx={{ fontSize: 14 }}>
              {isEnrolledPlan ? el?.store_name : el?.scheme_name}
            </Typography>

            <Box display="flex" alignItems="center" gap="0.5rem">
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                  if (isDigiPlan) {
                    handleDigiNavigate(e);
                    return;
                  }
                  if (isEnrolledPlan) {
                    onPayNow(e, el);
                  } else {
                    setConfirmDialog(el);
                  }
                }}
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{
                  color: theme.plans.enrollBtnTxt,
                  width: 84,
                  height: 30,
                  borderRadius: "5px",
                  background: theme.plans.gradient,
                }}
              >
                <Typography sx={{ fontSize: 12 }}>
                  {isEnrolledPlan ? "Pay Now" : "Join New"}
                </Typography>
              </Box>

              {!isExpanded && (
                <Box
                  onClick={(e) => handleKnowMoreClick(e, index)}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  sx={{
                    width: 100,
                    height: 30,
                    borderRadius: "5px",
                    background: theme.plans.gradient,
                  }}
                >
                  <Typography
                    sx={{ fontSize: 12 }}
                    color={theme.plans.enrollBtnTxt}
                  >
                    Know More
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Box
            sx={{
              width: 52,
              height: 52,
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: "cover",
            }}
          />
        </Box>

        <Collapse
          in={isExpanded && getDetailImages().length === 0}
          timeout={500}
          unmountOnExit
        >
          <Box width="100%" maxWidth={500} borderRadius={2} p={2}>
            {hasFormattedDescription ? (
              <DescriptionContent />
            ) : (
              <>
                <PlanCalculation
                  schemeAmount={isEnrolledPlan ? el?.scheme_amount : el?.AMOUNT}
                  noOfInstallments={el?.no_inst}
                  paidAmount={el?.amountPaid}
                />
                <Box
                  onClick={(e) => {
                    if (isDigiPlan) {
                      handleDigiNavigate(e);
                      return;
                    }
                    isEnrolledPlan ? onPayNow(e, el) : handleSelectPlan(e, el);
                  }}
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
                    Start Now
                  </Typography>
                </Box>
              </>
            )}
            <Box
              onClick={onCollapse}
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
    );
  }

  // Theme 2 / 3 Layout
  else if (theme_id === 2 || theme_id === 3) {
    return (
      <>
        <Box sx={{ width: "100%", maxWidth: 500 }}>
          <Box
            display="flex"
            width="100%"
            justifyContent="center"
            flexDirection={"column"}
            sx={{
              height: 157,
              px: 2,
              border: `1px solid ${theme.plans.cardBorderCol}`,
              borderRadius: "10px",
              cursor: "pointer",
              color: `${theme.plans.enrollBtnTxt}`,
              background: imageUrl
                ? `url(${imageUrl}) center/cover no-repeat`
                : theme.theme2.gradient[index % theme.theme2.gradient.length],
            }}
          >
            {el?.scheme_name && (
              <Typography sx={{ fontSize: 14, fontWeight: 600, opacity: 0.85 }}>
                {el?.scheme_name}
              </Typography>
            )}
            <Box
              display="flex"
              width="100%"
              justifyContent="space-between"
              // sx={{
              //   height: 157,
              //   px: 2,
              //   border: `1px solid ${theme.plans.cardBorderCol}`,
              //   borderRadius: "10px",
              //   cursor: "pointer",
              //   color: `${theme.plans.enrollBtnTxt}`,
              //   background: imageUrl
              //     ? `url(${imageUrl}) center/cover no-repeat`
              //     : theme.theme2.gradient[index % theme.theme2.gradient.length],
              // }}
            >
              <Box
                sx={{
                  width: imageUrl ? "100%" : "80%",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 0.5,
                  // minWidth: 0,      // ← add this
                  // overflow: "hidden" // ← add this
                }}
              >
                {isEnrolledPlan && (
                  <Box
                    sx={{
                      width:
                        logoOrientation === "vertical"
                          ? 25
                          : logoOrientation === "horizontal"
                          ? 70
                          : 40,
                      height:
                        logoOrientation === "vertical"
                          ? 55
                          : logoOrientation === "horizontal"
                          ? 55
                          : 40,
                      backgroundImage: `url(${storeLogo})`,
                      backgroundSize: "contain",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      filter: "brightness(0) invert(1)",
                    }}
                  />
                )}

                <Box
                  display="flex"
                  alignItems="center"
                  gap="0.5rem"
                  flexWrap="wrap"
                >
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                    {el?.code}
                    {isEnrolledPlan && `-${el?.member_no}`}
                  </Typography>

                  {isEnrolledPlan ? (
                    <>
                      <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                        |
                      </Typography>
                      {/* <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                      ₹{totalpaidamount?.toLocaleString("en-IN")} Saved
                    </Typography> */}
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                          ₹{totalpaidamount?.toLocaleString("en-IN")}
                        </Typography>

                        {totalpaidamount > 0 && (
                          <CheckCircleIcon
                            sx={{
                              fontSize: 13,
                              color: "#2E7D32",
                              bgcolor: "#fff",
                              borderRadius: "50%",
                              ml: 0.25,
                            }}
                          />
                        )}
                      </Box>
                    </>
                  ) : (
                    <>
                      <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                        |
                      </Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                        ₹{el?.AMOUNT?.toLocaleString("en-IN")}
                      </Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
                        |
                      </Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                        {el?.no_inst}
                        {el.no_inst > 60 ? " Days" : " Months"}
                      </Typography>
                    </>
                  )}
                </Box>

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                >
                  <Box
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isDigiPlan) {
                        handleDigiNavigate(e);
                        return;
                      }
                      if (isEnrolledPlan) {
                        onPayNow(e, el);
                      } else {
                        setConfirmDialog(el);
                      }
                    }}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                      fontSize: "11px",
                      color: theme.plans.enrollBtnTxt,
                      width: 84,
                      height: 30,
                      borderRadius: "5px",
                      border: `1px solid ${theme.plans.enrollBtnTxt}`,
                    }}
                  >
                    <Typography sx={{ fontSize: 12 }}>
                      {isEnrolledPlan ? "Pay Now" : "Join New"}
                    </Typography>
                  </Box>

                  {!isExpanded && showKnowMore && (
                    <Box
                      onClick={(e) => handleKnowMoreClick(e, index)}
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      sx={{
                        width: 100,
                        height: 30,
                        borderRadius: "5px",
                        border: `1px solid ${theme.plans.enrollBtnTxt}`,
                      }}
                    >
                      <Typography
                        sx={{ fontSize: 12 }}
                        color={theme.plans.enrollBtnTxt}
                      >
                        Know More
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {!imageUrl && (
                <Box
                  sx={{
                    width: 80,
                    backgroundSize: "cover",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {isEnrolledPlan && (
                    <Chip
                      label={plan_status === "A" ? "Completed" : "Active"}
                      size="small"
                      sx={{
                        backgroundColor:
                          plan_status === "A" ? "#1E7E34" : "#E6F4EA",
                        color: plan_status === "A" ? "#fff" : "#1E7E34",
                        fontWeight: 600,
                        fontSize: "11px",
                        height: "22px",
                        width: plan_status === "A" ? "80px" : "60px",
                        alignSelf: "flex-start",
                        marginLeft: plan_status === "A" ? "1.8rem" : "1rem",
                        marginTop: "-0.8rem",
                      }}
                    />
                  )}
                  <img
                    style={{
                      width: "80px",
                      filter: "drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.3))",
                    }}
                    src={goldPot}
                    alt="gold pot"
                  />
                </Box>
              )}
            </Box>
          </Box>
          <Collapse
            in={isExpanded && getDetailImages().length === 0}
            timeout={500}
            unmountOnExit
          >
            <Box width="100%" maxWidth={500} borderRadius={2} p={2}>
              {hasFormattedDescription ? (
                <>
                  <DescriptionContent />
                  {!isEnrolledPlan && (
                    <Box
                      onClick={(e) => {
                        if (isDigiPlan) {
                          handleDigiNavigate(e);
                          return;
                        }
                        isEnrolledPlan ? onPayNow(e, el) : setConfirmDialog(el);
                      }}
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
                        Start Now
                      </Typography>
                    </Box>
                  )}
                </>
              ) : (
                <>
                  <PlanCalculation
                    schemeAmount={
                      isEnrolledPlan ? el?.scheme_amount : el?.AMOUNT
                    }
                    noOfInstallments={el?.no_inst}
                    paidAmount={el?.amountPaid}
                  />
                  <Box
                    onClick={(e) => {
                      if (isDigiPlan) {
                        handleDigiNavigate(e);
                        return;
                      }
                      isEnrolledPlan ? onPayNow(e, el) : setConfirmDialog(el);
                    }}
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
                      Start Now
                    </Typography>
                  </Box>
                </>
              )}
              <Box
                onClick={onCollapse}
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
        </Box>

        {/* Confirmation Dialog (unchanged) */}
        {confirmDialog && (
          <Dialog
            open={Boolean(confirmDialog)}
            onClose={() => setConfirmDialog(null)}
            PaperProps={{
              sx: {
                borderRadius: 3,
                width: "92vw",
                maxWidth: "400px",
                mx: "auto",
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5, textAlign: "center" }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700 }}>
                Confirm Enrollment to Join This Plan!
              </Typography>
              <Typography sx={{ fontSize: 12, mt: 0.3 }}>
                You are going to join a new plan with the below details
              </Typography>
            </Box>
            <DialogContent sx={{ px: 2.5, pt: 0.5, pb: 1 }}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                {[
                  {
                    label: "Plan Name",
                    value: confirmDialog?.scheme_name || confirmDialog?.code,
                  },
                  { label: "Group Code", value: confirmDialog?.code },
                  {
                    label:
                      confirmDialog?.no_inst > 60
                        ? "Daily Amount(min.)"
                        : "Monthly Amount(min.)",
                    value:
                      confirmDialog?.no_inst > 60
                        ? `₹${
                            confirmDialog?.min_instal_amt?.toLocaleString(
                              "en-IN",
                            ) || "—"
                          }`
                        : `₹${
                            confirmDialog?.AMOUNT?.toLocaleString("en-IN") ||
                            "—"
                          }`,
                  },
                  {
                    label: "Duration",
                    value: `${confirmDialog?.no_inst} ${
                      confirmDialog?.no_inst > 60 ? "Days" : "Months"
                    }`,
                  },
                ].map((row, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      py: 1,
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "#888",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        mr: 2,
                      }}
                    >
                      {row.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#222",
                        textAlign: "right",
                      }}
                    >
                      {row.value || "—"}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Box
                sx={{
                  mt: 2,
                  bgcolor: "#fff8e1",
                  borderRadius: 2,
                  px: 1.5,
                  py: 1,
                }}
              >
                <Typography
                  sx={{ fontSize: 12, color: "#b45309", textAlign: "center" }}
                >
                  If you want to join New plan Tap <strong>Yes, Join</strong> to
                  become a member of this plan
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 1, gap: 1 }}>
              <Button
                onClick={() => setConfirmDialog(null)}
                variant="outlined"
                fullWidth
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: 14,
                  py: 1,
                  borderColor: "#ccc",
                  color: "#555",
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={(e) => {
                  setConfirmDialog(null);
                  handleSelectPlan(e, confirmDialog);
                }}
                variant="contained"
                fullWidth
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: 14,
                  py: 1,
                  background: theme.plans.gradient,
                  boxShadow: "none",
                }}
              >
                Yes, Join
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Image Dialog – Vertical Scrollable List, Pinch-to-Zoom */}
        {/* <Dialog
          open={imageDialogOpen}
          onClose={() => setImageDialogOpen(false)}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
            Plan Details – {el?.code || ""}
          </DialogTitle>
          <DialogContent
            sx={{
              p: 0.8,
              overflowY: "auto",
              maxHeight: "70vh",
            }}
          >
            <Stack spacing={2}>
              {detailImagesArray.map((img, idx) => (
                <Box key={idx} sx={{ textAlign: "center" }}>
                  <img
                    src={img?.url || img}
                    alt={`detail ${idx + 1}`}
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: 8,
                      cursor: "zoom-in", // optional
                    }}
                    // Allow pinch-to-zoom on touch devices
                    onTouchStart={(e) => {
                      // Let browser handle pinch gesture; no extra code needed
                    }}
                  />
                  {detailImagesArray.length > 1 && (
                    <Typography
                      variant="caption"
                      sx={{ display: "block", mt: 0.5 }}
                    >
                      Page {idx + 1} of {detailImagesArray.length}
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
            <Button
              onClick={() => setImageDialogOpen(false)}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog> */}
        <ImageViewer
          open={imageDialogOpen}
          onClose={() => setImageDialogOpen(false)}
          images={detailImagesArray}
          title={`Plan Details – ${el?.code || ""}`}
        />
      </>
    );
  }
};

export default PlanCard;
