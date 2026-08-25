import React, { useContext, useState, useEffect, useRef } from "react";
import { keyframes } from "@emotion/react";
import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";
import {
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  Box,
  IconButton,
  Typography,
  Badge,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { ReactComponent as FavoriteIcon } from "../assets/img/icons/Vector.svg";
import { ReactComponent as ShoppingCartIcon } from "../assets/img/icons/shopping bag.svg";
import theme from "../theme";
import Logo from "../assets/img/logo/logo.png";
import { AuthContext } from "../contexts/AuthContext";
import { useSafeAreaTop, useSafeAreaBottom } from "../SafeAreaFile";
import APP_CONFIG from "../config/constants";

import { EcomContext } from "../contexts/EcomContext";
import { StoreContext } from "../contexts/StoreContext";
// There is no ../assets/img/store/store.png in this repo — a runtime
// try/catch around require() here looked like a safe "use it if present"
// guard, but webpack resolves require() paths at BUILD time, not runtime,
// so a missing file fails the build outright (fatal under CI=true, which
// most CI/CD hosts — Netlify, Vercel, GitHub Actions — set by default,
// even though a plain local `npm run build` happened to warn instead of
// fail). Since the file has never existed, the try/catch always landed on
// null anyway — this is the exact same real-world behavior (the
// Typography text-logo fallback below always rendered), just without a
// require() pointed at a file that can't resolve. Add a real
// store/store.png and restore the require() if a store logo image is
// ever wanted here.
const store_name = null;
// Little "jump" whenever an item lands in the cart (count goes up).
const cartBump = keyframes`
  0%   { transform: scale(1); }
  30%  { transform: scale(1.28) translateY(-3px); }
  55%  { transform: scale(0.9); }
  80%  { transform: scale(1.06); }
  100% { transform: scale(1); }
`;

// Header cart button — "add to cart" icon + a premium count badge that bounces
// when the cart count increases. Shared by both header layouts (dashboard and
// inner pages) so the look/animation stays identical and lives in one place.
function CartIconButton({ isEcomEnable, cartCount, onClick }) {
  const [bump, setBump] = useState(false);
  const prevCount = useRef(cartCount);

  useEffect(() => {
    if (cartCount > prevCount.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 500);
      prevCount.current = cartCount;
      return () => clearTimeout(t);
    }
    prevCount.current = cartCount;
  }, [cartCount]);

  return (
    <IconButton
      disabled={!isEcomEnable}
      onClick={onClick}
      sx={{
        color: theme.colors.primaryHeading,
        backgroundColor: "rgba(161,22,33,0.06)",
        borderRadius: "50%",
        padding: "8px",
        position: "relative",
        visibility: !isEcomEnable ? "hidden" : "visible",
        transition: "background-color 0.15s ease",
        "&:hover, &:active": { backgroundColor: "rgba(161,22,33,0.14)" },
      }}
    >
      <Badge
        badgeContent={cartCount > 0 ? cartCount : 0}
        overlap="circular"
        sx={{
          animation: bump ? `${cartBump} 0.5s ease` : "none",
          "& .MuiBadge-badge": {
            background: `linear-gradient(135deg, ${theme.theme2.notificationBadge} 0%, #3A0A0F 100%)`,
            color: "#fff",
            fontSize: "10px",
            fontWeight: 700,
            minWidth: "18px",
            height: "18px",
            padding: "0 4px",
            borderRadius: "9px",
            border: "1.5px solid #fff",
            boxShadow: "0 2px 5px rgba(118,74,0,0.4)",
          },
        }}
      >
        <AddShoppingCartOutlinedIcon sx={{ fontSize: 21 }} />
      </Badge>
    </IconButton>
  );
}

