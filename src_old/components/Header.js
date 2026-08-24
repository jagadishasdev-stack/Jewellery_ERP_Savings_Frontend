// import React, { useContext, useState } from "react";
// import {
//   AppBar,
//   Toolbar,
//   Menu,
//   MenuItem,
//   Box,
//   IconButton,
//   Typography,
//   Badge,
// } from "@mui/material";
// import { useNavigate, useLocation } from "react-router-dom";
// impocon from "@mui/icons-material/Menu";
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
// import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
// import { ReactComponent as FavoriteIcon } from "../assets/img/icons/Vector.svg";
// import { ReactComponent as ShoppingCartIcon } from "../assets/img/icons/shopping bag.svg";
// import theme from "../theme";
// import Logo from "../assets/img/logo/logo.png";
// import { AuthContext } from "../contexts/AuthContext";
// import { useSafeAreaTop, useSafeAreaBottom } from "../SafeAreaFile";
// // import store_name from "../assets/img/store/store.png";
// import APP_CONFIG from "../config/constants";

// import { EcomContext } from "../contexts/EcomContext";
// import { StoreContext } from "../contexts/StoreContext";
// // At the top of the file, replace the import with:
// let store_name = null;
// try {
//   store_name = require("../assets/img/store/store.png");
// } catch (e) {
//   store_name = null;
// }
// function Header({ isDashboard, sidebarOpen, setSidebarOpen }) {
//   const { cartCount } = useContext(EcomContext);
//   const { isEcomEnable } = useContext(StoreContext);

//   const theme_id = APP_CONFIG.THEME_ID;
//   const { loginRole } = useContext(AuthContext);
//   const [tab, setTab] = useState(null);
//   const [anchorEl, setAnchorEl] = useState(null);
//   const [menuItems, setMenuItems] = useState([]);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const topInset = useSafeAreaTop();
//   const safeAreaTop = topInset;
//   const handleBack = () => {
//     const path = location.pathname;
//     const destination =
//       loginRole === "agent" ? "/searchcustomers" : "/savingplanslist";
//     // ✅ After payment or on schemepay → go to savingplanslist with clearHistory
//     if (
//       path === "/paymentsuccess" ||
//       path === "/paymentfailed" ||
//       path.startsWith("/schemepay")
//     ) {
//       navigate(destination, { replace: true, state: { clearHistory: true } });
//       return;
//     }

//     // ✅ On savingplanslist after payment → go to dashboard
//     if (path === "/savingplanslist" && location.state?.clearHistory) {
//       navigate("/dashboard", { replace: true });
//       return;
//     }

//     // Normal back
//     navigate(-1);
//   };

//   const tabOptions = [
//     {
//       label: "Master",
//       options: [
//         { label: "Saving Plans", path: "/savingplanslist" },
//         { label: "Store Admin", path: "/storeadmin" },
//         { label: "Branch Master", path: "/branchmanager" },
//         { label: "SMS Template", path: "/smstemplate" },
//       ],
//     },
//     {
//       label: "Reports",
//       options: [
//         { label: "Sales Report", path: "/reports/sales" },
//         { label: "Inventory Report", path: "/reports/inventory" },
//       ],
//     },
//     {
//       label: "Utility",
//       options: [
//         { label: "New Order", path: "/orders/new" },
//         { label: "Order History", path: "/orders/history" },
//       ],
//     },
//   ];

