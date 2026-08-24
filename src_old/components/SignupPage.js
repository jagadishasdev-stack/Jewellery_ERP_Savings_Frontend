// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Grid,
//   Typography,
//   TextField,
//   Button,
//   Snackbar,
//   Alert,
//   Link as MuiLink,
//   Dialog,
//   CircularProgress,
//   Paper,
//   InputAdornment,
//   MenuItem,
//   Select,
//   FormControl,
//   IconButton,
// } from "@mui/material";
// // ADD this import:
// import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
// import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
// import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
// import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
// import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
// import PinDropOutlinedIcon from "@mui/icons-material/PinDropOutlined";
// // import { Geolocation } from "@capacitor/geolocation";
// import { useNavigate, Link as RouterLink } from "react-router-dom";
// import theme from "../theme";
// import axios from "axios";
// import APP_CONFIG from "../config/constants";
// import Logo from "../assets/img/logo/logo.png";
// // import MyLocationIcon from "@mui/icons-material/MyLocation";

// const SignupPage = () => {
//   const navigate = useNavigate();

//   const [fetchingAddress, setFetchingAddress] = useState(false);
//   const [branches, setBranches] = useState([]);
//   const [branchesLoaded, setBranchesLoaded] = useState(false);

//   const [form, setForm] = useState({
//     name: "",
//     mobile: "",
//     email: "",
//     address1: "",
//     pincode: "",
//     latitude: "",
//     longitude: "",
//     device_id: "",
//     branch: APP_CONFIG.BRANCH,
//   });

//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "info",
//   });

//   // Feature 3: popup shown when the number already exists
//   const [existsDialog, setExistsDialog] = useState({ open: false, message: "" });

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   // Check on blur whether the number already has an account (or exists in members)
//   const handleMobileBlur = async () => {
//     if (!/^\d{10}$/.test(form.mobile)) return;
//     try {
//       const res = await axios.post(
//         `${process.env.REACT_APP_API_BASE_URL}/api/auth/v2/check-mobile`,
//         { mobile: form.mobile, storeID: APP_CONFIG.STORE_ID },
//       );
//       const { inUsers, inMembers, name } = res.data || {};
//       const withName = name ? ` with the name "${name}"` : "";
//       if (inUsers) {
//         setExistsDialog({
//           open: true,
//           message: `You already have an account${withName} with this number. Please login instead.`,
//         });
//       } else if (inMembers) {
//         setExistsDialog({
//           open: true,
//           message: `This number is already registered${withName}. Please login to continue.`,
//         });
//       }
//     } catch (err) {
//       // Silent — don't block signup if the check fails
//       console.error("check-mobile failed:", err?.message);
//     }
//   };

//   console.log(form);
//   useEffect(() => {
//     const fetchBranches = async () => {
//       try {
//         const res = await axios.get(
//           `${process.env.REACT_APP_API_BASE_URL}/api/core/getBranch/${APP_CONFIG.STORE_ID}`,
//         );
//         const data = res.data || [];
//         setBranches(data);
//         if (data.length === 1) {
//           setForm((prev) => ({ ...prev, branch: data[0].branch_code }));
//         }
//       } catch (err) {
//         console.error("Failed to fetch branches:", err);
//       } finally {
//         setBranchesLoaded(true);
//       }
//     };
//     fetchBranches();
//   }, []);

//   const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

//   const validateForm = () => {
//     const { name, mobile } = form;
//     if (!name || !mobile) {
//       setSnackbar({
//         open: true,
//         message: "* fields are mandatory",
//         severity: "warning",
//       });
//       return false;
//     }
//     if (!/^\d{10}$/.test(mobile)) {
//       setSnackbar({
//         open: true,
//         message: "Enter a valid 10-digit mobile number.",
//         severity: "error",
//       });
//       return false;
//     }
//     // add before return true:
//     // if (branches.length > 1 && !form.branch) {
//     //   setSnackbar({ open: true, message: "Please select a branch.", severity: "warning" });
//     //   return false;
//     // }
//     return true;
//   };

//   // const handleSignup = async (e) => {
//   //   e.preventDefault();
//   //   if (!validateForm()) return;

//   //   // Password match check
//   //   if (form.password !== form.confirmPassword) {
//   //     setSnackbar({
//   //       open: true,
//   //       message: "Passwords don't match",
//   //       severity: "error",
//   //     });
//   //     setForm({ ...form, password: "", confirmPassword: "" });
//   //     return;
//   //   }

//   //   try {
//   //     const response = await axios.post(
//   //       `${process.env.REACT_APP_API_BASE_URL}/api/auth/signup`,
//   //       {
//   //         ...form,
//   //         store_id: APP_CONFIG.STORE_ID,
//   //         branch: APP_CONFIG.BRANCH,
//   //       }
//   //     );

//   //     const { success, message, user } = response.data;

