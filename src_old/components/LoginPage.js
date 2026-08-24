// import React, { useContext, useEffect, useState } from "react";
// import {
//   TextField,
//   Button,
//   Typography,
//   Snackbar,
//   Alert,
//   Box,
//   CircularProgress,
//   Link as MuiLink,
//   IconButton,
//   InputAdornment,
//   Dialog,
//   DialogContent,
//   DialogActions,
// } from "@mui/material";
// import { Link as RouterLink, useNavigate } from "react-router-dom";
// import axios from "axios";
// import theme from "../theme";
// import TickIcon from "../assets/img/rightmark.svg";
// import APP_CONFIG from "../config/constants";
// import { AuthContext } from "../contexts/AuthContext";
// import { StoreContext } from "../contexts/StoreContext";
// import storeLogo from "../assets/img/logo/logo.png";
// import bgBanner from "../assets/img/LoginPageBGBanner.png";
// import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
// import ChevronRightIcon from "@mui/icons-material/ChevronRight";
// // import VisibilityIcon from "@mui/icons-material/Visibility";
// // import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
// // import ChevronRightIcon from "@mui/icons-material/ChevronRight";
// import VerifiedSharpIcon from "@mui/icons-material/VerifiedSharp";
// import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
// import { initPushNotifications } from "../initPushNotifications";

// function LoginPage() {
//   const navigate = useNavigate();
//   const [phone, setPhone] = useState("");
//   // const [password, setPassword] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isGuest, setIsGuest] = useState(false);
//   const [showGuestLoader, setShowGuestLoader] = useState(false);
//   // const [isForgotPwd, setIsForgotPwd] = useState(false);
//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "info",
//   });
//   const [logoOrientation, setLogoOrientation] = useState("square");
//   // const [forgotPhone, setForgotPhone] = useState("");
//   // const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
//   // const [showPassword, setShowPassword] = useState(false);

//   // ADD these:
//   const [userNotFoundDialog, setUserNotFoundDialog] = useState(false);
//   const [userNotFoundMsg, setUserNotFoundMsg] = useState("");

//   const { saveLoginData } = useContext(AuthContext);
//   const { storeAssets } = useContext(StoreContext);

//   const name = storeAssets?.storeinfo[0]?.store_name;
//   const logoColor = theme.palette.primary.main;
//   const bannerGradient = `linear-gradient(180deg, ${logoColor}30 0%, #ffffff 100%), url(${bgBanner})`;
//   // console.log(APP_CONFIG);
//   // Detect logo orientation
//   function getLogoOrientation(width, height) {
//     const ratio = width / height;
//     if (ratio > 1.2) return "horizontal";
//     if (ratio < 0.8) return "vertical";
//     return "square";
//   }

//   useEffect(() => {
//     const img = new Image();
//     img.src = storeLogo;
//     img.onload = () => {
//       const orientation = getLogoOrientation(
//         img.naturalWidth,
//         img.naturalHeight,
//       );
//       setLogoOrientation(orientation);
//     };
//   }, []);

//   const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

//   const handleInputFocus = (e) => {
//     setTimeout(() => {
//       e.target.scrollIntoView({ behavior: "smooth", block: "center" });
//     }, 300);
//   };

//   const isValidPhone = (value) => /^(\d{10}|[aA]\d{10})$/.test(value);

//   // =====================
//   // Login Functionality
//   // =====================
//   const handleGuestLogin = async (e) => {
//     e.preventDefault();
//     setShowGuestLoader(true);

//     await new Promise((resolve) => {
//       setTimeout(async () => {
//         await saveLoginData({
//           role: "guest",
//           mobile: 1234567890,
//           adminUser: { mobile: "1234567890" },
//         });
//         resolve();
//       }, 800);
//     });

//     navigate("/dashboard");
//   };

//   //   const handleLogin = async (e) => {
//   //     e.preventDefault();

//   //     if (!phone) {
//   //       return setSnackbar({
//   //         open: true,
//   //         message: "Phone number is required",
//   //         severity: "warning",
//   //       });
//   //     }

//   //     if (!isValidPhone(phone)) {
//   //       return setSnackbar({
//   //         open: true,
//   //         message: "Enter a valid 10-digit mobile number or start with A/a",
//   //         severity: "error",
//   //       });
//   //     }
//   // if (!password) {
//   //   return setSnackbar({
//   //     open: true,
//   //     message: "Password is required",
//   //     severity: "warning",
//   //   });
//   // }
//   //     setIsSubmitting(true);

//   //     const isAgent = /^[aA]\d{10}$/.test(phone);
//   //     const mobile = isAgent ? phone.slice(1) : phone;
//   //     const url = isAgent
//   //       ? `${process.env.REACT_APP_API_BASE_URL}/api/auth/agentlogin`
//   //       : `${process.env.REACT_APP_API_BASE_URL}/api/auth/userlogin`;

