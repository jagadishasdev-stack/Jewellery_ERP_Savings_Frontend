import {
  Box,
  List,
  ListItem,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import theme from "../theme";
import APP_CONFIG from "../config/constants";
import { StoreContext } from "../contexts/StoreContext";
import jsPDF from "jspdf";
import { Share } from "@capacitor/share";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

// import escpos from 'escpos-encoder';

// Icon
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import DownloadForOfflineRoundedIcon from "@mui/icons-material/DownloadForOfflineRounded";
import LoadingScreen from "./LoadingScreen";
import { AuthContext } from "../contexts/AuthContext";
import {
  isAndroid,
  preparePrinter,
  scanPrinters,
  connectAndPrint,
} from "../utils/printerService";

const Ledger = ({ data, userInfo, digiGold }) => {
  const { storeAssets } = useContext(StoreContext);
  const { loginRole, adminUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [userLedger, setUserLedger] = useState([]);
  const [printerDialogOpen, setPrinterDialogOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [printers, setPrinters] = useState([]);
  const [goldBal, setGoldBal] = useState(0);
  // console.log(data,'payment mode');

  const paymentMapping = {
    0: "Cash",
    2: "Credit Card",
    7: "NEFT",
    // 7: "Net Banking",
    1: "Cheque",
    6: "Online Payment",
    8: "Card",
  };

  useEffect(() => {
    const fetchLedger = async () => {
      setLoading(true); // start loading

      const payload = {
        mobile: userInfo.mobile,
        mcode: `${data.mgroup}-${data.member_no}`,
        storeID: APP_CONFIG.STORE_ID,
        branchId: data?.branch,
        // branchId: APP_CONFIG.BRANCH,
      };

      try {
        const url = `${process.env.REACT_APP_API_BASE_URL}/api/core/userledger`;
        const response = await axios.post(url, payload);

        const ledgerData = response.data || [];
        setUserLedger(ledgerData);
        // console.log(ledgerData);
        

        // ✅ calculate total gross weight safely
        const totalGrossWt = ledgerData.reduce((acc, item) => {
          const val = Number(item?.gross_wt);
          const safeVal = Number.isFinite(val) ? val : 0;
          return acc + safeVal;
        }, 0);

        setGoldBal(totalGrossWt);
        // console.log("Total Gross Weight:", totalGrossWt);
      } catch (error) {
        console.error("Error fetching ledger:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userInfo?.mobile && data?.mgroup && data?.member_no) {
      fetchLedger();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo.mobile, data.mgroup, data.member_no,data.branch]);

  const handlePrintVoucher = async (voucher) => {
    setSelectedVoucher(voucher);
    if (!isAndroid()) return; // Bluetooth printing is Android-only
    const ready = await preparePrinter(); // permission + Bluetooth-ON check
    if (!ready) return;
    setPrinterDialogOpen(true);
    scanPrinters(setPrinters);
  };

  const formatESCPOSText = (data) => {
    // Initialize printer
    let commands = "\x1B\x40"; // ESC @ - Initialize printer

    // Set alignment center for header
    commands += "\x1B\x61\x01"; // ESC a 1 - Center alignment

    // Store header
    const header = `${storeAssets?.storeinfo[0]?.store_name || "NA"}\n${
      storeAssets?.storeinfo[0]?.store_address
    }\nMobile: ${storeAssets?.storeinfo[0]?.store_phone || "NA"}`;

    // Add header
    commands += header + "\n";

    // Set alignment left for receipt
    commands += "\x1B\x61\x00"; // ESC a 0 - Left alignment

    // ₹ often prints as garbage on thermal printers. If yours does not
    // support it, change this to "Rs." (that is why totals used Rs. before).
    const RUPEE = "Rs "; // thermal printers can't print ₹, so use Rs

    // Left-align every label to a fixed width so all the colons line up,
    // same style as PaymentSuccessful.js (that is why it looked aligned there).
    const line = (label, value) => `${String(label).padEnd(16)}: ${value}\n`;

    // Add receipt content
    commands += line(
      "DATE",
      new Date().toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    );
    commands += "-------------------------\n";
    commands += line("Voucher No", data?.voucher_no || "NA");
    commands += "-------------------------\n";
    commands += line("Collector", data?.ent_by || "");
    commands += line("Group Code", data?.mcode || "NA");
    commands += line("Name", data?.name || "NA");
    commands += line("Customer Mobile", data?.mobile || "NA");
    commands += line("Installment NO", data?.CurInstlCnt || "0");
    commands += "-------------------------\n";
    commands += line("Payment Mode", paymentMapping[data?.pmode] || "NA");
    commands += line("Amount Paid", `${RUPEE}${data?.amount || "0"}`);
    if (Number(digiGold?.isDigiGold) === 1) {
      commands += line("Weight", `${data?.gross_wt || "0"} gm`);
    }
    commands += "-------------------------\n";
    commands += line("Rate", `${RUPEE}${data.rate}/gram`);
    commands += "-------------------------\n";

    // Total summary
    commands += line(
      "Total Amount Paid",
      `${RUPEE}${digiGold?.totalAmount || "NA"}`
    );
    if (Number(digiGold?.isDigiGold) === 1) {
      commands += line("Total Gold Balance", `${goldBal.toFixed(3)} gm`);
    }
    commands += "-------------------------\n";
    commands += "Thank you!\n";

    // Add line feeds and cut paper
    commands += "\n\n\n"; // Add some empty lines
    commands += "\x1D\x56\x00"; // GS V 0 - Full cut

    return commands;
  };

  // Build this screen's receipt text, then hand off to the shared printer service
  const printToDevice = (printer, data) => {
    const escposData = formatESCPOSText(data);
    connectAndPrint(printer, escposData, { onError: (msg) => alert(msg) });
    setPrinterDialogOpen(false);
  };

  // Receipt download pdf text format
  const handleReceiptDownload = async (voucherData) => {
    const doc = new jsPDF();
    const store = storeAssets?.storeinfo?.[0] || {};
    let y = 10;

    doc.setFontSize(16);
    const heading = "Installment Receipt";

    // Centered heading
    const widthOfPage = doc.internal.pageSize.getWidth();
    const centerX = widthOfPage / 2;
    doc.text(heading, centerX, y, { align: "center" });

    const textWidth = doc.getTextWidth(heading);
    const padding = 10;
    const lineStartX = centerX - textWidth / 2 - padding;
    const lineEndX = centerX + textWidth / 2 + padding;

    y += 3;
    doc.setLineWidth(0.5);
    doc.line(lineStartX, y, lineEndX, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`Store: ${store.store_name || "N/A"}`, 10, y);
    y += 7;
    doc.text(`Address: ${store.store_address || "N/A"}`, 10, y);
    y += 7;
    doc.text(`Phone: ${store.store_mobile || "N/A"}`, 10, y);
    y += 7;

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    doc.text(`Voucher No: ${voucherData.voucher_no || "N/A"}`, 10, y);
    y += 7;
    doc.text(
      `Date: ${
        new Date(voucherData.voucher_date).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }) || "N/A"
      }`,
      10,
      y,
    );
    y += 7;
    doc.text(`Name: ${voucherData.name || "N/A"}`, 10, y);
    y += 7;
    doc.text(`Mobile: ${voucherData.mobile || "N/A"}`, 10, y);
    y += 7;
    doc.text(`Amount Paid: ${voucherData.amount}/-`, 10, y);
    y += 10;
    doc.text("Thank you...", 10, y);

    const fileName = `${store.store_name}_Receipt_${
      voucherData.voucher_no || "voucher"
    }.pdf`;

    const platform = Capacitor.getPlatform();

    if (platform === "web") {
      doc.save(fileName); // For web browsers
    } else {
      try {
        // Convert PDF to base64
        const pdfArrayBuffer = doc.output("arraybuffer");
        const base64Pdf = btoa(
          new Uint8Array(pdfArrayBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            "",
          ),
        );

        // Save the PDF on device
        await Filesystem.writeFile({
          path: fileName,
          data: base64Pdf,
          directory: Directory.Documents,
          encoding: Encoding.BASE64,
        });

        // Get file URI
        const fileUri = await Filesystem.getUri({
          path: fileName,
          directory: Directory.Documents,
        });

        // Open in device browser to view the PDF
        await Browser.open({
          url: fileUri.uri,
        });

        // Optionally allow user to share
        await Share.share({
          title: "Receipt PDF",
          text: "Here is your receipt.",
          url: fileUri.uri,
          dialogTitle: "Share Receipt",
        });
      } catch (err) {
        console.error("Error saving or opening PDF:", err);
        alert("Unable to save or open receipt.");
      }
    }
  };
  const dateConverter = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <Box sx={{ marginBottom: "3rem" }}>
      {/* Header Row */}

      <Box
        marginBottom="1.2rem"
        width="100vw"
        display="flex"
        flexDirection="column"
        sx={{
          p: 1,
          mx: "-16px",
          border: `1px solid ${theme.paymentScreen.cardBorder}`,
          backgroundColor: theme.paymentAndLedger.payInfoTabSectionBg,
        }}
      >
        {" "}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: theme.paymentScreen.textColHighlighted,
            }}
          >
            Total Amount Balance{" "}
          </Typography>
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: theme.paymentScreen.textColHighlighted,
            }}
          >
            ₹ {digiGold.totalAmount}{" "}
          </Typography>
        </Box>
        {Number(digiGold.isDigiGold) === 1 && (
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: theme.paymentScreen.textColHighlighted,
              }}
            >
              Total Gold Balance{" "}
            </Typography>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: theme.paymentScreen.textColHighlighted,
              }}
            >
              {goldBal.toFixed(3)} gm
            </Typography>
          </Box>
        )}
      </Box>

      {userLedger.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            mb: 1,
          }}
        >
          <Typography
            sx={{
              // width: "40%",
              fontSize: 14,
              fontWeight: 500,
              // whiteSpace: "nowrap",
            }}
          >
            Ref No
          </Typography>
          <Typography
            sx={{
              width: "0%",
              fontSize: 14,
              fontWeight: 500,
              whiteSpace: "nowrap",
              ml: 0.8,
            }}
          >
            Weight
          </Typography>
          <Typography
            sx={{
              width: loginRole === "agent" ? "0%" : "25%",
              fontSize: 14,
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            Amount
          </Typography>
          {loginRole === "agent" && (
            <>
              <Typography
                sx={{
                  width: "15%",
                  fontSize: 14,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  textAlign: "center",
                }}
              >
                Print
              </Typography>
            </>
          )}
        </Box>
      )}

      {/* Loading screen */}
      {loading && <LoadingScreen message="Loading your payments" />}

      {/* List */}
      <List>
        {/* If there is no payment done */}
        {!loading && userLedger.length === 0 && (
          <>
            <Typography
              variant="body1"
              sx={{
                fontSize: 16,
                fontWeight: 500,
                textAlign: "center",
                color: theme.theme2.textCol,
              }}
            >
              Haven't paid yet!
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: 16,
                fontWeight: 500,
                textAlign: "center",
                color: theme.theme2.textCol,
              }}
            >
              Make your first payment now
            </Typography>
          </>
        )}

        {/* Show all payments */}
        {userLedger.map((data, index) => (
          <ListItem
            key={index}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100vw",
              marginX: -2,
              px: 2,
              py: 1,
              marginBottom: "0.2rem",
              borderBottom: `1px solid ${theme.ledger.ledgerListSeparatorLineCol}`,
              backgroundColor: index % 2 === 0 ? "#fcf9efff" : "#ffffff", //
            }}
            disableGutters
          >
            {/* Ref No & Date */}
            <Box sx={{ width: "40%" }}>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  color: theme.ledger.primaryTextCol,
                }}
              >
                #{data.voucher_no}
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  mt: 0.4,
                  whiteSpace: "nowrap",
                  color: theme.ledger.secondaryTextCol,
                }}
              >
                {dateConverter(data.voucher_date)}
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  color: theme.ledger.primaryTextCol,
                }}
              >
                Rate : ₹ {data.rate}
              </Typography>
            </Box>
            {/* gold weight */}
            <Box
              display="flex"
              justifyContent="center"
              alignItems="flex-start"
              flexDirection="column"
              sx={{ width: "25%" }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  color: theme.ledger.primaryTextCol,
                }}
              >
                {data.gross_wt} g
              </Typography>
            </Box>
            {/* Amount & Status */}
            <Box
              display="flex"
              justifyContent="center"
              alignItems="flex-start"
              flexDirection="column"
              sx={{ width: "25%" }}
            >
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  color: theme.ledger.primaryTextCol,
                }}
              >
                {data.amount}/-
              </Typography>
            </Box>

            {/* Print Icon & Button */}
            {loginRole === "agent" && (
              <Box
                sx={{
                  width: "15%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={() => handlePrintVoucher(data)}
              >
                <PrintRoundedIcon sx={{ fontSize: "1.5rem" }} />
                <Typography
                  sx={{
                    fontSize: 12,
                    mt: 0.25,
                    whiteSpace: "nowrap",
                    color: theme.ledger.downloadIconCol,
                    fontWeight: "600",
                  }}
                >
                  Print
                </Typography>
              </Box>
            )}
          </ListItem>
        ))}
      </List>

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
    </Box>
  );
};

export default Ledger;
