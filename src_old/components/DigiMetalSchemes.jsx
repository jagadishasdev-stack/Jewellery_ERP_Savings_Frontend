import React, { useEffect, useState, useContext, useRef } from "react";
import {
  Box, Typography, Chip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Divider,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import VerifiedOutlinedIcon   from "@mui/icons-material/VerifiedOutlined";
import LockOutlinedIcon       from "@mui/icons-material/LockOutlined";
import TrendingUpIcon         from "@mui/icons-material/TrendingUp";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import WaterDropOutlinedIcon  from "@mui/icons-material/WaterDropOutlined";
import CloseIcon              from "@mui/icons-material/Close";
import { useSafeAreaTop }     from "../SafeAreaFile";
import { Capacitor }          from "@capacitor/core";
import storeLogo              from "../assets/img/logo/logo.png";
import axios                  from "axios";
import APP_CONFIG             from "../config/constants";
import { StoreContext }       from "../contexts/StoreContext";

// ─── 15-min refresh interval ──────────────────────────────────────────────────
const RATE_REFRESH_MS = 10 * 60 * 1000;

const inr = (n) => Number(n).toLocaleString("en-IN");

function getOrientation(w, h) {
  const r = w / h;
  if (r > 1.2) return "horizontal";
  if (r < 0.8) return "vertical";
  return "square";
}

// 22KT (916 purity) → 24KT (999 purity)
function calc24ktRate(rate22kt) {
  if (!rate22kt) return null;
  return Math.round((rate22kt / 916) * 999);
}

// ─── Coin SVGs ────────────────────────────────────────────────────────────────
// function GoldCoinIcon({ size = 32 }) {
//   return (
//     <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
//       <defs>
//         {/* Coin body gradient */}
//         <radialGradient id="coinGrad" cx="35%" cy="35%" r="70%" fx="30%" fy="30%">
//           <stop offset="0%" stopColor="#FFE484" />
//           <stop offset="30%" stopColor="#FBBF24" />
//           <stop offset="70%" stopColor="#F59E0B" />
//           <stop offset="100%" stopColor="#B45309" />
//         </radialGradient>

//         {/* Inner circle gradient (depth) */}
//         <radialGradient id="innerGrad" cx="40%" cy="40%" r="60%">
//           <stop offset="0%" stopColor="#FDE68A" />
//           <stop offset="60%" stopColor="#F59E0B" />
//           <stop offset="100%" stopColor="#D97706" />
//         </radialGradient>

//         {/* Rupee text gradient */}
//         <linearGradient id="rupeeGrad" x1="0" y1="0" x2="0" y2="1">
//           <stop offset="0%" stopColor="#FEF3C7" />
//           <stop offset="100%" stopColor="#78350F" />
//         </linearGradient>

//         {/* Drop shadow for coin */}
//         <filter id="coinShadow" x="-20%" y="-20%" width="140%" height="140%">
//           <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.35" />
//         </filter>

//         {/* Soft glow for rupee symbol */}
//         <filter id="rupeeGlow">
//           <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.4" />
//         </filter>
//       </defs>

//       {/* Ground shadow */}
//       <ellipse cx="32" cy="56" rx="24" ry="6" fill="#000" opacity="0.25" filter="url(#coinShadow)" />

//       {/* Main coin body */}
//       <circle cx="32" cy="32" r="24" fill="url(#coinGrad)" filter="url(#coinShadow)" />

//       {/* Coin rim (metallic edge) */}
//       <circle cx="32" cy="32" r="24" fill="none" stroke="#FDE68A" strokeWidth="1.5" opacity="0.8" />
//       <circle cx="32" cy="32" r="23" fill="none" stroke="#B45309" strokeWidth="0.8" opacity="0.5" />

//       {/* Inner embossed area */}
//       <circle cx="32" cy="32" r="18" fill="url(#innerGrad)" />
//       <circle cx="32" cy="32" r="18" fill="none" stroke="#FEF3C7" strokeWidth="1" opacity="0.6" />
//       <circle cx="32" cy="32" r="17" fill="none" stroke="#92400E" strokeWidth="0.5" opacity="0.4" />

//       {/* Highlight shine (top-left) */}
//       <ellipse cx="22" cy="22" rx="10" ry="6" fill="white" opacity="0.15" transform="rotate(-30 22 22)" />

//       {/* Secondary shine (bottom-right reflection) */}
//       <ellipse cx="44" cy="44" rx="8" ry="4" fill="white" opacity="0.08" transform="rotate(-30 44 44)" />

//       {/* Rupee symbol */}
//       <text
//         x="32"
//         y="41"
//         textAnchor="middle"
//         fontSize="28"
//         fontWeight="900"
//         fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, sans-serif"
//         fill="url(#rupeeGrad)"
//         filter="url(#rupeeGlow)"
//         stroke="#78350F"
//         strokeWidth="0.8"
//       >
//         ₹
//       </text>
//     </svg>
//   );
// }
function GoldCoinIcon({ size = 80 }) {
  return (
    <img
      src="/goldcoin.png"
      alt="gold coin"
      width={size}
      height={size}
       style={{
        objectFit: "contain",
        // transform: "rotateY(-40deg) scale(1.05)",
        filter: "drop-shadow(2px 4px 6px rgba(0,0,0,0.35))",
      }}
    />
  );
}
function SilverCoinIcon({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="54" rx="22" ry="6" fill="#64748b" opacity="0.4" />
      <ellipse cx="32" cy="30" rx="22" ry="22" fill="#cbd5e1" />
      <ellipse cx="32" cy="30" rx="22" ry="22" fill="none" stroke="#e2e8f0" strokeWidth="3" />
      <ellipse cx="32" cy="30" rx="15" ry="15" fill="#94a3b8" />
      <text x="32" y="36" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#f8fafc" fontFamily="sans-serif">₹</text>
      <path d="M10 30 Q10 54 32 54 Q54 54 54 30" fill="#94a3b8" opacity="0.5" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function DigiMetalSchemes() {
  const { metalType: paramMetal } = useParams();
  const navigate    = useNavigate();
  const [metalType, setMetalType] = useState(paramMetal || "gold");
  const topInset    = useSafeAreaTop();
  const isnative    = Capacitor.getPlatform() === "android";
const [addMoreDialog, setAddMoreDialog] = useState(false);
const [addMoreScheme, setAddMoreScheme] = useState(null);
  // ── Context ───────────────────────────────────────────────────────────────
  // plan = array of all plans the user is enrolled in
 const { dgGold22Plan, dgGold24Plan, dgSilverPlan, Allplan: enrolledPlans ,isLoadingPlans } = useContext(StoreContext);
// console.log(enrolledPlans);

  // ── Enrolled member lookup ────────────────────────────────────────────────
const gold24Members = (enrolledPlans || []).filter((p) => p.mgroup === "DIGIG24");
const gold22Members = (enrolledPlans || []).filter((p) => p.mgroup === "DIGIG22");
const silverMembers = (enrolledPlans || []).filter((p) => p.mgroup === "DIGIS");

  // ── Live rates ────────────────────────────────────────────────────────────
  const [metalRates, setMetalRates]     = useState(null);
  const [ratesLoading, setRatesLoading] = useState(true);
  const intervalRef = useRef(null);

  const fetchMetalRates = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/core/rates`,
        { params: { store_id: APP_CONFIG.STORE_ID, branch: APP_CONFIG.BRANCH } }
      );
      setMetalRates(res.data);
    } catch (err) {
      console.error("Failed to fetch metal rates:", err);
    } finally {
      setRatesLoading(false);
    }
  };

  useEffect(() => {
    fetchMetalRates();
    intervalRef.current = setInterval(fetchMetalRates, RATE_REFRESH_MS);
    return () => clearInterval(intervalRef.current);
  }, []);
// console.log(metalRates);

  // ── Extract rates (adjust field names to match your API response) ─────────
  const rate22kt = metalRates?.find(
    (r) =>
      (r.metal?.toLowerCase() === "gold") 
      // && (r.purity === "916" || r.purity === "22" || r.kt === "22")
  )?.rate ??
  metalRates?.find(
    (r) => r.metal?.toLowerCase() === "gold" || r.type?.toLowerCase() === "gold"
  )?.rate ?? null;

  const rateSilver = metalRates?.find(
    (r) => r.metal?.toLowerCase() === "silver"
  )?.rate ?? null;

  const rate24kt = calc24ktRate(rate22kt);

  // ── Scheme cards ──────────────────────────────────────────────────────────
  // const schemes = {
  //   gold: [
  //     dgGoldPlan && rate24kt != null ? {
  //       id: dgGoldPlan.code + "_24kt",
  //       metal: "gold", label: "Digi Gold 24KT",
  //       purity: "999", kt: "24KT",
  //       rate: rate24kt,
  //       minAmt: 100, badge: "Highest Purity",
  //       plan: dgGoldPlan,
  //     } : null,
  //     dgGoldPlan && rate22kt != null ? {
  //       id: dgGoldPlan.code + "_22kt",
  //       metal: "gold", label: "Digi Gold 22KT",
  //       purity: "916", kt: "22KT",
  //       rate: rate22kt,
  //       minAmt: 100, badge: "BIS Hallmarked",
  //       plan: dgGoldPlan,
  //     } : null,
  //   ].filter(Boolean),

  //   silver: [
  //     dgSilverPlan && rateSilver != null ? {
  //       id: dgSilverPlan.code + "_925",
  //       metal: "silver", label: "Digi Silver 925",
  //       purity: "925", kt: "Sterling",
  //       rate: rateSilver,
  //       minAmt: 100, badge: "Sterling Silver",
  //       plan: dgSilverPlan,
  //     } : null,
  //   ].filter(Boolean),
  // };

const schemes = {
  gold: [
    dgGold24Plan && rate24kt != null ? {
      id: "DIGIG24_24kt",
      metal: "gold", label: "Digi Gold 24KT",
      purity: "999", kt: "24KT",
      rate: rate24kt,
      minAmt: 100, badge: "Highest Purity",
      mgroup: "DIGIG24",
      members: gold24Members,
      plan: dgGold24Plan,
    } : null,
    dgGold22Plan && rate22kt != null ? {
      id: "DIGIG22_22kt",
      metal: "gold", label: "Digi Gold 22KT",
      purity: "916", kt: "22KT",
      rate: rate22kt,
      minAmt: 100, badge: "BIS Hallmarked",
      mgroup: "DIGIG22",
      members: gold22Members,
      plan: dgGold22Plan,
    } : null,
  ].filter(Boolean),

  silver: [
    dgSilverPlan && rateSilver != null ? {
      id: "DIGIS_925",
      metal: "silver", label: "Digi Silver 925",
      purity: "925", kt: "Sterling",
      rate: rateSilver,
      minAmt: 100, badge: "Sterling Silver",
      mgroup: "DIGIS",
      members: silverMembers,
      plan: dgSilverPlan,
    } : null,
  ].filter(Boolean),
};
// console.log(schemes);

  const isGold         = metalType === "gold";
  const accent         = isGold ? "#b45309" : "#475569";
  const currentSchemes = schemes[metalType] || [];
  // const currentMembers = isGold ? goldMembers : silverMembers;
  // const isEnrolled     = currentMembers.length > 0;

  // ── Dialog state ──────────────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen]       = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);

  // ── Logo orientation ──────────────────────────────────────────────────────
  const [logoOrientation, setLogoOrientation] = useState("square");
  useEffect(() => {
    const img = new Image();
    img.src = storeLogo;
    img.onload = () => setLogoOrientation(getOrientation(img.naturalWidth, img.naturalHeight));
  }, []);
  const logoW = logoOrientation === "vertical" ? 25 : logoOrientation === "horizontal" ? 70 : 40;
  const logoH = logoOrientation === "vertical" ? 55 : logoOrientation === "horizontal" ? 55 : 40;

  const handleSwitch = (type) => {
    setMetalType(type);
    navigate(`/digi-metal/${type}`, { replace: true });
  };

  // Navigate to BuyMetalScreen — enrolledMember null means "Join New" (goes through contact page)
  const goToBuyScreen = (scheme, enrolledMember = null) => {
    navigate("/buy-metal", {
      state: {
        scheme,
        initialRate: scheme.rate,
        rate22kt,
        rateSilver,
        alreadyEnrolled: !!enrolledMember,
        enrolledMember:  enrolledMember || null,
      },
    });
  };

const handlePayNow = (scheme) => {
  const members = scheme.members || [];
  if (members.length === 1) {
    goToBuyScreen(scheme, members[0]);
  } else {
    setSelectedScheme(scheme);
    setDialogOpen(true);
  }
};

  const handleJoinNew    = (scheme)  => goToBuyScreen(scheme, null);
  const handleMemberPick = (member)  => {
    setDialogOpen(false);
    goToBuyScreen(selectedScheme, member);
  };

  return (
    <Box sx={{ pt:0.5, backgroundColor: "#fff", minHeight: "100vh" }}>

      {/* ── Toggle ───────────────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", backgroundColor: "#f3f4f6", borderRadius: "100px", p: "4px", mb: 1,position: "relative" }}>
        <Box
          sx={{
            position: "absolute", top: "4px",
            left: metalType === "gold" ? "4px" : "calc(50% + 0px)",
            width: "calc(50% - 4px)", height: "calc(100% - 8px)",
            borderRadius: "100px",
            backgroundColor: metalType === "gold" ? "#fde68a" : "#e2e8f0",
            border: metalType === "gold" ? "1.5px solid #f59e0b" : "1.5px solid #94a3b8",
            transition: "left 0.28s cubic-bezier(0.4,0,0.2,1), background-color 0.28s ease, border-color 0.28s ease",
            boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
          }}
        />
        {[
          { type: "gold",   Icon: GoldCoinIcon,   label: "Digi Gold",   activeColor: "#92400e" },
          { type: "silver", Icon: SilverCoinIcon, label: "Digi Silver", activeColor: "#1e293b" },
        ].map(({ type, Icon, label, activeColor }) => (
          <Box
            key={type}
            onClick={() => handleSwitch(type)}
            sx={{ flex: 1, zIndex: 1, height: "40px", display: "flex", alignItems: "center", justifyContent: "center", gap: 0.8, cursor: "pointer", borderRadius: "100px" }}
          >
            <Icon size={20} />
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: metalType === type ? activeColor : "#6b7280" }}>
              {label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* ── Loading ───────────────────────────────────────────────────────── */}
      {(ratesLoading || isLoadingPlans) && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress size={28} sx={{ color: accent }} />
        </Box>
      )}

      {/* ── Main content ──────────────────────────────────────────────────── */}
      {!ratesLoading && !isLoadingPlans && (
        <Box
          key={metalType}
          sx={{
            animation: "fadeSlideIn 0.25s ease forwards",
            "@keyframes fadeSlideIn": {
              from: { opacity: 0, transform: "translateY(8px)" },
              to:   { opacity: 1, transform: "translateY(0px)" },
            },
          }}
        >
          {currentSchemes.length === 0 && (
            <Box sx={{ border: "1.5px dashed #e5e7eb", borderRadius: 3, p: 3, textAlign: "center", mb: 2 }}>
              <Typography sx={{ fontSize: 14, color: "#9ca3af", fontWeight: 500 }}>
                No Digi {isGold ? "Gold" : "Silver"} plan available at the moment.
              </Typography>
            </Box>
          )}

      {currentSchemes.map((scheme) => (
  <Box key={scheme.id} sx={{ border: "1.5px solid #e5e7eb", borderRadius: 3, p: 2, mb: 2, backgroundColor: "#fff" }}>

    {/* Row 1: Logo left | Rate right */}
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
      <Box sx={{ width: logoW, height: logoH, backgroundImage: `url(${storeLogo})`, backgroundSize: "contain", backgroundPosition: "center left", backgroundRepeat: "no-repeat", flexShrink: 0 }} />
      <Box sx={{ textAlign: "center" }}>
        <Typography sx={{ fontSize: 11, color: "#37383b", mb: 0.3 }}>Today's Rate</Typography>
        <Typography sx={{ fontSize: 20, fontWeight: 700, color: accent, lineHeight: 1.2 }}>
          ₹{inr(scheme.rate)}
          <span style={{ fontSize: 12, fontWeight: 400, color: "#9ca3af" }}>/gm</span>
        </Typography>
      </Box>
    </Box>

    {/* Row 2: Coin + Label + Purity/Badge | Buy button (small, right-aligned) */}
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {isGold ? <GoldCoinIcon size={35} /> : <SilverCoinIcon size={24} />}
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#111", lineHeight: 1.2 }}>
            {scheme.label}
          </Typography>

          {/* Purity + Badge always shown here for both enrolled & non-enrolled */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 0.3 }}>
            <Typography sx={{ fontSize: 12, color: accent, fontWeight: 600 }}>
              {scheme.purity}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>||</Typography>
            <Chip
              label={scheme.badge} size="small"
              icon={<VerifiedOutlinedIcon style={{ fontSize: 11 }} />}
              sx={{
                fontSize: 10, height: 20, fontWeight: 600,
                backgroundColor: isGold ? "#fef3c7" : "#f1f5f9",
                color: isGold ? "#92400e" : "#334155",
                "& .MuiChip-icon": { color: isGold ? "#b45309" : "#475569" },
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Buy button — small, shown for ALL users (enrolled or not) */}
      {!(scheme.members?.length > 0) && (
  <Box
    onClick={() => handleJoinNew(scheme)}
    sx={{
      height: 28,
      px: 1.5,
      borderRadius: "8px",
      backgroundColor: accent,
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "pointer",
      flexShrink: 0,
      mt: "auto", 
      "&:active": { opacity: 0.85 },
    }}
  >
    <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 11 }}>
      {isGold ? "Buy Gold" : "Buy Silver"}
    </Typography>
  </Box>
)}
    </Box>

    {/* Pay Now + Join New — only for enrolled users */}
    {(scheme.members?.length > 0) && (
      <Box sx={{ display: "flex", gap: 1, mt: 1, pt: 1, borderTop: "1px solid #f3f4f6" }}>
        <Box
          onClick={() => handlePayNow(scheme)}
          sx={{
            flex: 1, height: 38, borderRadius: "10px",
            backgroundColor: accent,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", "&:active": { opacity: 0.85 },
          }}
        >
          <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>Continue & Pay</Typography>
        </Box>
        <Box
          onClick={() => {
  setAddMoreScheme(scheme);
  setAddMoreDialog(true);
}}
          sx={{
            flex: 1, height: 38, borderRadius: "10px",
            border: `1.5px solid ${accent}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", "&:active": { opacity: 0.85 },
          }}
        >
          <Typography sx={{ color: accent, fontWeight: 700, fontSize: 13 }}>Add More</Typography>
        </Box>
      </Box>
    )}

  </Box>
))}

          {/* ── Why invest ────────────────────────────────────────────────── */}
          <Box sx={{ border: "1.5px solid #e5e7eb", borderRadius: 3, p: 2, mt: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <StorefrontOutlinedIcon sx={{ fontSize: 18, color: accent }} />
              <Typography sx={{ fontWeight: 600, fontSize: 14, color: "#111" }}>Why Digi {isGold ? "Gold" : "Silver"}?</Typography>
            </Box>
            {[
              { icon: <LockOutlinedIcon sx={{ fontSize: 16, color: accent }} />, text: "100% secure & insured storage" },
              { icon: <VerifiedOutlinedIcon sx={{ fontSize: 16, color: accent }} />, text: isGold ? "BIS Hallmarked quality" : "Sterling certified quality" },
              { icon: <TrendingUpIcon sx={{ fontSize: 16, color: accent }} />, text: "Start with as little as ₹100" },
              { icon: isGold ? <GoldCoinIcon size={16} /> : <WaterDropOutlinedIcon sx={{ fontSize: 16, color: accent }} />, text: "Buy anytime from your phone" },
            ].map((item, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: i < 3 ? 1 : 0 }}>
                {item.icon}
                <Typography sx={{ fontSize: 13, color: "#374151" }}>{item.text}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* ── Member Picker Dialog ──────────────────────────────────────────── */}
<Dialog
  open={dialogOpen}
  onClose={() => setDialogOpen(false)}
  PaperProps={{
    sx: {
      borderRadius: "20px",
      background: "rgba(255,255,255,0.6)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      border: "1px solid rgba(255,255,255,0.3)",
      boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
      width: "88%",
      maxWidth: 360,
    }
  }}
  slotProps={{
    backdrop: {
      sx: {
        backgroundColor: "rgba(0,0,0,0.25)",
        backdropFilter: "blur(6px)",
      }
    }
  }}
>
  <DialogTitle sx={{ pb: 1 }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      
      <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#111" }}>
        Select Plan
      </Typography>

      {/* Close Button with Circle Background */}
      <Box
        onClick={() => setDialogOpen(false)}
        sx={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          backgroundColor: "rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "0.2s",
          "&:hover": {
            backgroundColor: "rgba(0,0,0,0.12)"
          }
        }}
      >
        <CloseIcon sx={{ fontSize: 18, color: "#374151" }} />
      </Box>
    </Box>

    <Typography sx={{ fontSize: 12, color: "#6b7280", mt: 0.5 }}>
      Choose a plan to continue payment
    </Typography>
  </DialogTitle>

  <DialogContent sx={{ pt: 0, pb: 2 }}>
    {(selectedScheme?.members || []).map((member, i) => (
      <React.Fragment key={member.member_id}>
        {i > 0 && <Divider sx={{ my: 0.5, opacity: 0.6 }} />}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            py: 1.5,
            px: 1,
            borderRadius: "12px",
            transition: "0.2s",
            "&:hover": {
              backgroundColor: "rgba(0,0,0,0.04)"
            }
          }}
        >
          {/* Left: Member Info (No Avatar) */}
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: 14, color: "#111" }}>
              {member.mgroup} – {member.member_no}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>
              {member.name}
            </Typography>
          </Box>

          {/* Right: Bigger Capsule Button */}
          <Box
            onClick={() => handleMemberPick(member)}
            sx={{
              px: 2,
              py: 0.7,
              borderRadius: "999px",
              backgroundColor: accent,
              color: "#fff",
              cursor: "pointer",
              transition: "0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 80,
              "&:hover": {
                opacity: 0.9
              },
              "&:active": {
                transform: "scale(0.96)"
              }
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                fontWeight: 700,
                color: "#fff"
              }}
            >
               Pay
            </Typography>
          </Box>
        </Box>
      </React.Fragment>
    ))}
  </DialogContent>