//   //     try {
//   //       const response = await axios.post(url, {
//   //         mobile,
//   //         password,
//   //         storeID: APP_CONFIG.STORE_ID,
//   //       });

//   //       const { statusCode, message, data } = response.data;
//   //       if (statusCode !== 200) {
//   //         return setSnackbar({
//   //           open: true,
//   //           message: message || "Invalid credentials",
//   //           severity: "warning",
//   //         });
//   //       }

//   //       await new Promise((resolve) => {
//   //         setTimeout(async () => {
//   //           await saveLoginData({
//   //             role: isAgent ? "agent" : "user",
//   //             mobile,
//   //             adminUser: isAgent ? data.agent : data.user,
//   //           });
//   //           resolve();
//   //         }, 500);
//   //       });

//   //       await initPushNotifications();
//   //       navigate("/dashboard");
//   //     } catch (error) {
//   //       const msg =
//   //         error.response?.data?.data?.message || "Login failed, try again";
//   //       setSnackbar({ open: true, message: msg, severity: "error" });
//   //     } finally {
//   //       setIsSubmitting(false);
//   //     }
//   //   };

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

//     setIsSubmitting(true);

//     const isAgent = /^[aA]\d{10}$/.test(phone);
//     const mobile = isAgent ? phone.slice(1) : phone;
//     const url = isAgent
//       ? `${process.env.REACT_APP_API_BASE_URL}/api/auth/v2/agentlogin`
//       : `${process.env.REACT_APP_API_BASE_URL}/api/auth/v2/userlogin`;

//     try {
//       const response = await axios.post(url, {
//         mobile,
//         storeID: APP_CONFIG.STORE_ID,
//       });
//       const { statusCode, message } = response.data;

//       if (statusCode === 404) {
//         // User does not exist — show popup
//         setUserNotFoundMsg(
//           message || "User not found. Please create a new account first.",
//         );
//         setUserNotFoundDialog(true);
//         return;
//       }

//       if (statusCode !== 200) {
//         return setSnackbar({
//           open: true,
//           message: message || "Something went wrong",
//           severity: "warning",
//         });
//       }

//       // OTP sent — navigate to OTP verification page
//       navigate("/verify-signup-otp", {
//         state: { mobile, isAgent, type: "login" },
//       });
//     } catch (error) {
//       const msg = error.response?.data?.message || "Login failed, try again";
//       setSnackbar({ open: true, message: msg, severity: "error" });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // const handleForgotPassword = () => setIsForgotPwd(true);
//   //   const handleBackToLogin = () => {
//   //     setIsForgotPwd(false);
//   //     setForgotPhone("");
//   //   };

//   // ============================
//   // Forgot Password (Single Step)
//   // ============================
//   // const handleRecoverPassword = async (e) => {
//   //   e.preventDefault();
//   //   if (!isValidPhone(forgotPhone)) {
//   //     return setSnackbar({
//   //       open: true,
//   //       message: "Enter a valid 10-digit mobile number",
//   //       severity: "error",
//   //     });
//   //   }

//   //   setIsForgotSubmitting(true);
//   //   const isAgent = forgotPhone.trim().toLowerCase().startsWith("a");

//   //   try {
//   //     const url = isAgent
//   //       ? `${process.env.REACT_APP_API_BASE_URL}api/auth/recoverpwd`
//   //       : `${process.env.REACT_APP_API_BASE_URL}/api/auth/recoverusrpwd`;
//   //     const res = await axios.post(url, {
//   //       username: isAgent ? forgotPhone.replace(/a/g, "") : forgotPhone,
//   //       storeID: APP_CONFIG.STORE_ID,
//   //       branchID: APP_CONFIG.BRANCH,
//   //     });

//   //     const { success, message } = res.data;
//   //     if (success) {
//   //       setSnackbar({
//   //         open: true,
//   //         message: message || "Password sent successfully!",
//   //         severity: "success",
//   //       });

//   //       setTimeout(() => {
//   //         handleBackToLogin();
//   //       }, 1500);
//   //     } else {
//   //       setSnackbar({
//   //         open: true,
//   //         message: message || "Failed to recover password",
//   //         severity: "warning",
//   //       });
//   //     }
//   //   } catch (err) {
//   //     setSnackbar({
//   //       open: true,
//   //       message: err.response?.data?.message || "Something went wrong",
//   //       severity: "error",
//   //     });
//   //   } finally {
//   //     setIsForgotSubmitting(false);
//   //   }
//   // };