//   const pathToTitle = {
//     "/dashboard": "Dashboard",
//     "/categories": "Categories",
//     "/savingplanslist": "Saving Plans",
//     "/contactinfo": "Contact",
//     "/branchmanager": "Branch Master",
//     "/smstemplate": "SMS Template",
//     "/reports/sales": "Sales Report",
//     "/reports/inventory": "Inventory Report",
//     "/orders/new": "New Order",
//     "/orders/history": "Order History",
//     "/paymentandledger": "Payment And History",
//     "/orders": "Orders",
//     "/select-plan": "Select Plan",
//     "/select-plan/contact": "Contact",
//     "/select-plan/paymentandledger": "Payment",
//     "/userinfo": "About User",
//     "/users": "About User",
//     "/widhlist": "Wishlist",
//     "/about": "About Us",
//     "/contact": "Contact Us",
//     "/rate": "Rate Us",
//     "/searchcustomers": "Search Customer",
//     "/agentreport": "Collection Report",
//     "/digi-metal/gold": "Select Gold Plan",
//     "/digi-metal/silver": "Select Silver Plan",
//     "/buy-metal": "Digi Payment ",
//     "/userInfo": "Edit Personal Details",
//     "/paymenthistory": "Transaction History",
//     "/wishlist": "Wishlist",
//     "/e-com/categories": "Shopping",
//     "/e-com/product": "Product",
//     "/cart": "Cart",
//   };

//   const getPageTitle = (pathname) => {
//     // E-commerce dynamic titles (read from the navigation state the e-com
//     // screens already pass — no change to their existing logic):
//     //  • Product page shows the Item Type name of the opened product
//     //  • Categories page shows the tapped Item Type name (else "Shopping")
//     //  • Cart route shows the current step: Cart → Order Summary → Payment
//     if (pathname === "/e-com/product") {
//       return location.state?.itemtype_name || "Product";
//     }
//     if (pathname === "/e-com/categories") {
//       return location.state?.presetCategory?.name || "Shopping";
//     }
//     if (pathname === "/cart") {
//       return location.state?.ecomStep || "Cart";
//     }
//     return pathToTitle[pathname];
//   };

//   // eslint-disable-next-line no-unused-vars
//   const handleTabClick = (event, newTab) => {
//     const isSameTab = tab === newTab;
//     if (anchorEl && isSameTab) {
//       setAnchorEl(null);
//       setTab(null);
//     } else {
//       setTab(newTab);
//       setMenuItems(tabOptions[newTab].options);
//       setAnchorEl(event.currentTarget);
//     }
//   };

//   const handleMenuClick = (path) => {
//     navigate(path);
//     setAnchorEl(null);
//     setTab(null);
//   };

//   const handleCloseMenu = () => {
//     setAnchorEl(null);
//     setTab(null);
//   };
//   // console.log(window.innerWidth);

