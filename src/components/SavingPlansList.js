import React, { useState, useEffect, useContext, useMemo } from "react";
import { Alert, Box, Snackbar, Typography, Tooltip } from "@mui/material";
import theme from "../theme";
import { useNavigate } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BranchDropdown from "./BranchDropdown";

// Images
import jeweleryImg from "../assets/img/icons/jewellery.png";
import bangleImg from "../assets/img/icons/bangle.png";
import braceletImg from "../assets/img/icons/bracelet.png";
import earringsImg from "../assets/img/icons/earrings.png";
import LoadingScreen from "./LoadingScreen";
import FallbackScreen from "./FallbackScreen";
import NoAddedPlans from "./NoAddedPlans";
import PlanCard from "./PlanCard";
import { AuthContext } from "../contexts/AuthContext";
import { StoreContext } from "../contexts/StoreContext";

// ── Digi mgroup codes ─────────────────────────────────────────────────────────
const DIGI_MGROUPS = ["DIGIG24", "DIGIG22", "DIGIS"];

function isDigiPlan(plan) {
  return DIGI_MGROUPS.includes(plan?.mgroup?.toUpperCase());
}

// ── Filter tab config ─────────────────────────────────────────────────────────
const TABS = [
  { key: "all", label: "All" },
  { key: "digi", label: "Digi Gold" },
  { key: "normal", label: "Jewellery" },
];

// BranchDropdown was extracted to ./BranchDropdown.js (shared with SelectPlan).

// ─────────────────────────────────────────────────────────────────────────────