//   return (
//     <>
//       {/* Main Layout */}
//       <Box
//         sx={{
//           display: "flex",
//           flexDirection: "column",
//           height: "100vh",
//           overflow: "hidden",
//           // background: `linear-gradient(180deg, #ffffff84 0%, #ffffffff 100%)`,
//         }}
//       >
//         {/* Logo Section */}
//         <Box
//           sx={{
//             flex: "0 0 45%",
//             display: "flex",
//             alignItems: "center",
//             flexDirection: "column",
//             justifyContent: "center",
//             // backgroundImage: `linear-gradient(180deg, #fedfb484 0%, #ffffffff 100%), url(${bgBanner})`,
//             backgroundImage: bannerGradient,
//             backgroundSize: "contain",
//             backgroundPosition: "top",
//             backgroundRepeat: "no-repeat",
//           }}
//         >
//           <Box
//             sx={{
//               mt: logoOrientation === "vertical" ? 15 : 12.5,
//               width:
//                 logoOrientation === "vertical"
//                   ? 75
//                   : logoOrientation === "horizontal"
//                   ? 200
//                   : 150,
//               height: 125,
//               backgroundImage: `url(${storeLogo})`,
//               backgroundSize: "contain",
//               backgroundPosition: "center",
//               backgroundRepeat: "no-repeat",
//             }}
//           />
//           <Typography
//             sx={{
//               fontSize: { xs: 10, sm: 10, md: 10 },
//               fontWeight: 700,
//               letterSpacing: 1.5,
//               textTransform: "uppercase",
//               color: theme.theme2.primaryHeading,
//             }}
//           >
//             {name}
//           </Typography>
//         </Box>

//         {/* Login or Forgot Password Section */}
//         <Box
//           sx={{
//             flex: 1,
//             px: 2,
//             backgroundColor: theme.palette.background.default,
//             "& .MuiOutlinedInput-root": {
//               borderRadius: "8px",
//             },
//           }}
//         >
//           {/* ===== Login Form ===== */}
//           <Typography
//             sx={{
//               fontSize: 22,
//               fontWeight: 600,
//               color: theme.theme2.primaryHeading,
//             }}
//           >
//             Login
//           </Typography>

//           <form onSubmit={handleLogin}>
//             <TextField
//               onFocus={handleInputFocus}
//               fullWidth
//               label="Mobile Number"
//               margin="dense"
//               value={phone}
//               onChange={(e) => {
//                 const value = e.target.value.replace(/\s+/g, "");
//                 setPhone(value);
//               }}
//               InputProps={{
//                 endAdornment: isValidPhone(phone) ? (
//                   <VerifiedSharpIcon
//                     sx={{
//                       width: 20,
//                       height: 20,
//                       mr: 1,
//                       color: theme.colors.primaryButton,
//                     }}
//                   />
//                 ) : null,
//               }}
//             />

//             <Button
//               type="submit"
//               fullWidth
//               variant="contained"
//               disabled={isSubmitting}
//               sx={{
//                 mt: 1,
//                 fontSize: 16,
//                 py: 1,
//                 color: "#fff",
//                 background: theme.theme2.loginBtn,
//                 borderRadius: 1.5,
//               }}
//             >
//               {isSubmitting ? (
//                 <CircularProgress size={22} sx={{ color: "#fff" }} />
//               ) : (
//                 <>
//                   {" "}
//                   Login <ChevronRightIcon />{" "}
//                 </>
//               )}
//             </Button>
//           </form>

//           <Box
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               flexDirection: "column",
//               width: "100%",
//               mt: 2,
//             }}
//           >
//             <Typography sx={{ fontSize: 16, color: theme.theme2.textCol }}>
//               Don't have an account?
//             </Typography>
//             <Typography sx={{ fontSize: 16, color: theme.theme2.textCol }}>
//               <MuiLink
//                 component={RouterLink}
//                 to="/signup"
//                 underline="hover"
//                 sx={{ color: "#000", fontWeight: 500 }}
//               >
//                 Sign up
//               </MuiLink>{" "}
//               or enter as{" "}
//               <span
//                 style={{
//                   textDecoration: "underline",
//                   color: "#000",
//                   fontWeight: 500,
//                   cursor: "pointer",
//                 }}
//                 onClick={(e) => {
//                   setIsGuest(true);
//                   handleGuestLogin(e);
//                 }}
//               >
//                 Guest
//               </span>
//               <PlayArrowRoundedIcon sx={{ fill: theme.theme2.textCol2 }} />
//             </Typography>
//           </Box>
//         </Box>
//       </Box>