//   if (theme_id === 3) {
//     return (
//       <AppBar
//         position="static"
//         sx={{
//           backgroundColor: theme.theme2.headerBg,
//           boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
//           backgroundImage: "none",
//           paddingX: 2,
//           paddingTop: safeAreaTop,
//           // borderBottom: `1px solid ${theme.paymentScreen.sectionSeparatorLineCol}`,
//           zIndex: 1200,
//         }}
//       >
//         <Box>
//           <Toolbar
//             sx={{
//               minHeight: "56px !important",
//               paddingLeft: "var(--safe-area-left, 16px)",
//               paddingRight: "var(--safe-area-right, 16px)",
//             }}
//           >
//             {isDashboard ? (
//               <Box
//                 sx={{
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "space-between",
//                   width: "100%",
//                 }}
//               >
//                 <Box
//                   sx={{
//                     display: "flex",
//                     alignItems: "center",
//                     // flexGrow: 1,
//                     // width: "73.8px",
//                     minWidth: 0,
//                   }}
//                   //                   sx={{
//                   //   display: "flex",
//                   //   alignItems: "center",
//                   //   width: { xs: "48px", sm: "60px", md: "73.8px" },
//                   //   minWidth: 0,
//                   // }}
//                 >
//                   <IconButton
//                     color="inherit"
//                     edge="start"
//                     onClick={() => setSidebarOpen(!sidebarOpen)}
//                     sx={{ mr: 0.5, color: theme.colors.menuButton }}
//                   >
//                     <MenuIcon />
//                   </IconButton>
//                   {/* <img
//                     src={Logo}
//                     alt="Company Logo"
//                     style={{
//                       height: "46px",
//                       marginRight: "16px",
//                       // filter: "brightness(0) invert(1)",
//                     }}
//                   /> */}
//                 </Box>
//                 <Box
//                   sx={{
//                     flexGrow: 1,
//                     textAlign: "center",
//                     display: "flex",
//                     justifyContent: "center",
//                   }}
//                 >
//                   {store_name ? (
//                     <img
//                       src={store_name}
//                       alt="Store Name"
//                       style={{
//                         background: "#000",
//                         height: window.innerWidth > 360 ? "40px" : "27px",
//                         objectFit: "contain",
//                       }}
//                       // onError={(e) => { e.target.style.display = "none"; }}
//                     />
//                   ) : (
//                     <Typography
//                       sx={{
//                         fontFamily:
//                           "'Playfair Display', 'Times New Roman', serif",
//                         fontWeight: 700,
//                         fontSize: { xs: "1.2rem", sm: "1.5rem" },
//                         letterSpacing: "0.1em",
//                         textTransform: "uppercase",
//                         background:
//                           "linear-gradient(90deg, #5C1052 0%, #BA11A2 50%, #EA5056 100%)",
//                         WebkitBackgroundClip: "text",
//                         WebkitTextFillColor: "transparent",
//                         textShadow: "2px 2px 4px rgba(0,0,0,0.2)",
//                         lineHeight: 1.2,
//                       }}
//                     >
//                       {APP_CONFIG.STORE_NAME ? APP_CONFIG.STORE_NAME : ""}
//                     </Typography>
//                   )}
//                 </Box>
//                 {/* <Box
//                   sx={{
//                     flexGrow: 1,
//                     textAlign: "center",
//                     // marginRight: "48px",
//                   }}
//                 >
//                   <Typography
//                     variant="h6"
//                     sx={{
//                       color: "#9F6300",
//                       fontSize: "18px",
//                       fontWeight: 600,
//                     }}
//                   >
//                     {getPageTitle(location.pathname)}
//                   </Typography>
//                 </Box> */}

