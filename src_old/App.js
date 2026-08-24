import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  lazy,
  Suspense,
} from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import VerifyOtp from "./components/OtpVerificationPage";
import VerifyOtpPage from "./components/VerifyOtpPage";

import DashboardPage from "./components/DashboardPage";
import DashboardPage2 from "./components/DashboardPage2";
import DashboardPage3 from "./components/DashboardPage3";

import UserList from "./components/UserList";
import NotFound from "./components/NotFound";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import StoreManager from "./pages/StoreManager";
import BranchManager from "./pages/BranchManager";
import StoreAdmin from "./pages/StoreAdminManager";
import SmsTemplateManager from "./pages/SmsTemplateManager";

import { StoreContext, StoreProvider } from "./contexts/StoreContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";
import Header from "./components/Header";
import { Box } from "@mui/material";

import SelectPlanProcess from "./components/SelectPlanProcess";
import SavingPlansList from "./components/SavingPlansList";
import ContactInfo from "./components/ContactInfo";
import PaymentAndLedgerPage from "./components/PaymentAndLedgerPage";
import { App as CapacitorApp } from "@capacitor/app";
import EditUserInfo from "./components/EditUserInfo";
import SearchCustomer from "./components/SearchCustomer";
import ReportScreen from "./components/ReportScreen";
import SchemeDetailPage from "./components/SchemeDetailPageV2";
import ScrollToTop, {
  ScrollContainerContext,
  ScrollContainerProvider,
} from "./utils/ScrollToTop";
import "@fontsource/beau-rivage";
import APP_CONFIG from "./config/constants";

import PaymentSuccessful from "./components/PaymentSuccessful";
import { Capacitor } from "@capacitor/core";
import { useSafeAreaTop, useSafeAreaBottom } from "./SafeAreaFile";

import { AuthContext } from "./contexts/AuthContext";
import DigiMetalSchemes from "./components/DigiMetalSchemes";
import BuyMetalScreen from "./components/BuyMetalScreen";
import SplashScreen from "./components/splashscreen";
import { initPushNotifications } from "./initPushNotifications";
import PaymentHistory from "./components/phoepePaymenthistory";
import { PaymentGatewayProvider } from "./contexts/PaymentGatewayProvider";
import { EcomContext, EcomContextProvider } from "./contexts/EcomContext";
import { checkAppUpdate } from "./utils/checkAppUpdate";
import { Browser } from "@capacitor/browser";
import PaymentFailed from "./components/PaymentFailed";

// ---------- Lazy-loaded e‑commerce pages ----------
const LandingPage = lazy(() => import("./components/e-Commerce/LandingPage"));
const ProductViewer = lazy(() =>
  import("./components/e-Commerce/ProductViewer"),
);
const CartScreen = lazy(() => import("./components/e-Commerce/CartScreen"));
const Wishlist = lazy(() => import("./components/e-Commerce/Wishlist"));
const MyOrders = lazy(() => import("./components/e-Commerce/MyOrders"));

