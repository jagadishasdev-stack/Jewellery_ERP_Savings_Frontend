// src/components/TermsPage.jsx
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

// const TERMS_MATCH_KEY = "term & condition";
const TERMS_MATCH_KEY = "term";

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
      sx={{
        color: "#555",
        lineHeight: 1.8,
        fontSize: baseSize,
        whiteSpace: "pre-line",
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

// ─── Section Card — expandable ────────────────────────────────────────────────
function SectionCard({ title, content, index }) {
  const [expanded, setExpanded] = useState(false);
  const preview =
    content.replace(/<[^>]+>/g, "").slice(0, 110) + "…";

  return (
    <Box
      onClick={() => setExpanded((p) => !p)}
      sx={{
        mb: 2,
        borderRadius: "16px",
        border: "1px solid",
        borderColor: expanded ? "#C9A84C" : "#f0ece4",
        backgroundColor: expanded ? "#fffdf7" : "#fff",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.25s ease",
        boxShadow: expanded
          ? "0 4px 20px rgba(201,168,76,0.15)"
          : "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {/* Card Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1.8,
        }}
      >
        {/* Number badge */}
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            backgroundColor: expanded ? "#C9A84C" : "#f5f0e8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "background 0.25s",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.65rem",
              fontWeight: 700,
              color: expanded ? "#fff" : "#C9A84C",
              lineHeight: 1,
            }}
          >
            {String(index + 1).padStart(2, "0")}
          </Typography>
        </Box>

        <Typography
          sx={{
            fontSize: "0.9rem",
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
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s ease",
            color: "#C9A84C",
            fontSize: "0.8rem",
            lineHeight: 1,
          }}
        >
          ▾
        </Box>
      </Box>

      {/* Divider */}
      {expanded && (
        <Box sx={{ height: "1px", backgroundColor: "#f0ece4", mx: 2 }} />
      )}

      {/* Expanded Content */}
      <Box
        sx={{
          px: 2,
          overflow: "hidden",
          maxHeight: expanded ? "2000px" : "0px",
          transition: "max-height 0.35s ease",
        }}
      >
        <Box sx={{ py: 1.5 }}>
          <RichText text={content} />
        </Box>
      </Box>

      {/* Collapsed preview */}
      {!expanded && (
        <Typography
          sx={{
            px: 2,
            pb: 1.5,
            fontSize: "0.75rem",
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

// ─── Main Component ───────────────────────────────────────────────────────────
function TermsPage({ open, onClose }) {
  const topInset = useSafeAreaTop();

  const { adminUser } = useContext(AuthContext);
  const storeID  = APP_CONFIG.STORE_ID;
  const branchID = adminUser?.branch;

  const [sections, setSections] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (!open) return;
    fetchTerms();
  }, [open]);

  const fetchTerms = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/policies/${storeID}`,
        { params: { branch_id: branchID } },
      );
      if (res.data.success) {
        const group = res.data.data.find((d) =>
          d.policy_type.trim().toLowerCase().includes(TERMS_MATCH_KEY),
        );
        setSections(group ? group.subPolicies : []);
      } else {
        setError("Failed to load terms.");
      }
    } catch {
      setError("Failed to load terms.");
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
        paddingTop: topInset,
        zIndex: 10000,
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
          pt:1.5,
          pb: 1.5,
          background: "linear-gradient(135deg, #1a1a1a 0%, #2d2410 100%)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <IconButton onClick={onClose} size="small" sx={{ color: "#fff" }}>
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
        <Box sx={{ flex: 1, textAlign: "center", ml: -4}}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: "1rem",
              color: "#fff",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Terms & Conditions
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
          <Typography sx={{ fontSize: "1.4rem", lineHeight: 1 }}>📋</Typography>
          <Box>
            <Typography
              sx={{
                fontSize: "0.8rem",
                color: "#C9A84C",
                fontWeight: 700,
                mb: 0.3,
              }}
            >
              Please Read Carefully
            </Typography>
            <Typography
              sx={{ fontSize: "0.72rem", color: "#ccc", lineHeight: 1.5 }}
            >
              By using our app, you agree to these terms. Tap any section to
              read the full details.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Scrollable Sections ── */}
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

        {/* Empty state */}
        {!loading && !error && sections.length === 0 && (
          <Box sx={{ textAlign: "center", mt: 6 }}>
            <Typography sx={{ fontSize: "0.82rem", color: "#aaa" }}>
              No terms available at the moment.
            </Typography>
          </Box>
        )}

        {/* Cards */}
        {!loading &&
          !error &&
          sections.map((s, i) => (
            <SectionCard
              key={s.id ?? i}
              index={i}
              title={s.title}
              content={s.content}
            />
          ))}

        {/* ── Agreement Footer ── */}
        {!loading && !error && sections.length > 0 && (
          <Box
            sx={{
              mt: 2,
              borderRadius: "16px",
              background:
                "linear-gradient(135deg, #1a1a1a 0%, #2d2410 100%)",
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
              ✦ Agreement
            </Typography>
            <Typography
              sx={{ fontSize: "0.75rem", color: "#ddd", lineHeight: 1.6 }}
            >
              I have read the Terms of Use and agree to all of the provisions
              contained above.
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
              <Box
                sx={{
                  width: 40,
                  height: "1px",
                  backgroundColor: "rgba(201,168,76,0.4)",
                }}
              />
             
            </Box>
          </Box>
        )}
      </Box>
    </Dialog>
  );
}

export default TermsPage;