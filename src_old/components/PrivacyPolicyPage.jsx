// src/components/PrivacyPolicyPage.jsx
import React, { useEffect, useState, useContext } from "react";
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { Capacitor } from "@capacitor/core";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import APP_CONFIG from "../config/constants";
import { useSafeAreaTop } from "../SafeAreaFile";

// ─── Policy tab definitions ───────────────────────────────────────────────────
const POLICY_TABS = [
  { id: "privacy",  matchKey: "privacy policy",         displayTitle: "Privacy Policy",           emoji: "🔒" },
  { id: "return",   matchKey: "return & refund policy",  displayTitle: "Return & Refund Policy",    emoji: "↩️" },
  { id: "shipping", matchKey: "shipping policy",         displayTitle: "Shipping & Delivery Policy", emoji: "🚚" },
];

// ─── Parse inline HTML tags: <b>, <strong>, <i>, <em>, <u> ───────────────────
function RichText({ text, baseSize = "0.82rem" }) {
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
        tag === "b" || tag === "strong" ? "bold"
        : tag === "i" || tag === "em"   ? "italic"
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
      sx={{
        color: "#555",
        lineHeight: 1.8,
        fontSize: baseSize,
        whiteSpace: "pre-line",
      }}
    >
      {parts.map((p, i) => {
        if (p.type === "bold")      return <strong key={i}>{p.value}</strong>;
        if (p.type === "italic")    return <em key={i}>{p.value}</em>;
        if (p.type === "underline") return <u key={i}>{p.value}</u>;
        return <span key={i}>{p.value}</span>;
      })}
    </Typography>
  );
}