//   //     if (user.status === "INA") {
//   //       setSnackbar({
//   //         open: true,
//   //         message: message || "Signup successful.",
//   //         severity: success ? "success" : "error",
//   //       });
//   //       setTimeout(() => {
//   //         navigate("/verify-signup-otp", { state: { mobile: form.mobile } });
//   //       }, 2000);
//   //     } else {
//   //       setSnackbar({
//   //         open: true,
//   //         message: "This number is already registered. Please try logging in.",
//   //         severity: "error",
//   //       });
//   //     }
//   //   } catch (error) {
//   //     const msg = error.response?.data?.message || "Signup failed.";
//   //     setSnackbar({ open: true, message: msg, severity: "error" });
//   //   }
//   // };

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_API_BASE_URL}/api/auth/v2/signup`,
//         { ...form, store_id: APP_CONFIG.STORE_ID },
//       );

//       const { success, message, alreadyExists } = response.data;

//       if (alreadyExists) {
//         setSnackbar({
//           open: true,
//           message: "This number is already registered. Please login.",
//           severity: "error",
//         });
//         return;
//       }

//       if (success) {
//         setSnackbar({
//           open: true,
//           message: message || "Signup successful. OTP sent.",
//           severity: "success",
//         });
//         setTimeout(() => {
//           navigate("/verify-signup-otp", {
//             state: { mobile: form.mobile, type: "signup" },
//           });
//         }, 1500);
//       } else {
//         setSnackbar({
//           open: true,
//           message: message || "Signup failed.",
//           severity: "error",
//         });
//       }
//     } catch (error) {
//       const msg = error.response?.data?.message || "Signup failed.";
//       setSnackbar({ open: true, message: msg, severity: "error" });
//     }
//   };

//   // const handleLocateMe = async () => {
//   //   try {
//   //     const permission = await Geolocation.requestPermissions();

//   //     if (permission.location !== "granted") {
//   //       throw new Error("Location permission not granted");
//   //     }

//   //     setFetchingAddress(true);

//   //     const coords = await Geolocation.getCurrentPosition();
//   //     const { latitude, longitude } = coords.coords;

//   //     const res = await axios.get(
//   //       "https://nominatim.openstreetmap.org/reverse",
//   //       {
//   //         params: { format: "json", lat: latitude, lon: longitude },
//   //       }
//   //     );

//   //     const address = res.data.address;

//   //     setForm((prev) => ({
//   //       ...prev,
//   //       address1: address.road || "",
//   //       address2: address.neighbourhood || address.suburb || "",
//   //       address3: address.city || address.town || address.village || "",
//   //       place: address.state_district || address.county || "",
//   //       pincode: address.postcode || "",
//   //       latitude: latitude.toString(),
//   //       longitude: longitude.toString(),
//   //     }));
//   //     setFetchingAddress(false);
//   //   } catch (err) {
//   //     console.error("Geolocation error:", err);
//   //     setSnackbar({
//   //       open: true,
//   //       message: "Location permission denied or unavailable.",
//   //       severity: "error",
//   //     });
//   //     setFetchingAddress(false);
//   //   }
//   // };

//   const handleInputFocus = (e) => {
//     setTimeout(() => {
//       e.target.scrollIntoView({ behavior: "smooth", block: "center" });
//     }, 300);
//   };
//   const fieldSx = {
//     "& .MuiOutlinedInput-root": {
//       borderRadius: "10px",
//       backgroundColor: "#fff",
//     },
//     "& .MuiOutlinedInput-notchedOutline": {
//       borderColor: "#a29f9f", // ← default border color
//       borderWidth: "1.5px", // ← slightly thicker so it's visible
//     },
//     "&:hover .MuiOutlinedInput-notchedOutline": {
//       borderColor: "#a29f9f", // ← hover border color
//     },
//     "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
//       borderColor: theme.colors.subHeading, // ← focused border color
//       borderWidth: "2px",
//     },
//   };

//   const labelSx = {
//     fontSize: 13,
//     fontWeight: 600,
//     color: theme.colors.subHeading, // ← change from "#444" to this
//     textAlign: "left",
//     display: "block",
//     mb: 0.5,
//     mt: 1.5,
//   };

//   const showBranchDropdown = branchesLoaded && branches.length > 1;
//   return (
//     <Grid
//       container
//       direction="column"
//       justifyContent="center"
//       alignItems="center"
//       sx={{
//         paddingTop: "env(safe-area-inset-top, 24px)",
//         paddingBottom: "env(safe-area-inset-bottom, 44px)",
//         mb: 2,
//         minHeight: "90vh",
//         backgroundColor: theme.palette.background.default,
//       }}
//     >
//       <Box textAlign="center" px={3} width="100%" maxWidth={500}>
//         <img
//           src={Logo}
//           alt="Logo"
//           style={{ width: 110, marginBottom: 2, marginTop: 10 }}
//         />
//         <Box
//           sx={{
//             // display: "inline-block",
//             px: 2.5,
//             py: 0.5,

//             width: "80%",
//             margin: "auto",
//             mb: 1.2,
//             borderRadius: "999px",

//             // ✨ transparent capsule
//             background: "transparent",

//             // ✨ visible border
//             border: `1.5px solid ${theme.colors.subHeading}`,

//             // ✨ subtle soft look
//             opacity: 0.9,
//           }}
//         >
//           <Typography
//             variant="caption"
//             sx={{
//               color: theme.colors.subHeading,
//               fontWeight: 600,
//               letterSpacing: 1,
//               textTransform: "uppercase",
//               fontSize: 13,
//             }}
//           >
//             Create New Account
//           </Typography>
//         </Box>
//         <Typography
//           variant="body2"
//           sx={{ color: theme.colors.subHeading, marginBottom: 2 }}
//         >
//           Register using your mobile number and basic info.
//         </Typography>
//         <form onSubmit={handleSignup}>
//           <Typography sx={labelSx}>Name *</Typography>
//           <TextField
//             required
//             fullWidth
//             name="name"
//             value={form.name}
//             placeholder="Enter your name"
//             onChange={handleChange}
//             onFocus={handleInputFocus}
//             size="small"
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <PersonOutlineIcon sx={{ fontSize: 18, color: "#aaa" }} />
//                 </InputAdornment>
//               ),
//             }}
//             sx={fieldSx}
//           />

//           <Typography sx={labelSx}>Mobile Number *</Typography>
//           <TextField
//             required
//             fullWidth
//             name="mobile"
//             type="tel"
//             value={form.mobile}
//             placeholder="Enter your mobile number"
//             onChange={(e) => {
//               const cleaned = e.target.value.replace(/\D/g, "").slice(0, 10);
//               setForm({ ...form, mobile: cleaned });
//             }}
//             onFocus={handleInputFocus}
//             onBlur={handleMobileBlur}
//             size="small"
//             inputProps={{
//               maxLength: 10,
//               inputMode: "numeric",
//               pattern: "[0-9]*",
//             }}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <PhoneAndroidIcon sx={{ fontSize: 18, color: "#aaa" }} />
//                 </InputAdornment>
//               ),
//             }}
//             sx={fieldSx}
//           />

//           <Typography sx={labelSx}>Email </Typography>
//           <TextField
//             // required
//             fullWidth
//             type="email"
//             name="email"
//             value={form.email}
//             placeholder="Enter your email"
//             onChange={handleChange}
//             onFocus={handleInputFocus}
//             size="small"
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <EmailOutlinedIcon sx={{ fontSize: 18, color: "#aaa" }} />
//                 </InputAdornment>
//               ),
//             }}
//             sx={fieldSx}
//           />

//           <Typography sx={labelSx}>Address</Typography>
//           <Box sx={{ position: "relative" }}>
//             <TextField
//               fullWidth
//               name="address1"
//               value={form.address1}
//               placeholder="Enter your full address"
//               onChange={handleChange}
//               onFocus={handleInputFocus}
//               multiline
//               rows={3}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment
//                     position="start"
//                     sx={{ alignSelf: "flex-start", mt: 0 }}
//                   >
//                     <HomeOutlinedIcon sx={{ fontSize: 18, color: "#aaa" }} />
//                   </InputAdornment>
//                 ),
//               }}
//               sx={fieldSx}
//             />
//             {form.address1 && (
//               <IconButton
//                 size="small"
//                 onClick={() => setForm((prev) => ({ ...prev, address1: "" }))}
//                 sx={{
//                   position: "absolute",
//                   top: 4,
//                   right: 4,
//                   width: 20,
//                   height: 20,
//                   backgroundColor: "#e5e7eb",
//                   "&:hover": { backgroundColor: "#d1d5db" },
//                 }}
//               >
//                 <Typography
//                   sx={{ fontSize: 11, color: "#6b7280", lineHeight: 1 }}
//                 >
//                   ✕
//                 </Typography>
//               </IconButton>
//             )}
//           </Box>

//           {/* <Typography sx={labelSx}>Pincode</Typography> */}
//           {/* <TextField
//     fullWidth
//     name="pincode"
//     type="tel"
//     value={form.pincode}
//     placeholder="Enter your pincode"
//     onChange={(e) => {
//       const cleaned = e.target.value.replace(/\D/g, "").slice(0, 6);
//       setForm({ ...form, pincode: cleaned });
//     }}
//     onFocus={handleInputFocus}
//     size="small"
//     inputProps={{ maxLength: 6, inputMode: "numeric", pattern: "[0-9]*" }}
//     InputProps={{
//       startAdornment: (
//         <InputAdornment position="start">
//           <PinDropOutlinedIcon sx={{ fontSize: 18, color: "#aaa" }} />
//         </InputAdornment>
//       ),
//     }}
//     sx={fieldSx}
//   /> */}
//           {/* Pincode + Branch Row */}
//           <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
//             <Box sx={{ flex: 1 }}>
//               <Typography sx={labelSx}>Pincode</Typography>
//               <TextField
//                 fullWidth
//                 name="pincode"
//                 type="tel"
//                 value={form.pincode}
//                 placeholder="Pincode"
//                 onChange={(e) => {
//                   const cleaned = e.target.value.replace(/\D/g, "").slice(0, 6);
//                   setForm({ ...form, pincode: cleaned });
//                 }}
//                 onFocus={handleInputFocus}
//                 size="small"
//                 inputProps={{
//                   maxLength: 6,
//                   inputMode: "numeric",
//                   pattern: "[0-9]*",
//                 }}
//                 InputProps={{
//                   startAdornment: (
//                     <InputAdornment position="start">
//                       <PinDropOutlinedIcon
//                         sx={{ fontSize: 18, color: "#aaa" }}
//                       />
//                     </InputAdornment>
//                   ),
//                 }}
//                 sx={fieldSx}
//               />
//             </Box>

//             {showBranchDropdown && (
//               <Box sx={{ flex: 1 }}>
//                 <Typography sx={labelSx}>Store *</Typography>
//                 <FormControl fullWidth size="small">
//                   <Select
//                     name="branch"
//                     value={form.branch}
//                     onChange={handleChange}
//                     displayEmpty
//                     startAdornment={
//                       <InputAdornment position="start">
//                         <StorefrontOutlinedIcon
//                           sx={{ fontSize: 18, color: "#aaa" }}
//                         />
//                       </InputAdornment>
//                     }
//                     sx={{
//                       borderRadius: "10px",
//                       backgroundColor: "#fff",
//                       "& .MuiOutlinedInput-notchedOutline": {
//                         borderColor: "#a29f9f",
//                         borderWidth: "1.5px",
//                       },
//                       "&:hover .MuiOutlinedInput-notchedOutline": {
//                         borderColor: "#a29f9f",
//                       },
//                       "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
//                         borderColor: theme.colors.subHeading,
//                         borderWidth: "2px",
//                       },
//                     }}
//                   >
//                     <MenuItem value="" disabled>
//                       <em>Select Store</em>
//                     </MenuItem>
//                     {branches.map((b) => (
//                       <MenuItem key={b.Id} value={b.branch_code}>
//                         {b.branch_city}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </FormControl>
//               </Box>
//             )}
//           </Box>
//           <Button
//             type="submit"
//             fullWidth
//             variant="contained"
//             sx={{
//               backgroundColor: theme.colors.primaryButton,
//               color: "#fff",
//               mt: 2,
//               borderRadius: 2,
//               py: 1.2,
//               fontSize: 15,
//             }}
//           >
//             Sign Up
//           </Button>
//         </form>

//         <Typography variant="body2" sx={{ marginTop: 3 }}>
//           Already have an account?{" "}
//           <MuiLink
//             component={RouterLink}
//             to="/login"
//             underline="hover"
//             sx={{ color: theme.colors.subHeading, fontWeight: 500 }}
//           >
//             Login
//           </MuiLink>
//         </Typography>
//       </Box>

//       <Dialog
//         open={fetchingAddress}
//         fullScreen
//         PaperProps={{
//           sx: {
//             backgroundColor: "rgba(0, 0, 0, 0.4)",
//             boxShadow: "none",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//           },
//         }}
//       >
//         <Box
//           sx={{
//             borderRadius: 2,
//             padding: 4,
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             gap: 2,
//             width: "80%",
//             maxWidth: 320,
//             color: "#fff",
//           }}
//         >
//           <Typography
//             sx={{ textAlign: "center" }}
//             variant="body1"
//             fontWeight={500}
//           >
//             Getting your location to proceed...
//           </Typography>
//           <CircularProgress sx={{ color: "#fff" }} />
//         </Box>

//         <Button
//           variant="outlined"
//           sx={{
//             border: "1px solid #fff",
//             color: "#fff",
//             backgroundColor: "rgba(255, 255, 255, 0.4)",
//             fontSize: "12px",
//           }}
//           color="error"
//           onClick={() => setFetchingAddress(false)}
//         >
//           Cancel
//         </Button>
//       </Dialog>

//       {/* Feature 3: "number already exists" popup */}
//       <Dialog
//         open={existsDialog.open}
//         onClose={() => setExistsDialog({ open: false, message: "" })}
//         PaperProps={{
//           sx: {
//             borderRadius: "20px",
//             width: "88%",
//             maxWidth: 340,
//             mx: "auto",
//             p: 0.5,
//           },
//         }}
//       >
//         <Box sx={{ pt: 3, pb: 1, px: 3, textAlign: "center" }}>
//           <Typography
//             sx={{ fontWeight: 700, fontSize: 16, color: "#111", mb: 1 }}
//           >
//             Account Already Exists
//           </Typography>
//           <Typography sx={{ fontSize: 13.5, color: "#4b5563", lineHeight: 1.5 }}>
//             {existsDialog.message}
//           </Typography>
//         </Box>
//         <Box
//           sx={{
//             px: 2.5,
//             pt: 1,
//             pb: 2.5,
//             display: "flex",
//             flexDirection: "column",
//             gap: 1,
//           }}
//         >
//           <Button
//             fullWidth
//             variant="contained"
//             onClick={() => {
//               setExistsDialog({ open: false, message: "" });
//               navigate("/login");
//             }}
//             sx={{
//               height: 44,
//               borderRadius: "12px",
//               fontWeight: 700,
//               fontSize: 14,
//               textTransform: "none",
//               backgroundColor: theme.colors.primaryButton,
//               color: "#fff",
//             }}
//           >
//             Go to Login
//           </Button>
//           <Button
//             fullWidth
//             variant="text"
//             onClick={() => setExistsDialog({ open: false, message: "" })}
//             sx={{
//               height: 38,
//               borderRadius: "12px",
//               textTransform: "none",
//               fontSize: 12.5,
//               fontWeight: 600,
//               color: "#6b7280",
//             }}
//           >
//             Continue Sign Up
//           </Button>
//         </Box>
//       </Dialog>

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
//     </Grid>
//   );
// };

// export default SignupPage;






// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Grid,
//   Typography,
//   TextField,
//   Button,
//   Snackbar,
//   Alert,
//   Link as MuiLink,
//   Dialog,
//   CircularProgress,
//   InputAdornment,
//   MenuItem,
//   Select,
//   FormControl,
//   IconButton,
// } from "@mui/material";
// import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
// import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
// import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
// import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
// import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
// import PinDropOutlinedIcon from "@mui/icons-material/PinDropOutlined";
// import { useNavigate, Link as RouterLink } from "react-router-dom";
// import axios from "axios";
// import APP_CONFIG from "../config/constants";
// import Logo from "../assets/img/logo/logo.png";

// // ---- Same fixed premium palette used on the Login page ----
// const MAROON = "#691B1D";
// const MAROON_DEEP = "#3D0F10";
// const GOLD = "#C9A227";
// const GOLD_SOFT = "#E4C874";
// const IVORY = "#FBF8F3";
// const INK = "#2A1210";
// const TAUPE = "#8A7060";

// const DISPLAY_FONT = "'Playfair Display', 'Georgia', serif";

// const SignupPage = () => {
//   const navigate = useNavigate();

//   const [fetchingAddress, setFetchingAddress] = useState(false);
//   const [branches, setBranches] = useState([]);
//   const [branchesLoaded, setBranchesLoaded] = useState(false);

//   const [form, setForm] = useState({
//     name: "",
//     mobile: "",
//     email: "",
//     address1: "",
//     pincode: "",
//     latitude: "",
//     longitude: "",
//     device_id: "",
//     branch: APP_CONFIG.BRANCH,
//   });

//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "info",
//   });

//   const [existsDialog, setExistsDialog] = useState({ open: false, message: "" });

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleMobileBlur = async () => {
//     if (!/^\d{10}$/.test(form.mobile)) return;
//     try {
//       const res = await axios.post(
//         `${process.env.REACT_APP_API_BASE_URL}/api/auth/v2/check-mobile`,
//         { mobile: form.mobile, storeID: APP_CONFIG.STORE_ID },
//       );
//       const { inUsers, inMembers, name } = res.data || {};
//       const withName = name ? ` with the name "${name}"` : "";
//       if (inUsers) {
//         setExistsDialog({
//           open: true,
//           message: `You already have an account${withName} with this number. Please login instead.`,
//         });
//       } else if (inMembers) {
//         setExistsDialog({
//           open: true,
//           message: `This number is already registered${withName}. Please login to continue.`,
//         });
//       }
//     } catch (err) {
//       console.error("check-mobile failed:", err?.message);
//     }
//   };

//   useEffect(() => {
//     const fetchBranches = async () => {
//       try {
//         const res = await axios.get(
//           `${process.env.REACT_APP_API_BASE_URL}/api/core/getBranch/${APP_CONFIG.STORE_ID}`,
//         );
//         const data = res.data || [];
//         setBranches(data);
//         if (data.length === 1) {
//           setForm((prev) => ({ ...prev, branch: data[0].branch_code }));
//         }
//       } catch (err) {
//         console.error("Failed to fetch branches:", err);
//       } finally {
//         setBranchesLoaded(true);
//       }
//     };
//     fetchBranches();
//   }, []);

//   const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

//   const validateForm = () => {
//     const { name, mobile } = form;
//     if (!name || !mobile) {
//       setSnackbar({
//         open: true,
//         message: "* fields are mandatory",
//         severity: "warning",
//       });
//       return false;
//     }
//     if (!/^\d{10}$/.test(mobile)) {
//       setSnackbar({
//         open: true,
//         message: "Enter a valid 10-digit mobile number.",
//         severity: "error",
//       });
//       return false;
//     }
//     return true;
//   };

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_API_BASE_URL}/api/auth/v2/signup`,
//         { ...form, store_id: APP_CONFIG.STORE_ID },
//       );

