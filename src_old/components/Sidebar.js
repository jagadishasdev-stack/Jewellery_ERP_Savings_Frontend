import React, { useEffect, useState, useContext, useRef } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  Box,
  Toolbar,
  Button,
  Avatar,
  Stack,
  Typography,
  Dialog,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import userIcon from "../assets/img/icons/magic-star.svg";
import theme from "../theme";
import Location from "../assets/img/icons/location.svg";
import Payments from "../assets/img/icons/moneys.svg";
import About from "../assets/img/icons/people.svg";
import Contact from "../assets/img/icons/call-calling.svg";
import Terms from "../assets/img/icons/note.svg";
import Rate from "../assets/img/icons/star.svg";
import arrowIcon from "../assets/img/icons/arrow-circle-right.svg";
import Truck from "../assets/img/icons/truck-fast.svg";
import Heart from "../assets/img/icons/heart.svg";
import user from "../assets/img/icons/footer-profile.svg";
import { StoreContext } from "../contexts/StoreContext";
import ConfirmLogout from "./ConfirmLogout";
import LoadingScreen from "./LoadingScreen";
import { AuthContext } from "../contexts/AuthContext";
import { useSafeAreaTop, useSafeAreaBottom } from "../SafeAreaFile";
import { Capacitor } from "@capacitor/core";
// import { Browser } from "@capacitor/browser";
import TermsPage from "./TermsPage";
import AboutUsPage from "./AboutUsPage";
import PrivacyPolicyPage from "./PrivacyPolicyPage";
import RefundPolicyPage from "./Refundpolicypage";
import ShippingDeliveryPage from "./ShippingDeliveryPage";
// import { CapacitorHttp } from "@capacitor/core";
import InAppPage from "./InAppPage";
import { AppLauncher } from "@capacitor/app-launcher";
import APP_CONFIG from "../config/constants";
import { App } from "@capacitor/app";
export const drawerWidth = 320;

