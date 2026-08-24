// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Typography,
//   CircularProgress,
//   Button,
//   Stack,
//   InputAdornment,
//   TextField,
//   Divider,
// } from "@mui/material";
// import {
//   LocationCity as LocationCityIcon,
//   Search as SearchIcon,
//   ArrowForwardIos as ArrowIcon,
//   ErrorOutline as ErrorIcon,
//   Storefront as StorefrontIcon,
//   Close as CloseIcon,
// } from "@mui/icons-material";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import theme from "../theme";
// import APP_CONFIG from "../config/constants";

// export const branchFlag = { value: false };

// // Inject critical CSS once, before first paint, to prevent layout flash
// const injectGlobalStyles = () => {
//   if (document.getElementById("branch-selection-global")) return;
//   const style = document.createElement("style");
//   style.id = "branch-selection-global";
//   style.textContent = `
//     html, body, #root {
//       width: 100% !important;
//       max-width: 100% !important;
//       min-height: 100vh !important;
//       margin: 0 !important;
//       padding: 0 !important;
//       overflow-x: hidden !important;
//     }
//   `;
//   document.head.insertBefore(style, document.head.firstChild);
// };

// // Call immediately at module load — before any render
// injectGlobalStyles();

// const BranchSelection = () => {
//   const navigate = useNavigate();

//   const [branches, setBranches] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selecting, setSelecting] = useState(null);

//   useEffect(() => {
//     fetchBranches();
//   }, []);