//       const { success, message, alreadyExists } = response.data;

//       if (alreadyExists) {
//         setSnackbar({
//           open: true,
//           message: "This number is already registered. Please login.",
//           severity: "error",
//         });
//         return;
//       }

//       if (success) {
//         setSnackbar({
//           open: true,
//           message: message || "Signup successful. OTP sent.",
//           severity: "success",
//         });
//         setTimeout(() => {
//           navigate("/verify-signup-otp", {
//             state: { mobile: form.mobile, type: "signup" },
//           });
//         }, 1500);
//       } else {
//         setSnackbar({
//           open: true,
//           message: message || "Signup failed.",
//           severity: "error",
//         });
//       }
//     } catch (error) {
//       const msg = error.response?.data?.message || "Signup failed.";
//       setSnackbar({ open: true, message: msg, severity: "error" });
//     }
//   };

//   const handleInputFocus = (e) => {
//     setTimeout(() => {
//       e.target.scrollIntoView({ behavior: "smooth", block: "center" });
//     }, 300);
//   };

//   const fieldSx = {
//     "& .MuiOutlinedInput-root": {
//       borderRadius: "10px",
//       backgroundColor: "#fff",
//     },
//     "& .MuiOutlinedInput-notchedOutline": {
//       borderColor: "#DDD3C8",
//       borderWidth: "1.5px",
//     },
//     "&:hover .MuiOutlinedInput-notchedOutline": {
//       borderColor: "#C9BBA8",
//     },
//     "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
//       borderColor: GOLD,
//       borderWidth: "2px",
//     },
//   };

