// import {
//   Accordion,
//   AccordionDetails,
//   AccordionSummary,
//   Box,
//   Tab,
//   Tabs,
//   Typography,
//   Skeleton,
// } from "@mui/material";
// import theme from "../../theme";
// import React, { useState, useContext, useEffect } from "react";
// import { useLocation } from "react-router-dom";

// // Icons
// import FavoriteIcon from "@mui/icons-material/Favorite";
// import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
// import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
// import ReplyRoundedIcon from "@mui/icons-material/ReplyRounded";
// import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
// import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
// import MetalDetailsIcon from "../../assets/img/icons/metal_details.svg";
// import GoldCoinIcon from "../../assets/img/icons/gold-price-breakdown.svg";
// import ImageViewerDialog from "../ImageViewerDialog";

// import CircularProgress from "@mui/material/CircularProgress";
// import { AuthContext } from "../../contexts/AuthContext";
// import APP_CONFIG from "../../config/constants";
// import axios from "axios";
// import { EcomContext } from "../../contexts/EcomContext";

// // ── helpers ───────────────────────────────────────────────────────────────────
// const METAL_TYPE_MAP = {
//   1: "Yellow Gold",
//   2: "White Gold",
//   3: "Rose Gold",
//   4: "Silver",
//   5: "Platinum",
// };
// const ITEM_TYPE_MAP = { 1: "Gold", 2: "Diamond", 3: "Silver" };

// const purityLabel = (purity) => {
//   if (!purity) return "—";
//   if (purity === 999) return "24K";
//   if (purity === 958) return "23K";
//   if (purity === 916) return "22K";
//   if (purity === 875) return "21K";
//   if (purity === 750) return "18K";
//   if (purity === 585) return "14K";
//   return `${purity}‰`;
// };

// const fmt = (n) =>
//   Number(n).toLocaleString("en-IN", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   });

// // ── Component ─────────────────────────────────────────────────────────────────
// const ProductViewer = () => {
//   const store_id = APP_CONFIG.STORE_ID;
//   const location = useLocation();
//   const product = location.state;
//   const { adminUser } = useContext(AuthContext);
//   const user_id = adminUser?.user_id;

//   const [details, setDetails] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [currentImage, setCurrentImage] = useState(0);
//   const [openViewer, setOpenViewer] = useState(false);
//   const [tabValue, setTabValue] = useState(0);
//   const [wishlistLoading, setWishlistLoading] = useState(false);
//   const [cartLoading, setCartLoading] = useState(false);

//   const { toggleWishlist, toggleCart, isInWishlist, isInCart } =
//     useContext(EcomContext);

//   const inWishlist = isInWishlist(product.tagno);
//   const inCart = isInCart(product.tagno);

//   // ── fetch full product details ────────────────────────────────────────────
//   useEffect(() => {
//     const fetchDetails = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const baseURL = process.env.REACT_APP_API_BASE_URL;
//         const res = await axios.get(
//           `${baseURL}/api/e-com/stocks/${product.tagno}`,
//           { params: { store_id, user_id, branch_id: APP_CONFIG.BRANCH } },
//         );
//         setDetails(res.data?.data || null);
//         setCurrentImage(0);
//       } catch (err) {
//         console.error("Failed to fetch product details:", err);
//         setError("Failed to load product details.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchDetails();
//   }, [product.tagno]);

//   const handleWishlistToggle = async () => {
//     setWishlistLoading(true);
//     await toggleWishlist(product.tagno);
//     setWishlistLoading(false);
//   };

//   const handleCartToggle = async () => {
//     setCartLoading(true);
//     await toggleCart(product.tagno);
//     setCartLoading(false);
//   };

//   // ── derived values ────────────────────────────────────────────────────────
//   const images = details?.images?.length
//     ? details.images
//     : product.images?.length
//     ? product.images
//     : [];

//   const actualPrice = details?.actual_price ?? 0;
//   const falsePrice = details?.false_price ?? 0;
//   const metalType = METAL_TYPE_MAP[details?.metaltype] ?? "—";
//   const itemType = ITEM_TYPE_MAP[details?.itemtype] ?? "—";
//   const purity = purityLabel(details?.purity);
//   const netwt = details?.netwt ?? "—";
//   const gross = details?.gross ?? "—";
//   const makingCharge = details?.makingcharge ?? "—";
//   const mcpg = details?.mcpg ?? "—";
//   const hasCert = details?.certificate === 1;
//   const certNo = details?.certificateno ?? "—";
//   const huid = details?.huid ?? null;
//   const pcs = details?.pcs ?? 1;
//   const custodyMap = { IN: "In Stock", OUT: "Sold" };
//   const custody = custodyMap[details?.custody] ?? details?.custody ?? "—";

//   // ── Price Breakup calculations (dummy data — replace with API fields) ─────
//   // Replace DUMMY fields with real API data:
//   //   grossWt      → details.gross
//   //   stoneWt      → details.stone_wt   (add to API if missing)
//   //   netWt        → details.netwt
//   //   ratePerGram  → details.rate
//   //   mcPerGram    → details.mcpg
//   //   va           → details.va
//   //   stoneCharge  → details.stone_charge
//   const DUMMY = {
//     grossWt: 3.923,
//     stoneWt: 1.0,
//     netWt: 2.92,
//     ratePerGram: 7900,
//     va: 0,
//     stoneCharge: 500,
//     mcPerGram: 300,
//     gstPct: 3,
//   };

