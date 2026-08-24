import React, { useState, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import theme from "../theme";

// ── Branch Dropdown ───────────────────────────────────────────────────────────
// Shared branch picker (used by SavingPlansList and SelectPlan). Shows the
// branch CITY as the label (branch name as subtitle); the VALUE passed to
// onChange is the branch_code. Includes an "All Stores" option and hides
// itself when fewer than two real branches are available.
function BranchDropdown({
  branches,
  activeBranchCodes,
  selectedBranch,
  onChange,
}) {
  const [open, setOpen] = useState(false);

  const branchOptions = useMemo(() => {
    // When activeBranchCodes is provided, limit options to those codes
    // (SavingPlansList). When omitted, list EVERY branch from the branch
    // master (SelectPlan shows all store branches).
    const list = activeBranchCodes
      ? (branches || []).filter((b) =>
          activeBranchCodes.includes(b.branch_code),
        )
      : branches || [];
    return [
      { branch_code: "ALL", branch_city: "All Stores", branch_name: "" },
      ...list,
    ];
  }, [branches, activeBranchCodes]);

  // Don't render if only one real branch
  if (branchOptions.length <= 2) return null;

  const selected = branchOptions.find((b) => b.branch_code === selectedBranch);
  const label =
    selectedBranch === "ALL"
      ? "All Stores"
      : selected?.branch_city || selected?.branch_name || selectedBranch;

  const isFiltered = selectedBranch !== "ALL";

  return (
    <Box sx={{ position: "relative", width: "100%" }}>
      {/* Trigger button */}
      <Box
        onClick={() => setOpen((v) => !v)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          px: 1.5,
          py: 0.85,
          borderRadius: "10px",
          border: isFiltered
            ? `1.5px solid ${theme.colors?.primaryButton || "#b45309"}`
            : "1.5px solid #e5e7eb",
          backgroundColor: isFiltered
            ? `${theme.colors?.primaryButton || "#b45309"}12`
            : "#f9fafb",
          cursor: "pointer",
          transition: "all 0.18s ease",
          userSelect: "none",
          "&:active": { transform: "scale(0.98)" },
        }}
      >
        <LocationOnIcon
          sx={{
            fontSize: 15,
            color: isFiltered
              ? theme.colors?.primaryButton || "#b45309"
              : "#9ca3af",
            flexShrink: 0,
          }}
        />
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: isFiltered ? 700 : 500,
            color: isFiltered
              ? theme.colors?.primaryButton || "#b45309"
              : "#374151",
            flex: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </Typography>
        <KeyboardArrowDownIcon
          sx={{
            fontSize: 16,
            color: isFiltered
              ? theme.colors?.primaryButton || "#b45309"
              : "#9ca3af",
            transition: "transform 0.2s ease",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            flexShrink: 0,
          }}
        />
      </Box>

      {/* Dropdown panel */}
      {open && (
        <>
          {/* Backdrop */}
          <Box
            onClick={() => setOpen(false)}
            sx={{
              position: "fixed",
              inset: 0,
              zIndex: 99,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              zIndex: 100,
              backgroundColor: "#fff",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
              overflow: "hidden",
              animation: "dropIn 0.15s ease",
              "@keyframes dropIn": {
                from: { opacity: 0, transform: "translateY(-6px)" },
                to: { opacity: 1, transform: "translateY(0)" },
              },
            }}
          >
            {branchOptions.map((branch, idx) => {
              const isSelected = branch.branch_code === selectedBranch;
              return (
                <Box
                  key={branch.branch_code}
                  onClick={() => {
                    onChange(branch.branch_code);
                    setOpen(false);
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.5,
                    py: 1,
                    cursor: "pointer",
                    backgroundColor: isSelected
                      ? `${theme.colors?.primaryButton || "#b45309"}10`
                      : "transparent",
                    borderBottom:
                      idx < branchOptions.length - 1
                        ? "1px solid #f3f4f6"
                        : "none",
                    "&:active": {
                      backgroundColor: `${
                        theme.colors?.primaryButton || "#b45309"
                      }18`,
                    },
                  }}
                >
                  <LocationOnIcon
                    sx={{
                      fontSize: 15,
                      color: isSelected
                        ? theme.colors?.primaryButton || "#b45309"
                        : "#d1d5db",
                      flexShrink: 0,
                    }}
                  />
                  <Box flex={1} minWidth={0}>
                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: isSelected ? 700 : 500,
                        color: isSelected
                          ? theme.colors?.primaryButton || "#b45309"
                          : "#1f2937",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {branch.branch_code === "ALL"
                        ? "All Stores"
                        : branch.branch_city || branch.branch_name}
                    </Typography>
                    {branch.branch_code !== "ALL" && branch.branch_name && (
                      <Typography
                        sx={{
                          fontSize: 11,
                          color: "#9ca3af",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {branch.branch_name}
                      </Typography>
                    )}
                  </Box>
                  {isSelected && (
                    <CheckCircleIcon
                      sx={{
                        fontSize: 15,
                        color: theme.colors?.primaryButton || "#b45309",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
        </>
      )}
    </Box>
  );
}

export default BranchDropdown;
