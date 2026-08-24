import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import React, { useContext, useState, useEffect } from "react";
import theme from "../theme";
import print from "../assets/img/icons/printer.svg";
import success from "../assets/img/icons/tick-circle.svg";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import APP_CONFIG from "../config/constants";
import { StoreContext } from "../contexts/StoreContext";
import { AuthContext } from "../contexts/AuthContext";
import {
  isAndroid,
  preparePrinter,
  scanPrinters,
  connectAndPrint,
} from "../utils/printerService";

const PaymentSuccessful = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const paymentResult = location.state?.paymentResult;
  const additionalPlanDetails = location.state?.additionalPlanDetails;

  const { loginRole, adminUser } = useContext(AuthContext);
// console.log(adminUser);

  const paymentMapping = {
    0: "Cash",
    2: "Credit Card",
    7: "NEFT",
    1: "Cheque",
    6: "Online Payment",
    8: "Card",
  };

  const role = loginRole;

  const { storeAssets, fetchUserPlan } = useContext(StoreContext);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [printerDialogOpen, setPrinterDialogOpen] = useState(false);
  const [printers, setPrinters] = useState([]);
  // Installment count shown on the printed receipt. Defaults to the snapshot
  // forwarded via navigation, then refreshed from the backend (agents only).
  const [installmentCount, setInstallmentCount] = useState(
    additionalPlanDetails?.Installment_count ?? "NA",
  );

  // Date format
  function formatToDDMonthYYYY(dateString) {
    if (!dateString) return "Invalid Date";

    let date;

    if (!isNaN(Date.parse(dateString))) {
      date = new Date(dateString);
    } else {
      const parts = dateString.split(/[/-]/);
      if (parts.length === 3) {
        let [p1, p2, p3] = parts.map((part) => part.trim());
        let day, month, year;

        if (+p1 > 12) {
          [day, month, year] = [p1, p2, p3];
        } else {
          [month, day, year] = [p1, p2, p3];
        }

        date = new Date(+year, +month - 1, +day);
      }
    }

    return !date || isNaN(date)
      ? "Invalid Date"
      : date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });
  }

  // Format date as "Mon DD YYYY, H:MM AM/PM"
  function formatReceiptDateTime(date) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const d = date instanceof Date ? date : new Date();
    const mon = months[d.getMonth()];
    const day = String(d.getDate()).padStart(2, "0");
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${mon} ${day} ${year}, ${hours}:${minutes} ${ampm}`;
  }

  const amount = paymentResult?.amount ?? "0";
  const refNumber = paymentResult?.voucher ?? "0";
  const paymentTime = formatToDDMonthYYYY(paymentResult?.voucher_date);
  const paymentMethod = paymentResult?.pmode ?? 0;
  const senderName = paymentResult?.name ?? "Name";
  const agentName = paymentResult?.agent_name ?? "Agent Name";
  // const userInfo = adminUser;
  const userInfo = {
  ...adminUser,
  role: loginRole,
};

  useEffect(() => {
    if (userInfo) {
      fetchUserPlan(userInfo);
    }
  }, []);

  // Fetch the current installment count for the receipt print — agents only.
  useEffect(() => {
    if (role !== "agent") return;

    const group = additionalPlanDetails?.group_code;
    const memberNo = additionalPlanDetails?.member_no;
    const branch = additionalPlanDetails?.branch;
    if (!group || !memberNo || !branch) return;

    const fetchInstallmentCount = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/core/cur-installment-count`,
          {
            params: {
              group,
              memberNo,
              storeID: APP_CONFIG.STORE_ID,
              branch,
            },
          },
        );
        if (data?.installmentCount !== undefined && data?.installmentCount !== null) {
          setInstallmentCount(data.installmentCount);
        }
      } catch (err) {
        console.error("Failed to fetch installment count:", err);
        // Keep the snapshot fallback already set in state.
      }
    };

    fetchInstallmentCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  // PRINT -----------------
  const handlePrintVoucher = () => {
    const voucherData = {
      amount,
      voucher: refNumber,
      voucher_date: paymentResult?.voucher_date,
      rate: paymentResult?.rate,
      gross_wt:paymentResult?.gross_wt,
      pmode: paymentMethod,
      name: senderName,
      agentName: agentName,
    };

    setSelectedVoucher(voucherData);
    handleOpenPrinterDialog();
  };

  const handleOpenPrinterDialog = async () => {
    if (!isAndroid()) return; // Bluetooth printing is Android-only
    const ready = await preparePrinter(); // permission + Bluetooth-ON check
    if (!ready) return;
    setPrinterDialogOpen(true);
    scanPrinters(setPrinters);
  };

  const formatESCPOSTextFromSummary = (record) => {
    let commands = "\x1B\x40"; // ESC @ - Initialize printer

    // ── Header (centered) ──────────────────────────────────────
    commands += "\x1B\x61\x01"; // Center align
    const storeName = storeAssets?.storeinfo?.[0]?.store_name || "Store Name";
    const storeAddress =
      storeAssets?.storeinfo?.[0]?.store_address || "Address NA";
    const storePhone = storeAssets?.storeinfo?.[0]?.store_phone || "Phone NA";
    commands += `${storeName}\n${storeAddress}\nMobile: ${storePhone}\n`;

    // ── Date & Time ────────────────────────────────────────────
    commands += "\x1B\x61\x00"; // Left align
    commands += `\nDATE           : ${formatReceiptDateTime(new Date())}\n`;
    commands += "------------------------------------\n";

    // ── Ref Number ────────────────────────────────────────────
    commands += `Voucher Number : ${record.voucher || "NA"}\n`;
    commands += "------------------------------------\n";

    // ── Plan / Sender details ─────────────────────────────────
    const groupCode = additionalPlanDetails?.group_code || "NA";
    const memberNo = additionalPlanDetails?.member_no || "NA";
    const senderMobile = additionalPlanDetails?.sender_mobile || "NA";
    const installCount = installmentCount ?? "NA";
    commands += `Agent Name     : ${record.agentName || "NA"}\n`;
    commands += `Group Code     : ${groupCode}-${memberNo}\n`;
    commands += `Name           : ${record.name || "NA"}\n`;
    commands += `Mobile         : ${senderMobile}\n`;
    commands += `Rate           : ${record.rate || "NA"}/gram\n`;
    commands += "------------------------------------\n";

    // ── Payment details ───────────────────────────────────────
    const method = paymentMapping[record.pmode] || "NA";
    commands += `Payment Method : ${method}\n`;
    commands += `Installment Count : ${installCount}\n`;
    commands += "------------------------------------\n";

    // ── Agent ────────────────────────────────────────────────

    // ── Total (bold) ──────────────────────────────────────────
    // ₹ often prints as garbage on thermal printers. If yours does not
    // support it, change RUPEE to "Rs.".
    const RUPEE = "Rs "; // thermal printers can't print ₹, so use Rs
    commands += "\x1B\x21\x08"; // Bold on gross_wt
    commands += `Total Amount   : ${RUPEE}${record.amount}\n`;
    commands += `Total Weight   : ${record.gross_wt} gm\n`;
    commands += "\x1B\x21\x00"; // Bold off


    // ── Footer ────────────────────────────────────────────────
    commands += "\x1B\x61\x01"; // Center align
    commands += "\nThank you!\n";
    commands += "\n\n\n";
    commands += "\x1D\x56\x00"; // Full cut

    return commands;
  };

  // Build this screen's receipt text, then hand off to the shared printer service
  const printToDevice = (printer, data) => {
    const escposData = formatESCPOSTextFromSummary(data);
    connectAndPrint(printer, escposData, { onError: (msg) => alert(msg) });
    setPrinterDialogOpen(false);
  };

  const handleRedirect = () => {
    if (role === "agent") {
      navigate("/searchcustomers");
    } else {
      navigate("/savingplanslist");
    }
  };

  return (
    <>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingX: 3,
          pt: 5,
          mt: 8,
          pb: 3,
          position: "relative",
          backgroundColor: theme.paymentAndLedger.payInfoTabSectionBg,
        }}
      >
        <Box
          sx={{
            backgroundColor: theme.paymentAndLedger.payInfoTabSectionBg,
            width: "56px",
            height: "56px",
            top: "-28px",
            position: "absolute",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: "100%",
            boxShadow: "0 5px 25px #d6d6d6",
          }}
        >
          <img style={{ width: "32px" }} src={success} alt="Success" />
        </Box>

        <Box>
          <Typography
            sx={{
              mt: 1,
              fontSize: "20px",
              lineHeight: "28px",
              fontWeight: 600,
              color: theme.colors.primaryHeading,
              textAlign: "center",
            }}
          >
            Payment Success!
          </Typography>

          <Typography
            sx={{
              fontSize: "14px",
              lineHeight: "22px",
              fontWeight: 400,
              textAlign: "center",
              my: 2,
            }}
          >
            Your payment has been successfully done.
          </Typography>

          <hr />

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{ fontSize: "14px", lineHeight: "22px", fontWeight: 400 }}
            >
              Total Payment
            </Typography>
            <Typography
              sx={{
                fontSize: "20px",
                lineHeight: "28px",
                fontWeight: 600,
                color: theme.colors.primaryHeading,
                my: 2,
              }}
            >
              ₹{amount}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            {[
              { label: "Ref Number", value: refNumber },
              { label: "Payment Date", value: paymentTime },
              {
                label: "Payment Method",
                value: paymentMapping[paymentMethod],
              },
              { label: "Sender Name", value: senderName },
            ].map((item, index) => (
              <Box
                key={index}
                sx={{
                  width: "calc(50% - 6px)",
                  border: "2px solid #EDEDED",
                  borderRadius: "6px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  padding: "12px",
                  height: "62px",
                }}
              >
                <Typography
                  sx={{ fontSize: "12px", lineHeight: "16px", fontWeight: 400 }}
                >
                  {item.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "13px",
                    lineHeight: "18px",
                    fontWeight: 500,
                    color: theme.colors.primaryHeading,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    width: "100%",
                  }}
                >
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {role === "agent" && (
          <Box
            onClick={handlePrintVoucher}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
              mt: 4,
              cursor: "pointer",
            }}
          >
            <img src={print} alt="Print" />
            <Typography>Print</Typography>
          </Box>
        )}
      </Box>

      <Button
        onClick={handleRedirect}
        sx={{
          fontSize: "14px",
          width: "100%",
          height: "48px",
          backgroundColor: theme.colors.primaryButton,
          borderRadius: 2,
          color: "#fff",
          mt: 0,
          mb: 6,
        }}
      >
        Done
      </Button>

      {/* Printer Selection Dialog */}
      <Dialog
        open={printerDialogOpen}
        onClose={() => setPrinterDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Select Printer</DialogTitle>
        <DialogContent>
          {printers.length === 0 && <Typography>No printers found</Typography>}
          {printers.map((printer, idx) => (
            <Box
              key={idx}
              sx={{ display: "flex", justifyContent: "space-between", my: 1 }}
            >
              <Typography>
                {printer.name || printer.id} ({printer.type})
              </Typography>
              <Button
                variant="contained"
                onClick={() => printToDevice(printer, selectedVoucher)}
              >
                Print
              </Button>
            </Box>
          ))}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PaymentSuccessful;