//                 <Box
//                   sx={{
//                     width: "20%",
//                     display: "flex",
//                     justifyContent: "flex-end",
//                     //gap: 1.5,
//                   }}
//                 >
//                   <IconButton
//                     disabled={!isEcomEnable}
//                     onClick={() => navigate("/wishlist")}
//                     sx={{
//                       color: "#764A00",
//                       padding: 0,
//                       visibility: !isEcomEnable ? "hidden" : "visible",
//                     }}
//                   >
//                     <FavoriteBorderIcon sx={{ fontSize: 20 }} />
//                   </IconButton>
//                   <IconButton
//                     disabled={!isEcomEnable}
//                     onClick={() => navigate("/cart")}
//                     sx={{
//                       color: "#764A00",
//                       padding: 0,
//                       position: "relative",
//                       visibility: !isEcomEnable ? "hidden" : "visible",
//                     }}
//                   >
//                     <Badge
//                       badgeContent={cartCount > 0 ? cartCount : 0}
//                       color="error"
//                       overlap="circular"
//                       sx={{
//                         "& .MuiBadge-badge": {
//                           backgroundColor: theme.theme2.notificationBadge, // golden brown
//                           color: "#fff",
//                           fontSize: "10px",
//                           fontWeight: 600,
//                           minWidth: "16px",
//                           height: "16px",
//                           width: "16px",
//                           borderRadius: "50%",
//                           top: "0px",
//                           right: "0px",
//                           boxShadow: "0 0 3px rgba(0,0,0,0.2)",
//                         },
//                       }}
//                     >
//                       <ShoppingCartOutlinedIcon sx={{ fontSize: 20 }} />
//                     </Badge>
//                   </IconButton>
//                 </Box>
//                 {/* <Box sx={{ width: "73.8px" }}></Box> */}
//               </Box>
//             ) : (
//               <Box
//                 sx={{
//                   display: "flex",
//                   alignItems: "center",
//                   width: "100%",
//                   justifyContent: "space-between",
//                 }}
//               >
//                 {/* Back Button */}
//                 <IconButton
//                   onClick={handleBack}
//                   sx={{
//                     color: theme.colors.subHeading,
//                     bgcolor: "#fff",
//                     width: "32px",
//                     height: "32px",
//                   }}
//                 >
//                   <ArrowBackIcon sx={{ fontSize: 20 }} />
//                 </IconButton>
//                 {/* Page Title */}
//                 <Box
//                   sx={{
//                     // flexGrow: 1,
//                     textAlign: "center",
//                     // marginRight: "48px",
//                   }}
//                 >
//                   <Typography
//                     variant="h6"
//                     sx={{
//                       fontSize: 18,
//                       color: theme.theme2.notificationBadge,
//                       fontWeight: 600,
//                     }}
//                   >
//                     {getPageTitle(location.pathname)}
//                   </Typography>
//                 </Box>
//                 {/* <Box sx={{ width: "32px" }} />{" "} */}
//                 <Box
//                   sx={{
//                     display: "flex",
//                     justifyContent: "flex-end",
//                     //gap: 1.5,
//                   }}
//                 >
//                   <IconButton
//                     disabled={!isEcomEnable}
//                     onClick={() => navigate("/wishlist")}
//                     sx={{
//                       color: "#764A00",
//                       padding: 0,
//                       visibility: !isEcomEnable ? "hidden" : "visible",
//                     }}
//                   >
//                     <FavoriteBorderIcon sx={{ fontSize: 20 }} />
//                   </IconButton>
//                   <IconButton
//                     disabled={!isEcomEnable}
//                     onClick={() => navigate("/cart")}
//                     sx={{
//                       color: "#764A00",
//                       padding: 0,
//                       position: "relative",
//                       visibility: !isEcomEnable ? "hidden" : "visible",
//                     }}
//                   >
//                     <Badge
//                       badgeContent={cartCount > 0 ? cartCount : 0}
//                       color="error"
//                       overlap="circular"
//                       sx={{
//                         "& .MuiBadge-badge": {
//                           backgroundColor: theme.theme2.notificationBadge, // golden brown
//                           color: "#fff",
//                           fontSize: "10px",
//                           fontWeight: 600,
//                           minWidth: "16px",
//                           height: "16px",
//                           width: "16px",
//                           borderRadius: "50%",
//                           top: "0px",
//                           right: "0px",
//                           boxShadow: "0 0 3px rgba(0,0,0,0.2)",
//                         },
//                       }}
//                     >
//                       <ShoppingCartOutlinedIcon sx={{ fontSize: 20 }} />
//                     </Badge>
//                   </IconButton>
//                 </Box>
//               </Box>
//             )}
//           </Toolbar>
//         </Box>
//         {/* Dropdown Menu */}
//         {!isDashboard && tab !== null && (
//           <Menu
//             anchorEl={anchorEl}
//             open={Boolean(anchorEl)}
//             onClose={handleCloseMenu}
//             anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
//             transformOrigin={{ vertical: "top", horizontal: "left" }}
//           >
//             {menuItems.map((item, index) => (
//               <MenuItem
//                 key={index}
//                 onClick={() => handleMenuClick(item.path)}
//                 selected={location.pathname === item.path}
//               >
//                 {item.label}
//               </MenuItem>
//             ))}
//           </Menu>
//         )}
//       </AppBar>
//     );
//   }

