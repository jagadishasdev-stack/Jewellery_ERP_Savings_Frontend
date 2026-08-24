// src/components/RefundPolicyPage.jsx
import React, { useState } from "react";
import { Dialog, Box, Typography, IconButton } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { Capacitor } from "@capacitor/core";
import { useSafeAreaTop } from "../SafeAreaFile";

const sections = [
  {
    emoji: "❌",
    title: "Cancellation Policy",
    content: `If you are not satisfied with your savings scheme, Nama Srinivasa Jewellers allows you to cancel your scheme before it has been completed.

To cancel, please contact us with your reason for cancellation. Nama Srinivasa Jewellers will review and approve your request based on valid reasons.

Once approved, your entire paid scheme amount will be refunded.`,
  },
  {
    emoji: "🔄",
    title: "Refund on Scheme Amount",
    content: `In case your scheme cancellation has been approved, your refund will be processed within 7 working days.

Refunds will be credited back to the original payment method used at the time of scheme enrollment.

Any applicable deductions as per scheme terms will be communicated to you before processing.`,
  },
  {
    emoji: "💳",
    title: "Credit Card Refunds",
    content: `If payment was made via credit card, the refund amount will be re-credited to the same credit card account by Nama Srinivasa Jewellers.

The refund amount will be credited within the time span stipulated by the bank which issued the credit card.

Please allow additional processing time as per your bank's standard refund policy.`,
  },
  {
    emoji: "🏦",
    title: "Bank / Wire Transfer Refunds",
    content: `If payment was made via UPI, net banking, cheque, or wire transfer, the refund amount will be deposited into the original bank account within seven (7) business days after receipt of an approved cancellation request.

Please ensure your bank account details are accurate to avoid any delays in processing.`,
  },
  {
    emoji: "📞",
    title: "Contact for Cancellation & Refunds",
    content: `For any cancellation or refund queries related to your savings scheme, please contact us:

📞 +91 81542 52379
📞 +91 99454 30961
📧 namasrinivasajewellers@gmail.com

Our team will guide you and ensure a smooth refund experience.`,
  },
];

function SectionCard({ emoji, title, content, index }) {
  const [expanded, setExpanded] = useState(false);
  const preview = content.slice(0, 120) + "...";

  return (
    <Box
      onClick={() => setExpanded((p) => !p)}
      sx={{
        mb: 2, borderRadius: "16px", border: "1px solid",
        borderColor: expanded ? "#C9A84C" : "#f0ece4",
        backgroundColor: expanded ? "#fffdf7" : "#fff",
        overflow: "hidden", cursor: "pointer", transition: "all 0.25s ease",
        boxShadow: expanded ? "0 4px 20px rgba(201,168,76,0.15)" : "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.8 }}>
        <Box sx={{
          width: 28, height: 28, borderRadius: "50%",
          backgroundColor: expanded ? "#C9A84C" : "#f5f0e8",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, transition: "background 0.25s",
        }}>
          <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, color: expanded ? "#fff" : "#C9A84C", lineHeight: 1 }}>
            {String(index + 1).padStart(2, "0")}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, color: "#1a1a1a", flex: 1, letterSpacing: "0.01em" }}>
          {emoji} {title}
        </Typography>
        <Box sx={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s ease", color: "#C9A84C", fontSize: "0.8rem", lineHeight: 1 }}>▾</Box>
      </Box>
      {expanded && <Box sx={{ height: "1px", backgroundColor: "#f0ece4", mx: 2 }} />}
      <Box sx={{ px: 2, overflow: "hidden", maxHeight: expanded ? "1000px" : "0px", transition: "max-height 0.35s ease" }}>
        <Typography variant="body2" sx={{ color: "#555", lineHeight: 1.75, fontSize: "0.82rem", whiteSpace: "pre-line", py: 1.5 }}>
          {content}
        </Typography>
      </Box>
      {!expanded && (
        <Typography sx={{ px: 2, pb: 1.5, fontSize: "0.75rem", color: "#aaa", lineHeight: 1.5 }}>{preview}</Typography>
      )}
    </Box>
  );
}

function RefundPolicyPage({ open, onClose }) {
  const topInset = useSafeAreaTop();
  const isIOS = Capacitor.getPlatform() === "ios";

  return (
    <Dialog fullScreen open={open} onClose={onClose}
      sx={{ zIndex: 10000, paddingTop: topInset, "& .MuiDialog-paper": { zIndex: 10000, backgroundColor: "#faf8f4" } }}>

      {/* ── Header ── */}
      <Box sx={{
        display: "flex", alignItems: "center", px: 1.5, pb: 1.5,pt:1,
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2410 100%)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <IconButton onClick={onClose} size="small" sx={{ color: "#fff" }}>
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
        <Box sx={{ flex: 1, textAlign: "center", ml: -4,  }}>
          <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "#fff", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Cancellation & Refund
          </Typography>
        </Box>
      </Box>

      {/* ── Banner ── */}
      <Box sx={{ background: "linear-gradient(135deg, #1a1a1a 0%, #2d2410 100%)", px: 3, pt: 1, pb: 3 }}>
        <Box sx={{ backgroundColor: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: "12px", p: 2, display: "flex", gap: 1.5, alignItems: "flex-start" }}>
          <Typography sx={{ fontSize: "1.4rem", lineHeight: 1 }}>💰</Typography>
          <Box>
            <Typography sx={{ fontSize: "0.8rem", color: "#C9A84C", fontWeight: 700, mb: 0.3 }}>
              Scheme Cancellation & Refund Policy
            </Typography>
            <Typography sx={{ fontSize: "0.72rem", color: "#ccc", lineHeight: 1.5 }}>
              This app offers jewellery savings scheme services. Cancellation and refund terms apply to scheme payments only. Tap any section for details.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Sections ── */}
      <Box sx={{ overflowY: "auto", px: 2, pt: 2.5, pb: 6, flex: 1 }}>
        {sections.map((s, i) => <SectionCard key={i} index={i} {...s} />)}

        {/* ── Footer ── */}
        <Box sx={{ mt: 2, borderRadius: "16px", background: "linear-gradient(135deg, #1a1a1a 0%, #2d2410 100%)", p: 2.5, textAlign: "center" }}>
          <Typography sx={{ fontSize: "0.75rem", color: "#C9A84C", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", mb: 0.8 }}>
            ✦ Our Commitment
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "#ddd", lineHeight: 1.6 }}>
            We are committed to making your jewellery savings scheme experience smooth and transparent.
          </Typography>
          <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
            <Box sx={{ width: 40, height: "1px", backgroundColor: "rgba(201,168,76,0.4)" }} />
            <Typography sx={{ fontSize: "0.7rem", color: "#C9A84C" }}>Nama Srinivasa Jewellers</Typography>
            <Box sx={{ width: 40, height: "1px", backgroundColor: "rgba(201,168,76,0.4)" }} />
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}

export default RefundPolicyPage;