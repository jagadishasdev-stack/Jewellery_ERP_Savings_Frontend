import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  InputAdornment,
  Snackbar,
  Alert,
  IconButton,
  Divider,
  CircularProgress,
  Dialog,
} from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PinDropOutlinedIcon from "@mui/icons-material/PinDropOutlined";
// import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import theme from "../theme";
import axios from "axios";
// import APP_CONFIG from "../config/constants";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/img/logo/logo.png";
import UserAvatarUpload from "./UserAvatarUpload";
const EditUserForm = () => {
  const { adminUser, updateAdminUser, clearLoginData } =
    useContext(AuthContext);
  //store userId
  const [userId, setUserId] = useState(null);

  //State for user info
  const [userInfoNew, setUserInfoNew] = useState(null);
  const [fetchingAddress, setFetchingAddress] = useState(false);
  const [deleteDailog, setDeleteDailog] = useState(false);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  //Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  //Accessing the data from local storage and setting it into state
  useEffect(() => {
    // const userInfoOld = JSON.parse(localStorage.getItem("adminUser"));
    const userInfoOld = adminUser;
    // const role = localStorage.getItem("loginRole");

    if (userInfoOld) {
      // Merge address1 + address2 + address3 into one field
      const fullAddress = [
        userInfoOld.address1,
        userInfoOld.address2,
        userInfoOld.address3,
      ]
        .filter((part) => part && part.trim() !== "")
        .join(", ");

      setUserInfoNew({
        name: userInfoOld.name || "",
        email: userInfoOld.email || "",
        phone: userInfoOld.mobile || "",
        address1: fullAddress || "",
        pincode: userInfoOld.pincode || "",
        // branch: userInfoOld.branch || "",
      });
      setUserId(userInfoOld.user_id);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, []);

  //General Input handler function
  const handleChange = (e) => {
    setUserInfoNew((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  //Geo Location
  const handleLocateMe = async () => {
    setFetchingAddress(true);
    if (!navigator.geolocation) {
      return setSnackbar({
        open: true,
        message: "Geolocation not supported.",
        severity: "error",
      });
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await axios.get(
            `https://nominatim.openstreetmap.org/reverse`,
            {
              params: {
                format: "json",
                lat: latitude,
                lon: longitude,
              },
            },
          );
          const address = res.data.address;
          setFetchingAddress(false);

          setUserInfoNew((prev) => ({
            ...prev,
            address1: address.road || "",
            pincode: address.postcode || "",
          }));
        } catch {
          setFetchingAddress(false);

          setSnackbar({
            open: true,
            message: "Failed to fetch address.",
            severity: "error",
          });
        }
      },
      () => {
        setSnackbar({
          open: true,
          message: "Permission denied.",
          severity: "error",
        });
        setFetchingAddress(false);
      },
    );
  };

  //Form validation
  const validateForm = () => {
    const { name, pincode } = userInfoNew;

    // ✅ ADD THIS — name required
    if (!name || !name.trim()) {
      setSnackbar({
        open: true,
        message: "Full name is required.",
        severity: "warning",
      });
      return false;
    }

    // ✅ ADD THIS — email required
    // if (!email || !email.trim()) {
    //   setSnackbar({
    //     open: true,
    //     message: "Email is required.",
    //     severity: "warning",
    //   });
    //   return false;
    // }

    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if (email && !emailRegex.test(email.trim())) {
    //   setSnackbar({
    //     open: true,
    //     message: "Please enter a valid email address.",
    //     severity: "error",
    //   });
    //   return false;
    // }

    if (pincode && !/^\d{6}$/.test(pincode.trim())) {
      setSnackbar({
        open: true,
        message: "Pincode must be exactly 6 digits.",
        severity: "error",
      });
      return false;
    }

    return true;
  };

  //Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const url = `${process.env.REACT_APP_API_BASE_URL}/api/auth/edituser/${userId}`;
      // const response = await axios.put(url, userInfoNew);
      const payload = {
        ...userInfoNew,
        address2: "",
        address3: "",
        place: "",
      };
      const response = await axios.put(url, payload);

      if (response.status === 200) {
        const updatedUser = {
          ...adminUser, // from context
          ...userInfoNew,
          address2: "",
          address3: "",
          place: "",
        };

        // ✅ Save to Preferences & update context
        await updateAdminUser(updatedUser);

        setSnackbar({
          open: true,
          message: "Your details have been updated",
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Something went wrong. Try again.",
          severity: "error",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Something went wrong.",
        severity: "error",
      });
    }
  };
  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      backgroundColor: "#fff",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#a29f9f",
      borderWidth: "1.5px",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#a29f9f",
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.colors.primaryHeading,
      borderWidth: "2px",
    },
  };

  const labelSx = {
    fontSize: 13,
    fontWeight: 600,
    color: theme.colors.subHeading,
    textAlign: "left",
    display: "block",
    mb: 0,
    // mt: 1.5,
  };

  if (!userInfoNew) return null;

  const handleDeleteAccount = async () => {
    const url = `${process.env.REACT_APP_API_BASE_URL}/api/auth/deleteuser`;
    const payload = {
      user_id: adminUser?.user_id,
      mobile: adminUser?.mobile,
      storeID: adminUser?.store_id,
    };
    const response = await axios.post(url, payload);
    const { code, message } = response.data;

    if (code == 1) {
      setSnackbar({
        open: true,
        message: message,
        severity: "error",
      });

      setTimeout(async () => {
        await clearLoginData();
        navigate("/");

        // Force full reload after small delay to reset route memory
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }, 2000);
    } else {
      setSnackbar({
        open: true,
        message: message,
        severity: "error",
      });
      setDeleteDailog(false);
    }
  };

  return (
    <Box
      component="form"
      noValidate
      onSubmit={handleSubmit}
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        pb: 3,
        mt: 2,
      }}
    >
      {/* Section 1: Personal Details */}
      {/* <Box display="flex" justifyContent="center">
  <Typography
    variant="h6"
    sx={{
      fontWeight: 500,
      color: theme.colors.primaryHeading,
      px: 10,              // horizontal padding
      py: 0.9,              // vertical padding
      borderRadius: "50px", // capsule shape
      backgroundColor: "#f0f0f0", // light background (change as needed)
      display: "inline-block",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)", // optional soft shadow
    }}
  >
    Edit Personal Details
  </Typography>
</Box> */}
      <Box display="flex" justifyContent="center">
        <Box>
          <img
            src={Logo}
            alt="logo"
            style={{
              height: "80px", // adjust size
              objectFit: "contain",
            }}
          />
        </Box>
      </Box>

      {/* Profile photo — view / zoom / change */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 1,
        }}
      >
        <UserAvatarUpload admin={adminUser} editable showActions size={90} />
      </Box>

      {/* Name */}
      <Typography sx={labelSx}>Full Name *</Typography>
      <TextField
        required
        fullWidth
        name="name"
        value={userInfoNew.name}
        placeholder="Enter your full name"
        onChange={handleChange}
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PersonOutlineIcon sx={{ fontSize: 18, color: "#aaa" }} />
            </InputAdornment>
          ),
        }}
        sx={fieldSx}
      />

      {/* Mobile — disabled */}
      <Typography sx={labelSx}>Mobile Number</Typography>
      <TextField
        fullWidth
        disabled
        value={userInfoNew.phone}
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PhoneAndroidIcon sx={{ fontSize: 18, color: "#aaa" }} />
              <Typography
                sx={{ fontSize: 14, color: "#000", ml: 0.5, mr: 0.5 }}
              >
                +91
              </Typography>
            </InputAdornment>
          ),
        }}
        sx={fieldSx}
      />

      {/* Email — optional */}
      <Typography sx={labelSx}>Email</Typography>
      <TextField
        fullWidth
        type="email"
        name="email"
        value={userInfoNew.email}
        placeholder="Enter your email (optional)"
        onChange={handleChange}
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailOutlinedIcon sx={{ fontSize: 18, color: "#aaa" }} />
            </InputAdornment>
          ),
        }}
        sx={fieldSx}
      />

      {/* Address */}
      <Typography sx={labelSx}>Address</Typography>
      <Box sx={{ position: "relative" }}>
        <TextField
          fullWidth
          name="address1"
          value={userInfoNew.address1}
          placeholder="Enter your full address"
          onChange={handleChange}
          multiline
          rows={3}
          InputProps={{
            startAdornment: (
              <InputAdornment
                position="start"
                sx={{ alignSelf: "flex-start", mt: 0 }}
              >
                <HomeOutlinedIcon sx={{ fontSize: 18, color: "#aaa" }} />
              </InputAdornment>
            ),
          }}
          sx={fieldSx}
        />
        {userInfoNew.address1 && (
          <IconButton
            size="small"
            onClick={() =>
              setUserInfoNew((prev) => ({ ...prev, address1: "" }))
            }
            sx={{
              position: "absolute",
              top: 4,
              right: 4,
              width: 20,
              height: 20,
              backgroundColor: "#e5e7eb",
              "&:hover": { backgroundColor: "#d1d5db" },
            }}
          >
            <Typography sx={{ fontSize: 11, color: "#6b7280", lineHeight: 1 }}>
              ✕
            </Typography>
          </IconButton>
        )}
      </Box>

      {/* Pincode + Branch row */}
      {/* <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>


  <Box sx={{ flex: 1 }}>
    <Typography sx={labelSx}>Pincode</Typography>
    <TextField
      fullWidth
      name="pincode"
      type="tel"
      value={userInfoNew.pincode}
      placeholder="Pincode"
      onChange={(e) => {
        const cleaned = e.target.value.replace(/\D/g, "").slice(0, 6);
        setUserInfoNew((prev) => ({ ...prev, pincode: cleaned }));
      }}
      size="small"
      inputProps={{ maxLength: 6, inputMode: "numeric", pattern: "[0-9]*" }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <PinDropOutlinedIcon sx={{ fontSize: 18, color: "#aaa" }} />
          </InputAdornment>
        ),
      }}
      sx={fieldSx}
    />
  </Box>

  
  <Box sx={{ flex: 1 }}>
    <Typography sx={labelSx}>Branch</Typography>
    <TextField
      fullWidth
      disabled
      value={userInfoNew.branch}
      size="small"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <StorefrontOutlinedIcon sx={{ fontSize: 18, color: "#aaa" }} />
          </InputAdornment>
        ),
      }}
      sx={fieldSx}
    />
  </Box>
</Box> */}
      {/* Pincode  row */}
      <Typography sx={labelSx}>Pincode</Typography>
      <TextField
        fullWidth
        name="pincode"
        type="tel"
        value={userInfoNew.pincode}
        placeholder="Pincode"
        onChange={(e) => {
          const cleaned = e.target.value.replace(/\D/g, "").slice(0, 6);
          setUserInfoNew((prev) => ({ ...prev, pincode: cleaned }));
        }}
        size="small"
        inputProps={{ maxLength: 6, inputMode: "numeric", pattern: "[0-9]*" }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PinDropOutlinedIcon sx={{ fontSize: 18, color: "#aaa" }} />
            </InputAdornment>
          ),
        }}
        sx={fieldSx}
      />
      <Button
        variant="contained"
        type="submit"
        sx={{
          borderRadius: 2.5,
          backgroundColor: theme.colors.primaryButton,
          color: "#fff",
          fontWeight: 600,
          fontSize: "16px",
          textTransform: "none",
          height: 46,
          mt: 2,
          mb: 1.5,
        }}
      >
        Save Changes
      </Button>

      <Button
        variant="contained"
        onClick={() => {
          setDeleteDailog(true);
        }}
        color="error"
        sx={{
          mb: 3,
          borderRadius: 2.5,
          fontWeight: 600,
          fontSize: "16px",
          textTransform: "none",
          height: 46,
          border: `1px solid ${theme.palette.error.main}`, // 🔴 red border
        }}
      >
        Delete your Account
      </Button>
      <Dialog open={deleteDailog}>
        <Box sx={{ padding: 2 }}>
          <Typography sx={{ fontWeight: 600 }}>
            Are you sure you want to permanently delete your account?
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
            {" "}
            <Button
              onClick={handleDeleteAccount}
              sx={{
                border: "1px solid red",
                color: "#fff",
                backgroundColor: theme.palette.error.main,
              }}
            >
              Yes
            </Button>
            <Button
              onClick={() => setDeleteDailog(false)}
              sx={{
                border: `1px solid ${theme.colors.primaryButton}`,
                color: "#fff",
                backgroundColor: theme.colors.primaryButton,
              }}
            >
              No
            </Button>
          </Box>
        </Box>
      </Dialog>

      <Dialog
        open={fetchingAddress}
        fullScreen
        PaperProps={{
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.4)", // semi-transparent background
            boxShadow: "none",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          },
        }}
      >
        <Box
          sx={{
            borderRadius: 2,
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            width: "80%",
            maxWidth: 320,
            color: "#fff",
          }}
        >
          <Typography
            sx={{ textAlign: "center" }}
            variant="body1"
            fontWeight={500}
          >
            Getting your location to proceed...
          </Typography>
          <CircularProgress sx={{ color: "#fff" }} />
        </Box>

        <Button
          variant="outlined"
          sx={{
            border: "1px solid #fff",
            color: "#fff",
            backgroundColor: "rgba(255, 255, 255, 0.4)",
            fontSize: "12px",
          }}
          color="error"
          onClick={() => {
            setFetchingAddress(false);
          }}
        >
          Cancel
        </Button>
      </Dialog>

      {/*Snackbar code*/}
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
    </Box>
  );
};

export default EditUserForm;
