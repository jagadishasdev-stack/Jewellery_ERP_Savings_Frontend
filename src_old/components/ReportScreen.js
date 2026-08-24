import {
  Box,
  Button,
  TextField,
  Typography,
  Snackbar,
  Alert,Select, MenuItem, InputLabel, FormControl 
} from "@mui/material";
import React, { useContext, useEffect, useRef, useState } from "react";
import theme from "../theme";
import axios from "axios";
import SummaryScreen from "./SummaryScreen";
import DetailScreen from "./DetailScreen";
import { AuthContext } from "../contexts/AuthContext";

function ReportsScreen() {
  const { loginRole, adminUser } = useContext(AuthContext);
  const [isAgent, setIsAgent] = useState(false);
  const [agentInfo, setAgentInfo] = useState({
    startDate: "",
    agentID: "",
    storeID: "",
  });
  // const [date, setDate] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [summaryData, setSummaryData] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [activeScreen, setActiveScreen] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "",
  });

  let [totalCollectedAmount, setTotalCollectedAmount] = useState(0);
// ADD these 4 new states after line: let [totalCollectedAmount, setTotalCollectedAmount] = useState(0);
const [filterType, setFilterType] = useState("date"); // "date" | "range" | "month"
// const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
const [dateRange, setDateRange] = useState({
  startDate: new Date().toISOString().split("T")[0],
  endDate: new Date().toISOString().split("T")[0],
});
const [selectedMonth, setSelectedMonth] = useState("");
const currentYear = new Date().getFullYear();
  const amountRef = useRef(null);
// ADD this after the states
const monthOptions = [
  "January","February","March","April",
  "May","June","July","August",
  "September","October","November","December"
].slice(0, new Date().getMonth() + 1).map((name, i) => ({
  label: name,
  value: i + 1,
}));
  // Fetch agent info from localStorage
  useEffect(() => {
    const currentUser = loginRole;
    const currentUserParsed = adminUser;
    // console.log(currentUserParsed);

    // const currentUser = localStorage.getItem("loginRole");
    // const currentUserParsed = JSON.parse(localStorage.getItem("adminUser"));

    if (currentUser === "agent") {
      setIsAgent(true);
      setAgentInfo((prev) => ({
        ...prev,
        agentID: currentUserParsed?.agent_id,
        storeID: currentUserParsed?.store_id,
      }));
    }
  }, [adminUser]);
  // console.log(agentInfo);

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false,
    }));
  };

  // Fetch summary and details panel data
  // const fetchDataForDate = async (selectedDate) => {
  //   if (!selectedDate) {
  //     console.log("adjbchjsbchdsbcs", selectedDate);
  //     setSnackbar({
  //       open: true,
  //       message: "Please select a date",
  //       severity: "warning",
  //     });
  //     return;
  //   }
  //   try {
  //     const commonPayload = {
  //       ...agentInfo,
  //       startDate: selectedDate,
  //     };

  //     const [summaryResponse, detailResponse] = await Promise.all([
  //       axios.post(
  //         `${process.env.REACT_APP_API_BASE_URL}/api/core/ledgersummary`,
  //         commonPayload
  //       ),
  //       axios.post(
  //         `${process.env.REACT_APP_API_BASE_URL}/api/core/myledger`,
  //         commonPayload
  //       ),
  //     ]);

  //     setSummaryData(summaryResponse.data);
  //     setDetailData(detailResponse.data);
  //     setActiveScreen("summary");

  //     let amnt = detailResponse?.data?.records
  //       ?.map((record) => record.amount_collected)
  //       .reduce((amount, acc) => (amount += acc), 0);
  //     setTotalCollectedAmount(amnt);

  //     // 🔽 Delay to ensure DOM updates
  //     setTimeout(() => {
  //       if (amountRef.current) {
  //         const headerOffset = 56;
  //         const elementPosition =
  //           amountRef.current.getBoundingClientRect().top + window.scrollY;
  //         const offsetPosition = elementPosition - headerOffset;

  //         window.scrollTo({
  //           top: offsetPosition,
  //           behavior: "smooth",
  //         });
  //       }
  //     }, 200); // Allow React to finish DOM updates
  //   } catch (error) {
  //     console.error("Error fetching data:", error);
  //     setSnackbar({
  //       open: true,
  //       message: "Something went wrong. Please try again.",
  //       severity: "warning",
  //     });
  //   }
  // };

