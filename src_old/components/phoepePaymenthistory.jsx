import React, {
  useState,
  useEffect,
  useContext,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import { StoreContext } from "../contexts/StoreContext";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Avatar,
  Badge,
  Skeleton,
  Stack,
  Fab,
  AppBar,
  Toolbar,
  Container,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  FilterList,
  Close,
  CurrencyRupee,
  CalendarToday,
  Receipt,
  Refresh,
  Groups,
  AttachMoney,
  Straighten,
  LocationOn,
} from "@mui/icons-material";
import BalanceIcon from "@mui/icons-material/Balance";
import APP_CONFIG from "../config/constants";

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatShortDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function LedgerCardSkeleton() {
  return (
    <Card
      elevation={0}
      sx={{ mb: 1.5, borderRadius: 3, border: "1px solid #F0F0F0" }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Skeleton variant="circular" width={44} height={44} />
          <Box flex={1}>
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="40%" height={16} />
          </Box>
          <Skeleton variant="rounded" width={80} height={28} />
        </Box>
        <Box mt={1.5} display="flex" justifyContent="space-between">
          <Skeleton variant="text" width="30%" height={16} />
          <Skeleton variant="text" width="20%" height={16} />
        </Box>
      </CardContent>
    </Card>
  );
}

function LedgerCard({ entry }) {
  const {
    voucher_date,
    amount,
    gross_wt,
    mcode,
    CurInstlCnt,
    CurInstlAmt,
    CurInstlGrs,
    voucher_no,
    name,
    mobile,
    scheme_amount,
    rate,
    branch,
  } = entry;

  const amountNum = parseFloat(amount) || 0;
  const grossWtNum = parseFloat(gross_wt) || 0;
  const cumAmt = parseFloat(CurInstlAmt) || 0;
  const cumGrs = parseFloat(CurInstlGrs) || 0;
  const instCnt = parseInt(CurInstlCnt) || 0;

  return (
    <Card
      elevation={0}
      sx={{
        mb: 1.5,
        borderRadius: 3,
        border: "1px solid #b4acacdd",
        overflow: "hidden",
        transition: "all 0.2s ease",
        "&:active": { transform: "scale(0.98)", opacity: 0.9 },
        background: "#FFFFFF",
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        {/* Top row: icon, mcode, amount */}
        <Box
          display="flex"
          alignItems="flex-start"
          justifyContent={"space-between"}
          gap={1.5}
        >
          <Box minWidth={0}>
            <Box display="flex" alignItems="center" gap={0.5} mb={0.2}>
              <Groups sx={{ fontSize: 14, color: "#5C6BC0" }} />
              <Typography
                variant="subtitle1"
                fontWeight={700}
                fontSize={16}
                color="#1A1A2E"
                noWrap
              >
                {mcode || "—"}
              </Typography>
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              fontSize={11}
              noWrap
            >
              Voucher: {voucher_no}
            </Typography>
          </Box>

          <Box textAlign="right" flexShrink={0}>
            <Typography
              fontWeight={800}
              fontSize={20}
              color="#2E7D32"
              lineHeight={1}
            >
              ₹{amountNum.toLocaleString("en-IN")}
            </Typography>
            {grossWtNum !== 0 && (
              <Typography variant="caption" fontSize={14}>
                <strong>{grossWtNum.toFixed(3)} g</strong>
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 0.25, opacity: 0.5 }} />

        {/* Bottom row */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1}
        >
          <Box display="flex" alignItems="center" gap={0.5}>
            <CalendarToday sx={{ fontSize: 12, color: "#6a6868" }} />
            <Typography variant="caption" fontSize={12}>
              {formatShortDate(voucher_date)}
            </Typography>
          </Box>

          {rate && (
            <Box display="flex" alignItems="center" gap={0.5}>
              <Typography sx={{ fontSize: 13, color: "#4b5563" }}>
                Rate : <strong> ₹ {rate}/gm </strong>
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

function SummaryBar({ data }) {
  const totalAmount = data.reduce(
    (sum, entry) => sum + (parseFloat(entry.amount) || 0),
    0,
  );
  const totalWeight = data.reduce(
    (sum, entry) => sum + (parseFloat(entry.gross_wt) || 0),
    0,
  );

  const transactionCount = data.length;

  return (
    <Paper
      elevation={0}
      sx={{
        mx: 0,
        mb: 2,
        borderRadius: 3,
        border: "1px solid #F0F0F0",
        background: "linear-gradient(135deg, #667EEA15, #764BA215)",
        overflow: "hidden",
      }}
    >
      <Box display="flex" divider={<Divider orientation="vertical" flexItem />}>
        <Box flex={1} textAlign="center" py={1.5}>
          <Typography fontWeight={800} fontSize={18} color="#1565C0">
            ₹{totalAmount.toLocaleString("en-IN")}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontSize={11}>
            Total Investment
          </Typography>
        </Box>
        {totalWeight > 0 && (
          <Box flex={1} textAlign="center" py={1.5}>
            <Typography fontWeight={800} fontSize={18} color="#E65100">
              {totalWeight.toFixed(3)} g
            </Typography>
            <Typography variant="caption" color="text.secondary" fontSize={11}>
              Total Weight
            </Typography>
          </Box>
        )}

        <Box flex={1} textAlign="center" py={1.5}>
          <Typography fontWeight={800} fontSize={18} color="#2E7D32">
            {transactionCount}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontSize={11}>
            Transactions
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default function LedgerHistory() {
  const { adminUser } = useContext(AuthContext);
  const { branches, allPlan } = useContext(StoreContext);

  const [ledgerData, setLedgerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedMcode, setSelectedMcode] = useState("ALL");
  const [selectedBranch, setSelectedBranch] = useState("ALL"); // "ALL" or branch_code
  const [refreshing, setRefreshing] = useState(false);

  // ----- NEW: Set of mcodes for plans where info="A" and MaturityDate < now -----
  const expiredAMcodes = useMemo(() => {
    if (!allPlan) return new Set();
    const now = new Date();
    return new Set(
      allPlan
        .filter(
          (plan) => plan.info === "A" && new Date(plan.MaturityDate) < now,
        )
        .map((plan) => `${plan.mgroup}-${plan.member_no}`),
    );
  }, [allPlan]);
  // -------------------------------------------------------------------------

  const fetchLedger = useCallback(
    async (silent = false) => {
      if (!adminUser?.mobile || !adminUser?.store_id) {
        setError("User information missing. Please login again.");
        setLoading(false);
        return;
      }

      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError(null);

      try {
        const payload = {
          mobile: adminUser.mobile,
          storeID: adminUser.store_id,
          // no branchId — fetch All stores
        };

        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/core/V1/userledger`,
          payload,
          {
            headers: { "Content-Type": "application/json" },
            timeout: 60000,
          },
        );

        const { success, data, error: apiError } = response.data;

        if (success && Array.isArray(data)) {
          setLedgerData(data);
        } else {
          setLedgerData([]);
          setError(apiError || "Failed to load ledger data.");
        }
      } catch (err) {
        console.error("Ledger fetch error:", err);
        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to load ledger data.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [adminUser],
  );

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  // ── Derive branch codes present in the fetched data ──────────────────────
  // Only show branches that actually have transactions, matched from branches list
  const activeBranchCodes = Array.from(
    new Set(ledgerData.map((item) => item.branch).filter(Boolean)),
  );

  const branchOptions = [
    { branch_code: "ALL", branch_city: "All stores", branch_name: "All" },
    ...(branches || []).filter((b) =>
      activeBranchCodes.includes(b.branch_code),
    ),
  ];

  // ── Apply filters ─────────────────────────────────────────────────────────
  const branchFiltered =
    selectedBranch === "ALL"
      ? ledgerData
      : ledgerData.filter((item) => item.branch === selectedBranch);

  const mcodes = [
    "ALL",
    ...Array.from(
      new Set(branchFiltered.map((item) => item.mcode).filter(Boolean)),
    ),
  ];

  // Reset mcode filter when branch changes if current mcode not in new branch
  const filteredByMcode =
    selectedMcode === "ALL"
      ? branchFiltered
      : branchFiltered.filter((item) => item.mcode === selectedMcode);

  // ----- Apply expired "A" plan filter -----
  const filteredData = filteredByMcode.filter(
    (item) => !expiredAMcodes.has(item.mcode),
  );
  // ---------------------------------------

  const hasFilters = selectedBranch !== "ALL" || selectedMcode !== "ALL";

  const selectedBranchLabel =
    selectedBranch === "ALL"
      ? null
      : branchOptions.find((b) => b.branch_code === selectedBranch)
          ?.branch_city || selectedBranch;

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
      {/* AppBar */}
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
            {adminUser.name || adminUser.username || "Member"}
            <Typography fontSize={12} sx={{ opacity: 0.85 }}>
              {adminUser.mobile}
            </Typography>
          </Typography>

          <IconButton
            size="small"
            onClick={() => fetchLedger(true)}
            disabled={refreshing || loading}
            sx={{ mr: 0.5 }}
          >
            <Refresh
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

          <Badge
            badgeContent={hasFilters ? 1 : 0}
            color="primary"
            variant="dot"
          >
            <IconButton
              size="small"
              onClick={() => setFilterDrawerOpen(true)}
              sx={{
                backgroundColor: hasFilters ? "#EEF0FF" : "transparent",
                borderRadius: 2,
              }}
            >
              <FilterList fontSize="small" sx={{ color: "#5C6BC0" }} />
            </IconButton>
          </Badge>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Box flex={1} sx={{ overflowY: "auto", pb: 10 }}>
        {/* Active filter chips */}
        {hasFilters && (
          <Box px={2} pt={2} display="flex" gap={1} flexWrap="wrap">
            {selectedBranch !== "ALL" && (
              <Chip
                icon={<LocationOn sx={{ fontSize: 14 }} />}
                label={selectedBranchLabel}
                onDelete={() => {
                  setSelectedBranch("ALL");
                  setSelectedMcode("ALL");
                }}
                deleteIcon={<Close />}
                size="small"
                sx={{
                  backgroundColor: "#dadbe4",
                  color: "#5C6BC0",
                  fontWeight: 600,
                  "& .MuiChip-deleteIcon": { color: "#5C6BC0", fontSize: 16 },
                }}
              />
            )}
            {selectedMcode !== "ALL" && (
              <Chip
                label={`Scheme: ${selectedMcode}`}
                onDelete={() => setSelectedMcode("ALL")}
                deleteIcon={<Close />}
                size="small"
                sx={{
                  backgroundColor: "#dadbe4",
                  color: "#5C6BC0",
                  fontWeight: 600,
                  "& .MuiChip-deleteIcon": { color: "#5C6BC0", fontSize: 16 },
                }}
              />
            )}
          </Box>
        )}

        {/* Summary bar */}
        {!loading && !error && ledgerData.length > 0 && (
          <Box pt={hasFilters ? 1.5 : 2}>
            <SummaryBar data={filteredData} />
          </Box>
        )}

        {/* Count info */}
        {!loading && !error && (
          <Box px={0} pb={1}>
            <Typography variant="caption" color="text.secondary" fontSize={12}>
              {filteredData.length} transaction
              {filteredData.length !== 1 ? "s" : ""}{" "}
              {hasFilters ? "matching filters" : "total"}
            </Typography>
          </Box>
        )}

        {/* Loading skeletons */}
        {loading && (
          <Box px={0} pt={2}>
            {[...Array(5)].map((_, i) => (
              <LedgerCardSkeleton key={i} />
            ))}
          </Box>
        )}

        {/* Error */}
        {error && !loading && (
          <Box px={0} pt={2}>
            <Alert
              severity="error"
              action={
                <IconButton size="small" onClick={() => fetchLedger()}>
                  <Refresh fontSize="small" />
                </IconButton>
              }
              sx={{ borderRadius: 2 }}
            >
              {error}
            </Alert>
          </Box>
        )}

        {/* Empty */}
        {!loading && !error && filteredData.length === 0 && (
          <Box textAlign="center" py={8} px={0}>
            <Receipt sx={{ fontSize: 56, color: "#E0E0E0", mb: 2 }} />
            <Typography fontWeight={600} color="text.secondary">
              No investment records
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {hasFilters
                ? "No transactions match the selected filters"
                : "Your investment history will appear here"}
            </Typography>
          </Box>
        )}

        {/* Ledger list */}
        {!loading && !error && filteredData.length > 0 && (
          <Box px={0}>
            {filteredData.map((entry, idx) => (
              <LedgerCard key={entry.id || idx} entry={entry} />
            ))}
          </Box>
        )}
      </Box>

      {/* Filter Drawer */}
      <Drawer
        anchor="bottom"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: "75vh",
            maxWidth: 480,
            mx: "auto",
            left: "50%",
            transform: "translateX(-50%) !important",
            width: "100%",
          },
        }}
      >
        {/* Drag handle */}
        <Box display="flex" justifyContent="center" pt={1.5} pb={0.5}>
          <Box
            sx={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: "#E0E0E0",
            }}
          />
        </Box>

        {/* Drawer header */}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          px={2}
          py={1.5}
          borderBottom="1px solid #F0F0F0"
        >
          <Typography fontWeight={700} fontSize={16}>
            Filters
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            {hasFilters && (
              <Typography
                fontSize={13}
                color="#5C6BC0"
                fontWeight={600}
                sx={{ cursor: "pointer" }}
                onClick={() => {
                  setSelectedBranch("ALL");
                  setSelectedMcode("ALL");
                }}
              >
                Clear all
              </Typography>
            )}
            <IconButton size="small" onClick={() => setFilterDrawerOpen(false)}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ overflowY: "auto", pb: 3 }}>
          {/* ── Branch section ── */}
          {branchOptions.length > 1 && (
            <Box px={2} pt={2} pb={1}>
              <Typography
                fontSize={12}
                fontWeight={700}
                color="text.secondary"
                textTransform="uppercase"
                letterSpacing={0.8}
                mb={1}
              >
                Store
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={selectedBranch}
                  onChange={(e) => {
                    setSelectedBranch(e.target.value);
                    setSelectedMcode("ALL");
                  }}
                  displayEmpty
                  sx={{
                    borderRadius: 2,
                    backgroundColor: "#F8F9FB",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#E0E0E0",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#5C6BC0",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#5C6BC0",
                    },
                  }}
                  renderValue={(value) => {
                    if (value === "ALL") {
                      return (
                        <Box display="flex" alignItems="center" gap={1}>
                          <LocationOn sx={{ fontSize: 16, color: "#BDBDBD" }} />
                          <Typography fontSize={14}>All stores</Typography>
                        </Box>
                      );
                    }
                    const branch = branchOptions.find(
                      (b) => b.branch_code === value,
                    );
                    return (
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationOn sx={{ fontSize: 16, color: "#5C6BC0" }} />
                        <Typography
                          fontSize={14}
                          fontWeight={600}
                          color="#5C6BC0"
                        >
                          {branch?.branch_city || branch?.branch_name || value}
                        </Typography>
                      </Box>
                    );
                  }}
                >
                  {branchOptions.map((branch) => {
                    const count =
                      branch.branch_code === "ALL"
                        ? ledgerData.length
                        : ledgerData.filter(
                            (item) => item.branch === branch.branch_code,
                          ).length;
                    return (
                      <MenuItem
                        key={branch.branch_code}
                        value={branch.branch_code}
                        sx={{
                          borderRadius: 1,
                          mx: 0.5,
                          "&.Mui-selected": {
                            backgroundColor: "#EEF0FF",
                            "&:hover": { backgroundColor: "#E8EAFF" },
                          },
                        }}
                      >
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                          width="100%"
                          gap={1}
                        >
                          <Box display="flex" alignItems="center" gap={1}>
                            <LocationOn
                              sx={{
                                fontSize: 16,
                                color:
                                  selectedBranch === branch.branch_code
                                    ? "#5C6BC0"
                                    : "#BDBDBD",
                              }}
                            />
                            <Box>
                              <Typography fontSize={14}>
                                {branch.branch_code === "ALL"
                                  ? "All stores"
                                  : branch.branch_city || branch.branch_name}
                              </Typography>
                              {branch.branch_code !== "ALL" &&
                                branch.branch_city && (
                                  <Typography
                                    fontSize={11}
                                    color="text.secondary"
                                  >
                                    {branch.branch_name}
                                  </Typography>
                                )}
                            </Box>
                          </Box>
                          <Chip
                            label={count}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: 11,
                              fontWeight: 600,
                              backgroundColor:
                                selectedBranch === branch.branch_code
                                  ? "#5C6BC0"
                                  : "#F5F5F5",
                              color:
                                selectedBranch === branch.branch_code
                                  ? "#fff"
                                  : "#757575",
                            }}
                          />
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Box>
          )}

          {/* ── Scheme section ── */}
          <Box px={2} pt={2} pb={0.5}>
            <Typography
              fontSize={12}
              fontWeight={700}
              color="text.secondary"
              textTransform="uppercase"
              letterSpacing={0.8}
            >
              Scheme
            </Typography>
          </Box>
          <List disablePadding>
            {mcodes.map((mcode) => {
              const count =
                mcode === "ALL"
                  ? branchFiltered.length
                  : branchFiltered.filter((item) => item.mcode === mcode)
                      .length;
              const isSelected = selectedMcode === mcode;

              return (
                <ListItem key={mcode} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      setSelectedMcode(mcode);
                      setFilterDrawerOpen(false);
                    }}
                    sx={{
                      px: 2,
                      py: 1.2,
                      backgroundColor: isSelected ? "#EEF0FF" : "transparent",
                      "&:active": { backgroundColor: "#E8EAFF" },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Groups
                        sx={{
                          fontSize: 20,
                          color: isSelected ? "#5C6BC0" : "#BDBDBD",
                        }}
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={mcode === "ALL" ? "All Schemes" : mcode}
                      primaryTypographyProps={{
                        fontWeight: isSelected ? 700 : 400,
                        fontSize: 15,
                        color: isSelected ? "#5C6BC0" : "#1A1A2E",
                      }}
                    />
                    <Chip
                      label={count}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: 11,
                        fontWeight: 600,
                        backgroundColor: isSelected ? "#5C6BC0" : "#F5F5F5",
                        color: isSelected ? "#fff" : "#757575",
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
}
