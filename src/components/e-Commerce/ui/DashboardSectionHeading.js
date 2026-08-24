import React from "react";
import { Box, Typography } from "@mui/material";
import theme from "../../../theme";

// Section heading that matches the DashboardPage3 headings (e.g. "Saving
// Plans") — same font, colour, size and the underlined "View all" link — so
// the e-commerce sections added to the dashboard look consistent with it.
const DashboardSectionHeading = ({ title, onViewAll }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      mb: 1,
    }}
  >
    <Typography
      sx={{
        fontSize: "16px",
        fontWeight: 600,
        color: theme.ecommerce.sectionHeadingCol,
      }}
    >
      {title}
    </Typography>
    {onViewAll && (
      <Typography
        onClick={onViewAll}
        sx={{
          cursor: "pointer",
          color: theme.ecommerce.viewAllCol,
          textDecoration: "underline",
          fontSize: "14px",
        }}
      >
        View all
      </Typography>
    )}
  </Box>
);

export default DashboardSectionHeading;
