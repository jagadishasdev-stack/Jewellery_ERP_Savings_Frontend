import React, { useContext, useEffect, useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  Box,
  CircularProgress,
  Link as MuiLink,
  IconButton,
  InputAdornment,
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import axios from "axios";
import theme from "../theme";
import TickIcon from "../assets/img/rightmark.svg";
import APP_CONFIG from "../config/constants";
import { AuthContext } from "../contexts/AuthContext";
import { StoreContext } from "../contexts/StoreContext";
import storeLogo from "../assets/img/logo/logo.png";
import bgBanner from "../assets/img/LoginPageBGBanner.png";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
// import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import VerifiedSharpIcon from "@mui/icons-material/VerifiedSharp";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { initPushNotifications } from "../initPushNotifications";

function LoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [showGuestLoader, setShowGuestLoader] = useState(false);
  // const [isForgotPwd, setIsForgotPwd] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [logoOrientation, setLogoOrientation] = useState("square");
  // const [forgotPhone, setForgotPhone] = useState("");
  // const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
  // const [showPassword, setShowPassword] = useState(false);

  // ADD these:
  const [userNotFoundDialog, setUserNotFoundDialog] = useState(false);
  const [userNotFoundMsg, setUserNotFoundMsg] = useState("");

  const { saveLoginData } = useContext(AuthContext);
  const { storeAssets } = useContext(StoreContext);

  const name = storeAssets?.storeinfo[0]?.store_name;
  const logoColor = theme.palette.primary.main;
  const bannerGradient = `linear-gradient(180deg, ${logoColor}30 0%, #ffffff 100%), url(${bgBanner})`;
  // console.log(APP_CONFIG);
  // Detect logo orientation
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
  }, []);

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const handleInputFocus = (e) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  };

  const isValidPhone = (value) => /^(\d{10}|[aA]\d{10})$/.test(value);

  // =====================
  // Login Functionality
  // =====================
  const handleGuestLogin = async (e) => {
    e.preventDefault();
    setShowGuestLoader(true);

    await new Promise((resolve) => {
      setTimeout(async () => {
        await saveLoginData({
          role: "guest",
          mobile: 1234567890,
          adminUser: { mobile: "1234567890" },
        });
        resolve();
      }, 800);
    });

    navigate("/dashboard");
  };

  //   const handleLogin = async (e) => {
  //     e.preventDefault();

  //     if (!phone) {
  //       return setSnackbar({
  //         open: true,
  //         message: "Phone number is required",
  //         severity: "warning",
  //       });
  //     }

  //     if (!isValidPhone(phone)) {
  //       return setSnackbar({
  //         open: true,
  //         message: "Enter a valid 10-digit mobile number or start with A/a",
  //         severity: "error",
  //       });
  //     }
  // if (!password) {
  //   return setSnackbar({
  //     open: true,
  //     message: "Password is required",
  //     severity: "warning",
  //   });
  // }
  //     setIsSubmitting(true);

  //     const isAgent = /^[aA]\d{10}$/.test(phone);
  //     const mobile = isAgent ? phone.slice(1) : phone;
  //     const url = isAgent
  //       ? `${process.env.REACT_APP_API_BASE_URL}/api/auth/agentlogin`
  //       : `${process.env.REACT_APP_API_BASE_URL}/api/auth/userlogin`;

  //     try {
  //       const response = await axios.post(url, {
  //         mobile,
  //         password,
  //         storeID: APP_CONFIG.STORE_ID,
  //       });

  //       const { statusCode, message, data } = response.data;
  //       if (statusCode !== 200) {
  //         return setSnackbar({
  //           open: true,
  //           message: message || "Invalid credentials",
  //           severity: "warning",
  //         });
  //       }

  //       await new Promise((resolve) => {
  //         setTimeout(async () => {
  //           await saveLoginData({
  //             role: isAgent ? "agent" : "user",
  //             mobile,
  //             adminUser: isAgent ? data.agent : data.user,
  //           });
  //           resolve();
  //         }, 500);
  //       });

  //       await initPushNotifications();
  //       navigate("/dashboard");
  //     } catch (error) {
  //       const msg =
  //         error.response?.data?.data?.message || "Login failed, try again";
  //       setSnackbar({ open: true, message: msg, severity: "error" });
  //     } finally {
  //       setIsSubmitting(false);
  //     }
  //   };

  // DLJ has no record in the old savings-app MySQL database (STORE_ID is
  // null for this build — see constants.js), so the old OTP-by-store-ID
  // flow above literally can't resolve anything for this tenant. Jewellery
  // ERP already has its own, more complete mobile OTP login system
  // (server/src/routes/mobileAuth.js — real SMS gateway, a fixed dev OTP
  // for local testing, and it already checks tbl_scheme_members) — this
  // sends the OTP through THAT instead of building a second one.
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!phone) {
      return setSnackbar({
        open: true,
        message: "Phone number is required",
        severity: "warning",
      });
    }
    if (!isValidPhone(phone)) {
      return setSnackbar({
        open: true,
        message: "Enter a valid 10-digit mobile number",
        severity: "error",
      });
    }

    setIsSubmitting(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_ERP_API_BASE_URL}/api/mobile/send-otp`,
        { mobile: phone, tenantId: APP_CONFIG.TENANT_ID, purpose: "LOGIN" },
      );

      // OTP sent — navigate to OTP verification page
      navigate("/verify-signup-otp", {
        state: { mobile: phone, type: "login" },
      });
    } catch (error) {
      if (error.response?.status === 404) {
        setUserNotFoundMsg(
          error.response?.data?.message ||
            "Mobile number not registered. Please visit the store to enroll first.",
        );
        setUserNotFoundDialog(true);
        return;
      }
      const msg = error.response?.data?.message || "Login failed, try again";
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleForgotPassword = () => setIsForgotPwd(true);
  //   const handleBackToLogin = () => {
  //     setIsForgotPwd(false);
  //     setForgotPhone("");
  //   };

  // ============================
  // Forgot Password (Single Step)
  // ============================
  // const handleRecoverPassword = async (e) => {
  //   e.preventDefault();
  //   if (!isValidPhone(forgotPhone)) {
  //     return setSnackbar({
  //       open: true,
  //       message: "Enter a valid 10-digit mobile number",
  //       severity: "error",
  //     });
  //   }

  //   setIsForgotSubmitting(true);
  //   const isAgent = forgotPhone.trim().toLowerCase().startsWith("a");

  //   try {
  //     const url = isAgent
  //       ? `${process.env.REACT_APP_API_BASE_URL}api/auth/recoverpwd`
  //       : `${process.env.REACT_APP_API_BASE_URL}/api/auth/recoverusrpwd`;
  //     const res = await axios.post(url, {
  //       username: isAgent ? forgotPhone.replace(/a/g, "") : forgotPhone,
  //       storeID: APP_CONFIG.STORE_ID,
  //       branchID: APP_CONFIG.BRANCH,
  //     });

  //     const { success, message } = res.data;
  //     if (success) {
  //       setSnackbar({
  //         open: true,
  //         message: message || "Password sent successfully!",
  //         severity: "success",
  //       });

  //       setTimeout(() => {
  //         handleBackToLogin();
  //       }, 1500);
  //     } else {
  //       setSnackbar({
  //         open: true,
  //         message: message || "Failed to recover password",
  //         severity: "warning",
  //       });
  //     }
  //   } catch (err) {
  //     setSnackbar({
  //       open: true,
  //       message: err.response?.data?.message || "Something went wrong",
  //       severity: "error",
  //     });
  //   } finally {
  //     setIsForgotSubmitting(false);
  //   }
  // };

  return (
    <>
      {/* Main Layout */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
          // background: `linear-gradient(180deg, #ffffff84 0%, #ffffffff 100%)`,
        }}
      >
        {/* Logo Section */}
        <Box
          sx={{
            flex: "0 0 45%",
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            justifyContent: "center",
            // backgroundImage: `linear-gradient(180deg, #fedfb484 0%, #ffffffff 100%), url(${bgBanner})`,
            backgroundImage: bannerGradient,
            backgroundSize: "contain",
            backgroundPosition: "top",
            backgroundRepeat: "no-repeat",
          }}
        >
          <Box
            sx={{
              mt: logoOrientation === "vertical" ? 15 : 12.5,
              width:
                logoOrientation === "vertical"
                  ? 75
                  : logoOrientation === "horizontal"
                  ? 200
                  : 150,
              height: 125,
              backgroundImage: `url(${storeLogo})`,
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
          <Typography
            sx={{
              fontSize: { xs: 10, sm: 10, md: 10 },
              fontWeight: 700,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: theme.theme2.primaryHeading,
            }}
          >
            {name}
          </Typography>
        </Box>

        {/* Login or Forgot Password Section */}
        <Box
          sx={{
            flex: 1,
            px: 2,
            backgroundColor: theme.palette.background.default,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
            },
          }}
        >
          {/* ===== Login Form ===== */}
          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 600,
              color: theme.theme2.primaryHeading,
            }}
          >
            Login
          </Typography>

          <form onSubmit={handleLogin}>
            <TextField
              onFocus={handleInputFocus}
              fullWidth
              label="Mobile Number"
              margin="dense"
              value={phone}
              onChange={(e) => {
                const value = e.target.value.replace(/\s+/g, "");
                setPhone(value);
              }}
              InputProps={{
                endAdornment: isValidPhone(phone) ? (
                  <VerifiedSharpIcon
                    sx={{
                      width: 20,
                      height: 20,
                      mr: 1,
                      color: theme.colors.primaryButton,
                    }}
                  />
                ) : null,
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{
                mt: 1,
                fontSize: 16,
                py: 1,
                color: "#fff",
                background: theme.theme2.loginBtn,
                borderRadius: 1.5,
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={22} sx={{ color: "#fff" }} />
              ) : (
                <>
                  {" "}
                  Login <ChevronRightIcon />{" "}
                </>
              )}
            </Button>
          </form>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              width: "100%",
              mt: 2,
            }}
          >
            <Typography sx={{ fontSize: 16, color: theme.theme2.textCol }}>
              Don't have an account?
            </Typography>
            <Typography sx={{ fontSize: 16, color: theme.theme2.textCol }}>
              <MuiLink
                component={RouterLink}
                to="/signup"
                underline="hover"
                sx={{ color: "#000", fontWeight: 500 }}
              >
                Sign up
              </MuiLink>{" "}
              or enter as{" "}
              <span
                style={{
                  textDecoration: "underline",
                  color: "#000",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  setIsGuest(true);
                  handleGuestLogin(e);
                }}
              >
                Guest
              </span>
              <PlayArrowRoundedIcon sx={{ fill: theme.theme2.textCol2 }} />
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Guest Loader */}
      {showGuestLoader && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(255,255,255,0.9)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <CircularProgress
            size={60}
            thickness={5}
            sx={{ color: "#D6900F", mb: 3 }}
          />
          <Typography
            sx={{ fontSize: 18, fontWeight: 500, color: theme.theme2.textCol }}
          >
            Logging you in as guest...
          </Typography>
        </Box>
      )}
      {/* User Not Found Dialog */}
      <Dialog
        open={userNotFoundDialog}
        onClose={() => setUserNotFoundDialog(false)}
        PaperProps={{ sx: { borderRadius: 3, px: 1 } }}
      >
        <DialogContent>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 600,
              mb: 1,
              color: theme.theme2.primaryHeading,
            }}
          >
            Account Not Found
          </Typography>
          <Typography sx={{ fontSize: 14, color: theme.theme2.textCol }}>
            {userNotFoundMsg}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ flexDirection: "column", gap: 1, pb: 2, px: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setUserNotFoundDialog(false);
              navigate("/signup");
            }}
            sx={{
              background: theme.theme2.loginBtn,
              color: "#fff",
              borderRadius: 1.5,
            }}
          >
            Create New Account
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setUserNotFoundDialog(false)}
            sx={{ borderRadius: 1.5 }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar */}
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
    </>
  );
}

export default LoginPage;