function Header({ isDashboard, sidebarOpen, setSidebarOpen }) {
  const { cartCount } = useContext(EcomContext);
  const { isEcomEnable } = useContext(StoreContext);

  const theme_id = APP_CONFIG.THEME_ID;
  const { loginRole } = useContext(AuthContext);
  const [tab, setTab] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const topInset = useSafeAreaTop();
  const safeAreaTop = topInset;
  const handleBack = () => {
    // ✅ If the fullscreen image viewer is open, back just closes it (one step)
    // so the user stays on the product page. No-op on every other screen.
    if (typeof window.__IMAGE_VIEWER_CLOSE__ === "function") {
      window.__IMAGE_VIEWER_CLOSE__();
      return;
    }

    const path = location.pathname;
    const destination =
      loginRole === "agent" ? "/searchcustomers" : "/savingplanslist";
    // ✅ After payment or on schemepay → go to savingplanslist with clearHistory
    if (
      path === "/paymentsuccess" ||
      path === "/paymentfailed" ||
      path.startsWith("/schemepay")
    ) {
      navigate(destination, { replace: true, state: { clearHistory: true } });
      return;
    }

    // ✅ On savingplanslist after payment → go to dashboard
    if (path === "/savingplanslist" && location.state?.clearHistory) {
      navigate("/dashboard", { replace: true });
      return;
    }

    // Normal back
    navigate(-1);
  };

  const tabOptions = [
    {
      label: "Master",
      options: [
        { label: "Saving Plans", path: "/savingplanslist" },
        { label: "Store Admin", path: "/storeadmin" },
        { label: "Branch Master", path: "/branchmanager" },
        { label: "SMS Template", path: "/smstemplate" },
      ],
    },
    {
      label: "Reports",
      options: [
        { label: "Sales Report", path: "/reports/sales" },
        { label: "Inventory Report", path: "/reports/inventory" },
      ],
    },
    {
      label: "Utility",
      options: [
        { label: "New Order", path: "/orders/new" },
        { label: "Order History", path: "/orders/history" },
      ],
    },
  ];

  const pathToTitle = {
    "/dashboard": "Dashboard",
    "/categories": "Categories",
    "/savingplanslist": "Saving Plans",
    "/contactinfo": "Contact",
    "/branchmanager": "Branch Master",
    "/smstemplate": "SMS Template",
    "/reports/sales": "Sales Report",
    "/reports/inventory": "Inventory Report",
    "/orders/new": "New Order",
    "/orders/history": "Order History",
    "/paymentandledger": "Payment And History",
    "/orders": "Orders",
    "/select-plan": "Select Plan",
    "/select-plan/contact": "Contact",
    "/select-plan/paymentandledger": "Payment",
    "/userinfo": "About User",
    "/users": "About User",
    "/widhlist": "Wishlist",
    "/about": "About Us",
    "/contact": "Contact Us",
    "/rate": "Rate Us",
    "/searchcustomers": "Search Customer",
    "/agentreport": "Collection Report",
    "/digi-metal/gold": "Select Gold Plan",
    "/digi-metal/silver": "Select Silver Plan",
    "/buy-metal": "Digi Payment ",
    "/userInfo": "Edit Personal Details",
    "/paymenthistory": "Transaction History",
    "/wishlist": "Wishlist",
    "/e-com/categories": "Shopping",
    "/e-com/product":"Product",
    "/cart":"Cart"
  };

  const getPageTitle = (pathname) => {
    // E-commerce dynamic titles (read from the navigation state the e-com
    // screens already pass — no change to their existing logic):
    //  • Product page shows the Item Type name of the opened product
    //  • Categories page shows the tapped Item Type name (else "Shopping")
    //  • Cart route shows the current step: Cart → Order Summary → Payment
    if (pathname === "/e-com/product") {
      return location.state?.itemtype_name || "Product";
    }
    if (pathname === "/e-com/categories") {
      return (
        location.state?.sectionTitle ||
        location.state?.presetCategory?.name ||
        "Shopping"
      );
    }
    if (pathname === "/cart") {
      return location.state?.ecomStep || "Cart";
    }
    return pathToTitle[pathname];
  };

  // eslint-disable-next-line no-unused-vars
  const handleTabClick = (event, newTab) => {
    const isSameTab = tab === newTab;
    if (anchorEl && isSameTab) {
      setAnchorEl(null);
      setTab(null);
    } else {
      setTab(newTab);
      setMenuItems(tabOptions[newTab].options);
      setAnchorEl(event.currentTarget);
    }
  };

  const handleMenuClick = (path) => {
    navigate(path);
    setAnchorEl(null);
    setTab(null);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setTab(null);
  };
  // console.log(window.innerWidth);

  if (theme_id === 3) {
    return (
      <AppBar
        position="static"
        sx={{
          backgroundColor: theme.theme2.headerBg,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          backgroundImage: "none",
          paddingX: 2,
          paddingTop: safeAreaTop,
          // borderBottom: `1px solid ${theme.paymentScreen.sectionSeparatorLineCol}`,
          zIndex: 1200,
        }}
      >
        <Box>
          <Toolbar
            sx={{
              minHeight: "56px !important",
              paddingLeft: "var(--safe-area-left, 16px)",
              paddingRight: "var(--safe-area-right, 16px)",
            }}
          >
            {isDashboard ? (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    // Equal flex basis with the right-hand box so the store
                    // image in the middle stays optically centered in the bar.
                    flex: "1 1 0",
                    minWidth: 0,
                  }}
                  //                   sx={{
                  //   display: "flex",
                  //   alignItems: "center",
                  //   width: { xs: "48px", sm: "60px", md: "73.8px" },
                  //   minWidth: 0,
                  // }}
                >
                  <IconButton
                    color="inherit"
                    edge="start"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    sx={{ mr: 0.5, color: theme.colors.menuButton }}
                  >
                    <MenuIcon />
                  </IconButton>
                  <img
                    src={Logo}
                    alt="Company Logo"
                    style={{
                      height: "46px",
                      marginRight: "16px",
                      // filter: "brightness(0) invert(1)",
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    flex: "0 1 auto",
                    minWidth: 0,
                    textAlign: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {store_name ? (
                    <img
                      src={store_name}
                      alt="Store Name"
                      style={{
                        display: "block",
                        height: window.innerWidth > 360 ? "40px" : "27px",
                        maxWidth: "100%",
                        objectFit: "contain",
                      }}
                      // onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    <Typography
                      sx={{
                        fontFamily:
                          "'Playfair Display', 'Times New Roman', serif",
                        fontWeight: 700,
                        fontSize: { xs: "1.2rem", sm: "1.5rem" },
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        // background:"linear-gradient(90deg, #5c4a10 0%, #ba8211 50%, #eac150 100%)",
                        background:theme.colors.menuButton,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
                        lineHeight: 1.2,
                      }}
                    >
                      {APP_CONFIG.STORE_NAME ? APP_CONFIG.STORE_NAME : ""}
                    </Typography>
                  )}
                </Box>
                {/* <Box
                  sx={{
                    flexGrow: 1,
                    textAlign: "center",
                    // marginRight: "48px",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#9F6300",
                      fontSize: "18px",
                      fontWeight: 600,
                    }}
                  >
                    {getPageTitle(location.pathname)}
                  </Typography>
                </Box> */}

                <Box
                  sx={{
                    flex: "1 1 0",
                    minWidth: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    //gap: 1.5,
                  }}
                >
                  <CartIconButton
                    isEcomEnable={isEcomEnable}
                    cartCount={cartCount}
                    onClick={() => navigate("/cart")}
                  />
                </Box>
                {/* <Box sx={{ width: "73.8px" }}></Box> */}
              </Box>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                {/* Back Button */}
                <IconButton
                  onClick={handleBack}
                  sx={{
                    color: theme.colors.subHeading,
                    bgcolor: "#fff",
                    width: "32px",
                    height: "32px",
                  }}
                >
                  <ArrowBackIcon sx={{ fontSize: 20 }} />
                </IconButton>
                {/* Page Title */}
                <Box
                  sx={{
                    // flexGrow: 1,
                    textAlign: "center",
                    // marginRight: "48px",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: 18,
                      color: theme.theme2.notificationBadge,
                      fontWeight: 600,
                    }}
                  >
                    {getPageTitle(location.pathname)}
                  </Typography>
                </Box>
                {/* <Box sx={{ width: "32px" }} />{" "} */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    //gap: 1.5,
                  }}
                >
                  <CartIconButton
                    isEcomEnable={isEcomEnable}
                    cartCount={cartCount}
                    onClick={() => navigate("/cart")}
                  />
                </Box>
              </Box>
            )}
          </Toolbar>
        </Box>
        {/* Dropdown Menu */}
        {!isDashboard && tab !== null && (
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            {menuItems.map((item, index) => (
              <MenuItem
                key={index}
                onClick={() => handleMenuClick(item.path)}
                selected={location.pathname === item.path}
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>
        )}
      </AppBar>
    );
  }

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "theme.palette.background.default",
        boxShadow: "none",
        backgroundImage: "none",
        paddingX: 2,
        borderBottom: `1px solid ${theme.paymentScreen.sectionSeparatorLineCol}`,
        zIndex: 1200,
      }}
    >
      {" "}
      <Box>
        {" "}
        <Toolbar
          sx={{
            minHeight: "56px !important",
            paddingLeft: "var(--safe-area-left, 16px)",
            paddingRight: "var(--safe-area-right, 16px)",
          }}
        >
          {isDashboard ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  // flexGrow: 1,
                  width: "73.8px",
                }}
              >
                <IconButton
                  color="inherit"
                  edge="start"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  sx={{ mr: 0.5, color: theme.colors.primaryHeading }}
                >
                  <MenuIcon />
                </IconButton>
                <img
                  src={Logo}
                  alt="Company Logo"
                  style={{
                    height: "40px",
                    marginRight: "16px",
                    filter: "brightness(0) invert(1)",
                  }}
                />
              </Box>
              <Box
                sx={{
                  flexGrow: 1,
                  textAlign: "center",
                  // marginRight: "48px",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.colors.primaryHeading,
                    fontSize: "18px",
                    fontWeight: 600,
                  }}
                >
                  {getPageTitle(location.pathname)}
                </Typography>
              </Box>
              <Box>
                <IconButton
                  disabled={isEcomEnable}
                  sx={{
                    color: "black",
                    visibility: isEcomEnable ? "hidden" : "visible",
                  }}
                  onClick={() => navigate("/wishlist")}
                >
                  <FavoriteIcon />
                </IconButton>
                <IconButton
                  disabled={isEcomEnable}
                  sx={{
                    color: "black",
                    visibility: isEcomEnable ? "hidden" : "visible",
                  }}
                  onClick={() => navigate("/cart")}
                >
                  <ShoppingCartIcon />
                </IconButton>
              </Box>
              <Box sx={{ width: "73.8px" }}></Box>
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              {/* Back Button */}
              <IconButton
                onClick={handleBack}
                sx={{ color: theme.theme2.notificationBadge }}
              >
                <ArrowBackIcon />
              </IconButton>

              {/* Page Title */}
              <Box
                sx={{ flexGrow: 1, textAlign: "center", marginRight: "48px" }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: theme.colors.primaryHeading, fontWeight: 600 }}
                >
                  {getPageTitle(location.pathname)}
                </Typography>
              </Box>
            </Box>
          )}
        </Toolbar>
      </Box>
      {/* Dropdown Menu */}
      {!isDashboard && tab !== null && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
        >
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              onClick={() => handleMenuClick(item.path)}
              selected={location.pathname === item.path}
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      )}
    </AppBar>
  );
}

export default Header;
