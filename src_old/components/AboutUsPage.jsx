// src/components/AboutUsPage.jsx
import React, { useEffect, useState, useContext } from "react";
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Divider,
  CircularProgress,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { Capacitor } from "@capacitor/core";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import APP_CONFIG from "../config/constants";
import { useSafeAreaTop } from "../SafeAreaFile";

const ABOUT_MATCH_KEY = "about us";

// ─── Parse inline HTML tags: <b>, <strong>, <i>, <em>, <u> ───────────────────
function RichText({ text, baseSize = "0.875rem" }) {
  if (!text) return null;

  const parts = [];
  const regex = /<(b|strong|i|em|u)>([\s\S]*?)<\/\1>/gi;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "plain", value: text.slice(lastIndex, match.index) });
    }
    const tag = match[1].toLowerCase();
    parts.push({
      type:
        tag === "b" || tag === "strong"
          ? "bold"
          : tag === "i" || tag === "em"
          ? "italic"
          : "underline",
      value: match[2],
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "plain", value: text.slice(lastIndex) });
  }

  return (
    <Typography
      variant="body2"
      component="div"
      color="text.secondary"
      sx={{
        lineHeight: 1.75,
        fontSize: baseSize,
        whiteSpace: "pre-line",
        mb: 1,
      }}
    >
      {parts.map((p, i) => {
        if (p.type === "bold") return <strong key={i}>{p.value}</strong>;
        if (p.type === "italic") return <em key={i}>{p.value}</em>;
        if (p.type === "underline") return <u key={i}>{p.value}</u>;
        return <span key={i}>{p.value}</span>;
      })}
    </Typography>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function AboutUsPage({ open, onClose }) {
  const topInset = useSafeAreaTop();

  const { adminUser } = useContext(AuthContext);
  const storeID = APP_CONFIG.STORE_ID;
  const branchID = adminUser?.branch;

  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    fetchAboutUs();
  }, [open]);

  const fetchAboutUs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/policies/${storeID}`,
        { params: { branch_id: branchID } },
      );
      if (res.data.success) {
        const group = res.data.data.find((d) =>
          d.policy_type.trim().toLowerCase().includes(ABOUT_MATCH_KEY),
        );
        setSections(group ? group.subPolicies : []);
      } else {
        setError("Failed to load About Us.");
      }
    } catch {
      setError("Failed to load About Us.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      sx={{
        zIndex: 10000,
        paddingTop: topInset,
        "& .MuiDialog-paper": { zIndex: 10000, backgroundColor: "#fff" },
      }}
    >
      {/* ── Top Bar ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 1,
          py: 1,
          borderBottom: "1px solid #e0e0e0",
          backgroundColor: "#fff",
          minHeight: 48,
          position: "sticky",
          top: 0,
          zIndex: 1,
        }}
      >
        <IconButton onClick={onClose} size="small">
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
        <Typography
          sx={{
            flex: 1,
            textAlign: "center",
            fontWeight: 700,
            fontSize: "1rem",
            ml: -4,
          }}
        >
          About Us
        </Typography>
      </Box>

      {/* ── Scrollable Content ── */}
      <Box sx={{ overflowY: "auto", px: 3, py: 2, pb: 6 }}>
        {/* Loading */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <CircularProgress size={28} sx={{ color: "#000" }} />
          </Box>
        )}

        {/* Error */}
        {!loading && error && (
          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Typography sx={{ fontSize: "0.82rem", color: "#888" }}>
              {error}
            </Typography>
          </Box>
        )}

        {/* Empty state */}
        {!loading && !error && sections.length === 0 && (
          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Typography sx={{ fontSize: "0.82rem", color: "#aaa" }}>
              No information available at the moment.
            </Typography>
          </Box>
        )}

        {/* Sections — title as h6 heading, content with rich text */}
        {!loading &&
          !error &&
          sections.map((s, i) => (
            <Box key={s.id ?? i}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {s.title}
              </Typography>

              <RichText text={s.content} />

              {i < sections.length - 1 && <Divider sx={{ my: 2 }} />}
            </Box>
          ))}
      </Box>
    </Dialog>
  );
}

export default AboutUsPage;