//       {/* Guest Loader */}
//       {showGuestLoader && (
//         <Box
//           sx={{
//             position: "fixed",
//             inset: 0,
//             backgroundColor: "rgba(255,255,255,0.9)",
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 9999,
//           }}
//         >
//           <CircularProgress
//             size={60}
//             thickness={5}
//             sx={{ color: "#D6900F", mb: 3 }}
//           />
//           <Typography
//             sx={{ fontSize: 18, fontWeight: 500, color: theme.theme2.textCol }}
//           >
//             Logging you in as guest...
//           </Typography>
//         </Box>
//       )}
//       {/* User Not Found Dialog */}
//       <Dialog
//         open={userNotFoundDialog}
//         onClose={() => setUserNotFoundDialog(false)}
//         PaperProps={{ sx: { borderRadius: 3, px: 1 } }}
//       >
//         <DialogContent>
//           <Typography
//             sx={{
//               fontSize: 16,
//               fontWeight: 600,
//               mb: 1,
//               color: theme.theme2.primaryHeading,
//             }}
//           >
//             Account Not Found
//           </Typography>
//           <Typography sx={{ fontSize: 14, color: theme.theme2.textCol }}>
//             {userNotFoundMsg}
//           </Typography>
//         </DialogContent>
//         <DialogActions sx={{ flexDirection: "column", gap: 1, pb: 2, px: 2 }}>
//           <Button
//             fullWidth
//             variant="contained"
//             onClick={() => {
//               setUserNotFoundDialog(false);
//               navigate("/signup");
//             }}
//             sx={{
//               background: theme.theme2.loginBtn,
//               color: "#fff",
//               borderRadius: 1.5,
//             }}
//           >
//             Create New Account
//           </Button>
//           <Button
//             fullWidth
//             variant="outlined"
//             onClick={() => setUserNotFoundDialog(false)}
//             sx={{ borderRadius: 1.5 }}
//           >
//             Cancel
//           </Button>
//         </DialogActions>
//       </Dialog>
//       {/* Snackbar */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={4000}
//         onClose={handleSnackbarClose}
//         anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
//         sx={{ bottom: "72px !important" }}
//       >
//         <Alert
//           onClose={handleSnackbarClose}
//           severity={snackbar.severity}
//           variant="filled"
//           sx={{ width: "100%" }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </>
//   );
// }

// export default LoginPage;







// import React, { useContext, useEffect, useState } from "react";
// import {
//   TextField,
//   Button,
//   Typography,
//   Snackbar,
//   Alert,
//   Box,
//   CircularProgress,
//   Link as MuiLink,
//   Dialog,
//   DialogContent,
//   DialogActions,
// } from "@mui/material";
// import { Link as RouterLink, useNavigate } from "react-router-dom";
// import axios from "axios";
// import APP_CONFIG from "../config/constants";
// import { AuthContext } from "../contexts/AuthContext";
// import { StoreContext } from "../contexts/StoreContext";
// import storeLogo from "../assets/img/logo/logo.png";
// import bgBanner from "../assets/img/LoginPageBGBanner.png";
// import ChevronRightIcon from "@mui/icons-material/ChevronRight";
// import VerifiedSharpIcon from "@mui/icons-material/VerifiedSharp";

// // ---- Fixed premium palette (deep maroon + foil gold) ----
// const MAROON = "#691B1D";
// const MAROON_DEEP = "#3D0F10";
// const GOLD = "#C9A227";
// const GOLD_SOFT = "#E4C874";
// const IVORY = "#FBF8F3";
// const INK = "#2A1210";
// const TAUPE = "#8A7060";

// const DISPLAY_FONT = "'Playfair Display', 'Georgia', serif";

// function LoginPage() {
//   const navigate = useNavigate();
//   const [phone, setPhone] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [showGuestLoader, setShowGuestLoader] = useState(false);
//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "info",
//   });
//   const [logoOrientation, setLogoOrientation] = useState("square");
//   const [userNotFoundDialog, setUserNotFoundDialog] = useState(false);
//   const [userNotFoundMsg, setUserNotFoundMsg] = useState("");

//   const { saveLoginData } = useContext(AuthContext);
//   const { storeAssets } = useContext(StoreContext);
//   const name = storeAssets?.storeinfo[0]?.store_name;

//   function getLogoOrientation(width, height) {
//     const ratio = width / height;
//     if (ratio > 1.2) return "horizontal";
//     if (ratio < 0.8) return "vertical";
//     return "square";
//   }

//   useEffect(() => {
//     const img = new Image();
//     img.src = storeLogo;
//     img.onload = () => {
//       setLogoOrientation(getLogoOrientation(img.naturalWidth, img.naturalHeight));
//     };
//   }, []);

//   const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

//   const handleInputFocus = (e) => {
//     setTimeout(() => {
//       e.target.scrollIntoView({ behavior: "smooth", block: "center" });
//     }, 300);
//   };

//   const isValidPhone = (value) => /^(\d{10}|[aA]\d{10})$/.test(value);

//   const handleGuestLogin = async (e) => {
//     e.preventDefault();
//     setShowGuestLoader(true);

//     await new Promise((resolve) => {
//       setTimeout(async () => {
//         await saveLoginData({
//           role: "guest",
//           mobile: 1234567890,
//           adminUser: { mobile: "1234567890" },
//         });
//         resolve();
//       }, 800);
//     });

//     navigate("/dashboard");
//   };

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

//     setIsSubmitting(true);