//   const metalValue = DUMMY.netWt * DUMMY.ratePerGram; // 23,068
//   const makingChargeAmt = DUMMY.mcPerGram * DUMMY.netWt; // 876
//   const subtotal = metalValue + makingChargeAmt + DUMMY.va + DUMMY.stoneCharge; // 24,444
//   const gstAmt = (subtotal * DUMMY.gstPct) / 100; // 733.32
//   const grandTotal = subtotal + gstAmt; // 25,177.32

//   // ── loading skeleton ──────────────────────────────────────────────────────
//   if (loading) {
//     return (
//       <Box sx={{ mt: 1.5 }}>
//         <Skeleton
//           variant="rounded"
//           width="100%"
//           height={300}
//           sx={{ mb: 1, borderRadius: 4 }}
//         />
//         <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
//           {[...Array(4)].map((_, i) => (
//             <Skeleton
//               key={i}
//               variant="rounded"
//               width={68}
//               height={68}
//               sx={{ borderRadius: 2 }}
//             />
//           ))}
//         </Box>
//         <Skeleton variant="rounded" width="60%" height={20} sx={{ mb: 1 }} />
//         <Skeleton variant="rounded" width="40%" height={28} sx={{ mb: 2 }} />
//         <Skeleton variant="rounded" width="100%" height={48} sx={{ mb: 1 }} />
//         <Skeleton variant="rounded" width="100%" height={120} />
//       </Box>
//     );
//   }

//   if (error) {
//     return (
//       <Box sx={{ mt: 4, textAlign: "center" }}>
//         <Typography sx={{ color: "#e63946", fontSize: 14 }}>{error}</Typography>
//       </Box>
//     );
//   }

//   return (
//     <>
//       {/* ── Main Image ───────────────────────────────────────────────────── */}
//       <Box
//         sx={{
//           width: "100%",
//           aspectRatio: "4 /3 ",
//           borderRadius: 4,
//           mt: 1.5,
//           mb: 1.5,
//           bgcolor: "#f0f0f0",
//           overflow: "hidden",
//           cursor: images.length ? "pointer" : "default",
//           position: "relative",
//         }}
//         onClick={() => images.length && setOpenViewer(true)}
//       >
//         {images.length > 0 ? (
//           <Box
//             component="img"
//             src={images[currentImage]}
//             alt={`Tag #${product.tagno}`}
//             sx={{
//               width: "100%",
//               height: "100%",
//               objectFit: "contain",
//               display: "block",
//             }}
//           />
//         ) : (
//           <Box
//             sx={{
//               width: "100%",
//               height: "100%",
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//             }}
//           >
//             <Typography sx={{ fontSize: 13, color: "#999" }}>
//               No Image
//             </Typography>
//           </Box>
//         )}
//       </Box>

//       {/* ── Thumbnails ───────────────────────────────────────────────────── */}
//       {images.length > 0 && (
//         <Box
//           sx={{
//             display: "grid",
//             gridTemplateColumns: "repeat(4, 1fr)",
//             gap: 1,
//             width: "100%",
//           }}
//         >
//           {images.slice(0, 4).map((img, index) => (
//             <Box
//               key={index}
//               onClick={() => setCurrentImage(index)}
//               sx={{
//                 width: "100%",
//                 aspectRatio: "1 / 1",
//                 borderRadius: 2,
//                 overflow: "hidden",
//                 cursor: "pointer",
//                 border:
//                   currentImage === index
//                     ? `2px solid ${theme.theme2.primaryButton}`
//                     : "2px solid transparent",
//                 bgcolor: "#f0f0f0",
//               }}
//             >
//               <Box
//                 component="img"
//                 src={img}
//                 alt={`thumb-${index}`}
//                 sx={{
//                   width: "100%",
//                   height: "100%",
//                   objectFit: "cover",
//                   opacity: currentImage === index ? 1 : 0.65,
//                   transition: "opacity 0.2s ease",
//                 }}
//               />
//             </Box>
//           ))}
//         </Box>
//       )}

//       {/* ── Fullscreen dialog ────────────────────────────────────────────── */}
//       <ImageViewerDialog
//         openViewer={openViewer}
//         setOpenViewer={setOpenViewer}
//         product={{ ...product, images }}
//       />

//       {/* ── Price + Action Icons ─────────────────────────────────────────── */}
//       <Box
//         sx={{
//           width: "100%",
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           mb: 1,
//           mt: 0.8,
//         }}
//       >
//         {/* Price */}
//         <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
//           <Typography
//             sx={{
//               fontSize: 22,
//               fontWeight: 500,
//               color: theme.theme2.primaryButton,
//             }}
//           >
//             ₹{actualPrice.toLocaleString("en-IN")}
//           </Typography>

//           {falsePrice > actualPrice && (
//             <Typography
//               sx={{
//                 fontSize: 16,
//                 fontWeight: 500,
//                 color: "#999",
//                 textDecoration: "line-through",
//               }}
//             >
//               ₹{falsePrice.toLocaleString("en-IN")}
//             </Typography>
//           )}

//           {falsePrice > actualPrice && (
//             <Box sx={{ px: 1, py: 0.2, bgcolor: "#c58e8e", borderRadius: 1 }}>
//               <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>
//                 {Math.round(((falsePrice - actualPrice) / falsePrice) * 100)}%
//                 off
//               </Typography>
//             </Box>
//           )}
//         </Box>