const AppLayout = () => {
  const topInset = useSafeAreaTop();
  const bottomInset = useSafeAreaBottom();
  const isIOS = Capacitor.getPlatform() === "ios";

  const safeAreaTop = topInset;
  const safeAreaBottom = bottomInset;

  const { adminUser, loginRole, isAuthLoading } = useContext(AuthContext);
  const { isEcomEnable } = useContext(StoreContext);
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainRef = useContext(ScrollContainerContext);

  useEffect(() => {
    if (!isAuthLoading && !adminUser && location.pathname !== "/") {
      navigate("/", { replace: true });
    }
  }, [adminUser, isAuthLoading]);

  const wasAlreadyLoggedIn = useRef(null);

  useEffect(() => {
    if (!isAuthLoading && wasAlreadyLoggedIn.current === null) {
      wasAlreadyLoggedIn.current = !!adminUser?.user_id;

      if (wasAlreadyLoggedIn.current) {
        initPushNotifications(true).catch((e) => console.error(e));
      }
    }
  }, [isAuthLoading, adminUser?.user_id]);

  // Keep the latest route/role in a ref so the back handler always reads fresh
  // values WITHOUT re-registering the listener on every navigation.
  const backCtxRef = useRef({
    pathname: location.pathname,
    state: location.state,
    loginRole,
  });
  useEffect(() => {
    backCtxRef.current = {
      pathname: location.pathname,
      state: location.state,
      loginRole,
    };
  }, [location.pathname, location.state, loginRole]);

  // Register the Android hardware back listener EXACTLY ONCE. Previously this
  // effect re-ran on every navigation and, because addListener resolves
  // asynchronously while cleanup ran synchronously, duplicate listeners piled
  // up — so one back press fired several navigate(-1) calls and jumped all the
  // way back. Registering once guarantees a single listener → back goes one
  // step at a time.
  useEffect(() => {
    let handler;
    let removed = false;

    CapacitorApp.addListener("backButton", () => {
      // ✅ Do not navigate away while a payment is being verified.
      if (window.__PAYMENT_VERIFYING__) {
        return;
      }

      const { pathname: path, state, loginRole: role } = backCtxRef.current;
      const destination =
        role === "agent" ? "/searchcustomers" : "/savingplanslist";

      if (
        path === "/paymentsuccess" ||
        path === "/paymentfailed" ||
        path.startsWith("/schemepay")
      ) {
        navigate(destination, {
          replace: true,
          state: { clearHistory: true },
        });
        return;
      }

      if (path === "/savingplanslist" && state?.clearHistory) {
        navigate("/dashboard", { replace: true });
        return;
      }

      if (path === "/" || path === "/dashboard") {
        CapacitorApp.exitApp();
        return;
      }

      navigate(-1);
    }).then((h) => {
      handler = h;
      if (removed) h.remove(); // effect unmounted before add resolved
    });

    return () => {
      removed = true;
      if (handler) handler.remove();
    };
  }, [navigate]);

  if (isAuthLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box
          sx={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: theme.palette.background.default,
          }}
        ></Box>
      </ThemeProvider>
    );
  }

  const isLoginRoute =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/verify-otp" ||
    location.pathname === "/signup" ||
    location.pathname === "/verify-signup-otp";

  const isDashboardRoute = location.pathname === "/dashboard";

  // Routes that replace the global app footer (bottom nav) with their own
  // e‑commerce action footer (Add to Cart / Buy Now, Proceed to Checkout /
  // Proceed to Pay). The Landing page and everything else keep the app footer.
  const usesEcomActionFooter =
    location.pathname === "/e-com/product" || location.pathname === "/cart";

  if (isLoginRoute) {
    if (adminUser && loginRole && loginRole !== "guest") {
      return <Navigate to="/dashboard" replace />;
    }
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <StoreProvider>
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/verify-signup-otp" element={<VerifyOtpPage />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/" element={<LoginPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </StoreProvider>
      </ThemeProvider>
    );
  }

  const getDashboardComponent = (themeId) => {
    switch (themeId) {
      case 1:
        return <DashboardPage />;
      case 2:
        return <DashboardPage2 />;
      case 3:
        return <DashboardPage3 />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: ["100vh", "-webkit-fill-available"],
          paddingTop: isIOS ? "var(--safe-area-top)" : safeAreaTop,
          paddingBottom: isIOS ? "var(--safe-area-bottom)" : safeAreaBottom,
          paddingLeft: "var(--safe-area-left)",
          paddingRight: "var(--safe-area-right)",
          boxSizing: "border-box",
          overflowX: "hidden",
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Box
          component="header"
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 2000,
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Header
            isDashboard={isDashboardRoute}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </Box>

        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        <Box
          component="main"
          ref={mainRef}
          sx={{
            flex: 1,
            mt: "56px",
            mb: usesEcomActionFooter ? 0 : "56px",
            px: 2,
            overflowY: "auto",
            overflowX: "hidden",
            scrollBehavior: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <ScrollToTop />
          <Routes>
            <Route
              path="/dashboard"
              element={getDashboardComponent(APP_CONFIG.THEME_ID)}
            />
            <Route path="/users" element={<UserList />} />
            <Route path="/storemanager" element={<StoreManager />} />
            <Route path="/branchmanager" element={<BranchManager />} />
            <Route path="/storeadmin" element={<StoreAdmin />} />
            <Route path="/smstemplate" element={<SmsTemplateManager />} />
            <Route path="/select-plan/*" element={<SelectPlanProcess />} />
            <Route path="/savingplanslist" element={<SavingPlansList />} />
            <Route path="/contactinfo" element={<ContactInfo />} />
            <Route path="/agentreport" element={<ReportScreen />} />
            <Route
              path="/paymentandledger"
              element={<PaymentAndLedgerPage />}
            />
            <Route path="/paymenthistory" element={<PaymentHistory />} />
            <Route path="/userInfo" element={<EditUserInfo />} />
            <Route path="/searchcustomers" element={<SearchCustomer />} />
            <Route
              path="/schemepay/:groupCode/:memberCode/:payableAmount/:selectedOption"
              element={<SchemeDetailPage />}
            />
            <Route
              path="/digi-metal/:metalType"
              element={<DigiMetalSchemes />}
            />
            <Route path="/buy-metal" element={<BuyMetalScreen />} />
            <Route path="/paymentsuccess" element={<PaymentSuccessful />} />
            <Route path="/paymentfailed" element={<PaymentFailed />} />

            {/* E‑commerce routes – only rendered when feature is enabled */}
            {isEcomEnable ? (
              <Route
                path="/e-com/*"
                element={
                  <Suspense
                    fallback={<div style={{ padding: 20 }}>Loading…</div>}
                  >
                    <Routes>
                      <Route path="categories" element={<LandingPage />} />
                      <Route path="product" element={<ProductViewer />} />
                    </Routes>
                  </Suspense>
                }
              />
            ) : (
              <Route
                path="/e-com/*"
                element={<Navigate to="/dashboard" replace />}
              />
            )}

            {isEcomEnable && (
              <Route
                path="/cart"
                element={
                  <Suspense fallback={<div>Loading…</div>}>
                    <CartScreen />
                  </Suspense>
                }
              />
            )}
            {isEcomEnable && (
              <Route
                path="/wishlist"
                element={
                  <Suspense fallback={<div>Loading…</div>}>
                    <Wishlist />
                  </Suspense>
                }
              />
            )}
            {isEcomEnable && (
              <Route
                path="/orders"
                element={
                  <Suspense fallback={<div>Loading…</div>}>
                    <MyOrders />
                  </Suspense>
                }
              />
            )}

            {/* Redirect standalone e‑commerce paths when feature is off */}
            {!isEcomEnable && (
              <>
                <Route
                  path="/cart"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route
                  path="/wishlist"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route
                  path="/orders"
                  element={<Navigate to="/dashboard" replace />}
                />
              </>
            )}

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Box>

        {!usesEcomActionFooter && (
          <Box
            component="footer"
            sx={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: theme.zIndex.appBar,
              paddingBottom: isIOS ? "var(--safe-area-bottom)" : safeAreaBottom,
              backgroundColor: theme.palette.background.default,
            }}
          >
            <Footer />
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
};

// ─── Force Update — blocks entire app ────────────────────────────
const ForceUpdateScreen = ({ data, onUpdate }) => {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "32px 24px",
        background: "#ffffff",
        zIndex: 99999,
      }}
    >
      <div style={{ fontSize: 56, marginBottom: 16 }}>🚨</div>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          margin: "0 0 12px",
          color: "#111",
        }}
      >
        Update Required
      </h2>
      <p
        style={{
          fontSize: 15,
          color: "#555",
          marginBottom: 32,
          lineHeight: 1.5,
        }}
      >
        {data.message}
      </p>
      {data.latest_version && (
        <span
          style={{
            display: "inline-block",
            background: "#f0f0f0",
            borderRadius: 20,
            padding: "4px 14px",
            fontSize: 13,
            color: "#444",
            marginBottom: 28,
          }}
        >
          Latest version: v{data.latest_version}
        </span>
      )}
      <button
        onClick={onUpdate}
        style={{
          width: "100%",
          maxWidth: 320,
          padding: "14px",
          fontSize: 16,
          fontWeight: 600,
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          cursor: "pointer",
        }}
      >
        Update Now
      </button>
    </div>
  );
};

