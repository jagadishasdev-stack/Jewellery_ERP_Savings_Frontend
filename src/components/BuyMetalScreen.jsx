import React, { useState, useEffect, useRef,useContext  } from "react";
import { Box, Typography, Chip, Button, CircularProgress,DialogActions,Dialog ,DialogContent,
    Drawer,
  IconButton,
  Button as MuiButton,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useLocation, useNavigate } from "react-router-dom";
import { useSafeAreaTop,useSafeAreaBottom } from "../SafeAreaFile";
import { Capacitor }      from "@capacitor/core";
import axios              from "axios";
import APP_CONFIG         from "../config/constants";
import { AuthContext } from "../contexts/AuthContext";
import HistoryIcon from "@mui/icons-material/History";
// Add this import at the top with other imports
import PaymentHistory from "./PaymentHistory";
// ─── 15-minute refresh interval ───────────────────────────────────────────────
const RATE_REFRESH_MS  = 10 * 60 * 1000; // ms
const RATE_REFRESH_SEC = 10 * 60;         // seconds (for countdown)

// ─── Helpers ──────────────────────────────────────────────────────────────────
const POPULAR_RUPEES   = [100, 500, 1000,2000,3000, 5000, 10000,15000,20000,25000,30000,50000];
const POPULAR_S_RUPEES = [1000,2000,3000, 5000, 10000, 15000,20000, 50000];
const POPULAR_GRAMS    = [1, 2, 5, 6];
const POPULAR_S_GRAMS  = [10, 20, 50, 100, 200, 500];

const r3  = (n) => Math.round(n * 1000) / 1000;
const r0  = (n) => Math.round(n);
const inr = (n) => Number(n).toLocaleString("en-IN");

// 22KT (916 purity) → 24KT (999 purity)
function calc24ktRate(rate22kt) {
  if (!rate22kt) return null;
  return Math.round((rate22kt / 916) * 999);
}