//         {/* Wishlist / Share / Cart icons */}
//         <Box sx={{ display: "flex", gap: 0.5 }}>
//           {/* Wishlist */}
//           <Box
//             onClick={handleWishlistToggle}
//             sx={{
//               width: 45,
//               height: 45,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               bgcolor: inWishlist ? "#FFE0E0" : "#FFF2DB",
//               borderRadius: "50%",
//               cursor: "pointer",
//             }}
//           >
//             {wishlistLoading ? (
//               <CircularProgress size={20} sx={{ color: "#8A4500" }} />
//             ) : inWishlist ? (
//               <FavoriteIcon sx={{ fontSize: 24, fill: "#e63946" }} />
//             ) : (
//               <FavoriteBorderRoundedIcon
//                 sx={{ fontSize: 24, fill: "#8A4500" }}
//               />
//             )}
//           </Box>

//           {/* Share */}
//           <Box
//             sx={{
//               width: 45,
//               height: 45,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               bgcolor: "#FFF2DB",
//               borderRadius: "50%",
//             }}
//           >
//             <ReplyRoundedIcon
//               sx={{ fontSize: 24, fill: "#8A4500", transform: "scaleX(-1)" }}
//             />
//           </Box>

//           {/* Cart */}
//           <Box
//             onClick={handleCartToggle}
//             sx={{
//               width: 45,
//               height: 45,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               bgcolor: inCart ? theme.theme2.primaryButton : "#FFF2DB",
//               borderRadius: "50%",
//               cursor: "pointer",
//               transition: "background 0.2s ease",
//             }}
//           >
//             {cartLoading ? (
//               <CircularProgress
//                 size={20}
//                 sx={{ color: inCart ? "#fff" : theme.theme2.primaryButton }}
//               />
//             ) : (
//               <ShoppingCartRoundedIcon
//                 sx={{
//                   fontSize: 24,
//                   fill: inCart ? "#fff" : theme.theme2.primaryButton,
//                 }}
//               />
//             )}
//           </Box>
//         </Box>
//       </Box>

//       {/* ── Tabs ─────────────────────────────────────────────────────────── */}
//       <Box sx={{ mt: 3, mb: 3 }}>
//         <Tabs
//           value={tabValue}
//           onChange={(_, v) => setTabValue(v)}
//           sx={{
//             "& .MuiTabs-indicator": { display: "none" },
//             borderRadius: "50px",
//             border: "0.5px solid #C6C6C6",
//             p: 0.25,
//             minHeight: "40px",
//             mb: 2,
//           }}
//         >
//           {["Product Details", "Price Breakup"].map((label, index) => (
//             <Tab
//               key={index}
//               label={label}
//               sx={{
//                 flex: 1,
//                 minHeight: "40px",
//                 borderRadius: "50px",
//                 textTransform: "none",
//                 fontSize: 14,
//                 color: "#000",
//                 background: "transparent",
//                 transition: "all 0.3s ease",
//                 "&.Mui-selected": {
//                   color: "#FFF",
//                   background: theme.theme2.gradient[0],
//                 },
//               }}
//             />
//           ))}
//         </Tabs>

//         {/* ── Product Details tab ──────────────────────────────────────── */}
//         {tabValue === 0 && (
//           <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
//             {/* Description */}
//             <Accordion
//               defaultExpanded
//               disableGutters
//               sx={{
//                 width: "100%",
//                 bgcolor: "#FFF",
//                 border: "0.6px solid #C6C6C6",
//                 boxShadow: 0,
//               }}
//             >
//               <AccordionSummary expandIcon={<ArrowDropDownRoundedIcon />}>
//                 <Box display="flex" alignItems="center" gap={1}>
//                   <DescriptionRoundedIcon
//                     sx={{ color: theme.theme2.primaryButton }}
//                   />
//                   <Typography fontWeight={500} fontSize={14} color="#000">
//                     Description
//                   </Typography>
//                 </Box>
//               </AccordionSummary>
//               <AccordionDetails>
//                 <Box
//                   sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
//                 >
//                   <Row label="Tag No" value={details?.tagno} />
//                   <Row label="Category" value={details?.category} />
//                   <Row label="Pieces" value={pcs} />
//                   <Row label="Status" value={custody} />
//                 </Box>
//               </AccordionDetails>
//             </Accordion>

//             {/* Metal Details */}
//             <Accordion
//               disableGutters
//               sx={{
//                 width: "100%",
//                 bgcolor: "#FFF",
//                 border: "0.6px solid #C6C6C6",
//                 boxShadow: 0,
//               }}
//             >
//               <AccordionSummary expandIcon={<ArrowDropDownRoundedIcon />}>
//                 <Box display="flex" alignItems="center" gap={1.5}>
//                   <Box
//                     component="img"
//                     src={MetalDetailsIcon}
//                     alt="metal"
//                     sx={{ width: 20, height: 20 }}
//                   />
//                   <Typography fontWeight={500} fontSize={14} color="#000">
//                     Metal Details
//                   </Typography>
//                 </Box>
//               </AccordionSummary>
//               <AccordionDetails>
//                 <Box
//                   sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
//                 >
//                   <Row label="Metal Type" value={metalType} />
//                   <Row label="Purity" value={purity} />
//                   <Row label="Gross Wt" value={gross ? `${gross}g` : "—"} />
//                   <Row label="Net Wt" value={netwt ? `${netwt}g` : "—"} />
//                   {details?.s_size_len && (
//                     <Row label="Size / Length" value={details.s_size_len} />
//                   )}
//                 </Box>
//               </AccordionDetails>
//             </Accordion>