//   const fetchBranches = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await axios.get(
//         `${process.env.REACT_APP_API_BASE_URL}/api/core/getbranch/${APP_CONFIG.STORE_ID}`,
//       );
//       if (Array.isArray(res.data)) {
//         setBranches(res.data);
//       } else {
//         setError("Unexpected response from server.");
//       }
//     } catch (err) {
//       console.error("Failed to fetch branches", err);
//       setError(
//         "Unable to load branches. Please check your connection and try again.",
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSelectBranch = async (branch) => {
//     if (selecting) return;
//     setSelecting(branch.Id);
//     try {
//       await APP_CONFIG.setBranch(branch.branch_code);
//       branchFlag.value = true;
//       navigate("/login", { replace: true });
//     } catch {
//       setSelecting(null);
//     }
//   };

//   const filteredBranches = branches.filter(
//     (b) =>
//       b.branch_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       b.branch_city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       b.branch_code?.toLowerCase().includes(searchQuery.toLowerCase()),
//   );

//   // Shared root wrapper — always full width, no flash
//   const RootBox = ({ children, centerContent = false }) => (
//     <Box
//       sx={{
//         // Lock dimensions immediately — no waiting for layout
//         width: "100vw",
//         minHeight: "100vh",
//         maxWidth: "100%",
//         margin: 0,
//         padding: 0,
//         overflowX: "hidden",
//         display: "flex",
//         flexDirection: "column",
//         ...(centerContent && {
//           alignItems: "center",
//           justifyContent: "center",
//         }),
//         background: theme.theme2?.digi_card_bg || theme.palette.primary.main,
//       }}
//     >
//       {children}
//     </Box>
//   );

//   // ── Loading ──────────────────────────────────────────────
//   if (loading) {
//     return (
//       <RootBox centerContent>
//         <CircularProgress
//           size={36}
//           thickness={4}
//           sx={{ color: "rgba(255,255,255,0.9)", mb: 2 }}
//         />
//         <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
//           Loading branches…
//         </Typography>
//       </RootBox>
//     );
//   }

//   // ── Error ─────────────────────────────────────────────────
//   if (error) {
//     return (
//       <RootBox centerContent>
//         <Box
//           sx={{
//             width: 72,
//             height: 72,
//             borderRadius: "50%",
//             backgroundColor: "rgba(255,255,255,0.12)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             mb: 3,
//           }}
//         >
//           <ErrorIcon sx={{ color: "rgba(255,255,255,0.9)", fontSize: 36 }} />
//         </Box>
//         <Typography
//           variant="h6"
//           fontWeight={700}
//           textAlign="center"
//           color="#fff"
//           mb={1}
//         >
//           Couldn't load branches
//         </Typography>
//         <Typography
//           variant="body2"
//           textAlign="center"
//           mb={4}
//           sx={{ color: "rgba(255,255,255,0.65)", maxWidth: 260, px: 3 }}
//         >
//           {error}
//         </Typography>
//         <Button
//           variant="contained"
//           onClick={fetchBranches}
//           sx={{
//             borderRadius: 3,
//             textTransform: "none",
//             fontWeight: 700,
//             px: 5,
//             py: 1.5,
//             fontSize: 15,
//             backgroundColor: "#fff",
//             color: theme.palette.primary.main,
//             "&:hover": { backgroundColor: "rgba(255,255,255,0.9)" },
//           }}
//         >
//           Try Again
//         </Button>
//       </RootBox>
//     );
//   }

//   // ── Main ──────────────────────────────────────────────────
//   return (
//     <RootBox>
//       {/* ── Hero Header ── */}
//       <Box
//         sx={{
//           // No width/flex tricks — just natural block flow inside 100vw root
//           background: "transparent", // inherits gradient from RootBox
//           pt: 7,
//           pb: 5,
//           px: 3,
//           position: "relative",
//           overflow: "hidden",
//           flexShrink: 0,
//         }}
//       >
//         {/* Decorative circles */}
//         <Box
//           sx={{
//             position: "absolute",
//             width: 200,
//             height: 200,
//             borderRadius: "50%",
//             backgroundColor: "rgba(255,255,255,0.06)",
//             top: -50,
//             right: -50,
//             pointerEvents: "none",
//           }}
//         />
//         <Box
//           sx={{
//             position: "absolute",
//             width: 130,
//             height: 130,
//             borderRadius: "50%",
//             backgroundColor: "rgba(255,255,255,0.04)",
//             bottom: 10,
//             left: -30,
//             pointerEvents: "none",
//           }}
//         />

//         {/* Icon */}
//         <Box
//           sx={{
//             width: 56,
//             height: 56,
//             borderRadius: 3,
//             backgroundColor: "rgba(255,255,255,0.15)",
//             border: "1px solid rgba(255,255,255,0.2)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             mb: 3,
//           }}
//         >
//           <StorefrontIcon sx={{ color: "#fff", fontSize: 28 }} />
//         </Box>

//         <Typography
//           variant="h4"
//           fontWeight={800}
//           color="#fff"
//           letterSpacing={-0.5}
//           lineHeight={1.2}
//           mb={1}
//         >
//           Select Your Branch
//         </Typography>
//         <Typography
//           variant="body2"
//           sx={{ color: "rgba(255,255,255,0.65)", mb: 3 }}
//         >
//           Choose where you'd like to log in
//         </Typography>

//         <Box
//           sx={{
//             display: "inline-flex",
//             px: 2,
//             py: 0.8,
//             borderRadius: 2,
//             backgroundColor: "rgba(255,255,255,0.12)",
//             border: "1px solid rgba(255,255,255,0.18)",
//           }}
//         >
//           <Typography variant="caption" fontWeight={700} color="#fff">
//             {branches.length} {branches.length === 1 ? "Branch" : "Branches"}
//           </Typography>
//         </Box>
//       </Box>

//       {/* ── Bottom sheet ── */}
//       <Box
//         flex={1}
//         sx={{
//           backgroundColor: theme.palette.background.default,
//           borderTopLeftRadius: 24,
//           borderTopRightRadius: 24,
//           // Pull up slightly over the hero
//           mt: -3,
//           pt: 2.5,
//           px: 2.5,
//           pb: 5,
//           position: "relative",
//           zIndex: 1,
//           // Ensure it also fills full width
//           width: "100%",
//           boxSizing: "border-box",
//         }}
//       >
//         {/* Drag handle */}
//         <Box
//           sx={{
//             width: 36,
//             height: 4,
//             borderRadius: 2,
//             backgroundColor: theme.palette.divider,
//             mx: "auto",
//             mb: 3,
//           }}
//         />

//         {/* Search */}
//         {branches.length > 3 && (
//           <TextField
//             fullWidth
//             placeholder="Search by branch name or city…"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             size="small"
//             sx={{
//               mb: 2.5,
//               "& .MuiOutlinedInput-root": {
//                 borderRadius: 3,
//                 backgroundColor: theme.palette.background.paper,
//                 "& fieldset": {
//                   borderColor:
//                     theme.colors?.bordercolor || theme.palette.divider,
//                 },
//                 "&:hover fieldset": { borderColor: theme.palette.primary.main },
//                 "&.Mui-focused fieldset": {
//                   borderColor: theme.palette.primary.main,
//                 },
//               },
//             }}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <SearchIcon
//                     sx={{ fontSize: 18, color: theme.palette.text.secondary }}
//                   />
//                 </InputAdornment>
//               ),
//               endAdornment: searchQuery ? (
//                 <InputAdornment position="end">
//                   <Box
//                     component="span"
//                     onClick={() => setSearchQuery("")}
//                     sx={{ cursor: "pointer", display: "flex" }}
//                   >
//                     <CloseIcon
//                       sx={{ fontSize: 16, color: theme.palette.text.secondary }}
//                     />
//                   </Box>
//                 </InputAdornment>
//               ) : null,
//             }}
//           />
//         )}

//         {/* Section label */}
//         <Typography
//           variant="caption"
//           fontWeight={700}
//           letterSpacing={0.8}
//           sx={{
//             color: theme.palette.text.secondary,
//             textTransform: "uppercase",
//             display: "block",
//             mb: 1.5,
//             pl: 0.5,
//           }}
//         >
//           {searchQuery
//             ? `${filteredBranches.length} result${
//                 filteredBranches.length !== 1 ? "s" : ""
//               }`
//             : "Available Branches"}
//         </Typography>

//         {/* Empty state */}
//         {filteredBranches.length === 0 ? (
//           <Box
//             textAlign="center"
//             py={7}
//             sx={{
//               borderRadius: 4,
//               border: `1.5px dashed ${
//                 theme.colors?.bordercolor || theme.palette.divider
//               }`,
//               backgroundColor: theme.palette.background.paper,
//             }}
//           >
//             <SearchIcon
//               sx={{ fontSize: 40, color: theme.palette.text.disabled, mb: 1.5 }}
//             />
//             <Typography
//               variant="body2"
//               fontWeight={600}
//               color="text.secondary"
//               gutterBottom
//             >
//               No branches found
//             </Typography>
//             <Typography variant="caption" color="text.disabled">
//               Try a different name or city
//             </Typography>
//           </Box>
//         ) : (
//           <Box
//             sx={{
//               borderRadius: 4,
//               overflow: "hidden",
//               border: `1px solid ${
//                 theme.colors?.bordercolor || theme.palette.divider
//               }`,
//               backgroundColor: theme.palette.background.paper,
//             }}
//           >
//             {filteredBranches.map((branch, idx) => {
//               const isSelecting = selecting === branch.Id;
//               const isDisabled = selecting !== null && !isSelecting;
//               const accentColor =
//                 idx % 2 === 0
//                   ? theme.palette.primary.main
//                   : theme.palette.secondary.main;

//               return (
//                 <React.Fragment key={branch.Id}>
//                   <Box
//                     onClick={() => !selecting && handleSelectBranch(branch)}
//                     sx={{
//                       px: 2.5,
//                       py: 2.2,
//                       display: "flex",
//                       alignItems: "center",
//                       gap: 2,
//                       cursor: isDisabled ? "default" : "pointer",
//                       opacity: isDisabled ? 0.4 : 1,
//                       transition: "background 0.15s, opacity 0.2s",
//                       "&:hover": !selecting
//                         ? {
//                             backgroundColor:
//                               theme.customColors?.menuHover ||
//                               `${theme.palette.primary.main}08`,
//                           }
//                         : {},
//                       "&:active": !selecting
//                         ? {
//                             backgroundColor: `${theme.palette.primary.main}12`,
//                           }
//                         : {},
//                     }}
//                   >
//                     {/* Left accent bar */}
//                     <Box
//                       sx={{
//                         width: 4,
//                         height: 44,
//                         borderRadius: 2,
//                         flexShrink: 0,
//                         backgroundColor: isSelecting
//                           ? accentColor
//                           : `${accentColor}30`,
//                         transition: "background 0.2s",
//                       }}
//                     />

//                     {/* Avatar */}
//                     <Box
//                       sx={{
//                         width: 48,
//                         height: 48,
//                         borderRadius: 2.5,
//                         flexShrink: 0,
//                         background: `linear-gradient(135deg, ${accentColor}22 0%, ${accentColor}10 100%)`,
//                         border: `1.5px solid ${accentColor}25`,
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                       }}
//                     >
//                       <Typography
//                         fontWeight={900}
//                         sx={{
//                           fontSize: 14,
//                           letterSpacing: 0.5,
//                           color: accentColor,
//                         }}
//                       >
//                         {branch.branch_code?.slice(0, 2).toUpperCase()}
//                       </Typography>
//                     </Box>

