import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import theme from "../theme";

// Icons
import { ReactComponent as HomeIcon } from "../assets/img/icons/footer-home.svg";
import { ReactComponent as CategoriesIcon } from "../assets/img/icons/footer-category.svg";
import { ReactComponent as PlanIcon } from "../assets/img/icons/footer-note.svg";
import { ReactComponent as ChatIcon } from "../assets/img/icons/footer-text.svg";
import { ReactComponent as SearchIcon } from "../assets/img/icons/footer-search.svg";
import { ReactComponent as ReportIcon } from "../assets/img/icons/footer-reports.svg";
import { ReactComponent as AllPlansIcon } from "../assets/img/icons/footer-allPlans.svg";
import { AuthContext } from "../contexts/AuthContext";
import { StoreContext } from "../contexts/StoreContext";

function Footer() {
  const { loginRole } = useContext(AuthContext);
  const { isEcomEnable } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();
  const role = loginRole;

  const iconStyle = { width: 20, height: 20 };

  /** Map current pathname → BottomNavigation value (0‑4) */
  const currentIndex = React.useMemo(() => {
    const path = location.pathname.toLowerCase();

    if (path.includes("/dashboard")) return 0;
    if (path.includes("/categories") || path.includes("/agentreport")) return 1;
    if (
      path.includes("/savingplanslist") ||
      path.includes("/searchcustomers") ||
      path.includes("/paymentandledger")
    )
      return 2;
    if (path.includes("/contactinfo")) return 3;
    if (path.includes("/select-plan")) return 4;

    return 0; // default
  }, [location.pathname]);

  /** Handle tab clicks */
  const handleChange = (_, newValue) => {
    switch (newValue) {
      case 0:
        navigate("/dashboard");
        break;
      case 1:
        role === "agent"
          ? navigate("/agentreport")
          : navigate("/e-com/categories");
        break;
      case 2:
        role === "agent"
          ? navigate("/searchcustomers")
          : navigate("/savingplanslist");
        break;
      case 3:
        navigate("/contactinfo");
        break;
      case 4:
        navigate("/select-plan");
        break;
      default:
        break;
    }
  };

  return (
    <Paper
      sx={{
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        backgroundColor: theme.palette.background.default,
        boxShadow: "0 -4px 6px -4px rgba(0, 0, 0, 0.3)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
        boxSizing: "border-box",
      }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={currentIndex}
        onChange={handleChange}
        sx={{
          backgroundColor: theme.palette.background.default,
          "& .Mui-selected": {
            color: theme.colors.primaryButton,
            "& svg path, & svg circle, & svg rect, & svg line, & svg polygon, & svg polyline":
              { stroke: `${theme.colors.primaryButton} !important` },
          },
        }}
      >
        {/* 0. Home (always visible) */}
        <BottomNavigationAction
          value={0}
          sx={{
            padding: 0,
            minWidth: 0,
            flex: 1,
            backgroundColor: theme.palette.background.default,
          }}
          label="Home"
          icon={<HomeIcon style={iconStyle} />}
        />

        {/* 1. Report (agent only) or Shopping (non‑agent only when e‑commerce enabled) */}
        {role === "agent" ? (
          <BottomNavigationAction
            value={1}
            sx={{
              padding: 0,
              minWidth: 0,
              flex: 1,
              backgroundColor: theme.palette.background.default,
            }}
            label="Report"
            icon={<ReportIcon style={iconStyle} />}
          />
        ) : (
          isEcomEnable && (
            <BottomNavigationAction
              value={1}
              sx={{
                padding: 0,
                minWidth: 0,
                flex: 1,
                backgroundColor: theme.palette.background.default,
              }}
              label="Shopping"
              icon={<CategoriesIcon style={iconStyle} />}
            />
          )
        )}

        {/* 2. Search (agent) / My Plans (others) */}
        <BottomNavigationAction
          value={2}
          sx={{
            padding: 0,
            minWidth: 0,
            flex: 1,
            backgroundColor: theme.palette.background.default,
          }}
          label={role === "agent" ? "Search" : "My plans"}
          icon={
            role === "agent" ? (
              <SearchIcon style={iconStyle} />
            ) : (
              <PlanIcon style={iconStyle} />
            )
          }
        />

        {/* 3. Chat */}
        <BottomNavigationAction
          value={3}
          sx={{
            padding: 0,
            minWidth: 0,
            flex: 1,
            backgroundColor: theme.palette.background.default,
          }}
          label="Chat"
          icon={<ChatIcon style={iconStyle} />}
        />

        {/* 4. All Plans */}
        <BottomNavigationAction
          value={4}
          sx={{
            padding: 0,
            minWidth: 0,
            flex: 1,
            backgroundColor: theme.palette.background.default,
          }}
          label="All Plans"
          icon={<AllPlansIcon style={iconStyle} />}
        />
      </BottomNavigation>
    </Paper>
  );
}

export default Footer;