function Sidebar({ open, setOpen }) {
  const topInset = useSafeAreaTop();
  const bottomInset = useSafeAreaBottom();
  const isIOS = Capacitor.getPlatform() === "ios";
  const [appVersion, setAppVersion] = useState("");
  const safeAreaTop = topInset;
  const safeAreaBottom = bottomInset;

  //loCAL STORAGE DATA
  // const admin = JSON.parse(localStorage.getItem("adminUser"));
  // const role = localStorage.getItem("loginRole");

  const { loginRole, adminUser, clearLoginData } = useContext(AuthContext);

  const admin = adminUser;
  const role = loginRole;

  const [logoutFlag, setLogoutFlag] = useState(false);
  const [dialogState, setDialogState] = useState({ open: false, type: null });
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const iframeTimeoutRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { storeAssets, isEcomEnable } = useContext(StoreContext);
  const termsUrl = storeAssets?.storeinfo?.[0]?.terms;
  const aboutusUrl = storeAssets?.storeinfo?.[0]?.contact_us;
  const ratingUrl = storeAssets?.storeinfo?.[0]?.playstore_path;
  // console.log(termsUrl,aboutusUrl,ratingUrl);
  // Replace your existing dialogState with two simple boolean states
  const [showTerms, setShowTerms] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [showShipping, setShowShipping] = useState(false);
  const [inAppPage, setInAppPage] = useState({
    open: false,
    url: "",
    title: "",
  });
  // Store URLs
  const appId = APP_CONFIG.appid; // "com.asterix.nama"
  // console.log('apppppp',appId);

  const PLAY_STORE_URL = `market://details?id=${appId}`;
  const PLAY_STORE_WEB_URL = `https://play.google.com/store/apps/details?id=${appId}`;
  const APP_STORE_URL = `itms-apps://itunes.apple.com/app/${APP_CONFIG.appleid}`;
  const APP_STORE_WEB_URL = `https://apps.apple.com/app/id1234567890`;
  useEffect(() => {
    const getVersion = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          const info = await App.getInfo();
          setAppVersion(info.version);
        } else {
          setAppVersion("1.0.0"); // fallback for web/browser
        }
      } catch (e) {
        console.warn("Could not get app version:", e);
        setAppVersion("");
      }
    };
    getVersion();
  }, []);
  const menuItems = [
    isEcomEnable && {
      label: "Orders",
      path: "/orders",
      icon: Truck,
      subheading: "Track Your order status here",
    },
    role === "user" && {
      // ✅ only shows for “user” role
      label: "Saved Address",
      path: "/userInfo",
      icon: Location,
      subheading: "All your saved address are here",
    },
    isEcomEnable && {
      label: "Wishlist",
      path: "/wishlist",
      icon: Heart,
      subheading: "Your Most loved jewellery",
    },
    role === "user" && {
      label: "Payments",
      path: "/savingplanslist",
      icon: Payments,
      subheading: "Payment links generated for you",
    },
    role === "user" && {
      label: "Payment History",
      path: "/paymenthistory",
      icon: Payments,
      subheading: "Payment links generated for you",
    },
    role === "agent" && {
      label: "Reports",
      path: "/agentreport",
      icon: Payments,
      subheading: "Quick and detailed report of collections.",
    },
    {
      label: "About Us",
      path: "/about",
      icon: About,
      subheading: "Detailed info of our store & more",
    },
    {
      label: "Contact Us",
      path: "/contactinfo",
      icon: Contact,
      subheading: "Feel free to reach out",
    },
    {
      label: "Terms & Conditions",
      path: "/terms",
      icon: Terms,
      subheading: "Details of T&C attached here",
    },
    {
      label: "Rate Us",
      path: "/rateus",
      icon: Rate,
      subheading: "Helps us to improve and make your Journey easier",
    },
    {
      label: "Privacy Policy",
      path: "/privacy",
      icon: Terms,
      subheading: "How we protect your data",
    },
    // {
    //   label: "Refund Policy",
    //   path: "/refund",
    //   icon: Terms,
    //   subheading: "Our refund process explained",
    // },
    // {
    //   label: "Shipping & Delivery",
    //   path: "/shipping",
    //   icon: Terms,
    //   subheading: "How we ship your orders",
    // },
  ].filter(Boolean); // 🧹 removes the “false” when role !== "user"

  //****************************** */

  // const openUrl = async (url) => {
  //   if (Capacitor.isNativePlatform()) {
  //     await Browser.open({ url });     // iOS/Android — in-app browser with back button
  //   } else {
  //     window.open(url, "_blank");      // Web fallback — new tab
  //   }
  // };

  const finalMenuItems =
    admin !== null
      ? [
          ...menuItems,
          { label: "Logout", path: "/", icon: user, subheading: "" },
        ]
      : [
          ...menuItems,
          { label: "Login", path: "/", icon: user, subheading: "" },
        ];

  useEffect(() => {
    if (
      dialogState.open &&
      (dialogState.type === "terms" || dialogState.type === "about")
    ) {
      setIframeLoaded(false);
      setIframeError(false);
      iframeTimeoutRef.current = setTimeout(() => {
        setIframeError(true);
      }, 15000);
    }
    return () => clearTimeout(iframeTimeoutRef.current);
  }, [dialogState]);

  //   const handleMenuClick = (item) => {
  //  if (item.label === "Terms & Conditions") {
  //   openUrl(termsUrl);       // ✅
  //   setOpen(false);
  // } else if (item.label === "About Us") {
  //   openUrl(aboutusUrl);     // ✅
  //   setOpen(false);
  // } else if (item.label === "Rate Us") {
  //       window.open(ratingUrl, "_blank");
  //       setOpen(false);
  //     } else if (item.label === "Logout") {
  //       setLogoutFlag(true);
  //       setOpen(false);
  //     } else {
  //       setDialogState({ open: false, type: null });
  //       navigate(item.path);
  //       setOpen(false);
  //     }
  //   };

  // Update handleMenuClick

  const handleMenuClick = (item) => {
    if (item.label === "Terms & Conditions") {
      setShowTerms(true); // ✅ open in-app
      setOpen(false);
    } else if (item.label === "About Us") {
      setShowAbout(true); // ✅ open in-app
      setOpen(false);
      // if (item.label === "Terms & Conditions") {
      //   setInAppPage({ open: true, url: termsUrl, title: "Terms & Conditions" }); // ✅ changed
      //   setOpen(false);
      // } else if (item.label === "About Us") {
      //   setInAppPage({ open: true, url: aboutusUrl, title: "About Us" }); // ✅ changed
      //   setOpen(false);
    } else if (item.label === "Rate Us") {
      handleOpenStore(); // ✅ directly opens Play Store / App Store
      setOpen(false);
    } else if (item.label === "Logout") {
      setLogoutFlag(true);
      setOpen(false);
    } else if (item.label === "Privacy Policy") {
      setShowPrivacy(true);
      setOpen(false);
    }
    //  else if (item.label === "Refund Policy") {
    //   setShowRefund(true);
    //   setOpen(false);
    // } else if (item.label === "Shipping & Delivery") {
    //   setShowShipping(true);
    //   setOpen(false);
    // }
    else {
      navigate(item.path);
      setOpen(false);
    }
  };
  const handleConfirmLogout = async () => {
    await clearLoginData();
    navigate("/");

    // Force full reload after small delay to reset route memory
    // setTimeout(() => {
    //   window.location.reload();
    // }, 100);
  };

  const handleCancelLogout = () => {
    setLogoutFlag(false);
    setOpen(false);
    navigate("/dashboard");
  };

  const handleEditBtn = () => {
    role === "user" ? navigate("/userInfo") : navigate("/login");
    setOpen(false);
  };

  const handleOpenStore = async () => {
    const platform = Capacitor.getPlatform(); // "ios" | "android" | "web"
    const isNative = Capacitor.isNativePlatform(); // true only on real device/emulator

    // Step 1 — Check if running on native device
    if (isNative) {
      // Step 2 — Check platform iOS or Android
      if (platform === "ios") {
        try {
          await AppLauncher.openUrl({ url: APP_STORE_URL });
        } catch {
          // App Store app failed — fallback to browser
          window.open(APP_STORE_WEB_URL, "_blank");
        }
      } else if (platform === "android") {
        try {
          await AppLauncher.openUrl({ url: PLAY_STORE_URL });
        } catch {
          // Play Store app failed — fallback to browser
          window.open(PLAY_STORE_WEB_URL, "_blank");
        }
      }
    } else {
      // Step 3 — Running in browser/web — no app launcher available
      window.open(PLAY_STORE_WEB_URL, "_blank");
    }
  };

  const iframeUrl =
    dialogState.type === "terms"
      ? termsUrl
      : dialogState.type === "about"
      ? aboutusUrl
      : "";

  return (
    <>
      {logoutFlag && (
        <ConfirmLogout
          handleConfirmLogout={handleConfirmLogout}
          hancleCancelLogout={handleCancelLogout}
          open={logoutFlag}
          setLogoutFlag={setLogoutFlag}
        />
      )}
      {/* ✅ NEW — In-app pages */}
      <TermsPage open={showTerms} onClose={() => setShowTerms(false)} />
      <AboutUsPage open={showAbout} onClose={() => setShowAbout(false)} />
      {/* // ✅ ADD this one instead */}
      <InAppPage
        open={inAppPage.open}
        onClose={() => setInAppPage({ open: false, url: "", title: "" })}
        url={inAppPage.url}
        title={inAppPage.title}
      />
      <PrivacyPolicyPage
        open={showPrivacy}
        onClose={() => setShowPrivacy(false)}
      />
      {/* <RefundPolicyPage
        open={showRefund}
        onClose={() => setShowRefund(false)}
      />
      <ShippingDeliveryPage
        open={showShipping}
        onClose={() => setShowShipping(false)}
      /> */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          zIndex: 1200,
          "& .MuiDrawer-paper": {
            // mt: isIOS ? "56px" : `calc(56px + ${safeAreaTop})`,
            pt: isIOS
              ? `calc(56px + var(--safe-area-top))`
              : `calc(56px + ${safeAreaTop})`,
            width: drawerWidth,
            boxSizing: "border-box",
            height: "100%",
            overflowX: "hidden",
          },
        }}
      >
        {/* <Toolbar /> */}
        {admin && (
          <Box
            sx={{
              p: 2,
              borderBottom: "1px solid #ffff",
              background: `linear-gradient(10deg, ${theme.colors.primaryButton}, ${theme.colors.bordercolor})`,
              position: "relative",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar
                src={userIcon}
                alt="User"
                sx={{ width: 30, height: 30, bgcolor: "#fff" }}
              />
              <Box sx={{ flex: 1, color: "#fff" }}>
                <Typography sx={{ fontSize: "0.8rem" }}>
                  {role === "agent" ? admin.agent_name : admin.name}
                </Typography>
                <Typography sx={{ fontSize: "0.8rem" }}>
                  {role === "agent" && admin.agent_mobile}
                  {role === "user" ? admin.mobile : "Guest"}
                </Typography>
                <Typography
                  sx={{
                    display: "flex",
                    fontSize: "0.8rem",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  }}
                >
                  {role === "agent" ? admin.agent_email : admin.email}
                </Typography>
              </Box>
            </Stack>

            {role !== "agent" && (
              <Button
                onClick={handleEditBtn}
                variant="outlined"
                size="small"
                sx={{
                  fontSize: 12,
                  borderColor: "#fff",
                  color: "#fff",
                  position: "absolute",
                  top: 23,
                  right: 15,
                  zIndex: 1,
                }}
              >
                {role === "user" ? "Edit" : "Login"}
              </Button>
            )}
          </Box>
        )}

        <Box sx={{ overflow: "auto" }}>
          <List>
            {finalMenuItems.map((item, index) => (
              <React.Fragment key={index}>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => handleMenuClick(item)}
                  sx={{ display: "flex", alignItems: "center", p: 1.2 }}
                >
                  <img
                    src={item.icon}
                    alt=""
                    style={{ width: 24, height: 24, marginRight: 16 }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: "0.8rem" }}>
                      {item.label}
                    </Typography>
                    <Typography
                      sx={{ fontSize: "0.6rem", color: "text.secondary" }}
                    >
                      {item.subheading}
                    </Typography>
                  </Box>
                  <img
                    src={arrowIcon}
                    alt=""
                    style={{ width: 24, height: 24, marginLeft: "auto" }}
                  />
                </ListItemButton>
                <Box
                  sx={{ height: "1px", background: "#fff", margin: "0 16px" }}
                />
              </React.Fragment>
            ))}
          </List>
        </Box>

        {/* App Version — bottom of sidebar */}
        {appVersion ? (
          <Box
            sx={{
              position: "absolute",
              bottom: safeAreaBottom || 16,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
              pb: 1,
            }}
          >
            <Typography
              sx={{
                fontSize: "14px",
                color: "text.disabled",
                textAlign: "center",
              }}
            >
              Version {appVersion}
            </Typography>
          </Box>
        ) : null}
      </Drawer>
      {/* Unified Dialog for Terms or About */}
      <Dialog
        fullScreen
        open={dialogState.open}
        onClose={() => setDialogState({ open: false, type: null })}
        sx={{
          paddingTop: isIOS ? "var(--safe-area-top)" : safeAreaTop,
          zIndex: 10000, // Higher than your header's 2000
          "& .MuiDialog-paper": {
            zIndex: 10000,
          },
        }}
      >
        {iframeUrl && !iframeError ? (
          <Box
            sx={{
              position: "fixed",
              paddingBottom: "env(safe-area-inset-bottom, 44px)",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              width: "100%",
              // zIndex: 900000,
            }}
          >
            {!iframeLoaded && <LoadingScreen />}

            <Box flexGrow={1} position="relative">
              <iframe
                src={iframeUrl}
                style={{ width: "100%", height: "100%", border: "none" }}
                title={
                  dialogState.type === "terms"
                    ? "Terms and Conditions"
                    : "About Us"
                }
                onLoad={() => {
                  setIframeLoaded(true);
                  setIframeError(false);
                  clearTimeout(iframeTimeoutRef.current);
                }}
                onError={() => setIframeError(true)}
              />
            </Box>

            <Box
              sx={{
                padding: 2,
                borderTop: "1px solid #ccc",
                backgroundColor: "#fff",
                textAlign: "center",
              }}
            >
              <Button
                sx={{
                  backgroundColor: "#000",
                  boxShadow: "2px 2px",
                  marginBottom: 2,
                }}
                variant="contained"
                onClick={() => setDialogState({ open: false, type: null })}
              >
                Back
              </Button>
            </Box>
          </Box>
        ) : (
          <Box
            p={4}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <Typography variant="h6" gutterBottom>
              No content to show
            </Typography>
            <Button
              sx={{ backgroundColor: "#000", marginBottom: 2 }}
              variant="contained"
              onClick={() => setDialogState({ open: false, type: null })}
            >
              Back
            </Button>
          </Box>
        )}
      </Dialog>
    </>
  );
}

export default Sidebar;
