import React, { useEffect, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";
import theme from "../theme";

// Components
import PaymentScreen from "./PaymentScreen";
import Ledger from "./Ledger";

// Icons
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import AutoFixHighRoundedIcon from "@mui/icons-material/AutoFixHighRounded";

function PaymentAndLedgerPage() {
  // Accessing location.state data passed via router navigation from SavingPlansList
  const location = useLocation();

  const tabRefs = useRef([]);
  const { data, userInfo } = location?.state || {};
  const [activeTab, setActiveTab] = useState(0);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const digiGold = {
    isDigiGold: data?.gold_scheme,
    totalAmount: data?.amountPaid,
    goldBalance: data?.gold_balance,
  };

  // Update the tab indicator position on tab change
  useEffect(() => {
    const tab = tabRefs.current[activeTab];
    if (tab) {
      const { offsetLeft, offsetWidth } = tab;
      setIndicatorStyle({ left: offsetLeft, width: offsetWidth });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  // Setting the tabs data
  const tabs = [
    // Button for PaymentScreen
    {
      label: "Pay",
      icon: AccountBalanceWalletRoundedIcon,
      component: <PaymentScreen data={data} userInfo={userInfo} />,
    },

    // Button for LedgerScreen
    {
      label: "Ledger",
      icon: FactCheckRoundedIcon,
      component: <Ledger digiGold={digiGold} data={data} userInfo={userInfo} />,
    },
  ];

  // Setting schemeInfo arriving from SavingPlansList component
  const schemeInfo = {
    groupNo: data?.mgroup,
    memberNo: data?.member_no,
  };

  return (
    <React.Fragment>
      {/* Tabs container */}
      <Box
        // marginBottom="1.2rem"
        sx={{
          width: "100vw",
          marginLeft: "-16px",
          marginRight: "-16px",
        }}
      >
        {" "}
        <Box
          display="flex"
          justifyContent="space-around"
          alignItems="center"
          width="100%"
          padding="0.4rem 0"
          borderBottom="0.5px solid #DFDFDF "
          borderTop="0.5px solid #DFDFDF "
          sx={{ backgroundColor: theme.paymentAndLedger.payInfoTabSectionBg }}
        >
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap="0.8rem"
          >
            <GroupRoundedIcon
              sx={{ fill: "#808080", height: "24px", width: "24px" }}
            />
            <Typography variant="body2" color={theme.theme2.textCol}>
              {schemeInfo.groupNo}-{schemeInfo.memberNo}
            </Typography>
          </Box>
          {/* <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            gap="0.2rem"
          >
            <AutoFixHighRoundedIcon
              sx={{ fill: "#808080", height: "24px", width: "24px" }}
            />
            <Typography variant="body2" color="#808080">
              Member No - {schemeInfo.memberNo}
            </Typography>
          </Box> */}
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            position: "relative",
            paddingTop: "1rem",
          }}
        >
          {/* Tab buttons */}
          {tabs.map(({ label, icon: Icon }, index) => {
            const isActive = activeTab === index;
            return (
              <Box
                key={label}
                ref={(el) => (tabRefs.current[index] = el)}
                onClick={() => setActiveTab(index)}
                sx={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: isActive
                    ? theme.paymentAndLedger.payInfoTabColActive
                    : theme.paymentAndLedger.payInfoTextCol,
                  fontWeight: "bold",
                  fontSize: "1rem",
                  position: "relative",
                  padding: "0 0.75rem 1rem 0.75rem",
                }}
              >
                <Icon
                  sx={{
                    fill: isActive
                      ? theme.paymentAndLedger.payInfoTabColActive
                      : theme.paymentAndLedger.payInfoTextCol,
                    height: "1.5rem",
                    width: "1.5rem",
                  }}
                />
                {label}
              </Box>
            );
          })}

          {/* Animated indicator */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              height: "5px",
              bgcolor: theme.paymentAndLedger.payInfoTabColActive,
              borderRadius: "25px 25px 0 0",
              transition: "all 0.3s ease",
              ...indicatorStyle,
            }}
          />
        </Box>
      </Box>

      {/* Tab content */}
      {tabs[activeTab].component}
    </React.Fragment>
  );
}

export default PaymentAndLedgerPage;
