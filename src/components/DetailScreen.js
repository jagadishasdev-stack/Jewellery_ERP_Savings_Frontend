import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import theme from "../theme";
import React, { useContext, useState } from "react";

// Icon
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import SpeakerNotesOffRoundedIcon from "@mui/icons-material/SpeakerNotesOffRounded";
import { StoreContext } from "../contexts/StoreContext";
import PrintRoundedIcon from "@mui/icons-material/PrintRounded";
import { AuthContext } from "../contexts/AuthContext";
import {
  isAndroid,
  preparePrinter,
  scanPrinters,
  connectAndPrint,
} from "../utils/printerService";
function DetailScreen({ data }) {
  const { storeAssets } = useContext(StoreContext);
  const { adminUser } = useContext(AuthContext);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [printerDialogOpen, setPrinterDialogOpen] = useState(false);
  const [printers, setPrinters] = useState([]);
  // const currentAgent = JSON.parse(localStorage.getItem("adminUser"));

  const currentAgent = adminUser;

  const [expandedSummaryPanel, setExpandedSummaryPanel] = useState(null);
  // const cardRefs = useRef([]);
  // cardRefs.current = [];

  const handleShowSummaryDetails = (index) => {
    setExpandedSummaryPanel(index);

    // Wait for collapse animation to complete before scrolling
    // if (index === data.records.length - 1) {
    //   setTimeout(() => {
    //     cardRefs.current[index]?.scrollIntoView({
    //       behavior: "smooth",
    //       block: "end", // ensures expanded content is visible
    //     });
    //   }, 350); // after Collapse animation
    // }
  };

  const handleHideSummaryDetails = () => {
    // if (expandedSummaryPanel === data.records.length - 1) {
    // Optional: scroll back down to position of the collapsed card
    //   setTimeout(() => {
    //     cardRefs.current[expandedSummaryPanel]?.scrollIntoView({
    //       behavior: "smooth",
    //       block: "nearest",
    //     });
    //   }, 350);
    // }

    setExpandedSummaryPanel(null);
  };

  //PRINT-----------------
  const handlePrintVoucher = async (data) => {
    setSelectedVoucher(data);
    if (!isAndroid()) return; // Bluetooth printing is Android-only
    const ready = await preparePrinter(); // permission + Bluetooth-ON check
    if (!ready) return;
    setPrinterDialogOpen(true);
    scanPrinters(setPrinters);
  };

  //Print formate
  const formatESCPOSTextFromSummary = (record) => {
    let commands = "\x1B\x40"; // ESC @ - Initialize printer

    // Centered Header
    commands += "\x1B\x61\x01"; // Center alignment

    const storeName = storeAssets?.storeinfo?.[0]?.store_name || "Store Name";
    const storeAddress =
      storeAssets?.storeinfo?.[0]?.store_address || "Address NA";
    const storePhone = storeAssets?.storeinfo?.[0]?.store_phone || "Phone NA";

    commands += `${storeName}\n${storeAddress}\nMobile: ${storePhone}\n\n`;

    // Left-aligned content
    commands += "\x1B\x61\x00";

    // Basic member info
    commands += `Name          : ${record.name || "NA"}\n`;
    commands += `Member No     : ${record.mgroup ?? ""}-${
      record.member_no ?? ""
    }\n`;
    commands += `Voucher No    : ${record.voucher_no}\n`;
    commands += `Scheme Amount : ${record.scheme_amount}\n`;

    // Payment info
    const paymentMethod = (() => {
      const mode = record.collection_mode?.toLowerCase().trim();
      if (mode === "cash") return "Cash";
      if (mode === "cheque") return "Cheque";
      if (mode === "card") return "Card";
      return "Online Payment";
    })();

    const paymentTime = new Date(record.transaction_dt).toLocaleString(
      "en-GB",
      {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
    );

    commands += `Payment Mode  : ${paymentMethod}\n`;
    commands += `Payment Time  : ${paymentTime}\n`;
    commands += `Collected By  : ${currentAgent.agent_name}\n`;
    commands += "------------------------------\n";

    // Amount bold
    commands += "\x1B\x21\x08"; // Bold text
    commands += `Amount Collected: ${record.amount_collected}\n`;
    commands += "\x1B\x21\x00"; // Normal text
    commands += "==============================\n";

    // Thank you message
    commands += "\x1B\x61\x01"; // Center
    commands += "Thank you!\n\n";

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
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="100%"
      mt={3}
      mb={1}
    >
      {/* If there is no detail screen data */}
      {data.records.length === 0 && (
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

      {data.records.length !== 0 && (
        <Box
          sx={{
            width: "100%",
          }}
        >
          {data.records.map((record, index) => {
            const isExpanded = expandedSummaryPanel === index;
            // Details cards
            return (
              <>
                {/* Summary cards */}
                <Box
                  key={record.collection_id}
                  // ref={(el) => (cardRefs.current[index] = el)}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  flexDirection="column"
                  width="100%"
                >
                  {/* Details box */}
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      width: "100%",
                      borderRadius: 2.5,
                      p: 2,
                    }}
                  >
                    {/* Agent & plan details */}
                    <Box
                      display="flex"
                      alignItems="flex-start"
                      flexDirection="column"
                      gap={0.5}
                    >
                      {/* Agent details */}
                      <Typography
                        sx={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: theme.theme2.primaryHeading,
                        }}
                      >
                        {record.name}
                      </Typography>
                      {/* Plan details */}
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: theme.theme2.textCol,
                        }}
                      >
                        {record.voucher_no} |{" "}
                        {record.member_no === null && record.mgroup === null
                          ? ""
                          : `${record.mgroup} - ${record.member_no}`}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: theme.theme2.textCol,
                        }}
                      >
                        {(() => {
                          const mode = record.collection_mode
                            ?.toLowerCase()
                            .trim();
                          if (mode === "cash") return "Cash";
                          if (mode === "cheque") return "Cheque";
                          if (mode === "neft") return "Neft";
                          if (mode === "card") return "Card";
                          return "Online Payment";
                        })()}
                      </Typography>
                      {/* Ref No below mode in card */}
{record.ref_no && ["cheque", "neft", "card"].includes(record.collection_mode?.toLowerCase().trim()) && (
  <Typography
    sx={{
      fontSize: 12,
      fontWeight: 500,
      color: theme.theme2.textCol,
    }}
  >
    {(() => {
      const mode = record.collection_mode?.toLowerCase().trim();
      if (mode === "card")   return `Card No: ${record.ref_no}`;
      if (mode === "neft")   return `NEFT No: ${record.ref_no}`;
      if (mode === "cheque") return `Cheque No: ${record.ref_no}`;
    })()}
  </Typography>
)}
                    </Box>

                    {/* Amount & view more details */}
                    <Box
                      display="flex"
                      alignItems="flex-end"
                      flexDirection="column"
                      gap={0.5}
                    >
                      {/* Amount */}
                      <Typography
                        sx={{
                          fontSize: 16,
                          fontWeight: 500,
                          color: theme.theme2.primaryHeading,
                        }}
                      >
                        {record.amount_collected}/-
                      </Typography>
                      {/* View more */}
                      <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        onClick={() =>
                          isExpanded
                            ? handleHideSummaryDetails()
                            : handleShowSummaryDetails(index)
                        }
                        sx={{ width: "85px" }}
                      >
                        <Typography
                          sx={{
                            fontSize: 12,
                            fontWeight: 500,

                            color: theme.theme2.textCol2,
                          }}
                        >
                          View {!isExpanded ? "more" : "less"}
                        </Typography>

                        <ExpandMoreRoundedIcon
                          sx={{
                            height: 18,
                            width: 18,
                            fill: "#B98A46",
                            ml: 0.5,
                            transform: isExpanded
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                            transition: "transform 0.3s ease",
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Expandable summary info panel */}
                  <Collapse
                    in={isExpanded}
                    timeout={300}
                    unmountOnExit
                    sx={{ width: "100%" }}
                  >
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      flexDirection="column"
                      sx={{
                        width: "100%",
                        p: 2,
                        border: `1px solid ${theme.theme2.primaryButton}`,
                        borderRadius: 4,
                      }}
                    >
                      {/* Collection details */}
                      <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        flexDirection="column"
                        gap="0.875rem"
                        width="100%"
                      >
                        {/* Name */}
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          width="100%"
                        >
                          <Typography
                            sx={{ fontSize: 13, color: theme.theme2.textCol }}
                          >
                            Name
                          </Typography>
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: "#000",
                            }}
                          >
                            {record.name}
                          </Typography>
                        </Box>

                        {/* Voucher */}
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          width="100%"
                        >
                          <Typography
                            sx={{ fontSize: 13, color: theme.theme2.textCol }}
                          >
                            Voucher No
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: "#000",
                            }}
                          >
                            {record.voucher_no}
                          </Typography>
                        </Box>

                        {/* Pay method */}
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          width="100%"
                        >
                          <Typography
                            sx={{ fontSize: 13, color: theme.theme2.textCol }}
                          >
                            Payment Method
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: "#000",
                            }}
                          >
                            {(() => {
                              const mode = record.collection_mode
                                ?.toLowerCase()
                                .trim();
                              if (mode === "cash") return "Cash";
                              if (mode === "cheque") return "Cheque";
                              if (mode === "neft") return "Neft";
                              if (mode === "card") return "Card";
                              return "Online Payment";
                            })()}
                          </Typography>
                        </Box>

                        {/* Pay time */}
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          width="100%"
                        >
                          <Typography
                            sx={{ fontSize: 13, color: theme.theme2.textCol }}
                          >
                            Payment Time
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: "#000",
                            }}
                          >
                            {new Date(`${record.transaction_dt}`)
                              .toLocaleString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: false,
                              })
                              .replace(",", "")
                              .replace(" at", ",")}
                          </Typography>
                        </Box>

                        {/* Collector */}
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          width="100%"
                        >
                          <Typography
                            sx={{ fontSize: 13, color: theme.theme2.textCol }}
                          >
                            Collector
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: "#000",
                            }}
                          >
                            {currentAgent.agent_name}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Separator line */}
                      <Box
                        sx={{
                          width: "100%",
                          height: "1px",
                          bgcolor: "#DCDEE0",
                          mt: 1,
                          mb: 1,
                        }}
                      />

                      {/* Amount & pay status */}
                      <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        flexDirection="column"
                        width="100%"
                      >
                        {/* Amount */}
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          width="100%"
                        >
                          <Typography
                            sx={{ fontSize: 13, color: theme.theme2.textCol }}
                          >
                            Amount
                          </Typography>

                          <Typography sx={{ fontSize: 18 }}>
                            {new Intl.NumberFormat("en-IN").format(
                              record.amount_collected
                            )}
                          </Typography>
                        </Box>

                        {/* Pay status */}
                        <Box
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          width="100%"
                        >
                          <Box
                            sx={{
                              width: "15%",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              cursor: "pointer",
                            }}
                            onClick={() => handlePrintVoucher(record)}
                          >
                            <PrintRoundedIcon sx={{ fontSize: "1.5rem" }} />
                            <Typography
                              sx={{
                                fontSize: 12,
                                mt: 0.25,
                                mb: 1,
                                whiteSpace: "nowrap",
                                color: theme.colors.primaryButton,
                                fontWeight: "600",
                              }}
                            >
                              Print Summary
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Collapse>

                  {/* Separator line */}
                  <Box
                    sx={{
                      position: "relative",
                      transform: "translateX(-50%)",
                      left: "50%",
                      width: "100vw",
                      height: "1px",
                      bgcolor: "#F3E8DD",
                      mt: 0,
                    }}
                  />
                </Box>
              </>
            );
          })}
        </Box>
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
}

export default DetailScreen;