//             {/* Certificate Details */}
//             <Accordion
//               disableGutters
//               sx={{
//                 width: "100%",
//                 bgcolor: "#FFF",
//                 border: "0.6px solid #C6C6C6",
//                 boxShadow: 0,
//               }}
//             >
//               <AccordionSummary expandIcon={<ArrowDropDownRoundedIcon />}>
//                 <Box display="flex" alignItems="center" gap={1}>
//                   <DescriptionRoundedIcon
//                     sx={{ color: theme.theme2.primaryButton }}
//                   />
//                   <Typography fontWeight={500} fontSize={14} color="#282828">
//                     Certificate Details
//                   </Typography>
//                 </Box>
//               </AccordionSummary>
//               <AccordionDetails>
//                 <Box
//                   sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
//                 >
//                   <Row
//                     label="Hallmarked"
//                     value={hasCert ? "Yes — BIS Certified" : "No"}
//                   />
//                   {certNo !== "—" && (
//                     <Row label="Certificate No" value={certNo} />
//                   )}
//                   {huid && <Row label="HUID" value={huid} />}
//                   {details?.huid2 && (
//                     <Row label="HUID 2" value={details.huid2} />
//                   )}
//                 </Box>
//               </AccordionDetails>
//             </Accordion>
//           </Box>
//         )}

//         {/* ── Price Breakup tab ─────────────────────────────────────────── */}
//         {tabValue === 1 && (
//           <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
//             {/* Weight Details */}
//             <Accordion
//               defaultExpanded
//               disableGutters
//               sx={{
//                 width: "100%",
//                 bgcolor: "#FFF",
//                 border: "0.6px solid #C6C6C6",
//                 boxShadow: 0,
//               }}
//             >
//               <AccordionSummary expandIcon={<ArrowDropDownRoundedIcon />}>
//                 <Box display="flex" alignItems="center" gap={1.5}>
//                   <Box
//                     component="img"
//                     src={MetalDetailsIcon}
//                     alt="weight"
//                     sx={{ width: 20, height: 20 }}
//                   />
//                   <Typography fontWeight={500} fontSize={14} color="#000">
//                     Weight Details
//                   </Typography>
//                 </Box>
//               </AccordionSummary>
//               <AccordionDetails>
//                 <Box
//                   sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
//                 >
//                   <Row label="G.wt" value={`${DUMMY.grossWt.toFixed(3)} g`} />
//                   <Row label="Stone" value={`${DUMMY.stoneWt.toFixed(2)} g`} />
//                   <Row label="N.wt" value={`${DUMMY.netWt.toFixed(3)} g`} />
//                 </Box>
//               </AccordionDetails>
//             </Accordion>

//             {/* Metal Price */}
//             <Accordion
//               defaultExpanded
//               disableGutters
//               sx={{
//                 width: "100%",
//                 bgcolor: "#FFF",
//                 border: "0.6px solid #C6C6C6",
//                 boxShadow: 0,
//               }}
//             >
//               <AccordionSummary expandIcon={<ArrowDropDownRoundedIcon />}>
//                 <Box display="flex" alignItems="center" gap={1.5}>
//                   <Box
//                     component="img"
//                     src={GoldCoinIcon}
//                     alt="price"
//                     sx={{ width: 20, height: 20 }}
//                   />
//                   <Typography fontWeight={500} fontSize={14} color="#000">
//                     Price Details
//                   </Typography>
//                 </Box>
//               </AccordionSummary>
//               <AccordionDetails>
//                 <Box
//                   sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
//                 >
//                   {/* Rate */}
//                   <Row label="Rate" value={`₹${fmt(DUMMY.ratePerGram)}`} />

//                   {/* Metal Value with sub-hint: N.wt × Rate */}
//                   <Box
//                     sx={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                       alignItems: "center",
//                     }}
//                   >
//                     <Box>
//                       <Typography sx={{ fontSize: 12, color: "#666" }}>
//                         Metal Value
//                       </Typography>
//                       <Typography sx={{ fontSize: 10, color: "#BBBBBB" }}>
//                         {DUMMY.netWt.toFixed(3)} g × ₹{fmt(DUMMY.ratePerGram)}
//                       </Typography>
//                     </Box>
//                     <Typography
//                       sx={{
//                         fontSize: 12,
//                         fontWeight: 500,
//                         color: theme.theme2.primaryButton,
//                       }}
//                     >
//                       ₹{fmt(metalValue)}
//                     </Typography>
//                   </Box>

//                   {/* VA */}
//                   {/* <Row label="VA" value={`₹${fmt(DUMMY.va)}`} /> */}

//                   {/* Making Charge with sub-hint */}
//                   <Box
//                     sx={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                       alignItems: "center",
//                     }}
//                   >
//                     <Box>
//                       <Typography sx={{ fontSize: 12, color: "#666" }}>
//                         MC
//                       </Typography>
//                       <Typography sx={{ fontSize: 10, color: "#BBBBBB" }}>
//                         ₹{fmt(DUMMY.mcPerGram)} /g × {DUMMY.netWt.toFixed(3)} g
//                       </Typography>
//                     </Box>
//                     <Typography sx={{ fontSize: 12, color: "#282828" }}>
//                       ₹{fmt(makingChargeAmt)}
//                     </Typography>
//                   </Box>

//                   {/* Stone Charge */}
//                   <Row
//                     label="Stone Charge"
//                     value={`₹${fmt(DUMMY.stoneCharge)}`}
//                   />
//                 </Box>
//               </AccordionDetails>
//             </Accordion>