//     const isAgent = /^[aA]\d{10}$/.test(phone);
//     const mobile = isAgent ? phone.slice(1) : phone;
//     const url = isAgent
//       ? `${process.env.REACT_APP_API_BASE_URL}/api/auth/v2/agentlogin`
//       : `${process.env.REACT_APP_API_BASE_URL}/api/auth/v2/userlogin`;

//     try {
//       const response = await axios.post(url, {
//         mobile,
//         storeID: APP_CONFIG.STORE_ID,
//       });
//       const { statusCode, message } = response.data;

//       if (statusCode === 404) {
//         setUserNotFoundMsg(
//           message || "User not found. Please create a new account first.",
//         );
//         setUserNotFoundDialog(true);
//         return;
//       }

//       if (statusCode !== 200) {
//         return setSnackbar({
//           open: true,
//           message: message || "Something went wrong",
//           severity: "warning",
//         });
//       }

//       navigate("/verify-signup-otp", {
//         state: { mobile, isAgent, type: "login" },
//       });
//     } catch (error) {
//       const msg = error.response?.data?.message || "Login failed, try again";
//       setSnackbar({ open: true, message: msg, severity: "error" });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <>
//       <style>{`
//         @keyframes sealSparkle {
//           0%, 100% { opacity: 0.5; transform: scale(0.85) rotate(0deg); }
//           50%      { opacity: 1;   transform: scale(1.05) rotate(6deg); }
//         }
//         @keyframes shineSweep {
//           0%   { transform: translateX(-130%) skewX(-20deg); }
//           100% { transform: translateX(230%) skewX(-20deg); }
//         }
//       `}</style>

//       <Box
//         sx={{
//           display: "flex",
//           flexDirection: "column",
//           height: "100vh",
//           overflow: "hidden",
//           background: MAROON,
//           position: "relative",
//         }}
//       >
//         {/* ---------- Hero: fixed height, does not stretch ---------- */}
//         <Box
//           sx={{
//             position: "relative",
//             flex: "0 0 auto",
//             height: "42vh",
//             minHeight: 300,
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             justifyContent: "center",
//             backgroundImage: `linear-gradient(175deg, ${MAROON} 0%, ${MAROON_DEEP} 100%), url(${bgBanner})`,
//             backgroundBlendMode: "multiply",
//             backgroundSize: "cover",
//             backgroundPosition: "top center",
//           }}
//         >
//           <Box
//             sx={{
//               position: "relative",
//               width: logoOrientation === "vertical" ? 130 : logoOrientation === "horizontal" ? 280 : 200,
//               height: 170,
//               backgroundImage: `url(${storeLogo})`,
//               backgroundSize: "contain",
//               backgroundPosition: "center",
//               backgroundRepeat: "no-repeat",
//               filter: "brightness(0) invert(1)", // render logo in white on maroon hero
//             }}
//           />
//           <Typography
//             sx={{
//               mt: 1,
//               fontSize: 10.5,
//               fontWeight: 600,
//               letterSpacing: "0.22em",
//               textTransform: "uppercase",
//               color: GOLD_SOFT,
//             }}
//           >
//             {name}
//           </Typography>
//         </Box>

//         {/* ---------- Card: hugs its own content, overlaps the hero ---------- */}
//         <Box
//           sx={{
//             position: "relative",
//             mx: 2,
//             mt: "-28px",
//             borderRadius: "20px",
//             backgroundColor: IVORY,
//             boxShadow: "0 12px 30px rgba(61,15,16,0.35)",
//             px: 3,
//             pt: 4,
//             pb: 2.5,
//             zIndex: 2,
//           }}
//         >
//           {/* Gold diamond seal marking the seam */}
//           <Box
//             sx={{
//               position: "absolute",
//               top: -16,
//               left: "50%",
//               transform: "translateX(-50%) rotate(45deg)",
//               width: 30,
//               height: 30,
//               borderRadius: "6px",
//               background: `linear-gradient(135deg, ${GOLD_SOFT}, ${GOLD})`,
//               border: `2px solid ${IVORY}`,
//               boxShadow: "0 4px 10px rgba(61,15,16,0.35)",
//               animation: "sealSparkle 2.6s ease-in-out infinite",
//             }}
//           />

//           <Typography
//             sx={{
//               fontFamily: DISPLAY_FONT,
//               fontSize: 24,
//               fontWeight: 700,
//               color: INK,
//               textAlign: "center",
//               mt: 0.5,
//             }}
//           >
//             Welcome back
//           </Typography>
//           <Typography
//             sx={{
//               fontSize: 12.5,
//               color: TAUPE,
//               textAlign: "center",
//               mt: 0.3,
//               mb: 2,
//             }}
//           >
//             Login to continue with your account
//           </Typography>