function SavingPlansList() {
  const navigate = useNavigate();
  const { adminUser, loginRole, isAuthLoading } = useContext(AuthContext);
  const { storePlans, Allplan, isLoadingPlans, fetchUserPlan, branches } =
    useContext(StoreContext);

  const [plansList, setPlansList] = useState([]);
  const [expandedPlanId, setExpandedPlanId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("ALL");

  const userInfo = adminUser;

  // ── Fetch plans ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (adminUser && Allplan.length === 0 && !isLoadingPlans) {
      fetchUserPlan(adminUser);
    }
  }, [adminUser]);

  useEffect(() => {
    if (isLoadingPlans) return;
    if (Allplan.length === 0) return;

    const data = Array.isArray(Allplan) ? Allplan : [];
    const sorted = [...data].sort((a, b) => {
      if (a.info === "A" && b.info !== "A") return 1;
      if (a.info !== "A" && b.info === "A") return -1;
      return 0;
    });
    setPlansList(sorted);
  }, [Allplan, isLoadingPlans]);

  // ── Derived values ────────────────────────────────────────────────────────
  const { hasDigiPlans, hasAnyPaidPlan } = useMemo(
    () => ({
      hasDigiPlans: plansList.some((p) => isDigiPlan(p)),
      hasAnyPaidPlan: plansList.some((p) => Number(p.amountPaid) > 0),
    }),
    [plansList],
  );

  // Branch codes that actually exist in the plans list
  const activeBranchCodes = useMemo(
    () => Array.from(new Set(plansList.map((p) => p.branch).filter(Boolean))),
    [plansList],
  );

  // ── Two-stage filtering: branch → type ───────────────────────────────────
  // Same schema reality as SelectPlan.js: tbl_scheme_groups/tbl_scheme_members
  // carry no branch column, so /api/core/member-with-group never returns a
  // `branch` field on any plan. Only actually filter when a plan carries real
  // branch data; otherwise (today, always) show it regardless of selection.
  const branchFiltered = useMemo(
    () =>
      selectedBranch === "ALL"
        ? plansList
        : plansList.filter((p) => !p.branch || p.branch === selectedBranch),
    [plansList, selectedBranch],
  );

  const filteredList = useMemo(() => {
    if (activeFilter === "digi")
      return branchFiltered.filter((p) => isDigiPlan(p));
    if (activeFilter === "normal")
      return branchFiltered.filter((p) => !isDigiPlan(p));
    return branchFiltered;
  }, [branchFiltered, activeFilter]);

  // Show type tabs only when digi plans exist in the branch-filtered set
  const showTypeTabs = branchFiltered.some((p) => isDigiPlan(p));

  // ── Snackbar ──────────────────────────────────────────────────────────────
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const handleSnackbarClose = () => setSnackbar((s) => ({ ...s, open: false }));

  // ── Navigate to payment page ──────────────────────────────────────────────
  const handleDataForward = (e, data) => {
    e.stopPropagation();
    if (!data) {
      setSnackbar({
        open: true,
        message: "Could not fetch data. Please try again later!",
        severity: "warning",
      });
      return false;
    }
    navigate("/paymentandledger", { state: { data, userInfo } });
  };

  const handleShowPlanDetails = (index) => setExpandedPlanId(index);
  const handleHidePlanDetails = () => setExpandedPlanId(null);

  const imagesArr = [jeweleryImg, bangleImg, braceletImg, earringsImg];

  if (isAuthLoading) {
    return <LoadingScreen open={true} message="Loading..." />;
  }

  const hasFilters = selectedBranch !== "ALL" || activeFilter !== "all";

  return (
    <React.Fragment>
      {/* Guest fallback */}
      {loginRole === "guest" && (
        <FallbackScreen
          open={true}
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

      {loginRole !== "guest" && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          gap="1.2rem"
          sx={{ marginTop: 3, overflowY: "scroll", marginBottom: 7 }}
        >
          {/* Not logged in */}
          {!userInfo && (
            <FallbackScreen
              open={true}
              message={
                <>
                  No Current Plans Found
                  <br />
                  Log in to Add Plans
                </>
              }
              redirectTo="log in"
              redirectToURL="/login"
            />
          )}

          {/* Loading */}
          {userInfo && isLoadingPlans && (
            <LoadingScreen open={true} message="Loading Your Plans" />
          )}

          {/* ── Filter row: branch dropdown + type tabs ──────────────────── */}
          {userInfo && !isLoadingPlans && plansList.length > 0 && (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {/* Branch dropdown — only when >1 branch exists in plans */}
              {activeBranchCodes.length > 1 && (
                <BranchDropdown
                  branches={branches}
                  activeBranchCodes={activeBranchCodes}
                  selectedBranch={selectedBranch}
                  onChange={(code) => {
                    setSelectedBranch(code);
                    setActiveFilter("all"); // reset type tab when branch changes
                  }}
                />
              )}

              {/* Type tabs — only when digi plans exist in current branch */}
              {showTypeTabs && (
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    backgroundColor: "#f3f4f6",
                    borderRadius: "100px",
                    p: "4px",
                    position: "relative",
                  }}
                >
                  {/* Sliding pill */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: "4px",
                      left:
                        activeFilter === "all"
                          ? "4px"
                          : activeFilter === "digi"
                          ? "calc(33.33% + 0px)"
                          : "calc(66.66% + 0px)",
                      width: "calc(33.33% - 4px)",
                      height: "calc(100% - 8px)",
                      borderRadius: "100px",
                      backgroundColor: "#fff",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                      transition: "left 0.28s cubic-bezier(0.4,0,0.2,1)",
                      border: `1.5px solid ${
                        theme.colors?.primaryButton || "#b45309"
                      }`,
                    }}
                  />
                  {TABS.map(({ key, label }) => (
                    <Box
                      key={key}
                      onClick={() => setActiveFilter(key)}
                      sx={{
                        flex: 1,
                        zIndex: 1,
                        height: "33px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        borderRadius: "100px",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 700,
                          color:
                            activeFilter === key
                              ? theme.colors?.primaryButton || "#b45309"
                              : "#6b7280",
                          transition: "color 0.2s ease",
                        }}
                      >
                        {label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {/* Active filter summary pill */}
              {hasFilters && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>
                    Showing
                  </Typography>
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.4,
                      px: 1,
                      py: 0.2,
                      borderRadius: "100px",
                      backgroundColor: `${
                        theme.colors?.primaryButton || "#b45309"
                      }12`,
                      border: `1px solid ${
                        theme.colors?.primaryButton || "#b45309"
                      }30`,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: theme.colors?.primaryButton || "#b45309",
                      }}
                    >
                      {filteredList.length} plan
                      {filteredList.length !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                  {(selectedBranch !== "ALL" || activeFilter !== "all") && (
                    <Typography
                      onClick={() => {
                        setSelectedBranch("ALL");
                        setActiveFilter("all");
                      }}
                      sx={{
                        fontSize: 12,
                        color: "#6b7280",
                        textDecoration: "underline",
                        cursor: "pointer",
                        ml: 0.5,
                      }}
                    >
                      Clear filters
                    </Typography>
                  )}
                </Box>
              )}
            </Box>
          )}

          {/* No plans at all */}
          {userInfo && !isLoadingPlans && plansList.length === 0 && (
            <NoAddedPlans />
          )}

          {/* No results for current filters */}
          {userInfo &&
            !isLoadingPlans &&
            plansList.length > 0 &&
            filteredList.length === 0 && (
              <Box
                sx={{
                  width: "100%",
                  textAlign: "center",
                  py: 5,
                  px: 2,
                  borderRadius: "16px",
                  border: "1.5px dashed #e5e7eb",
                  backgroundColor: "#fafafa",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 14,
                    color: "#6b7280",
                    fontWeight: 600,
                    mb: 0.5,
                  }}
                >
                  No plans found
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#9ca3af" }}>
                  {selectedBranch !== "ALL"
                    ? `No ${
                        activeFilter !== "all"
                          ? activeFilter === "digi"
                            ? "Digi Gold"
                            : "Jewellery"
                          : ""
                      } plans in this branch`
                    : `No ${
                        activeFilter === "digi" ? "Digi Gold" : "Jewellery"
                      } plans found`}
                </Typography>
                <Typography
                  onClick={() => {
                    setSelectedBranch("ALL");
                    setActiveFilter("all");
                  }}
                  sx={{
                    fontSize: 12,
                    color: theme.colors?.primaryButton || "#b45309",
                    fontWeight: 700,
                    mt: 1,
                    cursor: "pointer",
                    display: "inline-block",
                  }}
                >
                  Clear filters
                </Typography>
              </Box>
            )}

          {/* Plan cards */}
          {filteredList.map((el, index) => {
            const imageUrl = el.media || null;
            return (
              <PlanCard
                key={el.member_id || index}
                el={el}
                index={index}
                imageUrl={imageUrl}
                theme={theme}
                isExpanded={expandedPlanId === index}
                onPayNow={(e, data) => handleDataForward(e, data)}
                onExpand={(idx) => handleShowPlanDetails(idx)}
                onCollapse={handleHidePlanDetails}
              />
            );
          })}

          {/* Total invested legend */}
          {!isLoadingPlans && hasAnyPaidPlan && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                alignSelf: "flex-start",
              }}
            >
              <CheckCircleIcon
                sx={{
                  fontSize: 16,
                  color: "#2E7D32",
                  bgcolor: "#fff",
                  borderRadius: "50%",
                }}
              />
              <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                Indicates total invested amount
              </Typography>
            </Box>
          )}
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ bottom: "72px !important" }}
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
    </React.Fragment>
  );
}

export default SavingPlansList;
