// // src/components/RateUsPage.jsx
// // Full frontend-only rating page — no backend needed
// // Shows star rating → optional feedback → thank you screen
// // ALL ratings (1-5) trigger InAppReview native popup

// import React, { useState } from "react";
// import { Dialog, Box, Typography, IconButton, Button, TextField } from "@mui/material";
// import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
// import StarRoundedIcon from "@mui/icons-material/StarRounded";
// import StarOutlineRoundedIcon from "@mui/icons-material/StarOutlineRounded";
// import { Capacitor } from "@capacitor/core";
// import { useSafeAreaTop, useSafeAreaBottom } from "../SafeAreaFile";
// import { useNavigate } from "react-router-dom";
// import { InAppReview } from "@capacitor-community/in-app-review";
// import { AppLauncher } from "@capacitor/app-launcher";
// // ── Store URLs (fallback if InAppReview doesn't show) ────────────
// const PLAY_STORE_URL = "market://details?id=com.asterix.nama";
// const PLAY_STORE_WEB_URL = "https://play.google.com/store/apps/details?id=com.lalitha.wincrm";
// const APP_STORE_URL = "itms-apps://itunes.apple.com/asterix/nama"; // ✅ Replace with your Apple App ID
// const APP_STORE_WEB_URL = "https://apps.apple.com/app/idYOURAPPID";   // ✅ Replace with your Apple App ID

// // ── Star labels based on rating ──────────────────────────────────
// const starLabels = {
//   1: { text: "Poor", emoji: "😞", color: "#e53935" },
//   2: { text: "Fair", emoji: "😕", color: "#fb8c00" },
//   3: { text: "Good", emoji: "🙂", color: "#fdd835" },
//   4: { text: "Great", emoji: "😊", color: "#7cb342" },
//   5: { text: "Excellent!", emoji: "🤩", color: "#C9A84C" },
// };

// // ── Thank you messages based on rating ───────────────────────────
// const thankYouMessages = {
//   1: {
//     title: "We're Sorry 😔",
//     subtitle: "Thank you for your honest feedback. We'll work hard to improve your experience.",
//     note: "Your feedback has been noted and shared with our team.",
//   },
//   2: {
//     title: "Thanks for Telling Us 🙏",
//     subtitle: "We appreciate your feedback. We'll use it to make the app better for you.",
//     note: "Your feedback has been noted and shared with our team.",
//   },
//   3: {
//     title: "Thank You! 😊",
//     subtitle: "We're glad you're having a decent experience. We'll keep working to make it even better.",
//     note: "Your feedback has been noted and shared with our team.",
//   },
//   4: {
//     title: "Wonderful! 😃",
//     subtitle: "So happy to hear you're enjoying the app! We'll keep making it better.",
//     note: "Your feedback has been shared with our team. We truly appreciate it!",
//   },
//   5: {
//     title: "You Made Our Day! 🤩",
//     subtitle: "Thank you so much for your amazing rating! We're thrilled you love the app.",
//     note: "Your rating has been shared with the Nama Srinivasa Jewellers team. We're so grateful! 💛",
//   },
// };

// function RateUsPage({ open = true, onClose }) {
//   const navigate = useNavigate();
//   const handleClose = () => {
//     if (onClose) onClose();
//     else navigate(-1);
//   };

//   const topInset = useSafeAreaTop();
//   const bottomInset = useSafeAreaBottom();
//   const isIOS = Capacitor.getPlatform() === "ios";

//   const [rating, setRating] = useState(0);
//   const [hovered, setHovered] = useState(0);
//   const [feedback, setFeedback] = useState("");
//   const [submitted, setSubmitted] = useState(false);
//   const [animating, setAnimating] = useState(false);
//   const [reviewTriggered, setReviewTriggered] = useState(false);

//   const activeRating = rating;
//   const label = starLabels[activeRating];

//   // ── Opens Play Store / App Store as fallback ──────────────────
//   const handleOpenStore = async () => {
//   const platform = Capacitor.getPlatform();
//   try {
//     const url = platform === "ios" ? APP_STORE_URL : PLAY_STORE_URL;
//     await AppLauncher.openUrl({ url }); // ✅ now uses top-level import directly
//   } catch {
//     const webUrl = platform === "ios" ? APP_STORE_WEB_URL : PLAY_STORE_WEB_URL;
//     window.open(webUrl, "_blank");
//   }
// };

//   // ── Submit — triggers InAppReview for ALL ratings (1 to 5) ────
//   const handleSubmit = async () => {
//     if (rating === 0) return;

//     setAnimating(true);