//             {/* GST + Total */}
//             <Accordion
//               defaultExpanded
//               disableGutters
//               sx={{
//                 width: "100%",
//                 bgcolor: "#FFF",
//                 border: "0.6px solid #C6C6C6",
//                 boxShadow: 0,
//                 overflow: "hidden",
//               }}
//             >
//               <AccordionSummary expandIcon={<ArrowDropDownRoundedIcon />}>
//                 <Box display="flex" alignItems="center" gap={1}>
//                   <DescriptionRoundedIcon
//                     sx={{ color: theme.theme2.primaryButton }}
//                   />
//                   <Typography fontWeight={500} fontSize={14} color="#000">
//                     Tax & Total
//                   </Typography>
//                 </Box>
//               </AccordionSummary>
//               <AccordionDetails sx={{ p: 0 }}>
//                 <Box
//                   sx={{
//                     px: 2,
//                     pt: 0.5,
//                     pb: 1,
//                     display: "flex",
//                     flexDirection: "column",
//                     gap: 0.5,
//                   }}
//                 >
//                   {/* Subtotal */}
//                   <Box
//                     sx={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                       alignItems: "center",
//                       pb: 0.75,
//                     }}
//                   >
//                     <Typography sx={{ fontSize: 12, color: "#666" }}>
//                       Subtotal
//                     </Typography>
//                     <Typography sx={{ fontSize: 12, color: "#282828" }}>
//                       ₹{fmt(subtotal)}
//                     </Typography>
//                   </Box>

//                   {/* GST with sub-hint */}
//                   <Box
//                     sx={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                       alignItems: "center",
//                       pb: 1,
//                     }}
//                   >
//                     <Box>
//                       <Typography sx={{ fontSize: 12, color: "#666" }}>
//                         GST ({DUMMY.gstPct}%)
//                       </Typography>
//                       <Typography sx={{ fontSize: 10, color: "#BBBBBB" }}>
//                         ₹{fmt(subtotal)} × {DUMMY.gstPct}%
//                       </Typography>
//                     </Box>
//                     <Typography sx={{ fontSize: 12, color: "#282828" }}>
//                       ₹{fmt(gstAmt)}
//                     </Typography>
//                   </Box>
//                 </Box>

//                 {/* Grand Total band */}
//                 <Box
//                   sx={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "center",
//                     px: 2,
//                     py: 1.75,
//                     background:
//                       theme.theme2.gradient?.[0] ?? theme.theme2.primaryButton,
//                   }}
//                 >
//                   <Typography fontSize={14} fontWeight={500} color="#fff">
//                     TOTAL
//                   </Typography>
//                   <Typography fontSize={18} fontWeight={500} color="#fff">
//                     ₹{fmt(grandTotal)}
//                   </Typography>
//                 </Box>
//               </AccordionDetails>
//             </Accordion>
//           </Box>
//         )}
//       </Box>
//     </>
//   );
// };

// // ── Row helper ────────────────────────────────────────────────────────────────
// const Row = ({ label, value, highlight, strike }) => (
//   <Box
//     sx={{
//       display: "flex",
//       justifyContent: "space-between",
//       alignItems: "center",
//     }}
//   >
//     <Typography sx={{ fontSize: 12, color: "#666" }}>{label}</Typography>
//     <Typography
//       sx={{
//         fontSize: 12,
//         fontWeight: highlight ? 600 : 400,
//         color: highlight
//           ? theme.theme2.primaryButton
//           : strike
//           ? "#999"
//           : "#282828",
//         textDecoration: strike ? "line-through" : "none",
//       }}
//     >
//       {value ?? "—"}
//     </Typography>
//   </Box>
// );