//   const selectSx = {
//     borderRadius: "10px",
//     backgroundColor: "#fff",
//     "& .MuiOutlinedInput-notchedOutline": {
//       borderColor: "#DDD3C8",
//       borderWidth: "1.5px",
//     },
//     "&:hover .MuiOutlinedInput-notchedOutline": {
//       borderColor: "#C9BBA8",
//     },
//     "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
//       borderColor: GOLD,
//       borderWidth: "2px",
//     },
//   };

//   const labelSx = {
//     fontSize: 12.5,
//     fontWeight: 700,
//     letterSpacing: "0.03em",
//     color: MAROON,
//     textAlign: "left",
//     display: "block",
//     mb: 0.5,
//     mt: 1.75,
//   };

//   const showBranchDropdown = branchesLoaded && branches.length > 1;

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

//       <Grid
//         container
//         direction="column"
//         sx={{
//           minHeight: "100vh",
//           backgroundColor: IVORY,
//         }}
//       >
//         {/* ---------- Hero band ---------- */}
//         <Box
//           sx={{
//             position: "relative",
//             flex: "0 0 auto",
//             pt: "env(safe-area-inset-top, 32px)",
//             pb: 6,
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             justifyContent: "center",
//             background: `linear-gradient(175deg, ${MAROON} 0%, ${MAROON_DEEP} 100%)`,
//           }}
//         >
//           <Box
//             sx={{
//               width: 160,
//               height: 130,
//               backgroundImage: `url(${Logo})`,
//               backgroundSize: "contain",
//               backgroundPosition: "center",
//               backgroundRepeat: "no-repeat",
//               filter: "brightness(0) invert(1)",
//             }}
//           />
//           <Typography
//             sx={{
//               mt: 1,
//               fontSize: 10.5,
//               fontWeight: 700,
//               letterSpacing: "0.24em",
//               textTransform: "uppercase",
//               color: GOLD_SOFT,
//             }}
//           >
//             Create Account
//           </Typography>
//         </Box>