//           <form onSubmit={handleLogin}>
//             <TextField
//               onFocus={handleInputFocus}
//               fullWidth
//               label="Mobile Number"
//               margin="dense"
//               value={phone}
//               onChange={(e) => setPhone(e.target.value.replace(/\s+/g, ""))}
//               InputProps={{
//                 endAdornment: isValidPhone(phone) ? (
//                   <VerifiedSharpIcon sx={{ width: 20, height: 20, mr: 1, color: MAROON }} />
//                 ) : null,
//               }}
//               sx={{
//                 "& .MuiOutlinedInput-root": {
//                   borderRadius: "10px",
//                   backgroundColor: "#fff",
//                   "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
//                     borderColor: GOLD,
//                   },
//                 },
//                 "& .MuiInputLabel-root.Mui-focused": {
//                   color: MAROON,
//                 },
//               }}
//             />

//             <Button
//               type="submit"
//               fullWidth
//               variant="contained"
//               disabled={isSubmitting}
//               sx={{
//                 mt: 1.5,
//                 fontSize: 15.5,
//                 fontWeight: 600,
//                 py: 1.05,
//                 color: "#fff",
//                 letterSpacing: "0.03em",
//                 background: `linear-gradient(90deg, ${MAROON} 0%, ${MAROON_DEEP} 100%)`,
//                 borderRadius: "10px",
//                 position: "relative",
//                 overflow: "hidden",
//                 boxShadow: "0 6px 16px rgba(105,27,29,0.4)",
//                 "&::after": {
//                   content: '""',
//                   position: "absolute",
//                   top: 0,
//                   left: 0,
//                   width: "40%",
//                   height: "100%",
//                   background:
//                     "linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent)",
//                   animation: "shineSweep 2.8s ease-in-out 1s 1",
//                 },
//               }}
//             >
//               {isSubmitting ? (
//                 <CircularProgress size={22} sx={{ color: "#fff" }} />
//               ) : (
//                 <>Login <ChevronRightIcon sx={{ ml: 0.3 }} /></>
//               )}
//             </Button>
//           </form>

//           <Box
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               flexDirection: "column",
//               width: "100%",
//               mt: 1.75,
//               gap: 0.3,
//             }}
//           >
//             <Typography sx={{ fontSize: 13, color: TAUPE }}>
//               Don't have an account?{" "}
//               <MuiLink
//                 component={RouterLink}
//                 to="/signup"
//                 underline="hover"
//                 sx={{ color: MAROON, fontWeight: 700 }}
//               >
//                 Sign up
//               </MuiLink>
//             </Typography>
//             <Typography
//               sx={{
//                 fontSize: 12.5,
//                 color: GOLD,
//                 fontWeight: 600,
//                 textDecoration: "underline",
//                 cursor: "pointer",
//                 mt: 0.25,
//               }}
//               onClick={handleGuestLogin}
//             >
//               Continue as Guest
//             </Typography>
//           </Box>
//         </Box>

//         {/* ---------- Bottom band: mirrors the hero gradient for symmetry ---------- */}
//         <Box
//           sx={{
//             flex: 1,
//             background: `linear-gradient(5deg, ${MAROON} 0%, ${MAROON_DEEP} 100%)`,
//           }}
//         />

//         {/* ---------- Slim fixed footer — replaces the old empty space ---------- */}
//         <Box
//           sx={{
//             position: "absolute",
//             bottom: 0,
//             left: 0,
//             right: 0,
//             py: 1.4,
//             textAlign: "center",
//           }}
//         >
//           <Typography
//             sx={{
//               fontSize: 9.5,
//               letterSpacing: "0.2em",
//               color: "rgba(255,255,255,0.55)",
//               fontWeight: 600,
//             }}
//           >
//             GOLD · ANTIQUE · DIAMOND · PLATINUM · SILVER
//           </Typography>
//         </Box>
//       </Box>

//       {/* Guest Loader */}
//       {showGuestLoader && (
//         <Box
//           sx={{
//             position: "fixed",
//             inset: 0,
//             backgroundColor: "rgba(251,248,243,0.95)",
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             justifyContent: "center",
//             zIndex: 9999,
//           }}
//         >
//           <CircularProgress size={54} thickness={4.5} sx={{ color: MAROON, mb: 3 }} />
//           <Typography sx={{ fontSize: 16, fontWeight: 500, color: INK }}>
//             Logging you in as guest...
//           </Typography>
//         </Box>
//       )}