// ─── Soft Update — dismissable banner ─────────────────────────────
const SoftUpdatePopup = ({ data, onUpdate, onDismiss }) => {
  return (
    <>
      <div
        onClick={onDismiss}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 9998,
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "#fff",
          borderRadius: "20px 20px 0 0",
          padding: "28px 24px 40px",
          boxShadow: "0 -6px 30px rgba(0,0,0,0.12)",
          zIndex: 9999,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 10 }}>🔔</div>
        <h3
          style={{
            margin: "0 0 8px",
            fontSize: 18,
            fontWeight: 700,
            color: "#111",
          }}
        >
          Update Available
        </h3>
        {data.latest_version && (
          <span
            style={{
              display: "inline-block",
              background: "#f0f0f0",
              borderRadius: 20,
              padding: "2px 12px",
              fontSize: 12,
              color: "#555",
              marginBottom: 10,
            }}
          >
            v{data.latest_version}
          </span>
        )}
        <p
          style={{
            fontSize: 14,
            color: "#666",
            marginBottom: 24,
            lineHeight: 1.5,
          }}
        >
          {data.message}
        </p>
        <button
          onClick={onUpdate}
          style={{
            width: "100%",
            padding: "13px",
            fontSize: 15,
            fontWeight: 600,
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            cursor: "pointer",
            marginBottom: 10,
          }}
        >
          Update Now
        </button>
        <button
          onClick={onDismiss}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: 14,
            background: "transparent",
            color: "#999",
            border: "none",
            cursor: "pointer",
          }}
        >
          Maybe Later
        </button>
      </div>
    </>
  );
};

function App() {
  const [update, setUpdate] = useState(null);
  const [softDismissed, setSoftDismissed] = useState(false);
  useEffect(() => {
    initUpdateCheck();
  }, []);

  const initUpdateCheck = async () => {
    const result = await checkAppUpdate();
    setUpdate(result);
  };

  const handleOpenStore = async () => {
    if (!update?.url) return;
    try {
      await Browser.open({ url: update.url });
    } catch (e) {
      window.open(update.url, "_blank");
    }
  };

  if (update?.type === "force") {
    return <ForceUpdateScreen data={update} onUpdate={handleOpenStore} />;
  }

  return (
    <>
      {update?.type === "soft" && !softDismissed && (
        <SoftUpdatePopup
          data={update}
          onUpdate={handleOpenStore}
          onDismiss={() => setSoftDismissed(true)}
        />
      )}
      <Router>
        <ScrollContainerProvider>
          <StoreProvider>
            <AuthProvider>
              <EcomContextProvider>
                <PaymentGatewayProvider>
                  <AppLayout />
                </PaymentGatewayProvider>
              </EcomContextProvider>
            </AuthProvider>
          </StoreProvider>
        </ScrollContainerProvider>
      </Router>
    </>
  );
}

export default App;
