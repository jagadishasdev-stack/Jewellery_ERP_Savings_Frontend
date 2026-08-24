import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  Grid,
  TextField,
  Typography,
  Button,
  Snackbar,
  Alert,
  Link as MuiLink,
  CircularProgress,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import axios from "axios";
import theme from "../theme";
import APP_CONFIG from "../config/constants";
import Logo from "../assets/img/logo/logo.png";
import { AuthContext } from "../contexts/AuthContext";
import { initPushNotifications } from "../initPushNotifications";

const VerifyOtpPage = () => {
  const { saveLoginData } = useContext(AuthContext);
  const navigate = useNavigate();
  const { state } = useLocation();
  // const location = useLocation(); // ← add this line
  const mobile = state?.mobile;
  const type = state?.type; // "login" or "signup"
  const isAgent = state?.isAgent; // only for login flow

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(30); // countdown starts at 30
  const [canResend, setCanResend] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // ── Countdown timer ──────────────────────────────────────────
  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const resetTimer = () => {
    setTimer(30);
    setCanResend(false);
  };

  const formatTimer = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${m}:${s}`;
  };
  // ─────────────────────────────────────────────────────────────

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      return setSnackbar({
        open: true,
        message: "Enter a valid 6-digit OTP.",
        severity: "warning",
      });
    }

    setIsVerifying(true);
    try {
      const verifyUrl =
        type === "login"
          ? `${process.env.REACT_APP_API_BASE_URL}/api/auth/v2/validateotp`
          : `${process.env.REACT_APP_API_BASE_URL}/api/auth/validateotp`;

      const verifyPayload =
        type === "login"
          ? {
              mobile,
              otp,
              storeID: APP_CONFIG.STORE_ID,
              role: isAgent ? "agent" : "user",
            }
          : { mobile, otp, storeID: APP_CONFIG.STORE_ID };

      const response = await axios.post(verifyUrl, verifyPayload);
      const { statusCode, statusMessage, data } = response.data;

      if (statusCode === 200) {
        if (type === "login") {
          await saveLoginData({
            role: isAgent ? "agent" : "user",
            mobile,
            adminUser: isAgent ? data.agent : data.user,
            //     branch: isAgent
            // ? data?.agent?.branch || APP_CONFIG.DEFAULT_BRANCH  // ✅ agent branch
            // : data?.user?.branch || APP_CONFIG.DEFAULT_BRANCH   // ✅ user branch
          });
          await initPushNotifications();
        } else {
          await saveLoginData({
            role: "user",
            mobile: data?.user?.mobile,
            adminUser: data?.user,
            // branch: state?.branch || APP_CONFIG.DEFAULT_BRANCH  // ✅
          });
        }

        setSnackbar({
          open: true,
          message: data?.message || "OTP verified successfully.",
          severity: "success",
        });
        setTimeout(() => navigate("/dashboard"), 1500);
      } else {
        setSnackbar({
          open: true,
          message: data?.message || statusMessage || "OTP verification failed.",
          severity: "warning",
        });
      }
    } catch (error) {
      const msg = error.response?.data?.message || "OTP verification failed.";
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/v2/resendotp`,
        { mobile, storeID: APP_CONFIG.STORE_ID },
      );
      setSnackbar({
        open: true,
        message: "OTP resent successfully.",
        severity: "success",
      });
      resetTimer(); // restart 30s countdown after resend
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to resend OTP. Try again.",
        severity: "error",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
      sx={{ minHeight: "90vh" }}
    >
      <Box textAlign="center" px={3} width="100%" maxWidth={400}>
        <img src={Logo} alt="Logo" style={{ width: 140, marginBottom: 60 }} />

        <Typography variant="h6" sx={{ mb: 2 }}>
          OTP Verification
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          Please enter the OTP sent to <strong>{mobile}</strong>
        </Typography>

        <TextField
          fullWidth
          label="Enter OTP"
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          margin="normal"
          inputProps={{ inputMode: "numeric", maxLength: 6 }}
          sx={{
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
              {
                borderColor: theme.colors.subHeading,
              },
            "& .MuiInputLabel-root.Mui-focused": {
              color: theme.colors.subHeading,
            },
          }}
        />

        <Button
          fullWidth
          variant="contained"
          onClick={handleVerify}
          disabled={isVerifying}
          sx={{
            mt: 2,
            backgroundColor: theme.colors.primaryButton,
            color: "#fff",
            borderRadius: 2,
          }}
        >
          {isVerifying ? (
            <CircularProgress size={22} sx={{ color: "#fff" }} />
          ) : (
            "Verify OTP"
          )}
        </Button>

        {/* Resend OTP — shows timer countdown, enables after 30s */}
        {canResend ? (
          <Button
            fullWidth
            variant="text"
            onClick={handleResendOtp}
            disabled={isResending}
            sx={{ mt: 1, color: theme.colors.subHeading, fontSize: 13 }}
          >
            {isResending ? <CircularProgress size={18} /> : "Resend OTP"}
          </Button>
        ) : (
          <Typography
            variant="body2"
            sx={{ mt: 1.5, color: "text.secondary", fontSize: 13 }}
          >
            Resend OTP in{" "}
            <span style={{ fontWeight: 600, color: theme.colors.subHeading }}>
              {formatTimer(timer)}
            </span>
          </Typography>
        )}

        <Typography variant="body2" sx={{ marginTop: 2 }}>
          Already have an account?{" "}
          <MuiLink
            component={RouterLink}
            to="/login"
            underline="hover"
            sx={{ color: theme.colors.subHeading, fontWeight: 500 }}
          >
            Login
          </MuiLink>
        </Typography>
      </Box>

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
    </Grid>
  );
};

export default VerifyOtpPage;
