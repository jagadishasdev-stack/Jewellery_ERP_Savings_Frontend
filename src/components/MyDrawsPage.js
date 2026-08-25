import React, { useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Skeleton,
  Alert,
  Chip,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import RefreshIcon from "@mui/icons-material/Refresh";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import { AuthContext } from "../contexts/AuthContext";
import APP_CONFIG from "../config/constants";
import FallbackScreen from "./FallbackScreen";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function DrawCardSkeleton() {
  return (
    <Card elevation={0} sx={{ mb: 1.5, borderRadius: 3, border: "1px solid #F0F0F0" }}>
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Skeleton variant="circular" width={44} height={44} />
          <Box flex={1}>
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="40%" height={16} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function DrawCard({ draw }) {
  const { Draw_Name, Draw_Type, Draw_Date, Prize_Type, Prize_Value, Prize_Description } = draw;
  const prizeValueNum = parseFloat(Prize_Value) || 0;

  return (
    <Card
      elevation={0}
      sx={{
        mb: 1.5,
        borderRadius: 3,
        border: "1px solid #f5c542",
        overflow: "hidden",
        background: "linear-gradient(135deg, #fff8e1, #ffffff)",
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={1.5}>
          <Box minWidth={0} display="flex" alignItems="center" gap={1}>
            <EmojiEventsIcon sx={{ color: "#f5a623", fontSize: 30 }} />
            <Box minWidth={0}>
              <Typography variant="subtitle1" fontWeight={700} fontSize={16} color="#1A1A2E" noWrap>
                {Draw_Name || "Lucky Draw"}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontSize={11}>
                {formatDate(Draw_Date)}
              </Typography>
            </Box>
          </Box>
          {Draw_Type && (
            <Chip
              label={Draw_Type}
              size="small"
              sx={{ backgroundColor: "#fff3cd", color: "#8a6d00", fontWeight: 600, fontSize: 11 }}
            />
          )}
        </Box>

        <Box mt={1.5} display="flex" alignItems="center" gap={1}>
          <CardGiftcardIcon sx={{ fontSize: 18, color: "#e65100" }} />
          <Typography fontWeight={800} fontSize={16} color="#e65100">
            {Prize_Type === "Cash" && prizeValueNum > 0
              ? `₹${prizeValueNum.toLocaleString("en-IN")}`
              : Prize_Description || Prize_Type || "Prize"}
          </Typography>
        </Box>
        {Prize_Description && Prize_Type === "Cash" && (
          <Typography variant="caption" color="text.secondary" fontSize={12} sx={{ ml: 3.5 }}>
            {Prize_Description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function MyDrawsPage() {
  const { adminUser, loginRole } = useContext(AuthContext);
  const [draws, setDraws] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDraws = useCallback(
    async (silent = false) => {
      if (!adminUser?.mobile) {
        setLoading(false);
        return;
      }
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError(null);
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/core/myDraws`,
          {
            params: {
              store_id: adminUser.store_id || APP_CONFIG.TENANT_ID,
              mobile: adminUser.mobile,
            },
          },
        );
        setDraws(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("myDraws fetch error:", err);
        setError(err.response?.data?.error || err.message || "Failed to load your draws.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [adminUser],
  );

  useEffect(() => {
    fetchDraws();
  }, [fetchDraws]);

  if (loginRole === "guest") {
    return (
      <FallbackScreen
        open={true}
        message={
          <>
            Don't remain a guest forever
            <br />
            Log in to see your Lucky Draw wins
          </>
        }
        redirectTo="log in"
        redirectToURL="/login"
      />
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        maxWidth: 480,
        mx: "auto",
        position: "relative",
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #F0F0F0",
          color: "#1A1A2E",
        }}
      >
        <Toolbar sx={{ minHeight: 56, px: 2 }}>
          <Typography variant="h6" fontWeight={700} fontSize={18} flex={1}>
            My Lucky Draws
          </Typography>
          <IconButton
            size="small"
            onClick={() => fetchDraws(true)}
            disabled={refreshing || loading}
          >
            <RefreshIcon
              fontSize="small"
              sx={{
                animation: refreshing ? "spin 1s linear infinite" : "none",
                "@keyframes spin": {
                  from: { transform: "rotate(0deg)" },
                  to: { transform: "rotate(360deg)" },
                },
              }}
            />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box flex={1} sx={{ overflowY: "auto", px: 2, pt: 2, pb: 10 }}>
        {loading && [...Array(3)].map((_, i) => <DrawCardSkeleton key={i} />)}

        {error && !loading && (
          <Alert
            severity="error"
            action={
              <IconButton size="small" onClick={() => fetchDraws()}>
                <RefreshIcon fontSize="small" />
              </IconButton>
            }
            sx={{ borderRadius: 2 }}
          >
            {error}
          </Alert>
        )}

        {!loading && !error && draws.length === 0 && (
          <Box textAlign="center" py={8}>
            <EmojiEventsIcon sx={{ fontSize: 56, color: "#E0E0E0", mb: 2 }} />
            <Typography fontWeight={600} color="text.secondary">
              No wins yet
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Keep paying your installments — your Lucky Draw wins will show up here
            </Typography>
          </Box>
        )}

        {!loading && !error && draws.length > 0 && (
          <Box>
            {draws.map((draw) => (
              <DrawCard key={draw.Draw_ID} draw={draw} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