//         {/* ---------- Card overlapping the hero ---------- */}
//         <Box
//           sx={{
//             position: "relative",
//             mx: 2,
//             mt: "-24px",
//             mb: "calc(env(safe-area-inset-bottom, 16px) + 16px)",
//             borderRadius: "20px",
//             backgroundColor: "#fff",
//             boxShadow: "0 12px 30px rgba(61,15,16,0.28)",
//             px: 3,
//             pt: 4,
//             pb: 3,
//             zIndex: 2,
//           }}
//         >
//           {/* Gold diamond seal marking the seam — matches the login page */}
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
//               border: "2px solid #fff",
//               boxShadow: "0 4px 10px rgba(61,15,16,0.3)",
//               animation: "sealSparkle 2.6s ease-in-out infinite",
//             }}
//           />

//           <Typography
//             sx={{
//               fontFamily: DISPLAY_FONT,
//               fontSize: 22,
//               fontWeight: 700,
//               color: INK,
//               textAlign: "center",
//               mt: 0.5,
//             }}
//           >
//             Join us
//           </Typography>
//           <Typography
//             sx={{
//               fontSize: 12.5,
//               color: TAUPE,
//               textAlign: "center",
//               mt: 0.3,
//               mb: 1,
//             }}
//           >
//             Register using your mobile number and basic info
//           </Typography>

//           <form onSubmit={handleSignup}>
//             <Typography sx={labelSx}>Name *</Typography>
//             <TextField
//               required
//               fullWidth
//               name="name"
//               value={form.name}
//               placeholder="Enter your name"
//               onChange={handleChange}
//               onFocus={handleInputFocus}
//               size="small"
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <PersonOutlineIcon sx={{ fontSize: 18, color: "#B79A7B" }} />
//                   </InputAdornment>
//                 ),
//               }}
//               sx={fieldSx}
//             />

//             <Typography sx={labelSx}>Mobile Number *</Typography>
//             <TextField
//               required
//               fullWidth
//               name="mobile"
//               type="tel"
//               value={form.mobile}
//               placeholder="Enter your mobile number"
//               onChange={(e) => {
//                 const cleaned = e.target.value.replace(/\D/g, "").slice(0, 10);
//                 setForm({ ...form, mobile: cleaned });
//               }}
//               onFocus={handleInputFocus}
//               onBlur={handleMobileBlur}
//               size="small"
//               inputProps={{
//                 maxLength: 10,
//                 inputMode: "numeric",
//                 pattern: "[0-9]*",
//               }}
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <PhoneAndroidIcon sx={{ fontSize: 18, color: "#B79A7B" }} />
//                   </InputAdornment>
//                 ),
//               }}
//               sx={fieldSx}
//             />

//             <Typography sx={labelSx}>Email</Typography>
//             <TextField
//               fullWidth
//               type="email"
//               name="email"
//               value={form.email}
//               placeholder="Enter your email"
//               onChange={handleChange}
//               onFocus={handleInputFocus}
//               size="small"
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">
//                     <EmailOutlinedIcon sx={{ fontSize: 18, color: "#B79A7B" }} />
//                   </InputAdornment>
//                 ),
//               }}
//               sx={fieldSx}
//             />