// ─── Inner sub-section card ───────────────────────────────────────────────────
function SubCard({ title, content, index }) {
  const [open, setOpen] = useState(false);
  const preview = content.replace(/<[^>]+>/g, "").slice(0, 100) + "…";

  return (
    <Box
      onClick={() => setOpen((p) => !p)}
      sx={{
        mb: 1.5,
        borderRadius: "12px",
        border: "1px solid",
        borderColor: open ? "#C9A84C" : "#f0ece4",
        backgroundColor: open ? "#fffdf7" : "#fff",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.22s ease",
        boxShadow: open
          ? "0 3px 14px rgba(201,168,76,0.15)"
          : "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Header row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.2,
          px: 1.8,
          py: 1.4,
        }}
      >
        {/* Number badge */}
        <Box
          sx={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            backgroundColor: open ? "#C9A84C" : "#f5f0e8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.22s",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.6rem",
              fontWeight: 800,
              color: open ? "#fff" : "#C9A84C",
              lineHeight: 1,
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </Typography>
        </Box>

        <Typography
          sx={{
            fontSize: "0.85rem",
            fontWeight: 700,
            color: "#1a1a1a",
            flex: 1,
            letterSpacing: "0.01em",
          }}
        >
          {title}
        </Typography>

        {/* Chevron */}
        <Box
          sx={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.22s ease",
            color: "#C9A84C",
            fontSize: "0.8rem",
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          ▾
        </Box>
      </Box>

      {/* Divider when open */}
      {open && (
        <Box sx={{ height: "1px", backgroundColor: "#f0ece4", mx: 1.8 }} />
      )}

      {/* Expanded content */}
      <Box
        sx={{
          px: 1.8,
          overflow: "hidden",
          maxHeight: open ? "2000px" : "0px",
          transition: "max-height 0.35s ease",
        }}
      >
        <Box sx={{ py: 1.4 }}>
          <RichText text={content} />
        </Box>
      </Box>

      {/* Collapsed preview */}
      {!open && (
        <Typography
          sx={{
            px: 1.8,
            pb: 1.2,
            fontSize: "0.72rem",
            color: "#aaa",
            lineHeight: 1.5,
          }}
        >
          {preview}
        </Typography>
      )}
    </Box>
  );
}

// ─── Outer policy-type group card ─────────────────────────────────────────────
function PolicyGroupCard({ tab, sections }) {
  const [open, setOpen] = useState(false);

  return (
    <Box
      sx={{
        mb: 2,
        borderRadius: "16px",
        // border: "1px solid",
        // borderColor: open ? "#C9A84C" : "#f0ece4",
        backgroundColor: open ? "#fffdf7" : "#fff",
        overflow: "hidden",
        boxShadow: open
          ? "0 4px 20px rgba(201,168,76,0.15)"
          : "0 1px 4px rgba(0,0,0,0.06)",
        transition: "all 0.25s ease",
      }}
    >
      {/* Outer header */}
      <Box
        onClick={() => setOpen((p) => !p)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1.8,
          cursor: "pointer",
          background: open
            ? "linear-gradient(135deg, #1a1a1a 0%, #2d2410 100%)"
            : "#fff",
          transition: "background 0.25s",
        }}
      >
        <Typography sx={{ fontSize: "1.2rem", lineHeight: 1 }}>
          {tab.emoji}
        </Typography>
        <Typography
          sx={{
            fontSize: "0.92rem",
            fontWeight: 800,
            color: open ? "#C9A84C" : "#1a1a1a",
            flex: 1,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
            transition: "color 0.25s",
          }}
        >
          {tab.displayTitle}
        </Typography>
        <Box
          sx={{
            fontSize: "0.78rem",
            color: open ? "#C9A84C" : "#999",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s ease, color 0.25s",
          }}
        >
          ▾
        </Box>
      </Box>

      {/* Thin gold divider when open */}
      {open && (
        <Box
          sx={{
            height: "1px",
            background: "rgba(201,168,76,0.3)",
            mx: 2,
          }}
        />
      )}

      {/* Inner sub-cards */}
      <Box
        sx={{
          overflow: "hidden",
          maxHeight: open ? "9999px" : "0px",
          transition: "max-height 0.4s ease",
        }}
      >
        <Box sx={{ px: 1.5, pt: 1.5, pb: 1.5 }}>
          {sections.map((s, i) => (
            <SubCard
              key={s.id ?? i}
              index={i}
              title={s.title}
              content={s.content}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

// ─── PAGE COMPONENT ───────────────────────────────────────────────────────────
function PrivacyPolicyPage({ open, onClose }) {
  const topInset = useSafeAreaTop();

  const { adminUser } = useContext(AuthContext);
  const storeID  = APP_CONFIG.STORE_ID;
  const branchID = adminUser?.branch;

  const [policies, setPolicies] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (!open) return;
    fetchPolicies();
  }, [open]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/policies/${storeID}`,
        { params: { branch_id: branchID } },
      );
      if (res.data.success) {
        setPolicies(res.data.data);
      } else {
        setError("Failed to load policies.");
      }
    } catch {
      setError("Failed to load policies.");
    } finally {
      setLoading(false);
    }
  };

const getSectionsFor = (matchKey) => {
  const myFirstWord = matchKey.split(" ")[0]; // "return" from your POLICY_TABS

  const group = policies.find((d) => {
    const type = d.policy_type.trim().toLowerCase();
    const dbFirstWord = type.split(" ")[0]; // "return" from "return policy" in DB

    return (
      type === matchKey ||          // full match:  "return & refund policy" === "return & refund policy"
      dbFirstWord === myFirstWord   // first word:  "return" === "return"
    );
  });

  return group ? group.subPolicies : [];
};

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      sx={{
        zIndex: 10000,
        paddingTop: topInset,
        "& .MuiDialog-paper": {
          zIndex: 10000,
          backgroundColor: "#faf8f4",
        },
      }}
    >
      {/* ── Top Bar ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          px: 1.5,
          pb: 1.5,
           pt:1.5,
          background: "linear-gradient(135deg, #1a1a1a 0%, #2d2410 100%)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <IconButton onClick={onClose} size="small" sx={{ color: "#fff" }}>
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
        <Box sx={{ flex: 1, textAlign: "center", ml: -4 }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: "1rem",
              color: "#fff",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Policies
          </Typography>
        </Box>
      </Box>

      {/* ── Hero Banner ── */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2d2410 100%)",
          px: 3,
          pt: 1,
          pb: 3,
        }}
      >
        <Box
          sx={{
            backgroundColor: "rgba(201,168,76,0.12)",
            border: "1px solid rgba(201,168,76,0.3)",
            borderRadius: "12px",
            p: 2,
            display: "flex",
            gap: 1.5,
            alignItems: "flex-start",
          }}
        >
          <Typography sx={{ fontSize: "1.4rem", lineHeight: 1 }}>🛡️</Typography>
          <Box>
            <Typography
              sx={{
                fontSize: "0.8rem",
                color: "#C9A84C",
                fontWeight: 700,
                mb: 0.3,
              }}
            >
              Your Privacy Matters
            </Typography>
            <Typography
              sx={{ fontSize: "0.72rem", color: "#ccc", lineHeight: 1.5 }}
            >
              Tap any section to read our full policies .
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Scrollable Content ── */}
      <Box
        sx={{
          overflowY: "auto",
          px: 2,
          pt: 2.5,
          pb: 6,
          flex: 1,
        }}
      >
        {/* Loading */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <CircularProgress size={28} sx={{ color: "#C9A84C" }} />
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

        {/* Policy group cards */}
        {!loading &&
          !error &&
          POLICY_TABS.map((tab) => {
            const sections = getSectionsFor(tab.matchKey);
            if (sections.length === 0) return null;
            return (
              <PolicyGroupCard key={tab.id} tab={tab} sections={sections} />
            );
          })}

        {/* Footer */}
        {!loading && !error && policies.length > 0 && (
          <Box
            sx={{
              mt: 2,
              borderRadius: "16px",
              background: "linear-gradient(135deg, #1a1a1a 0%, #2d2410 100%)",
              p: 2.5,
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: "#C9A84C",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                mb: 0.8,
              }}
            >
              ✦ Our Commitment
            </Typography>
            <Typography
              sx={{ fontSize: "0.72rem", color: "#ddd", lineHeight: 1.6 }}
            >
              We are committed to keeping your data safe. Your trust is our
              highest priority.
            </Typography>
            <Box
              sx={{
                mt: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
            </Box>
          </Box>
        )}
      </Box>
    </Dialog>
  );
}

export default PrivacyPolicyPage;