// export default ProductViewer;
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Tab,
  Tabs,
  Typography,
  Skeleton,
} from "@mui/material";
import theme from "../../theme";
import React, { useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";

// Icons
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import ShoppingCartRoundedIcon from "@mui/icons-material/ShoppingCartRounded";
import ReplyRoundedIcon from "@mui/icons-material/ReplyRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import MetalDetailsIcon from "../../assets/img/icons/metal_details.svg";
import GoldCoinIcon from "../../assets/img/icons/gold-price-breakdown.svg";
import ImageViewerDialog from "../ImageViewerDialog";

import CircularProgress from "@mui/material/CircularProgress";
import { AuthContext } from "../../contexts/AuthContext";
import APP_CONFIG from "../../config/constants";
import axios from "axios";
import { EcomContext } from "../../contexts/EcomContext";

// ── DEDUPLICATION CACHE ───────────────────────────────────────────────────────
const fetchedCache = new Map();

// ── helpers ───────────────────────────────────────────────────────────────────
const METAL_TYPE_MAP = {
  1: "Yellow Gold",
  2: "White Gold",
  3: "Rose Gold",
  4: "Silver",
  5: "Platinum",
};
const ITEM_TYPE_MAP = { 1: "Gold", 2: "Diamond", 3: "Silver" };

const purityLabel = (purity) => {
  if (!purity) return "—";
  if (purity === 999) return "24K";
  if (purity === 958) return "23K";
  if (purity === 916) return "22K";
  if (purity === 875) return "21K";
  if (purity === 750) return "18K";
  if (purity === 585) return "14K";
  return `${purity}‰`;
};

const fmt = (n) =>
  Number(n).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// ── Component ─────────────────────────────────────────────────────────────────
const ProductViewer = () => {
  const store_id = APP_CONFIG.STORE_ID;
  const location = useLocation();
  const product = location.state;
  const { adminUser } = useContext(AuthContext);
  const user_id = adminUser?.user_id;

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentImage, setCurrentImage] = useState(0);
  const [openViewer, setOpenViewer] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  const { toggleWishlist, toggleCart, isInWishlist, isInCart } =
    useContext(EcomContext);

  const inWishlist = isInWishlist(product.tagno);
  const inCart = isInCart(product.tagno);

  // ── fetch full product details ────────────────────────────────────────────
  useEffect(() => {
    const tagno = product.tagno;
    const now = Date.now();
    const lastFetch = fetchedCache.get(tagno);
    if (lastFetch && now - lastFetch < 5000) {
      // fetched within the last 5 seconds – skip duplicate
      return;
    }
    fetchedCache.set(tagno, now);

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const baseURL = process.env.REACT_APP_API_BASE_URL;
        const res = await axios.get(`${baseURL}/api/e-com/stocks/${tagno}`, {
          params: { store_id, user_id, branch_id: APP_CONFIG.BRANCH },
        });
        setDetails(res.data?.data || null);
        setCurrentImage(0);
      } catch (err) {
        console.error("Failed to fetch product details:", err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [product.tagno]);

  const handleWishlistToggle = async () => {
    setWishlistLoading(true);
    await toggleWishlist(product.tagno);
    setWishlistLoading(false);
  };

  const handleCartToggle = async () => {
    setCartLoading(true);
    await toggleCart(product.tagno);
    setCartLoading(false);
  };

  // ── derived values ────────────────────────────────────────────────────────
  const images = details?.images?.length
    ? details.images
    : product.images?.length
    ? product.images
    : [];

  const actualPrice = details?.actual_price ?? 0;
  const falsePrice = details?.false_price ?? 0;
  const metalType = METAL_TYPE_MAP[details?.metaltype] ?? "—";
  const itemType = ITEM_TYPE_MAP[details?.itemtype] ?? "—";
  const purity = purityLabel(details?.purity);
  const netwt = details?.netwt ?? "—";
  const gross = details?.gross ?? "—";
  const makingCharge = details?.makingcharge ?? "—";
  const mcpg = details?.mcpg ?? "—";
  const hasCert = details?.certificate === 1;
  const certNo = details?.certificateno ?? "—";
  const huid = details?.huid ?? null;
  const pcs = details?.pcs ?? 1;
  const custodyMap = { IN: "In Stock", OUT: "Sold" };
  const custody = custodyMap[details?.custody] ?? details?.custody ?? "—";

  // ── Price Breakup (computed server-side, from details.price_breakup) ──────
  const bk = details?.price_breakup ?? {};
  const breakup = {
    grossWt: Number(bk.gross_wt ?? details?.gross ?? 0),
    stoneWt: Number(bk.stone_wt ?? 0),
    netWt: Number(bk.net_wt ?? details?.netwt ?? 0),
    effectiveWt: Number(bk.effective_wt ?? bk.net_wt ?? details?.netwt ?? 0),
    rate: Number(bk.rate ?? 0),
    metalValue: Number(bk.metal_value ?? 0),
    makingCharge: Number(bk.making_charge ?? 0),
    makingChargeRate: Number(bk.making_charge_rate ?? 0),
    mcType: bk.mc_type ?? null,
    stoneCharge: Number(bk.stone_value ?? 0),
    subtotal: Number(bk.subtotal ?? 0),
    gstPct: Number(bk.gst_pct ?? 3),
    gstAmt: Number(bk.gst_amount ?? 0),
    grandTotal: Number(bk.total ?? actualPrice ?? 0),
  };

  // Short hint describing how the making charge was derived
  const mcHint = (() => {
    const t = breakup.mcType;
    const r = breakup.makingChargeRate;
    if (!t) return "";
    if (t.includes("%")) return `${r}% of metal`;
    if (t === "MC/GM") return `₹${fmt(r)} /g × ${breakup.netWt.toFixed(3)} g`;
    if (t === "PIECE MC") return `₹${fmt(r)} × ${pcs} pcs`;
    if (t === "PIECE COST") return "Flat per piece";
    return "";
  })();

  const metalValue = breakup.metalValue;
  const makingChargeAmt = breakup.makingCharge;
  const subtotal = breakup.subtotal;
  const gstAmt = breakup.gstAmt;
  const grandTotal = breakup.grandTotal;

  // ── loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ mt: 1.5 }}>
        <Skeleton
          variant="rounded"
          width="100%"
          height={300}
          sx={{ mb: 1, borderRadius: 4 }}
        />
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          {[...Array(4)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rounded"
              width={68}
              height={68}
              sx={{ borderRadius: 2 }}
            />
          ))}
        </Box>
        <Skeleton variant="rounded" width="60%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="rounded" width="40%" height={28} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" width="100%" height={48} sx={{ mb: 1 }} />
        <Skeleton variant="rounded" width="100%" height={120} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography sx={{ color: "#e63946", fontSize: 14 }}>{error}</Typography>
      </Box>
    );
  }

  return (
    <>
      {/* ── Main Image ───────────────────────────────────────────────────── */}
      <Box
        sx={{
          width: "100%",
          aspectRatio: "4 /3 ",
          borderRadius: 4,
          mt: 1.5,
          mb: 1.5,
          bgcolor: "#f0f0f0",
          overflow: "hidden",
          cursor: images.length ? "pointer" : "default",
          position: "relative",
        }}
        onClick={() => images.length && setOpenViewer(true)}
      >
        {images.length > 0 ? (
          <Box
            component="img"
            src={images[currentImage]}
            alt={`Tag #${product.tagno}`}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              display: "block",
            }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ fontSize: 13, color: "#999" }}>
              No Image
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Thumbnails ───────────────────────────────────────────────────── */}
      {images.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 1,
            width: "100%",
          }}
        >
          {images.slice(0, 4).map((img, index) => (
            <Box
              key={index}
              onClick={() => setCurrentImage(index)}
              sx={{
                width: "100%",
                aspectRatio: "1 / 1",
                borderRadius: 2,
                overflow: "hidden",
                cursor: "pointer",
                border:
                  currentImage === index
                    ? `2px solid ${theme.theme2.primaryButton}`
                    : "2px solid transparent",
                bgcolor: "#f0f0f0",
              }}
            >
              <Box
                component="img"
                src={img}
                alt={`thumb-${index}`}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: currentImage === index ? 1 : 0.65,
                  transition: "opacity 0.2s ease",
                }}
              />
            </Box>
          ))}
        </Box>
      )}

      {/* ── Fullscreen dialog ────────────────────────────────────────────── */}
      <ImageViewerDialog
        openViewer={openViewer}
        setOpenViewer={setOpenViewer}
        product={{ ...product, images }}
      />

      {/* ── Price + Action Icons ─────────────────────────────────────────── */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1,
          mt: 0.8,
        }}
      >
        {/* Price */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography
            sx={{
              fontSize: 22,
              fontWeight: 500,
              color: theme.theme2.primaryButton,
            }}
          >
            ₹{actualPrice.toLocaleString("en-IN")}
          </Typography>

          {falsePrice > actualPrice && (
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 500,
                color: "#999",
                textDecoration: "line-through",
              }}
            >
              ₹{falsePrice.toLocaleString("en-IN")}
            </Typography>
          )}

          {falsePrice > actualPrice && (
            <Box sx={{ px: 1, py: 0.2, bgcolor: "#c58e8e", borderRadius: 1 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>
                {Math.round(((falsePrice - actualPrice) / falsePrice) * 100)}%
                off
              </Typography>
            </Box>
          )}
        </Box>

        {/* Wishlist / Share / Cart icons */}
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {/* Wishlist */}
          <Box
            onClick={handleWishlistToggle}
            sx={{
              width: 45,
              height: 45,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: inWishlist ? "#FFE0E0" : "#FFF2DB",
              borderRadius: "50%",
              cursor: "pointer",
            }}
          >
            {wishlistLoading ? (
              <CircularProgress size={20} sx={{ color: "#8A4500" }} />
            ) : inWishlist ? (
              <FavoriteIcon sx={{ fontSize: 24, fill: "#e63946" }} />
            ) : (
              <FavoriteBorderRoundedIcon
                sx={{ fontSize: 24, fill: "#8A4500" }}
              />
            )}
          </Box>

          {/* Share */}
          <Box
            sx={{
              width: 45,
              height: 45,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#FFF2DB",
              borderRadius: "50%",
            }}
          >
            <ReplyRoundedIcon
              sx={{ fontSize: 24, fill: "#8A4500", transform: "scaleX(-1)" }}
            />
          </Box>

          {/* Cart */}
          <Box
            onClick={handleCartToggle}
            sx={{
              width: 45,
              height: 45,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: inCart ? theme.theme2.primaryButton : "#FFF2DB",
              borderRadius: "50%",
              cursor: "pointer",
              transition: "background 0.2s ease",
            }}
          >
            {cartLoading ? (
              <CircularProgress
                size={20}
                sx={{ color: inCart ? "#fff" : theme.theme2.primaryButton }}
              />
            ) : (
              <ShoppingCartRoundedIcon
                sx={{
                  fontSize: 24,
                  fill: inCart ? "#fff" : theme.theme2.primaryButton,
                }}
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <Box sx={{ mt: 3, mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          sx={{
            "& .MuiTabs-indicator": { display: "none" },
            borderRadius: "50px",
            border: "0.5px solid #C6C6C6",
            p: 0.25,
            minHeight: "40px",
            mb: 2,
          }}
        >
          {["Product Details", "Price Breakup"].map((label, index) => (
            <Tab
              key={index}
              label={label}
              sx={{
                flex: 1,
                minHeight: "40px",
                borderRadius: "50px",
                textTransform: "none",
                fontSize: 14,
                color: "#000",
                background: "transparent",
                transition: "all 0.3s ease",
                "&.Mui-selected": {
                  color: "#FFF",
                  background: theme.theme2.gradient[0],
                },
              }}
            />
          ))}
        </Tabs>

        {/* ── Product Details tab ──────────────────────────────────────── */}
        {tabValue === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            {/* Description */}
            <Accordion
              defaultExpanded
              disableGutters
              sx={{
                width: "100%",
                bgcolor: "#FFF",
                border: "0.6px solid #C6C6C6",
                boxShadow: 0,
              }}
            >
              <AccordionSummary expandIcon={<ArrowDropDownRoundedIcon />}>
                <Box display="flex" alignItems="center" gap={1}>
                  <DescriptionRoundedIcon
                    sx={{ color: theme.theme2.primaryButton }}
                  />
                  <Typography fontWeight={500} fontSize={14} color="#000">
                    Description
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  <Row label="Tag No" value={details?.tagno} />
                  <Row label="Category" value={details?.category} />
                  <Row label="Pieces" value={pcs} />
                  <Row label="Status" value={custody} />
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Metal Details */}
            <Accordion
              disableGutters
              sx={{
                width: "100%",
                bgcolor: "#FFF",
                border: "0.6px solid #C6C6C6",
                boxShadow: 0,
              }}
            >
              <AccordionSummary expandIcon={<ArrowDropDownRoundedIcon />}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box
                    component="img"
                    src={MetalDetailsIcon}
                    alt="metal"
                    sx={{ width: 20, height: 20 }}
                  />
                  <Typography fontWeight={500} fontSize={14} color="#000">
                    Metal Details
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  <Row label="Metal Type" value={metalType} />
                  <Row label="Purity" value={purity} />
                  <Row label="Gross Wt" value={gross ? `${gross}g` : "—"} />
                  <Row label="Net Wt" value={netwt ? `${netwt}g` : "—"} />
                  {details?.s_size_len && (
                    <Row label="Size / Length" value={details.s_size_len} />
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Certificate Details */}
            <Accordion
              disableGutters
              sx={{
                width: "100%",
                bgcolor: "#FFF",
                border: "0.6px solid #C6C6C6",
                boxShadow: 0,
              }}
            >
              <AccordionSummary expandIcon={<ArrowDropDownRoundedIcon />}>
                <Box display="flex" alignItems="center" gap={1}>
                  <DescriptionRoundedIcon
                    sx={{ color: theme.theme2.primaryButton }}
                  />
                  <Typography fontWeight={500} fontSize={14} color="#282828">
                    Certificate Details
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  <Row
                    label="Hallmarked"
                    value={hasCert ? "Yes — BIS Certified" : "No"}
                  />
                  {certNo !== "—" && (
                    <Row label="Certificate No" value={certNo} />
                  )}
                  {huid && <Row label="HUID" value={huid} />}
                  {details?.huid2 && (
                    <Row label="HUID 2" value={details.huid2} />
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}

        {/* ── Price Breakup tab ─────────────────────────────────────────── */}
        {tabValue === 1 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            {/* Weight Details */}
            <Accordion
              defaultExpanded
              disableGutters
              sx={{
                width: "100%",
                bgcolor: "#FFF",
                border: "0.6px solid #C6C6C6",
                boxShadow: 0,
              }}
            >
              <AccordionSummary expandIcon={<ArrowDropDownRoundedIcon />}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box
                    component="img"
                    src={MetalDetailsIcon}
                    alt="weight"
                    sx={{ width: 20, height: 20 }}
                  />
                  <Typography fontWeight={500} fontSize={14} color="#000">
                    Weight Details
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  <Row label="G.wt" value={`${breakup.grossWt.toFixed(3)} g`} />
                  <Row label="Stone" value={`${breakup.stoneWt.toFixed(2)} g`} />
                  <Row label="N.wt" value={`${breakup.netWt.toFixed(3)} g`} />
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Metal Price */}
            <Accordion
              defaultExpanded
              disableGutters
              sx={{
                width: "100%",
                bgcolor: "#FFF",
                border: "0.6px solid #C6C6C6",
                boxShadow: 0,
              }}
            >
              <AccordionSummary expandIcon={<ArrowDropDownRoundedIcon />}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box
                    component="img"
                    src={GoldCoinIcon}
                    alt="price"
                    sx={{ width: 20, height: 20 }}
                  />
                  <Typography fontWeight={500} fontSize={14} color="#000">
                    Price Details
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  <Row label="Rate" value={`₹${fmt(breakup.rate)}`} />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: 12, color: "#666" }}>
                        Metal Value
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: "#BBBBBB" }}>
                        {breakup.effectiveWt.toFixed(3)} g × ₹{fmt(breakup.rate)}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: theme.theme2.primaryButton,
                      }}
                    >
                      ₹{fmt(metalValue)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: 12, color: "#666" }}>
                        MC
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: "#BBBBBB" }}>
                        {mcHint}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: 12, color: "#282828" }}>
                      ₹{fmt(makingChargeAmt)}
                    </Typography>
                  </Box>
                  <Row
                    label="Stone Charge"
                    value={`₹${fmt(breakup.stoneCharge)}`}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* GST + Total */}
            <Accordion
              defaultExpanded
              disableGutters
              sx={{
                width: "100%",
                bgcolor: "#FFF",
                border: "0.6px solid #C6C6C6",
                boxShadow: 0,
                overflow: "hidden",
              }}
            >
              <AccordionSummary expandIcon={<ArrowDropDownRoundedIcon />}>
                <Box display="flex" alignItems="center" gap={1}>
                  <DescriptionRoundedIcon
                    sx={{ color: theme.theme2.primaryButton }}
                  />
                  <Typography fontWeight={500} fontSize={14} color="#000">
                    Tax & Total
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <Box
                  sx={{
                    px: 2,
                    pt: 0.5,
                    pb: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      pb: 0.75,
                    }}
                  >
                    <Typography sx={{ fontSize: 12, color: "#666" }}>
                      Subtotal
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "#282828" }}>
                      ₹{fmt(subtotal)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      pb: 1,
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: 12, color: "#666" }}>
                        GST ({breakup.gstPct}%)
                      </Typography>
                      <Typography sx={{ fontSize: 10, color: "#BBBBBB" }}>
                        ₹{fmt(subtotal)} × {breakup.gstPct}%
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: 12, color: "#282828" }}>
                      ₹{fmt(gstAmt)}
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 2,
                    py: 1.75,
                    background:
                      theme.theme2.gradient?.[0] ?? theme.theme2.primaryButton,
                  }}
                >
                  <Typography fontSize={14} fontWeight={500} color="#fff">
                    TOTAL
                  </Typography>
                  <Typography fontSize={18} fontWeight={500} color="#fff">
                    ₹{fmt(grandTotal)}
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}
      </Box>
    </>
  );
};

// ── Row helper ────────────────────────────────────────────────────────────────
const Row = ({ label, value, highlight, strike }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <Typography sx={{ fontSize: 12, color: "#666" }}>{label}</Typography>
    <Typography
      sx={{
        fontSize: 12,
        fontWeight: highlight ? 600 : 400,
        color: highlight
          ? theme.theme2.primaryButton
          : strike
          ? "#999"
          : "#282828",
        textDecoration: strike ? "line-through" : "none",
      }}
    >
      {value ?? "—"}
    </Typography>
  </Box>
);

export default ProductViewer;