//     // try {
//     //   await InAppReview.requestReview();
//     //   // Note: Google/Apple silently decides whether to show popup or not
//     //   // No way to confirm if it actually showed — this is by design
//     //   setReviewTriggered(true);
//     // } catch (err) {
//     //   // InAppReview plugin failed — fallback button shown in thank you screen
//     //   console.warn("InAppReview failed:", err);
//     //   setReviewTriggered(false);
//     // }
//     try {
//   alert("Step 1: Calling InAppReview.requestReview()...");
  
//   const response = await InAppReview.requestReview();
  
//   alert("Step 2: InAppReview completed! Response: " + JSON.stringify(response));
  
//   setReviewTriggered(true);
  
//   alert("Step 3: reviewTriggered set to TRUE ✅");

// } catch (err) {
//   alert("❌ InAppReview FAILED! Error: " + JSON.stringify(err));
  
//   console.warn("InAppReview failed:", err);
//   setReviewTriggered(false);
  
//   alert("Step: reviewTriggered set to FALSE ❌");
// }

//     setTimeout(() => {
//       setSubmitted(true);
//       setAnimating(false);
//     }, 300);
//   };

//   return (
//     <Dialog
//       fullScreen
//       open={open}
//       onClose={handleClose}
//       sx={{
//         zIndex: 10000,
//         paddingTop: topInset,
//         "& .MuiDialog-paper": {
//           zIndex: 10000,
//           backgroundColor: "#faf8f4",
//           display: "flex",
//           flexDirection: "column",
//           overflow: "hidden",
//         },
//       }}
//     >
//       {/* ── Header ── */}
//       <Box
//         sx={{
//           flexShrink: 0,
//           pt: isIOS ? `calc(${topInset} + 10px)` : "10px",
//           pb: "10px",
//           px: 1,
//           backgroundColor: "#1a1a1a",
//           display: "flex",
//           alignItems: "center",
//           position: "relative",
//           minHeight: 52,
//         }}
//       >
//         <IconButton onClick={handleClose} size="small" sx={{ color: "#fff" }}>
//           <ArrowBackIosNewIcon fontSize="small" />
//         </IconButton>
//         <Typography
//           sx={{
//             fontWeight: 700,
//             fontSize: "1rem",
//             color: "#fff",
//             letterSpacing: "0.03em",
//             position: "absolute",
//             left: "50%",
//             transform: "translateX(-50%)",
//           }}
//         >
//           Rate Us
//         </Typography>
//         <Box sx={{ width: 34 }} />
//       </Box>

//       {/* ── Content ── */}
//       <Box
//         sx={{
//           flex: 1,
//           overflowY: "auto",
//           display: "flex",
//           flexDirection: "column",
//           alignItems: "center",
//           px: 3,
//           pb: isIOS ? `calc(${bottomInset} + 24px)` : "24px",
//           opacity: animating ? 0 : 1,
//           transition: "opacity 0.3s ease",
//         }}
//       >
//         {!submitted ? (
//           /* ── Rating Screen ── */
//           <>
//             {/* Top Icon */}
//             <Box
//               sx={{
//                 mt: 5,
//                 mb: 2,
//                 width: 90,
//                 height: 90,
//                 borderRadius: "50%",
//                 background: "linear-gradient(135deg, #1a1a1a, #2d2410)",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 boxShadow: "0 8px 32px rgba(201,168,76,0.25)",
//               }}
//             >
//               <Typography sx={{ fontSize: "2.8rem", lineHeight: 1 }}>💎</Typography>
//             </Box>

//             <Typography
//               sx={{
//                 fontSize: "1.4rem",
//                 fontWeight: 800,
//                 color: "#1a1a1a",
//                 textAlign: "center",
//                 mb: 0.5,
//               }}
//             >
//               Enjoying the App?
//             </Typography>
//             <Typography
//               sx={{
//                 fontSize: "0.85rem",
//                 color: "#777",
//                 textAlign: "center",
//                 mb: 4,
//                 lineHeight: 1.5,
//                 px: 2,
//               }}
//             >
//               Your feedback helps us serve you better. Tell us how we're doing!
//             </Typography>