//   return (
//     <AppBar
//       position="static"
//       sx={{
//         backgroundColor: "theme.palette.background.default",
//         boxShadow: "none",
//         backgroundImage: "none",
//         paddingX: 2,
//         borderBottom: `1px solid ${theme.paymentScreen.sectionSeparatorLineCol}`,
//         zIndex: 1200,
//       }}
//     >
//       {" "}
//       <Box>
//         {" "}
//         <Toolbar
//           sx={{
//             minHeight: "56px !important",
//             paddingLeft: "var(--safe-area-left, 16px)",
//             paddingRight: "var(--safe-area-right, 16px)",
//           }}
//         >
//           {isDashboard ? (
//             <Box
//               sx={{
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 width: "100%",
//               }}
//             >
//               <Box
//                 sx={{
//                   display: "flex",
//                   alignItems: "center",
//                   // flexGrow: 1,
//                   width: "73.8px",
//                 }}
//               >
//                 <IconButton
//                   color="inherit"
//                   edge="start"
//                   onClick={() => setSidebarOpen(!sidebarOpen)}
//                   sx={{ mr: 0.5, color: theme.colors.primaryHeading }}
//                 >
//                   <MenuIcon />
//                 </IconButton>
//                 {/* <img
//                   src={Logo}
//                   alt="Company Logo"
//                   style={{
//                     height: "40px",
//                     marginRight: "16px",
//                     filter: "brightness(0) invert(1)",
//                   }}
//                 /> */}
//               </Box>
//               <Box
//                 sx={{
//                   flexGrow: 1,
//                   textAlign: "center",
//                   // marginRight: "48px",
//                 }}
//               >
//                 <Typography
//                   variant="h6"
//                   sx={{
//                     color: theme.colors.primaryHeading,
//                     fontSize: "18px",
//                     fontWeight: 600,
//                   }}
//                 >
//                   {getPageTitle(location.pathname)}
//                 </Typography>
//               </Box>
//               <Box>
//                 <IconButton
//                   disabled={isEcomEnable}
//                   sx={{
//                     color: "black",
//                     visibility: isEcomEnable ? "hidden" : "visible",
//                   }}
//                   onClick={() => navigate("/wishlist")}
//                 >
//                   <FavoriteIcon />
//                 </IconButton>
//                 <IconButton
//                   disabled={isEcomEnable}
//                   sx={{
//                     color: "black",
//                     visibility: isEcomEnable ? "hidden" : "visible",
//                   }}
//                   onClick={() => navigate("/cart")}
//                 >
//                   <ShoppingCartIcon />
//                 </IconButton>
//               </Box>
//               <Box sx={{ width: "73.8px" }}></Box>
//             </Box>
//           ) : (
//             <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
//               {/* Back Button */}
//               <IconButton
//                 onClick={handleBack}
//                 sx={{ color: theme.theme2.notificationBadge }}
//               >
//                 <ArrowBackIcon />
//               </IconButton>

//               {/* Page Title */}
//               <Box
//                 sx={{ flexGrow: 1, textAlign: "center", marginRight: "48px" }}
//               >
//                 <Typography
//                   variant="h6"
//                   sx={{ color: theme.colors.primaryHeading, fontWeight: 600 }}
//                 >
//                   {getPageTitle(location.pathname)}
//                 </Typography>
//               </Box>
//             </Box>
//           )}
//         </Toolbar>
//       </Box>
//       {/* Dropdown Menu */}
//       {!isDashboard && tab !== null && (
//         <Menu
//           anchorEl={anchorEl}
//           open={Boolean(anchorEl)}
//           onClose={handleCloseMenu}
//           anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
//           transformOrigin={{ vertical: "top", horizontal: "left" }}
//         >
//           {menuItems.map((item, index) => (
//             <MenuItem
//               key={index}
//               onClick={() => handleMenuClick(item.path)}
//               selected={location.pathname === item.path}
//             >
//               {item.label}
//             </MenuItem>
//           ))}
//         </Menu>
//       )}
//     </AppBar>
//   );
// }

// export default Header;

import React, { useContext, useState } from "react";
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
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { ReactComponent as FavoriteIcon } from "../assets/img/icons/Vector.svg";
import { ReactComponent as ShoppingCartIcon } from "../assets/img/icons/shopping bag.svg";
import theme from "../theme";
import Logo from "../assets/img/logo/logo.png";
import { AuthContext } from "../contexts/AuthContext";
import { useSafeAreaTop, useSafeAreaBottom } from "../SafeAreaFile";
// import store_name from "../assets/img/store/store.png";
import APP_CONFIG from "../config/constants";