//       {/* User Not Found Dialog */}
//       <Dialog
//         open={userNotFoundDialog}
//         onClose={() => setUserNotFoundDialog(false)}
//         PaperProps={{ sx: { borderRadius: 3, px: 1 } }}
//       >
//         <DialogContent>
//           <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 1, color: INK, fontFamily: DISPLAY_FONT }}>
//             Account Not Found
//           </Typography>
//           <Typography sx={{ fontSize: 14, color: TAUPE }}>{userNotFoundMsg}</Typography>
//         </DialogContent>
//         <DialogActions sx={{ flexDirection: "column", gap: 1, pb: 2, px: 2 }}>
//           <Button
//             fullWidth
//             variant="contained"
//             onClick={() => {
//               setUserNotFoundDialog(false);
//               navigate("/signup");
//             }}
//             sx={{
//               background: `linear-gradient(90deg, ${MAROON} 0%, ${MAROON_DEEP} 100%)`,
//               color: "#fff",
//               borderRadius: 1.5,
//             }}
//           >
//             Create New Account
//           </Button>
//           <Button
//             fullWidth
//             variant="outlined"
//             onClick={() => setUserNotFoundDialog(false)}
//             sx={{ borderRadius: 1.5, borderColor: MAROON, color: MAROON }}
//           >
//             Cancel
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Snackbar */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={4000}
//         onClose={handleSnackbarClose}
//         anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
//         sx={{ bottom: "72px !important" }}
//       >
//         <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </>
//   );
// }

// export default LoginPage;






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
  Dialog,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import axios from "axios";
import APP_CONFIG from "../config/constants";
import { AuthContext } from "../contexts/AuthContext";
import { StoreContext } from "../contexts/StoreContext";
import storeLogo from "../assets/img/logo/logo.png";
import bgBanner from "../assets/img/LoginPageBGBanner.png";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import VerifiedSharpIcon from "@mui/icons-material/VerifiedSharp";

// ---- Fixed premium palette (deep navy + foil gold) ----
const MAROON = "#112246";
const MAROON_DEEP = "#0A1730";
const GOLD = "#C9A227";
const GOLD_SOFT = "#E4C874";
const IVORY = "#F5F7FA";
const INK = "#14213D";
const TAUPE = "#5A6B8C";

const DISPLAY_FONT = "'Playfair Display', 'Georgia', serif";

function LoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGuestLoader, setShowGuestLoader] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [logoOrientation, setLogoOrientation] = useState("square");
  const [userNotFoundDialog, setUserNotFoundDialog] = useState(false);
  const [userNotFoundMsg, setUserNotFoundMsg] = useState("");

  const { saveLoginData } = useContext(AuthContext);
  const { storeAssets } = useContext(StoreContext);
  const name = storeAssets?.storeinfo[0]?.store_name;

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
      setLogoOrientation(getLogoOrientation(img.naturalWidth, img.naturalHeight));
    };
  }, []);

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const handleInputFocus = (e) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  };

  const isValidPhone = (value) => /^(\d{10}|[aA]\d{10})$/.test(value);

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
        message: "Enter a valid 10-digit mobile number or start with A/a",
        severity: "error",
      });
    }

    setIsSubmitting(true);

    const isAgent = /^[aA]\d{10}$/.test(phone);
    const mobile = isAgent ? phone.slice(1) : phone;
    const url = isAgent
      ? `${process.env.REACT_APP_API_BASE_URL}/api/auth/v2/agentlogin`
      : `${process.env.REACT_APP_API_BASE_URL}/api/auth/v2/userlogin`;

    try {
      const response = await axios.post(url, {
        mobile,
        storeID: APP_CONFIG.STORE_ID,
      });
      const { statusCode, message } = response.data;

      if (statusCode === 404) {
        setUserNotFoundMsg(
          message || "User not found. Please create a new account first.",
        );
        setUserNotFoundDialog(true);
        return;
      }

      if (statusCode !== 200) {
        return setSnackbar({
          open: true,
          message: message || "Something went wrong",
          severity: "warning",
        });
      }

      navigate("/verify-signup-otp", {
        state: { mobile, isAgent, type: "login" },
      });
    } catch (error) {
      const msg = error.response?.data?.message || "Login failed, try again";
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes sealSparkle {
          0%, 100% { opacity: 0.5; transform: scale(0.85) rotate(0deg); }
          50%      { opacity: 1;   transform: scale(1.05) rotate(6deg); }
        }
        @keyframes shineSweep {
          0%   { transform: translateX(-130%) skewX(-20deg); }
          100% { transform: translateX(230%) skewX(-20deg); }
        }
      `}</style>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
          background: MAROON,
          position: "relative",
        }}
      >
        {/* ---------- Hero: fixed height, does not stretch ---------- */}
        <Box
          sx={{
            position: "relative",
            flex: "0 0 auto",
            height: "42vh",
            minHeight: 300,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundImage: `linear-gradient(175deg, ${MAROON} 0%, ${MAROON_DEEP} 100%), url(${bgBanner})`,
            backgroundBlendMode: "multiply",
            backgroundSize: "cover",
            backgroundPosition: "top center",
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: logoOrientation === "vertical" ? 130 : logoOrientation === "horizontal" ? 280 : 200,
              height: 170,
              backgroundImage: `url(${storeLogo})`,
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              filter: "brightness(0) invert(1)", // render logo in white on navy hero
            }}
          />
          <Typography
            sx={{
              mt: 1,
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: GOLD_SOFT,
            }}
          >
            {name}
          </Typography>
        </Box>

        {/* ---------- Card: hugs its own content, overlaps the hero ---------- */}
        <Box
          sx={{
            position: "relative",
            mx: 2,
            mt: "-28px",
            borderRadius: "20px",
            backgroundColor: IVORY,
            boxShadow: "0 12px 30px rgba(10,23,48,0.35)",
            px: 3,
            pt: 4,
            pb: 2.5,
            zIndex: 2,
          }}
        >
          {/* Gold diamond seal marking the seam */}
          <Box
            sx={{
              position: "absolute",
              top: -16,
              left: "50%",
              transform: "translateX(-50%) rotate(45deg)",
              width: 30,
              height: 30,
              borderRadius: "6px",
              background: `linear-gradient(135deg, ${GOLD_SOFT}, ${GOLD})`,
              border: `2px solid ${IVORY}`,
              boxShadow: "0 4px 10px rgba(10,23,48,0.35)",
              animation: "sealSparkle 2.6s ease-in-out infinite",
            }}
          />

          <Typography
            sx={{
              fontFamily: DISPLAY_FONT,
              fontSize: 24,
              fontWeight: 700,
              color: INK,
              textAlign: "center",
              mt: 0.5,
            }}
          >
            Welcome back
          </Typography>
          <Typography
            sx={{
              fontSize: 12.5,
              color: TAUPE,
              textAlign: "center",
              mt: 0.3,
              mb: 2,
            }}
          >
            Login to continue with your account
          </Typography>

          <form onSubmit={handleLogin}>
            <TextField
              onFocus={handleInputFocus}
              fullWidth
              label="Mobile Number"
              margin="dense"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\s+/g, ""))}
              InputProps={{
                endAdornment: isValidPhone(phone) ? (
                  <VerifiedSharpIcon sx={{ width: 20, height: 20, mr: 1, color: MAROON }} />
                ) : null,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "10px",
                  backgroundColor: "#fff",
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: GOLD,
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: MAROON,
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isSubmitting}
              sx={{
                mt: 1.5,
                fontSize: 15.5,
                fontWeight: 600,
                py: 1.05,
                color: "#fff",
                letterSpacing: "0.03em",
                background: `linear-gradient(90deg, ${MAROON} 0%, ${MAROON_DEEP} 100%)`,
                borderRadius: "10px",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 6px 16px rgba(17,34,70,0.4)",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "40%",
                  height: "100%",
                  background:
                    "linear-gradient(120deg, transparent, rgba(255,255,255,0.35), transparent)",
                  animation: "shineSweep 2.8s ease-in-out 1s 1",
                },
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={22} sx={{ color: "#fff" }} />
              ) : (
                <>Login <ChevronRightIcon sx={{ ml: 0.3 }} /></>
              )}
            </Button>
          </form>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              width: "100%",
              mt: 1.75,
              gap: 0.3,
            }}
          >
            <Typography sx={{ fontSize: 13, color: TAUPE }}>
              Don't have an account?{" "}
              <MuiLink
                component={RouterLink}
                to="/signup"
                underline="hover"
                sx={{ color: MAROON, fontWeight: 700 }}
              >
                Sign up
              </MuiLink>
            </Typography>
            <Typography
              sx={{
                fontSize: 12.5,
                color: GOLD,
                fontWeight: 600,
                textDecoration: "underline",
                cursor: "pointer",
                mt: 0.25,
              }}
              onClick={handleGuestLogin}
            >
              Continue as Guest
            </Typography>
          </Box>
        </Box>

        {/* ---------- Bottom band: mirrors the hero gradient for symmetry ---------- */}
        <Box
          sx={{
            flex: 1,
            background: `linear-gradient(5deg, ${MAROON} 0%, ${MAROON_DEEP} 100%)`,
          }}
        />

        {/* ---------- Slim fixed footer — replaces the old empty space ---------- */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            py: 1.4,
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: 9.5,
              letterSpacing: "0.2em",
              color: "rgba(255,255,255,0.55)",
              fontWeight: 600,
            }}
          >
            GOLD · ANTIQUE · DIAMOND · PLATINUM · SILVER
          </Typography>
        </Box>
      </Box>

      {/* Guest Loader */}
      {showGuestLoader && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(245,247,250,0.95)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <CircularProgress size={54} thickness={4.5} sx={{ color: MAROON, mb: 3 }} />
          <Typography sx={{ fontSize: 16, fontWeight: 500, color: INK }}>
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
          <Typography sx={{ fontSize: 16, fontWeight: 700, mb: 1, color: INK, fontFamily: DISPLAY_FONT }}>
            Account Not Found
          </Typography>
          <Typography sx={{ fontSize: 14, color: TAUPE }}>{userNotFoundMsg}</Typography>
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
              background: `linear-gradient(90deg, ${MAROON} 0%, ${MAROON_DEEP} 100%)`,
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
            sx={{ borderRadius: 1.5, borderColor: MAROON, color: MAROON }}
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
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default LoginPage;