//             {/* ── Stars ── */}
//             <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
//               {[1, 2, 3, 4, 5].map((star) => (
//                 <IconButton
//                   key={star}
//                   onClick={() => setRating(star)}
//                   onMouseEnter={() => setHovered(star)}
//                   onMouseLeave={() => setHovered(0)}
//                   sx={{
//                     p: 0.5,
//                     transform: activeRating >= star ? "scale(1.15)" : "scale(1)",
//                     transition: "transform 0.15s ease",
//                   }}
//                 >
//                   {activeRating >= star ? (
//                     <StarRoundedIcon
//                       sx={{
//                         fontSize: "2.8rem",
//                         color: label?.color || "#C9A84C",
//                         filter: "drop-shadow(0 2px 6px rgba(201,168,76,0.4))",
//                         transition: "color 0.2s ease",
//                       }}
//                     />
//                   ) : (
//                     <StarOutlineRoundedIcon
//                       sx={{
//                         fontSize: "2.8rem",
//                         color: "#ddd",
//                         transition: "color 0.2s ease",
//                       }}
//                     />
//                   )}
//                 </IconButton>
//               ))}
//             </Box>

//             {/* ── Star Label ── */}
//             <Box sx={{ height: 32, mb: 3, display: "flex", alignItems: "center" }}>
//               {activeRating > 0 && (
//                 <Typography
//                   sx={{
//                     fontSize: "1rem",
//                     fontWeight: 700,
//                     color: label?.color,
//                     letterSpacing: "0.02em",
//                   }}
//                 >
//                   {label?.emoji} {label?.text}
//                 </Typography>
//               )}
//             </Box>

//             {/* ── Feedback Box ── */}
//             {activeRating > 0 && (
//               <Box sx={{ width: "100%", mb: 3 }}>
//                 <Typography
//                   sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#333", mb: 1 }}
//                 >
//                   {activeRating <= 3
//                     ? "What can we improve? (optional)"
//                     : "What do you love most? (optional)"}
//                 </Typography>
//                 <TextField
//                   multiline
//                   rows={4}
//                   fullWidth
//                   placeholder={
//                     activeRating <= 3
//                       ? "Tell us what we can do better..."
//                       : "Share what you enjoy about the app..."
//                   }
//                   value={feedback}
//                   onChange={(e) => setFeedback(e.target.value)}
//                   sx={{
//                     "& .MuiOutlinedInput-root": {
//                       borderRadius: "12px",
//                       backgroundColor: "#fff",
//                       fontSize: "0.85rem",
//                       "& fieldset": { borderColor: "#e8e4dc" },
//                       "&:hover fieldset": { borderColor: "#C9A84C" },
//                       "&.Mui-focused fieldset": { borderColor: "#C9A84C" },
//                     },
//                   }}
//                 />
//               </Box>
//             )}

//             {/* ── Submit Button ── */}
//             <Button
//               fullWidth
//               onClick={handleSubmit}
//               disabled={activeRating === 0}
//               sx={{
//                 py: 1.6,
//                 borderRadius: "14px",
//                 background:
//                   activeRating > 0
//                     ? "linear-gradient(135deg, #1a1a1a, #2d2410)"
//                     : "#e0e0e0",
//                 color: activeRating > 0 ? "#C9A84C" : "#aaa",
//                 fontWeight: 800,
//                 fontSize: "0.95rem",
//                 letterSpacing: "0.04em",
//                 textTransform: "none",
//                 boxShadow: activeRating > 0 ? "0 4px 20px rgba(0,0,0,0.2)" : "none",
//                 transition: "all 0.3s ease",
//                 "&:hover": {
//                   background:
//                     activeRating > 0
//                       ? "linear-gradient(135deg, #2d2410, #1a1a1a)"
//                       : "#e0e0e0",
//                 },
//                 "&.Mui-disabled": { background: "#ede8df", color: "#bbb" },
//               }}
//             >
//               {activeRating === 0 ? "Select a Rating" : "Submit Rating"}
//             </Button>

//             <Typography
//               sx={{
//                 mt: 2,
//                 fontSize: "0.72rem",
//                 color: "#aaa",
//                 textAlign: "center",
//                 lineHeight: 1.5,
//               }}
//             >
//               Your feedback goes directly to the{"\n"}Nama Srinivasa Jewellers team
//             </Typography>
//           </>
//         ) : (
//           /* ── Thank You Screen ── */
//           <>
//             <Box
//               sx={{
//                 mt: 6,
//                 mb: 3,
//                 width: 100,
//                 height: 100,
//                 borderRadius: "50%",
//                 background: "linear-gradient(135deg, #1a1a1a, #2d2410)",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 boxShadow: "0 8px 32px rgba(201,168,76,0.3)",
//               }}
//             >
//               <Typography sx={{ fontSize: "3rem", lineHeight: 1 }}>
//                 {starLabels[rating]?.emoji}
//               </Typography>
//             </Box>