</Dialog>

{/* ── Add More Confirmation Dialog ─────────────────────────────────── */}
<Dialog
  open={addMoreDialog}
  onClose={() => setAddMoreDialog(false)}
  PaperProps={{
    sx: {
      borderRadius: "20px",
      background: "rgba(255,255,255,0.6)",
      backdropFilter: "blur(18px)",
      WebkitBackdropFilter: "blur(18px)",
      border: "1px solid rgba(255,255,255,0.3)",
      boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
      width: "88%",
      maxWidth: 360,
    }
  }}
  slotProps={{
    backdrop: {
      sx: {
        backgroundColor: "rgba(0,0,0,0.25)",
        backdropFilter: "blur(6px)",
      }
    }
  }}
>
  <DialogTitle sx={{ pb: 0.5 }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#111" }}>
        Join New Plan?
      </Typography>
      <Box
        onClick={() => setAddMoreDialog(false)}
        sx={{
          width: 30, height: 30, borderRadius: "50%",
          backgroundColor: "rgba(0,0,0,0.06)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
          "&:hover": { backgroundColor: "rgba(0,0,0,0.12)" }
        }}
      >
        <CloseIcon sx={{ fontSize: 18, color: "#374151" }} />
      </Box>
    </Box>
  </DialogTitle>

  <DialogContent sx={{ pt: 1, pb: 1 }}>
    <Box sx={{ bgcolor: "#fff8e1", borderRadius: 2, px: 2, py: 1, mb: 1.5 }}>
      <Typography sx={{ fontSize: 14, color: "#b45309", textAlign: "center" }}>
        You already have an active <strong>{addMoreScheme?.label}</strong> plan.
        Joining a new one will create a separate plan for you.
      </Typography>
    </Box>
    <Typography sx={{ fontSize: 12, color: "#0f1011", textAlign: "center" }}>
      Do you want to continue with your existing plan or join a new one?
    </Typography>
  </DialogContent>

  <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 1, gap: 1 }}>
    {/* Continue & Pay — goes to existing member */}
    <Button
      onClick={() => {
        setAddMoreDialog(false);
        handlePayNow(addMoreScheme);
      }}
      variant="contained"
      fullWidth
      sx={{
        borderRadius: 2, textTransform: "none", fontSize: 11, py: 0.9,
        background: accent, boxShadow: "none",
        "&:hover": { background: accent, opacity: 0.9 }
      }}
      
    >
      Continue & Pay
    </Button>

    {/* Join New — proceeds to new enrollment */}
    <Button
      onClick={() => {
        setAddMoreDialog(false);
        handleJoinNew(addMoreScheme);
      }}
      variant="outlined"
      fullWidth
      sx={{
        borderRadius: 2, textTransform: "none", fontSize: 13, py: 0.6,
        borderColor: accent, color: accent,
      }}
    >
      Join New
    </Button>
  </DialogActions>
</Dialog>
    </Box>
  );
}