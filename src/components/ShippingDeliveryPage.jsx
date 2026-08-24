// src/components/ShippingDeliveryPage.jsx
import React, { useState } from "react";
import { Dialog, Box, Typography, IconButton } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { Capacitor } from "@capacitor/core";
import { useSafeAreaTop } from "../SafeAreaFile";

const sections = [
  {
    emoji: "🏪",
    title: "Collection of Jewellery",
    content: `All jewellery and gold accumulated through your savings scheme can be collected physically from our store located at:

Diamond Talkies Road, OPP. PCR Complex,
Chintamani - 563 125,
Karnataka, India.

Please carry a valid government-issued photo ID and your scheme details at the time of collection.`,
  },

  {
    emoji: "📞",
    title: "Contact Before Visit",
    content: `To schedule your jewellery collection or for any queries regarding your scheme, please contact us:

📞 +91 81542 52379
📞 +91 99454 30961
📧 namasrinivasajewellers@gmail.com

Our team will confirm the availability and guide you through the collection process.`,
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

function ShippingDeliveryPage({ open, onClose }) {
  const topInset = useSafeAreaTop();
  const isIOS = Capacitor.getPlatform() === "ios";

  return (
    <Dialog fullScreen open={open} onClose={onClose}
      sx={{ zIndex: 10000,paddingTop:topInset, "& .MuiDialog-paper": { zIndex: 10000, backgroundColor: "#faf8f4" } }}>
      <Box sx={{
        display: "flex", alignItems: "center", px: 1.5, pb: 1.5,
        // pt: isIOS ? `calc(${topInset} + 8px)` : "12px",
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2410 100%)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <IconButton onClick={onClose} size="small" sx={{ color: "#fff" }}>
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
        <Box sx={{ flex: 1, textAlign: "center", ml: -4 }}>
          <Typography sx={{ fontWeight: 800, fontSize: "1rem", color: "#fff", letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Shipping & Delivery
          </Typography>
          <Typography sx={{ fontSize: "0.65rem", color: "#C9A84C", mt: 0.2 }}>Nama Srinivasa Jewellers</Typography>
        </Box>
      </Box>

      <Box sx={{ overflowY: "auto", px: 2, pt: 2.5, pb: 6, flex: 1 }}>
        {sections.map((s, i) => <SectionCard key={i} index={i} {...s} />)}
        
      </Box>
    </Dialog>
  );
}

export default ShippingDeliveryPage;