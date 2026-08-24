import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Divider,
  Link,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import theme from "../theme";
import APP_CONFIG from "../config/constants";
import FacebookIcon from "../assets/img/Facebook.svg";
import GoogleIcon from "../assets/img/Google.svg";
import Logo from "../assets/img/logo/logo.png";
import { AuthContext } from "../contexts/AuthContext";

const OtpVerificationPage = () => {
  const { saveLoginData, loginRole, loginMobile } = useContext(AuthContext);
  const location = useLocation();
  const adminData = location.state;
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [resendTimer, setResendTimer] = useState(30);
  const inputsRef = useRef([]);

  // const mobile = localStorage.getItem("loginMobile") || "";
  // const role = localStorage.getItem("loginRole") || "user";
  const mobile = loginMobile;
  const role = loginRole;

  const handleChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) return;

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/validateotp`,
        {
          mobile,
          otp: fullOtp,
          // branch: userInfo.branch,
          storeID: APP_CONFIG.STORE_ID,
        },
      );

      const { statusCode, statusMessage, data } = response.data;

      // if (statusCode === 200 && role !== "agent") {
      //   localStorage.setItem("adminUser", JSON.stringify(data?.user));
      //   setSnackbar({
      //     open: true,
      //     message: data.message || "OTP verified. Login successful.",
      //     severity: "success",
      //   });
      //   setTimeout(() => navigate("/dashboard"), 1500);
      // }
      if (statusCode === 200 && role !== "agent") {
        await saveLoginData({
          role: role,
          mobile: data?.user?.mobile,
          adminUser: data?.user,
        });

        setSnackbar({
          open: true,
          message: data.message || "OTP verified. Login successful.",
          severity: "success",
        });

        setTimeout(() => navigate("/dashboard"), 1500);
      } else if (statusCode === 200 && role === "agent") {
        await saveLoginData({
          role: role,
          mobile: mobile,
          adminUser: adminData.agent,
        });

        console.log(role, mobile, adminData.agent);
        setSnackbar({
          open: true,
          message: data.message || "OTP verified. Login successful.",
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
      const msg =
        error.response?.data?.data?.message ||
        "Verification failed due to server error.";
      setSnackbar({ open: true, message: msg, severity: "error" });
    }
  };

  const handleResend = async () => {
    try {
      const url =
        role === "agent"
          ? `${process.env.REACT_APP_API_BASE_URL}/api/auth/agentlogin`
          : `${process.env.REACT_APP_API_BASE_URL}/api/auth/userlogin`;

      await axios.post(url, { mobile, storeID: APP_CONFIG.STORE_ID });

      setSnackbar({
        open: true,
        message: "OTP resent successfully.",
        severity: "info",
      });
      setResendTimer(30);
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to resend OTP.",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
      sx={{
        minHeight: "90vh",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Box textAlign="center" px={3}>
        <img src={Logo} alt="Logo" style={{ width: 140, marginBottom: 60 }} />
        <Typography
          variant="h6"
          sx={{ color: theme.colors.subHeading, marginBottom: 1 }}
        >
          Enter OTP
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: theme.colors.subHeading, marginBottom: 2 }}
        >
          +91-{mobile}{" "}
          <Link
            onClick={() => navigate("/")}
            underline="hover"
            sx={{
              cursor: "pointer",
              color: theme.colors.subHeading,
              fontWeight: 500,
            }}
          >
            Change Mobile
          </Link>
        </Typography>

        <Box display="flex" justifyContent="center" gap={1} mb={3}>
          {otp.map((value, index) => (
            <TextField
              key={index}
              inputRef={(el) => (inputsRef.current[index] = el)}
              value={value}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              type="number" // Suggests numeric input, brings up numeric keyboard on mobile
              inputMode="numeric"
              inputProps={{
                maxLength: 1,
                style: {
                  textAlign: "center",
                  fontSize: "1.5rem",
                  padding: "10px",
                },
              }}
              sx={{
                width: 45,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "& fieldset": {
                    borderColor: theme.colors.subHeading,
                  },
                  "&:hover fieldset": {
                    borderColor: theme.colors.subHeading,
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: theme.colors.subHeading,
                  },
                },
              }}
            />
          ))}
        </Box>

        <Button
          variant="contained"
          fullWidth
          onClick={handleVerify}
          disabled={otp.join("").length !== 6}
          sx={{
            backgroundColor: theme.colors.primaryButton,
            color: "#fff",
            borderRadius: 2,
            "&:hover": {
              backgroundColor: theme.colors.subHeading,
            },
          }}
        >
          Verify OTP
        </Button>

        <Button
          fullWidth
          variant="text"
          disabled={resendTimer > 0}
          onClick={handleResend}
          sx={{
            mt: 1,
            color: theme.colors.subHeading,
            fontWeight: 500,
            textTransform: "none",
          }}
        >
          Resend OTP {resendTimer > 0 && `in ${resendTimer}s`}
        </Button>

        <Divider sx={{ my: 4, fontWeight: 400, color: "#000000B2" }}>
          or Login with
        </Divider>

        <Box display="flex" justifyContent="center" gap={2}>
          {[FacebookIcon, GoogleIcon].map((icon, index) => (
            <Box
              key={index}
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: "#e0dada",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <Box
                component="img"
                src={icon}
                alt={index === 0 ? "Facebook Login" : "Google Login"}
                sx={{ width: 20, height: 20 }}
              />
            </Box>
          ))}
        </Box>
      </Box>

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
    </Grid>
  );
};

export default OtpVerificationPage;