//             {/* Stars display */}
//             <Box sx={{ display: "flex", gap: 0.5, mb: 2 }}>
//               {[1, 2, 3, 4, 5].map((star) => (
//                 <StarRoundedIcon
//                   key={star}
//                   sx={{
//                     fontSize: "1.8rem",
//                     color: star <= rating ? starLabels[rating]?.color : "#e0e0e0",
//                   }}
//                 />
//               ))}
//             </Box>

//             <Typography
//               sx={{
//                 fontSize: "1.6rem",
//                 fontWeight: 800,
//                 color: "#1a1a1a",
//                 textAlign: "center",
//                 mb: 1,
//               }}
//             >
//               {thankYouMessages[rating]?.title}
//             </Typography>

//             <Typography
//               sx={{
//                 fontSize: "0.9rem",
//                 color: "#555",
//                 textAlign: "center",
//                 lineHeight: 1.7,
//                 mb: 2,
//                 px: 2,
//               }}
//             >
//               {thankYouMessages[rating]?.subtitle}
//             </Typography>

//             {/* Note box */}
//             <Box
//               sx={{
//                 width: "100%",
//                 backgroundColor: "#fff",
//                 border: "1px solid",
//                 borderColor: starLabels[rating]?.color,
//                 borderRadius: "14px",
//                 p: 2,
//                 mb: 3,
//                 textAlign: "center",
//               }}
//             >
//               <Typography sx={{ fontSize: "0.8rem", color: "#444", lineHeight: 1.6 }}>
//                 ✅ {thankYouMessages[rating]?.note}
//               </Typography>
//             </Box>

//             {/* Info box — shown for ALL ratings */}
//             <Box
//               sx={{
//                 width: "100%",
//                 backgroundColor: "#fffdf7",
//                 border: "1px solid #C9A84C",
//                 borderRadius: "14px",
//                 p: 2,
//                 mb: 3,
//                 textAlign: "center",
//               }}
//             >
//               <Typography sx={{ fontSize: "0.8rem", color: "#7a6020", lineHeight: 1.6 }}>
//                 ⭐ A rating popup may have appeared to submit your rating directly to the{" "}
//                 {isIOS ? "App Store" : "Play Store"}.{"\n"}
//                 If it didn't appear, you can still rate us using the button below.
//               </Typography>
//             </Box>

//             {/* If user left feedback, show it */}
//             {feedback.trim().length > 0 && (
//               <Box
//                 sx={{
//                   width: "100%",
//                   backgroundColor: "#fffdf7",
//                   border: "1px solid #f0ece4",
//                   borderRadius: "14px",
//                   p: 2,
//                   mb: 3,
//                 }}
//               >
//                 <Typography
//                   sx={{ fontSize: "0.72rem", color: "#C9A84C", fontWeight: 700, mb: 0.5 }}
//                 >
//                   YOUR FEEDBACK
//                 </Typography>
//                 <Typography
//                   sx={{
//                     fontSize: "0.82rem",
//                     color: "#555",
//                     lineHeight: 1.6,
//                     fontStyle: "italic",
//                   }}
//                 >
//                   "{feedback}"
//                 </Typography>
//               </Box>
//             )}

//             {/* Fallback "Rate on Store" button — shown for ALL ratings */}
//             <Button
//               fullWidth
//               onClick={handleOpenStore}
//               sx={{
//                 py: 1.6,
//                 borderRadius: "14px",
//                 background: "linear-gradient(135deg, #C9A84C, #e6c96e)",
//                 color: "#1a1a1a",
//                 fontWeight: 800,
//                 fontSize: "0.95rem",
//                 textTransform: "none",
//                 boxShadow: "0 4px 20px rgba(201,168,76,0.3)",
//                 mb: 2,
//                 "&:hover": {
//                   background: "linear-gradient(135deg, #e6c96e, #C9A84C)",
//                 },
//               }}
//             >
//               ⭐ Rate on {isIOS ? "App Store" : "Play Store"}
//             </Button>

//             {/* Done button */}
//             <Button
//               fullWidth
//               onClick={handleClose}
//               sx={{
//                 py: 1.6,
//                 borderRadius: "14px",
//                 background: "linear-gradient(135deg, #1a1a1a, #2d2410)",
//                 color: "#C9A84C",
//                 fontWeight: 800,
//                 fontSize: "0.95rem",
//                 textTransform: "none",
//                 boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
//                 "&:hover": {
//                   background: "linear-gradient(135deg, #2d2410, #1a1a1a)",
//                 },
//               }}
//             >
//               Done
//             </Button>
//           </>
//         )}
//       </Box>
//     </Dialog>
//   );
// }

// export default RateUsPage;