//                     {/* Name + city */}
//                     <Box flex={1} minWidth={0}>
//                       <Typography
//                         variant="body1"
//                         fontWeight={700}
//                         noWrap
//                         sx={{
//                           color:
//                             theme.colors?.primaryHeading ||
//                             theme.palette.primary.main,
//                           lineHeight: 1.3,
//                         }}
//                       >
//                         {branch.branch_name}
//                       </Typography>
//                       <Stack
//                         direction="row"
//                         spacing={0.5}
//                         alignItems="center"
//                         mt={0.4}
//                       >
//                         <LocationCityIcon
//                           sx={{
//                             fontSize: 13,
//                             color: theme.palette.text.secondary,
//                             flexShrink: 0,
//                           }}
//                         />
//                         <Typography
//                           variant="caption"
//                           noWrap
//                           sx={{
//                             color: theme.palette.text.secondary,
//                             fontWeight: 500,
//                           }}
//                         >
//                           {branch.branch_city || "—"}
//                         </Typography>
//                       </Stack>
//                     </Box>

//                     {/* Chevron / spinner */}
//                     {isSelecting ? (
//                       <CircularProgress
//                         size={20}
//                         thickness={5}
//                         sx={{ color: accentColor, flexShrink: 0 }}
//                       />
//                     ) : (
//                       <Box
//                         sx={{
//                           width: 32,
//                           height: 32,
//                           borderRadius: "50%",
//                           backgroundColor: `${accentColor}12`,
//                           display: "flex",
//                           alignItems: "center",
//                           justifyContent: "center",
//                           flexShrink: 0,
//                         }}
//                       >
//                         <ArrowIcon sx={{ fontSize: 11, color: accentColor }} />
//                       </Box>
//                     )}
//                   </Box>

