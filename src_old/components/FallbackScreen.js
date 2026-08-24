import { Typography, Box } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import theme from "../theme";

// Icon
import CloudOffRoundedIcon from "@mui/icons-material/CloudOffRounded";

export default function FallbackScreen({ open = false, message = "" }) {
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate("/login");
  };

  return (
    <React.Fragment>
      <Box
        display="flex"
        alignItems="center"
        flexDirection="column"
        gap="1.2rem"
        width="100%"
        mt={3}
      >
        <CloudOffRoundedIcon
          sx={{
            fill: theme.colors.primaryButton,
            fontSize: "5rem",
            opacity: 0.5,
          }}
        />
        {/* Fallback message */}
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="75vw"
        >
          <Typography
            variant="body2"
            sx={{
              fontSize: 20,
              fontWeight: 500,
              textAlign: "center",
              color: theme.theme2.textCol,
            }}
          >
            {message}
          </Typography>
        </Box>

        {/* Redirect to loginPage button */}
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="30vw"
          height="5vh"
          onClick={handleRedirect}
          sx={{
            bgcolor: theme.colors.primaryButton,
            borderRadius: 2,
          }}
        >
          <Typography variant="button" color="#fff" fontWeight="600">
            Login Now
          </Typography>
        </Box>
      </Box>
    </React.Fragment>
  );
}
