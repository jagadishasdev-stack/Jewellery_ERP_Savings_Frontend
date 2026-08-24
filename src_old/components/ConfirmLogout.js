import { Backdrop, Typography, Box, Button } from "@mui/material";
import theme from "../theme";
export default function ConfirmLogout({
  open = false,
  handleConfirmLogout,
  hancleCancelLogout,
}) {
  return (
    // Loading screen overlay
    <Backdrop
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 1,
        flexDirection: "column",
      }}
      open={open}
    >
      <Box
        sx={{
          width: "70%",
          backgroundColor: "#fff",
          // height: "15vh",
          borderRadius: 2,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "1.2rem 1.2rem",
        }}
      >
        <Typography
          sx={{
            fontSize: "1.4rem",
            color: theme.colors.primaryButton,
            fontWeight: 600,
          }}
        >
          Confirm Logout!
        </Typography>
        <Box>
          <Button
            onClick={handleConfirmLogout}
            sx={{
              fontSize: "1rem",
              width: "35%",
              padding: 0.5,
              color: theme.colors.primaryButton,
              margin: 1,
              border: `1px solid ${theme.colors.primaryButton}`,
            }}
          >
            Yes
          </Button>
          <Button
            onClick={hancleCancelLogout}
            sx={{
              fontSize: "1rem",
              padding: 0.5,
              color: "#fff",
              width: "35%",
              margin: 1,
              border: `1px solid ${theme.colors.primaryButton}`,
              backgroundColor: theme.colors.primaryButton,
            }}
          >
            No
          </Button>
        </Box>
      </Box>
    </Backdrop>
  );
}