import { EcomContext } from "../contexts/EcomContext";
import { StoreContext } from "../contexts/StoreContext";
// At the top of the file, replace the import with:
let store_name = null;
try {
  store_name = require("../assets/img/store/store.png");
} catch (e) {
  store_name = null;
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
    "/e-com/product": "Product",
    "/cart": "Cart",
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
      return location.state?.presetCategory?.name || "Shopping";
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
                    width: "20%",
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
                  {/* <img
                    src={Logo}
                    alt="Company Logo"
                    style={{
                      height: "46px",
                      marginRight: "16px",
                      // filter: "brightness(0) invert(1)",
                    }}
                  /> */}
                </Box>
                <Box
                  sx={{
                    flexGrow: 1,
                    textAlign: "center",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {store_name ? (
                    <img
                      src={store_name}
                      alt="Store Name"
                      style={{
                        height: window.innerWidth > 360 ? "40px" : "27px",
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
                        background:
                          "linear-gradient(90deg, #5C1052 0%, #BA11A2 50%, #EA5056 100%)",
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
                    width: "20%",
                    display: "flex",
                    justifyContent: "flex-end",
                    //gap: 1.5,
                  }}
                >
                  <IconButton
                    disabled={!isEcomEnable}
                    onClick={() => navigate("/wishlist")}
                    sx={{
                      color: "#764A00",
                      padding: 0,
                      visibility: !isEcomEnable ? "hidden" : "visible",
                    }}
                  >
                    <FavoriteBorderIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                  <IconButton
                    disabled={!isEcomEnable}
                    onClick={() => navigate("/cart")}
                    sx={{
                      color: "#764A00",
                      padding: 0,
                      position: "relative",
                      visibility: !isEcomEnable ? "hidden" : "visible",
                    }}
                  >
                    <Badge
                      badgeContent={cartCount > 0 ? cartCount : 0}
                      color="error"
                      overlap="circular"
                      sx={{
                        "& .MuiBadge-badge": {
                          backgroundColor: theme.theme2.notificationBadge, // golden brown
                          color: "#fff",
                          fontSize: "10px",
                          fontWeight: 600,
                          minWidth: "16px",
                          height: "16px",
                          width: "16px",
                          borderRadius: "50%",
                          top: "0px",
                          right: "0px",
                          boxShadow: "0 0 3px rgba(0,0,0,0.2)",
                        },
                      }}
                    >
                      <ShoppingCartOutlinedIcon sx={{ fontSize: 20 }} />
                    </Badge>
                  </IconButton>
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
                  <IconButton
                    disabled={!isEcomEnable}
                    onClick={() => navigate("/wishlist")}
                    sx={{
                      color: "#764A00",
                      padding: 0,
                      visibility: !isEcomEnable ? "hidden" : "visible",
                    }}
                  >
                    <FavoriteBorderIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                  <IconButton
                    disabled={!isEcomEnable}
                    onClick={() => navigate("/cart")}
                    sx={{
                      color: "#764A00",
                      padding: 0,
                      position: "relative",
                      visibility: !isEcomEnable ? "hidden" : "visible",
                    }}
                  >
                    <Badge
                      badgeContent={cartCount > 0 ? cartCount : 0}
                      color="error"
                      overlap="circular"
                      sx={{
                        "& .MuiBadge-badge": {
                          backgroundColor: theme.theme2.notificationBadge, // golden brown
                          color: "#fff",
                          fontSize: "10px",
                          fontWeight: 600,
                          minWidth: "16px",
                          height: "16px",
                          width: "16px",
                          borderRadius: "50%",
                          top: "0px",
                          right: "0px",
                          boxShadow: "0 0 3px rgba(0,0,0,0.2)",
                        },
                      }}
                    >
                      <ShoppingCartOutlinedIcon sx={{ fontSize: 20 }} />
                    </Badge>
                  </IconButton>
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
                {/* <img
                  src={Logo}
                  alt="Company Logo"
                  style={{
                    height: "40px",
                    marginRight: "16px",
                    filter: "brightness(0) invert(1)",
                  }}
                /> */}
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