//             <Typography sx={labelSx}>Address</Typography>
//             <Box sx={{ position: "relative" }}>
//               <TextField
//                 fullWidth
//                 name="address1"
//                 value={form.address1}
//                 placeholder="Enter your full address"
//                 onChange={handleChange}
//                 onFocus={handleInputFocus}
//                 multiline
//                 rows={3}
//                 InputProps={{
//                   startAdornment: (
//                     <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 0 }}>
//                       <HomeOutlinedIcon sx={{ fontSize: 18, color: "#B79A7B" }} />
//                     </InputAdornment>
//                   ),
//                 }}
//                 sx={fieldSx}
//               />
//               {form.address1 && (
//                 <IconButton
//                   size="small"
//                   onClick={() => setForm((prev) => ({ ...prev, address1: "" }))}
//                   sx={{
//                     position: "absolute",
//                     top: 4,
//                     right: 4,
//                     width: 20,
//                     height: 20,
//                     backgroundColor: "#F0E8DA",
//                     "&:hover": { backgroundColor: "#E4D6BE" },
//                   }}
//                 >
//                   <Typography sx={{ fontSize: 11, color: TAUPE, lineHeight: 1 }}>✕</Typography>
//                 </IconButton>
//               )}
//             </Box>

//             {/* Pincode + Branch Row */}
//             <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
//               <Box sx={{ flex: 1 }}>
//                 <Typography sx={labelSx}>Pincode</Typography>
//                 <TextField
//                   fullWidth
//                   name="pincode"
//                   type="tel"
//                   value={form.pincode}
//                   placeholder="Pincode"
//                   onChange={(e) => {
//                     const cleaned = e.target.value.replace(/\D/g, "").slice(0, 6);
//                     setForm({ ...form, pincode: cleaned });
//                   }}
//                   onFocus={handleInputFocus}
//                   size="small"
//                   inputProps={{
//                     maxLength: 6,
//                     inputMode: "numeric",
//                     pattern: "[0-9]*",
//                   }}
//                   InputProps={{
//                     startAdornment: (
//                       <InputAdornment position="start">
//                         <PinDropOutlinedIcon sx={{ fontSize: 18, color: "#B79A7B" }} />
//                       </InputAdornment>
//                     ),
//                   }}
//                   sx={fieldSx}
//                 />
//               </Box>

//               {showBranchDropdown && (
//                 <Box sx={{ flex: 1 }}>
//                   <Typography sx={labelSx}>Store *</Typography>
//                   <FormControl fullWidth size="small">
//                     <Select
//                       name="branch"
//                       value={form.branch}
//                       onChange={handleChange}
//                       displayEmpty
//                       startAdornment={
//                         <InputAdornment position="start">
//                           <StorefrontOutlinedIcon sx={{ fontSize: 18, color: "#B79A7B" }} />
//                         </InputAdornment>
//                       }
//                       sx={selectSx}
//                     >
//                       <MenuItem value="" disabled>
//                         <em>Select Store</em>
//                       </MenuItem>
//                       {branches.map((b) => (
//                         <MenuItem key={b.Id} value={b.branch_code}>
//                           {b.branch_city}
//                         </MenuItem>
//                       ))}
//                     </Select>
//                   </FormControl>
//                 </Box>
//               )}
//             </Box>

//             <Button
//               type="submit"
//               fullWidth
//               variant="contained"
//               sx={{
//                 mt: 3,
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
//               Sign Up
//             </Button>
//           </form>

//           <Typography sx={{ fontSize: 13, color: TAUPE, textAlign: "center", mt: 2.5 }}>
//             Already have an account?{" "}
//             <MuiLink
//               component={RouterLink}
//               to="/login"
//               underline="hover"
//               sx={{ color: MAROON, fontWeight: 700 }}
//             >
//               Login
//             </MuiLink>
//           </Typography>
//         </Box>
//       </Grid>

//       <Dialog
//         open={fetchingAddress}
//         fullScreen
//         PaperProps={{
//           sx: {
//             backgroundColor: "rgba(42,18,16,0.55)",
//             boxShadow: "none",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//           },
//         }}
//       >
//         <Box
//           sx={{
//             borderRadius: 2,
//             padding: 4,
//             display: "flex",
//             flexDirection: "column",
//             alignItems: "center",
//             gap: 2,
//             width: "80%",
//             maxWidth: 320,
//             color: "#fff",
//           }}
//         >
//           <Typography sx={{ textAlign: "center" }} variant="body1" fontWeight={500}>
//             Getting your location to proceed...
//           </Typography>
//           <CircularProgress sx={{ color: GOLD_SOFT }} />
//         </Box>

//         <Button
//           variant="outlined"
//           sx={{
//             border: "1px solid #fff",
//             color: "#fff",
//             backgroundColor: "rgba(255, 255, 255, 0.15)",
//             fontSize: "12px",
//           }}
//           onClick={() => setFetchingAddress(false)}
//         >
//           Cancel
//         </Button>
//       </Dialog>

//       {/* "number already exists" popup */}
//       <Dialog
//         open={existsDialog.open}
//         onClose={() => setExistsDialog({ open: false, message: "" })}
//         PaperProps={{
//           sx: {
//             borderRadius: "20px",
//             width: "88%",
//             maxWidth: 340,
//             mx: "auto",
//             p: 0.5,
//           },
//         }}
//       >
//         <Box sx={{ pt: 3, pb: 1, px: 3, textAlign: "center" }}>
//           <Typography sx={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: 17, color: INK, mb: 1 }}>
//             Account Already Exists
//           </Typography>
//           <Typography sx={{ fontSize: 13.5, color: TAUPE, lineHeight: 1.5 }}>
//             {existsDialog.message}
//           </Typography>
//         </Box>
//         <Box sx={{ px: 2.5, pt: 1, pb: 2.5, display: "flex", flexDirection: "column", gap: 1 }}>
//           <Button
//             fullWidth
//             variant="contained"
//             onClick={() => {
//               setExistsDialog({ open: false, message: "" });
//               navigate("/login");
//             }}
//             sx={{
//               height: 44,
//               borderRadius: "12px",
//               fontWeight: 700,
//               fontSize: 14,
//               textTransform: "none",
//               background: `linear-gradient(90deg, ${MAROON} 0%, ${MAROON_DEEP} 100%)`,
//               color: "#fff",
//             }}
//           >
//             Go to Login
//           </Button>
//           <Button
//             fullWidth
//             variant="text"
//             onClick={() => setExistsDialog({ open: false, message: "" })}
//             sx={{
//               height: 38,
//               borderRadius: "12px",
//               textTransform: "none",
//               fontSize: 12.5,
//               fontWeight: 600,
//               color: TAUPE,
//             }}
//           >
//             Continue Sign Up
//           </Button>
//         </Box>
//       </Dialog>

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
// };