// REPLACE the entire fetchDataForDate function
const fetchDataForDate = async () => {
  let payload = {
    agentID: agentInfo.agentID,
    storeID: agentInfo.storeID,
  };

  // Validate & build payload based on filter type
  if (filterType === "date") {
    if (!date) {
      setSnackbar({ open: true, message: "Please select a date", severity: "warning" });
      return;
    }
    payload.startDate = date;

  } else if (filterType === "range") {
    if (!dateRange.startDate || !dateRange.endDate) {
      setSnackbar({ open: true, message: "Please select start and end date", severity: "warning" });
      return;
    }
    if (dateRange.endDate < dateRange.startDate) {
      setSnackbar({ open: true, message: "End date cannot be before start date", severity: "warning" });
      return;
    }
    payload.startDate = dateRange.startDate;
    payload.endDate   = dateRange.endDate;

  } else if (filterType === "month") {
    if (!selectedMonth) {
      setSnackbar({ open: true, message: "Please select a month", severity: "warning" });
      return;
    }
    payload.month = selectedMonth;
    payload.year  = currentYear;
  }

  try {
    const [summaryResponse, detailResponse] = await Promise.all([
      axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/core/ledgersummary`, payload),
      axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/core/myledger`, payload),
    ]);

    setSummaryData(summaryResponse.data);
    setDetailData(detailResponse.data);
    setActiveScreen("summary");

    let amnt = detailResponse?.data?.records
      ?.map((r) => r.amount_collected)
      .reduce((acc, val) => acc + val, 0);
    setTotalCollectedAmount(amnt);

    setTimeout(() => {
      if (amountRef.current) {
        const headerOffset = 56;
        const elementPosition = amountRef.current.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: elementPosition - headerOffset, behavior: "smooth" });
      }
    }, 200);

  } catch (error) {
    console.error("Error fetching data:", error);
    setSnackbar({ open: true, message: "Something went wrong. Please try again.", severity: "warning" });
  }
};

  useEffect(() => {
    if (totalCollectedAmount !== 0 && amountRef.current) {
      const timeout = setTimeout(() => {
        const headerOffset = 56;
        const elementPosition =
          amountRef.current.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }, 100); // Delay ensures DOM is ready

      return () => clearTimeout(timeout);
    }
  }, [totalCollectedAmount]);

  
  const handleSummaryScreen = () => {
    if (!summaryData) return;
    setActiveScreen("summary");
  };

  const handleDetailScreen = () => {
    if (!detailData) return;
    setActiveScreen("detail");
  };

  return (
    <React.Fragment>
      {isAgent && (
        <React.Fragment>
          {/* Date Picker & Fetch Details Button Container */}
          {/* Filter Section */}
<Box sx={{ display: "flex", flexDirection: "column", width: "100%", mb: 1, mt: 2 }}>

  {/* Heading */}
  <Typography variant="h6" sx={{ mb: 1 }}>Select Filter</Typography>

  {/* Filter Type Toggle — 3 pill buttons */}
  <Box display="flex" gap={1} mb={2}>
    {[
      { label: "Date", value: "date" },
      { label: "Date Range", value: "range" },
      { label: "Month",      value: "month" },
    ].map((f) => (
      <Button
        key={f.value}
        variant={filterType === f.value ? "contained" : "outlined"}
        onClick={() => {
          setFilterType(f.value);
          // clear previous selections on switch
         const today = new Date().toISOString().split("T")[0];
setDate(today);
setDateRange({ startDate: today, endDate: today });
          setSelectedMonth("");
        }}
        sx={{
          flex: 1,
          fontSize: 12,
          borderRadius: 5,
          fontWeight:"bold", 
          padding: "5px 6px",        // pill shape — suits mobile jewellery app
          borderColor: theme.colors.primaryButton,
          bgcolor: filterType === f.value ? theme.colors.primaryButton : "transparent",
          color:   filterType === f.value ? "#fff" : theme.colors.primaryButton,
          "&:hover": {
            bgcolor: theme.colors.primaryButton,
            color: "#fff",
          }
        }}
      >
        {f.label}
      </Button>
    ))}
  </Box>

  {/* Single Date Picker */}
  {filterType === "date" && (
    <TextField
      type="date"
      required
      value={date || ""}
      onChange={(e) => setDate(e.target.value)}
      sx={{ mb: 1 }}
      inputProps={{ max: new Date().toISOString().split("T")[0] }} // no future dates
    />
  )}

  {/* Date Range Pickers */}
  {filterType === "range" && (
    <Box display="flex" flexDirection="column" gap={1} mb={1}>
      <TextField
        label="Start Date"
        type="date"
        InputLabelProps={{ shrink: true }}
        value={dateRange.startDate}
        inputProps={{ max: new Date().toISOString().split("T")[0] }}
        onChange={(e) =>
          setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
        }
      />
      <TextField
        label="End Date"
        type="date"
        InputLabelProps={{ shrink: true }}
        value={dateRange.endDate}
        inputProps={{
          min: dateRange.startDate,                             // end can't be before start
          max: new Date().toISOString().split("T")[0],
        }}
        onChange={(e) =>
          setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
        }
      />
    </Box>
  )}

{/* Month Dropdown */}
{filterType === "month" && (
  <FormControl fullWidth sx={{ mb: 1 }}>
    <InputLabel shrink>Select Month ({currentYear})</InputLabel>
    <Select
      value={selectedMonth}
      onChange={(e) => setSelectedMonth(e.target.value)}
      label={`Select Month (${currentYear})`}
      displayEmpty
      notched
    >
      <MenuItem value=""><em>-- Select Month --</em></MenuItem>
      {monthOptions.map((m) => (
        <MenuItem key={m.value} value={m.value}>
          {m.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
)}

  {/* Fetch Button */}
  <Button
    variant="contained"
    onClick={fetchDataForDate}   // no argument needed anymore
    sx={{
      width: "fit-content",
      bgcolor: theme.colors.primaryButton,
      color: "#fff",
      borderRadius: 2,
      mt: 1,
    }}
  >
    Fetch Reports
  </Button>
</Box>

          {/* Collected amount */}
          {totalCollectedAmount !== 0 && (
            <Box
              ref={amountRef}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                width: "100vw",
                position: "relative",
                scrollMarginTop: "56px",
                marginLeft: "-16px",
                marginRight: "-16px",
                p: 2,
                mt: 2,
                color: "#fff",
                bgcolor: theme.colors.primaryButton,
              }}
            >
              <Typography sx={{ fontWeight: 500, fontSize: 14 }}>
                Total Amount Collected
              </Typography>
              <Typography sx={{ fontWeight: 700, fontSize: 22 }}>
                ₹ {new Intl.NumberFormat("en-IN").format(totalCollectedAmount)}
              </Typography>
            </Box>
          )}

          {/* Summary & Detail Buttons Container */}
          <Box
            margin="0 auto"
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap="0.2rem"
            width="50%"
            mt={2}
          >
            {/* Summary Button */}
            <Button
              onClick={handleSummaryScreen}
              variant={activeScreen === "summary" ? "contained" : "outlined"}
              disabled={!summaryData}
              sx={{
                bgcolor:
                  activeScreen === "summary"
                    ? theme.colors.primaryButton
                    : "transparent",
                color:
                  activeScreen === "summary"
                    ? "#fff"
                    : theme.colors.primaryButton,
                borderColor: theme.colors.primaryButton,
              }}
            >
              Summary
            </Button>

            {/* Detail Button */}
            <Button
              onClick={handleDetailScreen}
              variant={activeScreen === "detail" ? "contained" : "outlined"}
              disabled={!detailData}
              sx={{
                bgcolor:
                  activeScreen === "detail"
                    ? theme.colors.primaryButton
                    : "transparent",
                color:
                  activeScreen === "detail"
                    ? "#fff"
                    : theme.colors.primaryButton,
                borderColor: theme.colors.primaryButton,
              }}
            >
              Detail
            </Button>
          </Box>

          {/* Conditional Screens or Message */}
          <Box mt={3}>
            {activeScreen === "summary" && <SummaryScreen data={summaryData} />}
            {activeScreen === "detail" && <DetailScreen data={detailData} />}
            {!activeScreen && (
              <Typography
                align="center"
                sx={{ color: "gray", fontStyle: "italic", mt: 2 }}
              >
                Your details will appear here
              </Typography>
            )}
          </Box>

          {/* Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            sx={{ bottom: "72px !important" }} // Override default MUI style
          >
            <Alert
              onClose={handleSnackbarClose}
              severity={snackbar.severity}
              variant="filled"
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

export default ReportsScreen;
