import React, { useState, useContext, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Snackbar,
  Alert,
  Typography,
  MenuItem,
  InputAdornment,
  IconButton,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { GrPhone } from "react-icons/gr";
import theme from "../theme";
import axios from "axios";
import APP_CONFIG from "../config/constants";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { StoreContext } from "../contexts/StoreContext";
import { useSafeAreaTop, useSafeAreaBottom } from "../SafeAreaFile";

// In-memory cache (NOT localStorage/sessionStorage) that lives at module
// scope, outside the component. React Router navigation only mounts/unmounts
// the component - it doesn't reload the JS runtime - so this object keeps
// its values as the user moves between pages. It only resets when the app's
// JS process actually restarts (i.e. the app is closed/killed), which is
// exactly the behavior wanted: persist until Clear, a new search, or app close.
let searchCache = {
  searchBy: "mobile",
  mobile: "",
  groupCode: "",
  memberNumber: "",
  userData: null,
};

const SearchCustomer = () => {
  const navigate = useNavigate();
  const { adminUser } = useContext(AuthContext);
  const { storePlans } = useContext(StoreContext);
  // Real device safe-area insets (status bar / home indicator), same as App.js
  const topInset = useSafeAreaTop();
  const bottomInset = useSafeAreaBottom();
  // console.log(storePlans);

  // Initialize state from the in-memory cache instead of hardcoded defaults,
  // so returning to this page keeps the last search + results.
  const [searchBy, setSearchBy] = useState(searchCache.searchBy);
  const [mobile, setMobile] = useState(searchCache.mobile);
  const [groupCode, setGroupCode] = useState(searchCache.groupCode);
  const [memberNumber, setMemberNumber] = useState(searchCache.memberNumber);
  const [userData, setUserData] = useState(searchCache.userData);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "warning",
  });

  // Persist the given state slice into the in-memory cache
  const persistState = (partial) => {
    searchCache = { ...searchCache, ...partial };
  };

  // When returning to this page with a previous search still cached (e.g. after
  // completing a payment and coming back from the success page), silently
  // re-run that same search so results reflect the latest data (updated
  // installment count, amount paid, etc.) instead of the stale cached copy.
  useEffect(() => {
    if (!searchCache.userData) return;

    const searchValue =
      searchCache.searchBy === "mobile"
        ? searchCache.mobile
        : `${searchCache.groupCode.trim()}-${searchCache.memberNumber.trim()}`;
    if (!searchValue || searchValue === "-") return;

    const refreshSearch = async () => {
      try {
        const storeId = APP_CONFIG.STORE_ID;
        const url = `${process.env.REACT_APP_API_BASE_URL}/api/core/member-with-group?idAndGroup=${searchValue}&storeID=${storeId}`;
        const { data } = await axios.get(url);
        setUserData(data);
        persistState({ userData: data });
      } catch (error) {
        console.error("Refresh error:", error);
        // On failure keep showing the cached data.
      }
    };

    refreshSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchByChange = (e) => {
    const value = e.target.value;
    setSearchBy(value);
    setMobile("");
    setGroupCode("");
    setMemberNumber("");
    setUserData(null); // reset previous result
    persistState({
      searchBy: value,
      mobile: "",
      groupCode: "",
      memberNumber: "",
      userData: null,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile") {
      if (/^\d*$/.test(value)) {
        setMobile(value);
        persistState({ mobile: value });
      }
    } else if (name === "groupCode") {
      setGroupCode(value);
      persistState({ groupCode: value });
    } else if (name === "memberNumber") {
      if (/^\d*$/.test(value)) {
        setMemberNumber(value);
        persistState({ memberNumber: value });
      }
    }
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (searchBy === "mobile" && mobile.length !== 10) {
      setSnackbar({
        open: true,
        message: "Please enter a valid 10-digit mobile number",
        severity: "warning",
      });
      return;
    }

    if (
      searchBy === "groupAndMemberNo" &&
      (!groupCode.trim() || !memberNumber.trim())
    ) {
      setSnackbar({
        open: true,
        message: "Please enter both Group Code and Member Number",
        severity: "warning",
      });
      return;
    }

    setLoading(true);

    try {
      const storeId = APP_CONFIG.STORE_ID;
      const branch = adminUser.branch;

      const searchValue =
        searchBy === "mobile"
          ? mobile
          : `${groupCode.trim()}-${memberNumber.trim()}`;

      const url = `${process.env.REACT_APP_API_BASE_URL}/api/core/member-with-group?idAndGroup=${searchValue}&storeID=${storeId}`;

      const { data } = await axios.get(url);
      setUserData(data);
      persistState({ userData: data });
    } catch (error) {
      console.error("Fetch error:", error);
      setSnackbar({
        open: true,
        message: "Error fetching data. Please try again.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDataForward = (e, data) => {
    e.stopPropagation();

    if (!data) {
      setSnackbar({
        open: true,
        message: "Could not fetch data. Please try again later!",
        severity: "warning",
      });
      return;
    }

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

  // Clears everything: local state + in-memory cache
  const handleClearAll = () => {
    setSearchBy("mobile");
    setMobile("");
    setGroupCode("");
    setMemberNumber("");
    setUserData(null);
    searchCache = {
      searchBy: "mobile",
      mobile: "",
      groupCode: "",
      memberNumber: "",
      userData: null,
    };
  };

  const commonInputStyles = {
    "& .MuiOutlinedInput-root": {
      height: "40px",
      borderRadius: "20px",
      backgroundColor: "#fff",
      "& fieldset": {
        borderColor: "#ccc",
      },
      "&:hover fieldset": {
        borderColor: "#ccc",
      },
      "&.Mui-focused fieldset": {
        borderColor: theme.colors.primaryButton,
      },
    },
    "& .MuiInputLabel-root": {
      color: "#999",
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#999",
    },
  };

  return (
    <>
      {/*
        Layout: this wrapper is pinned to the actual browser/webview viewport
        using position:fixed (top/left/right/bottom), NOT height:100% - that
        way it doesn't depend on the parent element having an explicit
        height, which is what was breaking the "fixed top" behavior before.

        - Top part (form + Search/Clear) does not scroll.
        - Bottom part (loader / empty state / card list) scrolls on its own,
          between the top part and the `bottom` offset below.

        NOTE: `bottom: "72px"` reserves space for your footer/bottom nav
        (matches the existing Snackbar offset in this file). If your footer
        is a different height, change this value to match exactly.
      */}
      <Box
        sx={{
          position: "fixed",
          // Start below the fixed app header (56px toolbar + status-bar inset)
          top: `calc(56px + ${topInset})`,
          left: 0,
          right: 0,
          // End above the fixed footer (56px + bottom safe-area inset)
          bottom: `calc(56px + ${bottomInset})`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          backgroundColor: "#fff",
          padding: "inherit",
        }}
      >
        {/* Fixed Top Section: Form */}
        <Box
          sx={{
            flexShrink: 0,
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              width: "100%",
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              maxWidth: 500,
              mx: "auto",
              mt: 2,
            }}
          >
            <TextField
              select
              label="Search By"
              value={searchBy}
              onChange={handleSearchByChange}
              fullWidth
              sx={commonInputStyles}
            >
              <MenuItem value="mobile">Mobile</MenuItem>
              <MenuItem value="groupAndMemberNo">Group and Member No.</MenuItem>
            </TextField>

            {searchBy === "mobile" ? (
              <TextField
                name="mobile"
                placeholder="Enter mobile number"
                value={mobile}
                onChange={handleInputChange}
                fullWidth
                inputProps={{
                  maxLength: 10,
                  inputMode: "numeric",
                }}
                sx={commonInputStyles}
                InputProps={{
                  endAdornment: mobile && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setMobile("");
                          setUserData(null);
                          persistState({ mobile: "", userData: null });
                        }}
                        // note: this only clears the mobile field + results,
                        // same behavior as before
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            ) : (
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  select
                  name="groupCode"
                  label="Group Code"
                  value={groupCode}
                  onChange={handleInputChange}
                  fullWidth
                  sx={commonInputStyles}
                >
                  {storePlans?.map((plan, index) => (
                    <MenuItem key={index} value={plan.code}>
                      {plan.code}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  name="memberNumber"
                  placeholder="Member Number"
                  value={memberNumber}
                  onChange={handleInputChange}
                  fullWidth
                  inputProps={{ inputMode: "numeric" }}
                  sx={commonInputStyles}
                />
              </Box>
            )}

            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  width: "100%",
                  borderRadius: "20px",
                  textTransform: "none",
                  backgroundColor: theme.colors.primaryButton,
                }}
              >
                Search
              </Button>

              <Button
                type="button"
                variant="outlined"
                onClick={handleClearAll}
                sx={{
                  width: "100%",
                  borderRadius: "20px",
                  textTransform: "none",
                  borderColor: theme.colors.primaryButton,
                  color: theme.colors.primaryButton,
                }}
              >
                Clear
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Scrollable Bottom Section: Loader / Empty state / Card list */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            paddingBottom: "16px",
          }}
        >
          {/* Loader */}
          {loading && (
            <Box sx={{ textAlign: "center", mt: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Searching...
              </Typography>
            </Box>
          )}

          {/* No User Found */}
          {userData && !loading && userData.length === 0 && (
            <Box sx={{ textAlign: "center", margin: 5 }}>
              <Typography variant="body2" color="text.disabled">
                No customer found...
              </Typography>
            </Box>
          )}

          {/* User List */}
          {userData && !loading && userData.length > 0 && (
            <Box
              sx={{
                mt: 4,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                maxWidth: 500,
                mx: "auto",
                px: 0,
              }}
            >
              {userData.map((data, index) => (
                <Box
                  key={index}
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: "16px",
                    padding: "16px 18px",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.08)",
                    border: "1px solid #f0f0f0",
                  }}
                >
                  {/* Avatar */}

                  {/* Details */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: "16px",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      color={theme.colors.primaryHeading}
                    >
                      {data.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color={theme.ledger.secondaryTextCol}
                      sx={{ display: "flex", alignItems: "center", mt: "2px" }}
                    >
                      <GrPhone
                        style={{
                          fontSize: "16px",
                          marginRight: "4px",
                          verticalAlign: "middle",
                          stroke: theme.ledger.secondaryTextCol,
                          fill: "none",
                          strokeWidth: 1.5,
                        }}
                      />{" "}
                      {data.mobile} | {data.mgroup}-{data.member_no}
                    </Typography>
                  </Box>

                  {/* Amount + Action */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: "8px",
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "16px",
                      }}
                      color={theme.colors.primaryHeading}
                    >
                      {`₹${data.amountPaid}/-`}
                    </Typography>
                    <Button
                      onClick={(e) => handleDataForward(e, data)}
                      variant="contained"
                      size="small"
                      sx={{
                        borderRadius: "20px",
                        textTransform: "none",
                        fontSize: "12px",
                        fontWeight: 600,
                        paddingX: "16px",
                        backgroundColor: theme.colors.primaryButton,
                        boxShadow: "none",
                        "&:hover": {
                          backgroundColor: theme.colors.primaryButton,
                          boxShadow: "none",
                        },
                      }}
                    >
                      Pay Now
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>

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
};

export default SearchCustomer;
