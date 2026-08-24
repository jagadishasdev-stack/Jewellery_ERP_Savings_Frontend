import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import theme from "../theme";

// Icon
import SpeakerNotesOffRoundedIcon from "@mui/icons-material/SpeakerNotesOffRounded";

import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import { useContext, useState } from "react";
import { StoreContext } from "../contexts/StoreContext";
import {
  isAndroid,
  preparePrinter,
  scanPrinters,
  connectAndPrint,
} from "../utils/printerService";

function SummaryScreen({ data }) {
  const { storeAssets } = useContext(StoreContext);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [printerDialogOpen, setPrinterDialogOpen] = useState(false);
  const [printers, setPrinters] = useState([]);

  const handlePrintVoucher = async (data) => {
    setSelectedVoucher(data);
    if (!isAndroid()) return; // Bluetooth printing is Android-only
    const ready = await preparePrinter(); // permission + Bluetooth-ON check
    if (!ready) return;
    setPrinterDialogOpen(true);
    scanPrinters(setPrinters);
  };

  const formatESCPOSTextFromSummary = (summaryData) => {
    let commands = "\x1B\x40"; // ESC @ - Initialize printer

    // Centered Header
    commands += "\x1B\x61\x01"; // Center alignment

    const storeName = storeAssets?.storeinfo?.[0]?.store_name || "Store Name";
    const storeAddress =
      storeAssets?.storeinfo?.[0]?.store_address || "Address NA";
    const storePhone = storeAssets?.storeinfo?.[0]?.store_phone || "Phone NA";

    commands += `${storeName}\n${storeAddress}\nMobile: ${storePhone}\n\n`;

    // Left-aligned content
    commands += "\x1B\x61\x00"; // Left alignment

    const startDate = new Date(summaryData.dateRange?.start).toLocaleDateString(
      "en-GB"
    );
    const endDate = new Date(summaryData.dateRange?.end).toLocaleDateString(
      "en-GB"
    );

    commands += `Date Range : ${startDate} to ${endDate}\n`;
    commands += `Agent ID   : ${summaryData.agentID}\n`;
    commands += `Store ID   : ${summaryData.storeID}\n`;
    commands += "==============================\n";

    let totalAmount = 0;

    summaryData.summary.forEach((item) => {
      const modeLabel = (() => {
        const mode = item.mode?.toLowerCase().trim();
        if (mode === "cash") return "Cash";
        if (mode === "cheque") return "Cheque";
        return "Online Payment";
      })();

      commands += `Mode       : ${modeLabel}\n`;
      commands += `Count      : ${item.count}\n`;
      commands += `Amount     : ${item.amount}\n`;
      commands += "------------------------------\n";

      totalAmount += item.amount;
    });

    // Bold total collected
    commands += "\x1B\x21\x08"; // Bold text
    commands += `TOTAL COLLECTED: ${totalAmount}\n`;
    commands += "\x1B\x21\x00"; // Normal text
    commands += "==============================\n";

    // Thank you message (centered)
    commands += "\x1B\x61\x01";
    commands += "Thank you!\n";

    // Feed and cut
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
  // console.log(data);
  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        // alignItems="flex-start"
        flexDirection="column"
        width="100%"
        height="75vh"
        mt={3}
        mb={5}
      >
        {/* If there is no summary screen data */}
        {data.summary.length === 0 && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
            mt={20}
          >
            <SpeakerNotesOffRoundedIcon
              sx={{
                height: 36,
                width: 36,
                fill: theme.colors.primaryButton,
                opacity: 0.5,
              }}
            />
            <Typography color="textDisabled" sx={{ fontSize: 16 }}>
              No reports available for this date
            </Typography>
          </Box>
        )}

        {data.summary.length !== 0 && (
          <>
            {" "}
            <Box sx={{ width: "100%" }}>
              {data.summary.map((record) => {
                return (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    flexDirection="column"
                    gap={1}
                    sx={{
                      width: "100%",
                      border: "1px solid #E0CBB6",
                      borderRadius: 2,
                      p: 2,
                      mb: 3,
                    }}
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      width="100%"
                    >
                      <Typography
                        sx={{ fontSize: 13, color: theme.theme2.textCol }}
                      >
                        Payment Mode
                      </Typography>
                      <Typography
                        sx={{ fontSize: 13, fontWeight: 500, color: "#000" }}
                      >
                        {(() => {
                          const mode = record.mode?.toLowerCase().trim();
                          if (mode === "cash") return "Cash";
                          if (mode === "cheque") return "Cheque";
                          if (mode === "neft") return "Neft";
                          return "Online Payment";
                        })()}
                      </Typography>
                    </Box>

                    {/* Separator line */}
                    <Box
                      sx={{
                        alignSelf: "stretch",
                        height: "1px",
                        bgcolor: "#DCDEE0",
                        mt: -0.5,
                        mb: 1,
                      }}
                    />

                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      width="100%"
                    >
                      <Typography
                        sx={{ fontSize: 13, color: theme.theme2.textCol }}
                      >
                        Number of Payments
                      </Typography>
                      <Typography
                        sx={{ fontSize: 13, fontWeight: 500, color: "#000" }}
                      >
                        {record.count}
                      </Typography>
                    </Box>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      width="100%"
                    >
                      <Typography
                        sx={{ fontSize: 13, color: theme.theme2.textCol }}
                      >
                        Total Amount
                      </Typography>
                      <Typography
                        sx={{ fontSize: 13, fontWeight: 500, color: "#000" }}
                      >
                        ₹ {new Intl.NumberFormat("en-IN").format(record.amount)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
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
                  mb: 3,
                  whiteSpace: "nowrap",
                  color: theme.ledger.downloadIconCol,
                  fontWeight: "600",
                }}
              >
                Print Summary
              </Typography>
            </Box>
          </>
        )}
        {/* Printer Selection Dialog */}
        <Dialog
          open={printerDialogOpen}
          onClose={() => setPrinterDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Select Printer</DialogTitle>
          <DialogContent>
            {printers.length === 0 && (
              <Typography>No printers found</Typography>
            )}
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
    </>
  );
}

export default SummaryScreen;