//                   {idx < filteredBranches.length - 1 && (
//                     <Divider
//                       sx={{
//                         ml: 11,
//                         mr: 2.5,
//                         borderColor: theme.palette.divider,
//                       }}
//                     />
//                   )}
//                 </React.Fragment>
//               );
//             })}
//           </Box>
//         )}
//       </Box>
//     </RootBox>
//   );
// };

// export default BranchSelection;

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Stack,
  InputAdornment,
  TextField,
  Divider,
} from "@mui/material";
import {
  LocationCity as LocationCityIcon,
  Search as SearchIcon,
  ArrowForwardIos as ArrowIcon,
  ErrorOutline as ErrorIcon,
  Storefront as StorefrontIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import theme from "../theme";
import APP_CONFIG from "../config/constants";

export const branchFlag = { value: false };

// Inject critical CSS once, before first paint, to prevent layout flash
const injectGlobalStyles = () => {
  if (document.getElementById("branch-selection-global")) return;
  const style = document.createElement("style");
  style.id = "branch-selection-global";
  style.textContent = `
    html, body, #root {
      width: 100% !important;
      max-width: 100% !important;
      min-height: 100vh !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow-x: hidden !important;
    }
  `;
  document.head.insertBefore(style, document.head.firstChild);
};

// Call immediately at module load — before any render
injectGlobalStyles();

const BranchSelection = () => {
  const navigate = useNavigate();

  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selecting, setSelecting] = useState(null);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/core/getbranch/${APP_CONFIG.STORE_ID}`,
      );
      if (Array.isArray(res.data)) {
        setBranches(res.data);
      } else {
        setError("Unexpected response from server.");
      }
    } catch (err) {
      console.error("Failed to fetch branches", err);
      setError(
        "Unable to load branches. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBranch = async (branch) => {
    if (selecting) return;
    setSelecting(branch.Id);
    try {
      await APP_CONFIG.setBranch(branch.branch_code);
      branchFlag.value = true;
      navigate("/login", { replace: true });
    } catch {
      setSelecting(null);
    }
  };

  const filteredBranches = branches.filter(
    (b) =>
      b.branch_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.branch_city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.branch_code?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Shared root wrapper — always full width, no flash
  const RootBox = ({ children, centerContent = false }) => (
    <Box
      sx={{
        // Lock dimensions immediately — no waiting for layout
        width: "100vw",
        minHeight: "100vh",
        maxWidth: "100%",
        margin: 0,
        padding: 0,
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        ...(centerContent && {
          alignItems: "center",
          justifyContent: "center",
        }),
        background: theme.theme2?.digi_card_bg || theme.palette.primary.main,
      }}
    >
      {children}
    </Box>
  );

  // ── Loading ──────────────────────────────────────────────
  if (loading) {
    return (
      <RootBox centerContent>
        <CircularProgress
          size={36}
          thickness={4}
          sx={{ color: "rgba(255,255,255,0.9)", mb: 2 }}
        />
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
          Loading branches…
        </Typography>
      </RootBox>
    );
  }

  // ── Error ─────────────────────────────────────────────────
  if (error) {
    return (
      <RootBox centerContent>
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 3,
          }}
        >
          <ErrorIcon sx={{ color: "rgba(255,255,255,0.9)", fontSize: 36 }} />
        </Box>
        <Typography
          variant="h6"
          fontWeight={700}
          textAlign="center"
          color="#fff"
          mb={1}
        >
          Couldn't load branches
        </Typography>
        <Typography
          variant="body2"
          textAlign="center"
          mb={4}
          sx={{ color: "rgba(255,255,255,0.65)", maxWidth: 260, px: 3 }}
        >
          {error}
        </Typography>
        <Button
          variant="contained"
          onClick={fetchBranches}
          sx={{
            borderRadius: 3,
            textTransform: "none",
            fontWeight: 700,
            px: 5,
            py: 1.5,
            fontSize: 15,
            backgroundColor: "#fff",
            color: theme.palette.primary.main,
            "&:hover": { backgroundColor: "rgba(255,255,255,0.9)" },
          }}
        >
          Try Again
        </Button>
      </RootBox>
    );
  }

  // ── Main ──────────────────────────────────────────────────
  return (
    <RootBox>
      {/* ── Hero Header ── */}
      <Box
        sx={{
          // No width/flex tricks — just natural block flow inside 100vw root
          background: "transparent", // inherits gradient from RootBox
          pt: 7,
          pb: 5,
          px: 3,
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {/* Decorative circles */}
        <Box
          sx={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.06)",
            top: -50,
            right: -50,
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: 130,
            height: 130,
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.04)",
            bottom: 10,
            left: -30,
            pointerEvents: "none",
          }}
        />

        {/* Icon */}
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 3,
            backgroundColor: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 3,
          }}
        >
          <StorefrontIcon sx={{ color: "#fff", fontSize: 28 }} />
        </Box>

        <Typography
          variant="h4"
          fontWeight={800}
          color="#fff"
          letterSpacing={-0.5}
          lineHeight={1.2}
          mb={1}
        >
          Select Your Store
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "rgba(255,255,255,0.65)", mb: 3 }}
        >
          Choose where you'd like to log in
        </Typography>

        <Box
          sx={{
            display: "inline-flex",
            px: 2,
            py: 0.8,
            borderRadius: 2,
            backgroundColor: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          <Typography variant="caption" fontWeight={700} color="#fff">
            {branches.length} {branches.length === 1 ? "Branch" : "Branches"}
          </Typography>
        </Box>
      </Box>

      {/* ── Bottom sheet ── */}
      <Box
        flex={1}
        sx={{
          backgroundColor: theme.palette.background.default,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          // Pull up slightly over the hero
          mt: -3,
          pt: 2.5,
          px: 2.5,
          pb: 5,
          position: "relative",
          zIndex: 1,
          // Ensure it also fills full width
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Drag handle */}
        <Box
          sx={{
            width: 36,
            height: 4,
            borderRadius: 2,
            backgroundColor: theme.palette.divider,
            mx: "auto",
            mb: 3,
          }}
        />

        {/* Search */}
        {branches.length > 3 && (
          <TextField
            fullWidth
            placeholder="Search by branch name or city…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            sx={{
              mb: 2.5,
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                backgroundColor: theme.palette.background.paper,
                "& fieldset": {
                  borderColor:
                    theme.colors?.bordercolor || theme.palette.divider,
                },
                "&:hover fieldset": { borderColor: theme.palette.primary.main },
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.primary.main,
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    sx={{ fontSize: 18, color: theme.palette.text.secondary }}
                  />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <Box
                    component="span"
                    onClick={() => setSearchQuery("")}
                    sx={{ cursor: "pointer", display: "flex" }}
                  >
                    <CloseIcon
                      sx={{ fontSize: 16, color: theme.palette.text.secondary }}
                    />
                  </Box>
                </InputAdornment>
              ) : null,
            }}
          />
        )}

        {/* Section label */}
        <Typography
          variant="caption"
          fontWeight={700}
          letterSpacing={0.8}
          sx={{
            color: theme.palette.text.secondary,
            textTransform: "uppercase",
            display: "block",
            mb: 1.5,
            pl: 0.5,
          }}
        >
          {searchQuery
            ? `${filteredBranches.length} result${
                filteredBranches.length !== 1 ? "s" : ""
              }`
            : "Available Branches"}
        </Typography>

        {/* Empty state */}
        {filteredBranches.length === 0 ? (
          <Box
            textAlign="center"
            py={7}
            sx={{
              borderRadius: 4,
              border: `1.5px dashed ${
                theme.colors?.bordercolor || theme.palette.divider
              }`,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <SearchIcon
              sx={{ fontSize: 40, color: theme.palette.text.disabled, mb: 1.5 }}
            />
            <Typography
              variant="body2"
              fontWeight={600}
              color="text.secondary"
              gutterBottom
            >
              No branches found
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Try a different name or city
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              border: `1px solid ${
                theme.colors?.bordercolor || theme.palette.divider
              }`,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            {filteredBranches.map((branch, idx) => {
              const isSelecting = selecting === branch.Id;
              const isDisabled = selecting !== null && !isSelecting;
              const accentColor =
                idx % 2 === 0
                  ? theme.palette.primary.main
                  : theme.palette.secondary.main;

              return (
                <React.Fragment key={branch.Id}>
                  <Box
                    onClick={() => !selecting && handleSelectBranch(branch)}
                    sx={{
                      px: 2.5,
                      py: 2.2,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      cursor: isDisabled ? "default" : "pointer",
                      opacity: isDisabled ? 0.4 : 1,
                      transition: "background 0.15s, opacity 0.2s",
                      "&:hover": !selecting
                        ? {
                            backgroundColor:
                              theme.customColors?.menuHover ||
                              `${theme.palette.primary.main}08`,
                          }
                        : {},
                      "&:active": !selecting
                        ? {
                            backgroundColor: `${theme.palette.primary.main}12`,
                          }
                        : {},
                    }}
                  >
                    {/* Left accent bar */}
                    <Box
                      sx={{
                        width: 4,
                        height: 44,
                        borderRadius: 2,
                        flexShrink: 0,
                        backgroundColor: isSelecting
                          ? accentColor
                          : `${accentColor}30`,
                        transition: "background 0.2s",
                      }}
                    />

                    {/* Avatar */}
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2.5,
                        flexShrink: 0,
                        background: `linear-gradient(135deg, ${accentColor}22 0%, ${accentColor}10 100%)`,
                        border: `1.5px solid ${accentColor}25`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        fontWeight={900}
                        sx={{
                          fontSize: 14,
                          letterSpacing: 0.5,
                          color: accentColor,
                        }}
                      >
                        {branch.branch_code?.slice(0, 2).toUpperCase()}
                      </Typography>
                    </Box>

                    {/* Name + city */}
                    <Box flex={1} minWidth={0}>
                      <Typography
                        variant="body1"
                        fontWeight={700}
                        noWrap
                        sx={{
                          color:
                            theme.colors?.primaryHeading ||
                            theme.palette.primary.main,
                          lineHeight: 1.3,
                        }}
                      >
                        {branch.branch_city || "—"}
                      </Typography>
                      {/* <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        mt={0.4}
                      >
                        <LocationCityIcon
                          sx={{
                            fontSize: 13,
                            color: theme.palette.text.secondary,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          variant="caption"
                          noWrap
                          sx={{
                            color: theme.palette.text.secondary,
                            fontWeight: 500,
                          }}
                        >
                          {branch.branch_city || "—"}
                        </Typography>
                      </Stack> */}
                    </Box>

                    {/* Chevron / spinner */}
                    {isSelecting ? (
                      <CircularProgress
                        size={20}
                        thickness={5}
                        sx={{ color: accentColor, flexShrink: 0 }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          backgroundColor: `${accentColor}12`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <ArrowIcon sx={{ fontSize: 11, color: accentColor }} />
                      </Box>
                    )}
                  </Box>

                  {idx < filteredBranches.length - 1 && (
                    <Divider
                      sx={{
                        ml: 11,
                        mr: 2.5,
                        borderColor: theme.palette.divider,
                      }}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </Box>
        )}
      </Box>
    </RootBox>
  );
};

export default BranchSelection;