function formatTime(date) {
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

// Formats seconds → "MM:SS"
function formatCountdown(totalSecs) {
  const m = Math.floor(totalSecs / 60).toString().padStart(2, "0");
  const s = (totalSecs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function BuyMetalScreen() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const topInset  = useSafeAreaTop();
 const bottomInset = useSafeAreaBottom();
  const isnative  = Capacitor.getPlatform() === "android";
const [largeAmountDialog, setLargeAmountDialog] = useState(false);
const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
const { loginRole,adminUser } = useContext(AuthContext);
  // ── Data passed from DigiMetalSchemes ────────────────────────────────────
  const {
    scheme: initialScheme,
    rate22kt:    initial22kt,
    rateSilver:  initialSilver,
    alreadyEnrolled,
    enrolledMember,  // { member_id, mgroup, member_no, name, ... }
  } = location.state || {};

  const scheme = initialScheme || {
    id: "gold_24kt", metal: "gold",
    label: "Digi Gold 24KT", purity: "999", kt: "24KT", rate: 0,
  };

  const isGold = scheme.metal === "gold";
  const is24kt = scheme.purity === "999"; // drives which rate formula to use
  const accent = isGold ? "#b45309" : "#475569";

  // ── Live rate state ───────────────────────────────────────────────────────
  const [liveRate, setLiveRate]           = useState(scheme.rate || 0);
  const [rateUpdatedAt, setRateUpdatedAt] = useState(new Date());
  const [rateRefreshing, setRateRefreshing] = useState(false);

  // countdown in seconds (counts down from RATE_REFRESH_SEC to 0)
  const [countdown, setCountdown]         = useState(RATE_REFRESH_SEC);

  const rateIntervalRef      = useRef(null);
  const countdownIntervalRef = useRef(null);

  // ── Fetch and apply fresh rate ────────────────────────────────────────────
  const fetchAndApplyRate = async () => {
    setRateRefreshing(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/core/rates`,
        { params: { store_id: APP_CONFIG.STORE_ID, branch: APP_CONFIG.BRANCH } }
      );
      const ratesArray = res.data;

      if (isGold) {
        const fresh22kt = ratesArray?.find(
          (r) =>
            (r.metal?.toLowerCase() === "gold" || r.type?.toLowerCase() === "gold") &&
            (r.purity === "916" || r.purity === "22" || r.kt === "22")
        )?.rate ??
        ratesArray?.find(
          (r) => r.metal?.toLowerCase() === "gold" || r.type?.toLowerCase() === "gold"
        )?.rate ?? null;

        if (fresh22kt != null) {
          // ── KEY: apply the correct formula based on purity ──────────────
          // 24KT card → calculate up from 22KT rate
          // 22KT card → use 22KT rate directly
          const newRate = is24kt ? calc24ktRate(fresh22kt) : fresh22kt;
          setLiveRate(newRate);
          setRateUpdatedAt(new Date());
          // reset countdown
          setCountdown(RATE_REFRESH_SEC);
        }
      } else {
        const freshSilver = ratesArray?.find(
          (r) => r.metal?.toLowerCase() === "silver" || r.type?.toLowerCase() === "silver"
        )?.rate ?? null;

        if (freshSilver != null) {
          setLiveRate(freshSilver);
          setRateUpdatedAt(new Date());
          setCountdown(RATE_REFRESH_SEC);
        }
      }
    } catch (err) {
      console.error("Failed to refresh metal rates:", err);
    } finally {
      setRateRefreshing(false);
    }
  };

  // Start polling only on this page; stop on unmount (not in contact/payment)
  useEffect(() => {
    rateIntervalRef.current = setInterval(fetchAndApplyRate, RATE_REFRESH_MS);

    // Countdown tick every second
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(rateIntervalRef.current);
      clearInterval(countdownIntervalRef.current);
    };
  }, []);

useEffect(() => {
  const handleViewportResize = () => {
    if (document.activeElement?.tagName === "INPUT") {
      setTimeout(() => {
        document.activeElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  };

  window.visualViewport?.addEventListener("resize", handleViewportResize);
  return () => {
    window.visualViewport?.removeEventListener("resize", handleViewportResize);
  };
}, []);
  // ── Tabs ──────────────────────────────────────────────────────────────────
  const [tab, setTab] = useState(0);

  // Tab 0 — rupees
  const [rupees, setRupees] = useState("");
  const gmsFromRup = rupees && liveRate ? r3(parseFloat(rupees) / liveRate) : 0;

  // Tab 1 — grams
  const [grams, setGrams]   = useState("");
  const rupFromGms = grams && liveRate ? r0(parseFloat(grams) * liveRate) : 0;

  const canProceed = tab === 0
    ? parseFloat(rupees || 0) >= 100
    : parseFloat(grams  || 0) > 0;

  // ── Proceed ───────────────────────────────────────────────────────────────
  const handleProceed = () => {
    if (!canProceed) return;

    const finalAmountRupees = tab === 0 ? parseFloat(rupees) : rupFromGms;
    const finalGrams        = tab === 0 ? gmsFromRup : parseFloat(grams);
 if (finalAmountRupees > 100000) {
    setLargeAmountDialog(true);
    return;
  }
    if (alreadyEnrolled && enrolledMember) {
      // ── Already enrolled: skip SavingsContactDetails, go straight to payment ──
      // PaymentAndLedgerPage needs: data (currentPlan fields) + userInfo
      const paymentData = {
        // merge enrolledMember fields (member_id, mgroup, member_no, name, etc.)
        ...enrolledMember,
        // override scheme_amount with the amount user entered now
        scheme_amount: finalAmountRupees,
        // pass rate info so PaymentAndLedgerPage can display it
        rateAtPurchase:  liveRate,
        purchaseGrams:   finalGrams,
        purchaseAmount:  finalAmountRupees,
        buyMode:         tab === 0 ? "rupees" : "grams",
        metal:           scheme.metal,
        purity:          scheme.purity,
        kt:              scheme.kt,
        scheme_name:     scheme.label,
      };

      // const userInfo = {
      //   name:     enrolledMember.name,
      //   email:    enrolledMember.email     || "",
      //   address1: enrolledMember.address1  || "",
      //   address2: enrolledMember.address2  || "",
      //   mobile:   enrolledMember.mobile    || "",
      // };
      const userInfo =adminUser

      navigate("/paymentandledger", {
        state: { data: paymentData, userInfo },
      });
    } else {
      // ── New enrollment: go through SavingsContactDetails as normal ────────
      navigate("/select-plan/contact", {
        state: {
          // Required fields for SavingsContactDetails → join-scheme API
          code:   scheme.plan?.code || scheme.id,
          AMOUNT: finalAmountRupees,

          // Extra context for PaymentAndLedgerPage (passed through after contact)
          scheme_name:    scheme.label,
          metal:          scheme.metal,
          purity:         scheme.purity,
          kt:             scheme.kt,
          rateAtPurchase: liveRate,
          purchaseGrams:  finalGrams,
          purchaseAmount: finalAmountRupees,
          buyMode:        tab === 0 ? "rupees" : "grams",
          gold_scheme:    scheme.plan?.gold_scheme ?? "1",

          // Spread full plan object so SavingsContactDetails gets all fields it needs
          ...(scheme.plan || {}),

          // Re-assert code and AMOUNT after spread (spread must not overwrite them)
          code:   scheme.plan?.code || scheme.id,
          AMOUNT: finalAmountRupees,
        },
      });
    }
  };

  // ── Shared input style ────────────────────────────────────────────────────
  const inputStyle = {
    border: "none", outline: "none",
    fontSize: 22, fontWeight: 700,
    color: "#111", background: "transparent",
    fontFamily: "inherit", width: "100%",
  };

  return (
    <Box sx={{  backgroundColor: "#fff", minHeight: "100vh" , paddingBottom: "140px", }}>

      {/* ── Enrolled member banner (shown when paying for existing plan) ──── */}
{/* Enrolled member banner with history icon */}
   {alreadyEnrolled && enrolledMember && (
  <Box
    sx={{
      backgroundColor: isGold ? "#fef3c7" : "#f1f5f9",
      border: `1.5px solid ${isGold ? "#f59e0b" : "#94a3b8"}`,
      borderRadius: 2,
      px: 2, py: 1.5,
      mb: 2,
      mt: 1,
    }}
  >
    {/* Row 1: label + name */}
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
      <Box>
        <Typography sx={{ fontSize: 11, color: isGold ? "#92400e" : "#334155", fontWeight: 600 }}>
          Paying for
        </Typography>
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#111" }}>
          {enrolledMember.mgroup} – {enrolledMember.member_no}
        </Typography>
      </Box>
      <Box sx={{ textAlign: "right" }}>
  <Typography sx={{ fontSize: 13, color: "#374151", fontWeight: 500,textAlign: "left" }}>
    {enrolledMember.name}
  </Typography>
  <Typography sx={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
    {enrolledMember.member_id}
  </Typography>
</Box>
      
    </Box>

    {/* Divider */}
    <Box sx={{ height: "1px", backgroundColor: isGold ? "#f59e0b33" : "#94a3b833", mb: 1 }} />

    {/* Row 2: joining date + total amount paid */}
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Box>
        <Typography sx={{ fontSize: 10, color: "#9ca3af" }}>Joining Date</Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>
          {enrolledMember.member_created_at
            ? new Date(enrolledMember.member_created_at).toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric",
              })
            : "--"}
        </Typography>
      </Box>
      <Box sx={{ textAlign: "right" }}>
        <Typography sx={{ fontSize: 10, color: "#9ca3af" }}>Total Paid</Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: isGold ? "#b45309" : "#475569" }}>
          ₹{enrolledMember.amountPaid
            ? Number(enrolledMember.amountPaid).toLocaleString("en-IN")
            : "0"}
        </Typography>
      </Box>
       <Box sx={{ textAlign: "right" }}>
  <Typography sx={{ fontSize: 10, color: "#9ca3af" }}>
    Total Weight
  </Typography>

  <Typography
    sx={{
      fontSize: 13,
      fontWeight: 600,
      color: isGold ? "#b45309" : "#475569",
    }}
  >
    {enrolledMember.gold_balance != null
      ? Number(enrolledMember.gold_balance).toFixed(3)
      : "0.000"}{" "}
    g
  </Typography>
</Box>
    </Box>
  </Box>
)}

      {/* ── Scheme label + rate card ──────────────────────────────────────── */}
      <Box sx={{ border: "1.5px solid #e5e7eb", borderRadius: 3, px: 2, py: 1.8, mb: 3, mt: 0.5 }}>

        {/* Top row: rate left, scheme pill right */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.2 }}>
          <Box>
            <Typography sx={{ fontSize: 11, color: "#37383b" }}>Today's Rate</Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: accent, lineHeight: 1.2 }}>
                ₹{inr(liveRate)}
                <span style={{ fontSize: 12, fontWeight: 400, color: "#37383b" }}>/gm</span>
              </Typography>
              {rateRefreshing && <CircularProgress size={12} sx={{ color: accent }} />}
            </Box>
          </Box>
          <Box sx={{ backgroundColor: accent, borderRadius: "20px", px: 2, py: 0.5 }}>
            <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 14, letterSpacing: 0.3 }}>
              {scheme.kt} {isGold ? "Gold" : "Silver"}
            </Typography>
          </Box>
        </Box>

        {/* Bottom row: date • purity • updated at • countdown */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>
            {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </Typography>
          <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>•</Typography>
          <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>
            Purity: {scheme.purity} | {scheme.kt}
          </Typography>
          {/* <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>•</Typography> */}
          <Box sx={{ display: "flex", alignItems: "center", justifyContent:"space-between", gap: 0.4 , width: "100%"}}>
          <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>
            Rate updated at {formatTime(rateUpdatedAt)}
          </Typography>
          {/* <Typography sx={{ fontSize: 11, color: "#9ca3af" }}>•</Typography> */}
          {/* ── Live countdown ── */}
          
          <Typography
  sx={{
    display: "inline-block",
    fontSize: 11,
    color: accent,
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
    px: 1.2,              // horizontal padding
    py: 0.3,              // vertical padding
    borderRadius: "999px",// full capsule shape
    backgroundColor: `${accent}15`, // light background (15 = opacity)
    border: `1px solid ${accent}40`, // subtle border
  }}
>
  Refresh in {formatCountdown(countdown)}
</Typography>
            {/* <Typography sx={{ fontSize: 10, color: "#9ca3af" }}>to refresh</Typography> */}
          </Box>
        </Box>
      </Box>

      {/* ── Tab bar ──────────────────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", mb: 3 }}>
        {["Buy in Rupees", "Buy in Grams"].map((label, idx) => (
          <Box
            key={label}
            onClick={() => setTab(idx)}
            sx={{
              flex: 1, pb: 1.2, textAlign: "center", cursor: "pointer",
              borderBottom: tab === idx ? `2.5px solid ${accent}` : "1.5px solid #e5e7eb",
            }}
          >
            <Typography sx={{ fontSize: 14, fontWeight: tab === idx ? 700 : 400, color: tab === idx ? accent : "#374151" }}>
              {label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* ══ TAB 0 — Buy in Rupees ════════════════════════════════════════════ */}
      {tab === 0 && (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}>
            <Box sx={{ border: "1.5px solid #d1d5db", borderRadius: "12px", px: 1.5, py: 1, display: "flex", alignItems: "center", gap: 0.5, width: "44%" }}>
              <Typography sx={{ fontSize: 22, fontWeight: 700, color: "#374151", flexShrink: 0 }}>₹</Typography>
              <input
                type="tel" inputMode="numeric" pattern="[0-9]*"
                value={rupees}
                onChange={(e) => setRupees(e.target.value.replace(/\D/g, ""))}
                style={inputStyle}
              />
            </Box>
            <Typography sx={{ fontSize: 17, fontWeight: 600, color: "#111" }}>
              = {gmsFromRup > 0 ? gmsFromRup.toFixed(3) : "0.000"} gm
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 2 }}>3% GST will be applicable at the time of delivery</Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#111" }}>
            Start buying {isGold ? "gold" : "silver"} with minimum ₹100.00
          </Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", mt: 2.5, mb: 1 }}>Popular Buying Options</Typography>
         <Box
  sx={{
    display: "flex",
    gap: 1,
    mb: 2.5,
    overflowX: "auto",        // ✅ enable horizontal scroll
    whiteSpace: "nowrap",     // ✅ keep in one line
    pb: 0.5,
    "&::-webkit-scrollbar": { display: "none" }, // hide scrollbar
  }}
>
            {(isGold ? POPULAR_RUPEES : POPULAR_S_RUPEES).map((amt) => (
              <Chip
                key={amt} label={`₹${inr(amt)}`}
                onClick={() => setRupees(String(amt))}
                sx={{
                   flexShrink: 0,
                  fontWeight: 600, fontSize: 13, height: 36, borderRadius: "10px",
                  backgroundColor: rupees === String(amt) ? accent : "#f3f4f6",
                  color: rupees === String(amt) ? "#fff" : "#374151",
                  border: "none", "&:hover": { opacity: 0.85 },
                }}
              />
            ))}
          </Box>
          {/* Payment History Section - Only show for enrolled members */}
{alreadyEnrolled && enrolledMember && enrolledMember.amountPaid > 0 &&(
  <MuiButton
     fullWidth
  // disableRipple
  onClick={() => setHistoryDrawerOpen(true)}
  sx={{
    color: accent,
    fontWeight: 600,
    textTransform: "none",
    // backgroundColor: "transparent",
    // "&:hover": { backgroundColor: "transparent" },
    // "&:active": { backgroundColor: "transparent" },
    // "&:focus": { backgroundColor: "transparent" },
  }}
  >
    <HistoryIcon/>  View Payment History
  </MuiButton>

)}
        </Box>
      )}

      {/* ══ TAB 1 — Buy in Grams ══════════════════════════════════════════════ */}
      {tab === 1 && (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}>
            <Box sx={{ border: "1.5px solid #d1d5db", borderRadius: "12px", px: 1.5, py: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.5, width: "44%" }}>
              <input
                type="tel" inputMode="decimal"
                value={grams}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, "");
                  const parts = val.split(".");
                  if (parts.length > 2) return;
                  if (parts[1] && parts[1].length > 3) return;
                  setGrams(val);
                }}
                style={{ ...inputStyle, textAlign: "right" }}
              />
              <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#374151", flexShrink: 0 }}>gm</Typography>
            </Box>
            <Typography sx={{ fontSize: 17, fontWeight: 600, color: "#111" }}>
              = ₹{rupFromGms > 0 ? inr(rupFromGms) : "0.00"}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 12, color: "#6b7280", mb: 2 }}>3% GST will be applicable at the time of delivery</Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#374151", mb: 1 }}>Popular Buying Options</Typography>
         <Box
  sx={{
    display: "flex",
    gap: 1,
    mb: 2.5,
    overflowX: "auto",        // ✅ horizontal scroll
    whiteSpace: "nowrap",     // ✅ keep in one line
    pb: 0.5,
    "&::-webkit-scrollbar": { display: "none" }, // hide scrollbar
  }}
>
            {(isGold ? POPULAR_GRAMS : POPULAR_S_GRAMS).map((gm) => (
              
              <Chip
                key={gm} label={`${gm} gm`}
                onClick={() => setGrams(String(gm))}
                sx={{
                   flexShrink: 0, 
                  fontWeight: 600, fontSize: 13, height: 36, borderRadius: "10px",
                  backgroundColor: grams === String(gm) ? accent : "#f3f4f6",
                  color: grams === String(gm) ? "#fff" : "#374151",
                  border: "none", "&:hover": { opacity: 0.85 },
                }}
              />
            ))}
          </Box>
          {/* Payment History Section - Only show for enrolled members */}
{alreadyEnrolled && enrolledMember && enrolledMember.amountPaid > 0&& (
  <MuiButton
    fullWidth
  // disableRipple
  onClick={() => setHistoryDrawerOpen(true)}
  sx={{
    color: accent,
    fontWeight: 600,
    textTransform: "none",
    // backgroundColor: "transparent",
    // "&:hover": { backgroundColor: "transparent" },
    // "&:active": { backgroundColor: "transparent" },
    // "&:focus": { backgroundColor: "transparent" },
  }}
  >
   <HistoryIcon/> View Payment History
  </MuiButton>
)}
        </Box>
      )}

      {/* ── Sticky Proceed button ─────────────────────────────────────────────── */}
      <Box sx={{ position: "fixed", left: 0, right: 0, bottom:72, px: 2, py: 1, zIndex: 100 }}>
        <Button
  fullWidth variant="contained"
  disabled={loginRole !== "guest" && !canProceed}
  onClick={loginRole === "guest" ? () => navigate("/login") : handleProceed}
  sx={{
    height: 52, borderRadius: "30px", fontSize: 16, fontWeight: 700,
    textTransform: "none",
    backgroundColor: loginRole === "guest" ? "#374151" : accent,
    boxShadow: "none",
    "&:hover": {
      backgroundColor: loginRole === "guest" ? "#374151" : accent,
      opacity: 0.92, boxShadow: "none",
    },
    "&.Mui-disabled": { backgroundColor: "#d1d5db", color: "#fff" },
    color: "#fff",
  }}
>
  {loginRole === "guest" ? "Login to pay" : "Continue to Payment"}
</Button>
      </Box>

      
      {/* ── Large Amount Warning Dialog ─────────────────────────────────── */}
<Dialog
  open={largeAmountDialog}
  onClose={() => setLargeAmountDialog(false)}
  PaperProps={{
    sx: {
      borderRadius: 4,
      backgroundColor: "rgba(255,255,255,0.9)",
      backdropFilter: "blur(12px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      width: "88%", maxWidth: 340,
      px: 1,
    }
  }}
  slotProps={{
    backdrop: {
      sx: { backgroundColor: "rgba(0,0,0,0.35)" }
    }
  }}
>
  <DialogContent sx={{ pt: 3, pb: 2, textAlign: "center" }}>
    
    {/* Icon */}
    <Box sx={{
      width: 56, height: 56, borderRadius: "50%",
      backgroundColor: isGold ? "#fef3c7" : "#f1f5f9",
      display: "flex", alignItems: "center", justifyContent: "center",
      margin: "0 auto 16px",
    }}>
      <Typography sx={{ fontSize: 26 }}>
        ⚠️
      </Typography>
    </Box>

    {/* Title */}
    <Typography sx={{ fontWeight: 700, fontSize: 16, color: "#111", mb: 1 }}>
      Amount Too Large
    </Typography>

    {/* Message */}
    <Typography sx={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>
      Purchases above{" "}
      <span style={{ fontWeight: 700, color: accent }}>
        ₹1,00,000
      </span>{" "}
      are not allowed in this step.
      <br /><br />
      Please enter a smaller amount to continue.
    </Typography>
  </DialogContent>

  <DialogActions sx={{ px: 2, pb: 3 }}>
    <Button
      fullWidth
      variant="contained"
      onClick={() => setLargeAmountDialog(false)}
      sx={{
        height: 44,
        borderRadius: "12px",
        fontWeight: 700,
        fontSize: 14,
        textTransform: "none",
        backgroundColor: accent,
        boxShadow: "none",
        "&:hover": { backgroundColor: accent, opacity: 0.9, boxShadow: "none" },
      }}
    >
      OK
    </Button>
  </DialogActions>
</Dialog>
{/* Payment History Bottom Drawer */}
<Drawer
  anchor="bottom"
  open={historyDrawerOpen}
  onClose={() => setHistoryDrawerOpen(false)}
  transitionDuration={{ enter: 300, exit: 250 }}
  PaperProps={{
    sx: {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      backgroundColor:"white",
      maxHeight: "85vh",
      overflow: "hidden",
    },
  }}
>
  <Box sx={{ p: 2, pb: 4 }}>
  <Box sx={{ display: "flex", justifyContent: "center", pt: 1 }}>
  <Box
    sx={{
      width: 190,
      height: 4,
      bgcolor: "#cbd5e1",
      borderRadius: 4,
    }}
  />
</Box>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
      <Typography variant="h6" fontWeight={700}>
        Payment History 
      </Typography>
     {alreadyEnrolled && enrolledMember &&( <Typography
  sx={{
    display: "inline-block",
    fontSize: 11,
    // color: accent,
    fontWeight: 600,
    // fontVariantNumeric: "tabular-nums",
    px: 1.2,              // horizontal padding
    py: 0.3,              // vertical padding
    borderRadius: "999px",// full capsule shape
    backgroundColor: "#d7d7d7fe", // light background (15 = opacity)
    // border: `1px solid ${accent}40`, // subtle border
  }}
>
  {enrolledMember.mgroup} – {enrolledMember.member_no}
</Typography>)}
      <IconButton onClick={() => setHistoryDrawerOpen(false)}>
        <CloseIcon />
      </IconButton>
    </Box>
    <Divider sx={{ mb: 2 }} />
    <Box sx={{ maxHeight: "calc(85vh - 80px)", overflowY: "auto" }}>
      <PaymentHistory
        scheme={scheme}
        userInfo={enrolledMember}
        enrolledMember={enrolledMember}
      />
    </Box>
  </Box>
</Drawer>
    </Box>
  );
}