// export default SignupPage;






import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
  Link as MuiLink,
  Dialog,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  IconButton,
} from "@mui/material";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PinDropOutlinedIcon from "@mui/icons-material/PinDropOutlined";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import axios from "axios";
import APP_CONFIG from "../config/constants";
import Logo from "../assets/img/logo/logo.png";

// ---- Same fixed premium palette used on the Login page ----
const MAROON = "#112246";
const MAROON_DEEP = "#0A1730";
const GOLD = "#C9A227";
const GOLD_SOFT = "#E4C874";
const IVORY = "#F5F7FA";
const INK = "#14213D";
const TAUPE = "#5A6B8C";

const DISPLAY_FONT = "'Playfair Display', 'Georgia', serif";

const SignupPage = () => {
  const navigate = useNavigate();

  const [fetchingAddress, setFetchingAddress] = useState(false);
  const [branches, setBranches] = useState([]);
  const [branchesLoaded, setBranchesLoaded] = useState(false);

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    address1: "",
    pincode: "",
    latitude: "",
    longitude: "",
    device_id: "",
    branch: APP_CONFIG.BRANCH,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [existsDialog, setExistsDialog] = useState({ open: false, message: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMobileBlur = async () => {
    if (!/^\d{10}$/.test(form.mobile)) return;
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/v2/check-mobile`,
        { mobile: form.mobile, storeID: APP_CONFIG.STORE_ID },
      );
      const { inUsers, inMembers, name } = res.data || {};
      const withName = name ? ` with the name "${name}"` : "";
      if (inUsers) {
        setExistsDialog({
          open: true,
          message: `You already have an account${withName} with this number. Please login instead.`,
        });
      } else if (inMembers) {
        setExistsDialog({
          open: true,
          message: `This number is already registered${withName}. Please login to continue.`,
        });
      }
    } catch (err) {
      console.error("check-mobile failed:", err?.message);
    }
  };

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/core/getBranch/${APP_CONFIG.STORE_ID}`,
        );
        const data = res.data || [];
        setBranches(data);
        if (data.length === 1) {
          setForm((prev) => ({ ...prev, branch: data[0].branch_code }));
        }
      } catch (err) {
        console.error("Failed to fetch branches:", err);
      } finally {
        setBranchesLoaded(true);
      }
    };
    fetchBranches();
  }, []);

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const validateForm = () => {
    const { name, mobile } = form;
    if (!name || !mobile) {
      setSnackbar({
        open: true,
        message: "* fields are mandatory",
        severity: "warning",
      });
      return false;
    }
    if (!/^\d{10}$/.test(mobile)) {
      setSnackbar({
        open: true,
        message: "Enter a valid 10-digit mobile number.",
        severity: "error",
      });
      return false;
    }
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/v2/signup`,
        { ...form, store_id: APP_CONFIG.STORE_ID },
      );

      const { success, message, alreadyExists } = response.data;

      if (alreadyExists) {
        setSnackbar({
          open: true,
          message: "This number is already registered. Please login.",
          severity: "error",
        });
        return;
      }

      if (success) {
        setSnackbar({
          open: true,
          message: message || "Signup successful. OTP sent.",
          severity: "success",
        });
        setTimeout(() => {
          navigate("/verify-signup-otp", {
            state: { mobile: form.mobile, type: "signup" },
          });
        }, 1500);
      } else {
        setSnackbar({
          open: true,
          message: message || "Signup failed.",
          severity: "error",
        });
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Signup failed.";
      setSnackbar({ open: true, message: msg, severity: "error" });
    }
  };

  const handleInputFocus = (e) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      backgroundColor: "#fff",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#DDD3C8",
      borderWidth: "1.5px",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#C9BBA8",
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: GOLD,
      borderWidth: "2px",
    },
  };

  const selectSx = {
    borderRadius: "10px",
    backgroundColor: "#fff",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#DDD3C8",
      borderWidth: "1.5px",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#C9BBA8",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: GOLD,
      borderWidth: "2px",
    },
  };

  const labelSx = {
    fontSize: 12.5,
    fontWeight: 700,
    letterSpacing: "0.03em",
    color: MAROON,
    textAlign: "left",
    display: "block",
    mb: 0.5,
    mt: 1.75,
  };

  const showBranchDropdown = branchesLoaded && branches.length > 1;

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

      <Grid
        container
        direction="column"
        sx={{
          minHeight: "100vh",
          backgroundColor: IVORY,
        }}
      >
        {/* ---------- Hero band ---------- */}
        <Box
          sx={{
            position: "relative",
            flex: "0 0 auto",
            pt: "env(safe-area-inset-top, 32px)",
            pb: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: `linear-gradient(175deg, ${MAROON} 0%, ${MAROON_DEEP} 100%)`,
          }}
        >
          <Box
            sx={{
              width: 160,
              height: 130,
              backgroundImage: `url(${Logo})`,
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              filter: "brightness(0) invert(1)",
            }}
          />
          <Typography
            sx={{
              mt: 1,
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: GOLD_SOFT,
            }}
          >
            Create Account
          </Typography>
        </Box>

        {/* ---------- Card overlapping the hero ---------- */}
        <Box
          sx={{
            position: "relative",
            mx: 2,
            mt: "-24px",
            mb: "calc(env(safe-area-inset-bottom, 16px) + 16px)",
            borderRadius: "20px",
            backgroundColor: "#fff",
            boxShadow: "0 12px 30px rgba(10,23,48,0.28)",
            px: 3,
            pt: 4,
            pb: 3,
            zIndex: 2,
          }}
        >
          {/* Gold diamond seal marking the seam — matches the login page */}
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
              border: "2px solid #fff",
              boxShadow: "0 4px 10px rgba(10,23,48,0.3)",
              animation: "sealSparkle 2.6s ease-in-out infinite",
            }}
          />

          <Typography
            sx={{
              fontFamily: DISPLAY_FONT,
              fontSize: 22,
              fontWeight: 700,
              color: INK,
              textAlign: "center",
              mt: 0.5,
            }}
          >
            Join us
          </Typography>
          <Typography
            sx={{
              fontSize: 12.5,
              color: TAUPE,
              textAlign: "center",
              mt: 0.3,
              mb: 1,
            }}
          >
            Register using your mobile number and basic info
          </Typography>

          <form onSubmit={handleSignup}>
            <Typography sx={labelSx}>Name *</Typography>
            <TextField
              required
              fullWidth
              name="name"
              value={form.name}
              placeholder="Enter your name"
              onChange={handleChange}
              onFocus={handleInputFocus}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutlineIcon sx={{ fontSize: 18, color: "#B79A7B" }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />

            <Typography sx={labelSx}>Mobile Number *</Typography>
            <TextField
              required
              fullWidth
              name="mobile"
              type="tel"
              value={form.mobile}
              placeholder="Enter your mobile number"
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, "").slice(0, 10);
                setForm({ ...form, mobile: cleaned });
              }}
              onFocus={handleInputFocus}
              onBlur={handleMobileBlur}
              size="small"
              inputProps={{
                maxLength: 10,
                inputMode: "numeric",
                pattern: "[0-9]*",
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneAndroidIcon sx={{ fontSize: 18, color: "#B79A7B" }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />

            <Typography sx={labelSx}>Email</Typography>
            <TextField
              fullWidth
              type="email"
              name="email"
              value={form.email}
              placeholder="Enter your email"
              onChange={handleChange}
              onFocus={handleInputFocus}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ fontSize: 18, color: "#B79A7B" }} />
                  </InputAdornment>
                ),
              }}
              sx={fieldSx}
            />

            <Typography sx={labelSx}>Address</Typography>
            <Box sx={{ position: "relative" }}>
              <TextField
                fullWidth
                name="address1"
                value={form.address1}
                placeholder="Enter your full address"
                onChange={handleChange}
                onFocus={handleInputFocus}
                multiline
                rows={3}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 0 }}>
                      <HomeOutlinedIcon sx={{ fontSize: 18, color: "#B79A7B" }} />
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx}
              />
              {form.address1 && (
                <IconButton
                  size="small"
                  onClick={() => setForm((prev) => ({ ...prev, address1: "" }))}
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 20,
                    height: 20,
                    backgroundColor: "#F0E8DA",
                    "&:hover": { backgroundColor: "#E4D6BE" },
                  }}
                >
                  <Typography sx={{ fontSize: 11, color: TAUPE, lineHeight: 1 }}>✕</Typography>
                </IconButton>
              )}
            </Box>

            {/* Pincode + Branch Row */}
            <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
              <Box sx={{ flex: 1 }}>
                <Typography sx={labelSx}>Pincode</Typography>
                <TextField
                  fullWidth
                  name="pincode"
                  type="tel"
                  value={form.pincode}
                  placeholder="Pincode"
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setForm({ ...form, pincode: cleaned });
                  }}
                  onFocus={handleInputFocus}
                  size="small"
                  inputProps={{
                    maxLength: 6,
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PinDropOutlinedIcon sx={{ fontSize: 18, color: "#B79A7B" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={fieldSx}
                />
              </Box>

              {showBranchDropdown && (
                <Box sx={{ flex: 1 }}>
                  <Typography sx={labelSx}>Store *</Typography>
                  <FormControl fullWidth size="small">
                    <Select
                      name="branch"
                      value={form.branch}
                      onChange={handleChange}
                      displayEmpty
                      startAdornment={
                        <InputAdornment position="start">
                          <StorefrontOutlinedIcon sx={{ fontSize: 18, color: "#B79A7B" }} />
                        </InputAdornment>
                      }
                      sx={selectSx}
                    >
                      <MenuItem value="" disabled>
                        <em>Select Store</em>
                      </MenuItem>
                      {branches.map((b) => (
                        <MenuItem key={b.Id} value={b.branch_code}>
                          {b.branch_city}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
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
              Sign Up
            </Button>
          </form>

          <Typography sx={{ fontSize: 13, color: TAUPE, textAlign: "center", mt: 2.5 }}>
            Already have an account?{" "}
            <MuiLink
              component={RouterLink}
              to="/login"
              underline="hover"
              sx={{ color: MAROON, fontWeight: 700 }}
            >
              Login
            </MuiLink>
          </Typography>
        </Box>
      </Grid>

      <Dialog
        open={fetchingAddress}
        fullScreen
        PaperProps={{
          sx: {
            backgroundColor: "rgba(20,33,61,0.55)",
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
          <Typography sx={{ textAlign: "center" }} variant="body1" fontWeight={500}>
            Getting your location to proceed...
          </Typography>
          <CircularProgress sx={{ color: GOLD_SOFT }} />
        </Box>

        <Button
          variant="outlined"
          sx={{
            border: "1px solid #fff",
            color: "#fff",
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            fontSize: "12px",
          }}
          onClick={() => setFetchingAddress(false)}
        >
          Cancel
        </Button>
      </Dialog>

      {/* "number already exists" popup */}
      <Dialog
        open={existsDialog.open}
        onClose={() => setExistsDialog({ open: false, message: "" })}
        PaperProps={{
          sx: {
            borderRadius: "20px",
            width: "88%",
            maxWidth: 340,
            mx: "auto",
            p: 0.5,
          },
        }}
      >
        <Box sx={{ pt: 3, pb: 1, px: 3, textAlign: "center" }}>
          <Typography sx={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontSize: 17, color: INK, mb: 1 }}>
            Account Already Exists
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: TAUPE, lineHeight: 1.5 }}>
            {existsDialog.message}
          </Typography>
        </Box>
        <Box sx={{ px: 2.5, pt: 1, pb: 2.5, display: "flex", flexDirection: "column", gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setExistsDialog({ open: false, message: "" });
              navigate("/login");
            }}
            sx={{
              height: 44,
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: 14,
              textTransform: "none",
              background: `linear-gradient(90deg, ${MAROON} 0%, ${MAROON_DEEP} 100%)`,
              color: "#fff",
            }}
          >
            Go to Login
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => setExistsDialog({ open: false, message: "" })}
            sx={{
              height: 38,
              borderRadius: "12px",
              textTransform: "none",
              fontSize: 12.5,
              fontWeight: 600,
              color: TAUPE,
            }}
          >
            Continue Sign Up
          </Button>
        </Box>
      </Dialog>

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
};

export default SignupPage;