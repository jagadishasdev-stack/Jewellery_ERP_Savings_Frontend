// src/components/InAppPage.jsx
//
// GENERIC COMPONENT — works for any URL (Terms, Privacy, About Us, Refund, Shipping, etc.)

import React, { useState, useEffect } from "react";
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Button,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { Capacitor, CapacitorHttp } from "@capacitor/core";
import { useSafeAreaTop, useSafeAreaBottom } from "../SafeAreaFile";
import LoadingScreen from "./LoadingScreen";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
function InAppPage({ open, onClose, url, title = "Page" }) {
  const topInset = useSafeAreaTop();
  const bottomInset = useSafeAreaBottom();
  const isIOS = Capacitor.getPlatform() === "ios";
  const isNative = Capacitor.isNativePlatform();

  // "idle" | "loading" | "success" | "error"
  const [status, setStatus] = useState("idle");
  const [htmlContent, setHtmlContent] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!open) {
      setStatus("idle");
      setHtmlContent(null);
      return;
    }

    if (!url) {
      setStatus("error");
      return;
    }

    const fetchPage = async () => {
      setStatus("loading");
      setHtmlContent(null);

      try {
        let html = "";

        if (isNative) {
          // CapacitorHttp bypasses CORS & X-Frame-Options on native
          const response = await CapacitorHttp.get({
            url,
            headers: {
              "User-Agent":
                "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
              Accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.5",
            },
          });

          if (response.status !== 200 || !response.data) {
            setStatus("error");
            return;
          }
          html = response.data;
        } else {
          // Web browser fallback
          const response = await fetch(url);
          if (!response.ok) {
            setStatus("error");
            return;
          }
          html = await response.text();
        }
// ── 1. Inject app notice banner at top of body ──
// const appNotice = `
//   <div style="
//     background: #fff8e7;
//     border-left: 3px solid #C9A84C;
//     padding: 10px 14px;
//     margin-bottom: 20px;
//     border-radius: 6px;
//     font-size: 13px;
//     color: #555;
//     font-family: -apple-system, BlinkMacSystemFont, sans-serif;
//   ">
//     📱 References to <strong>"website"</strong> in this document also apply to our <strong>mobile app</strong>.
//   </div>
// `;
// html = html.replace(/<body([^>]*)>/i, `<body$1>${appNotice}`);

// ── 2. Safe word replacements — skips "our website www." cases ──
// const phraseReplacements = [
//   { find: "this website",          replace: "this app" },
//   { find: "this Website",          replace: "this App" },
//   { find: "this WEBSITE",          replace: "this APP" },
//   { find: "BY USING THIS WEBSITE", replace: "BY USING THIS APP" },
//   { find: "use of the Website",    replace: "use of the App" },
//   { find: "use of the website",    replace: "use of the app" },
//   { find: "use the Website",       replace: "use the App" },
//   { find: "use the website",       replace: "use the app" },
//   { find: "using the Website",     replace: "using the App" },
//   { find: "using the website",     replace: "using the app" },
//   { find: "on the Website",        replace: "on the App" },
//   { find: "on the website",        replace: "on the app" },
//   { find: "on our Website",        replace: "on our App" },
//   { find: "on our website",        replace: "on our app" },
//   { find: "from the Website",      replace: "from the App" },
//   { find: "from the website",      replace: "from the app" },
//   { find: "through the Website",   replace: "through the App" },
//   { find: "through the website",   replace: "through the app" },
//   { find: "via the Website",       replace: "via the App" },
//   { find: "via the website",       replace: "via the app" },
//   { find: "access the Website",    replace: "access the App" },
//   { find: "access the website",    replace: "access the app" },
//   { find: "visit the Website",     replace: "visit the App" },
//   { find: "visit the website",     replace: "visit the app" },
//   { find: "of our Website",        replace: "of our App" },
//   { find: "of our website",        replace: "of our app" },
//   { find: "Web site",              replace: "App" },
//   { find: "web site",              replace: "app" },
//   { find: "use of the Site",       replace: "use of the App" },
//   { find: "using the Site",        replace: "using the App" },
//   { find: "on the Site",           replace: "on the App" },
//   { find: "on our Site",           replace: "on our App" },
//   { find: "from the Site",         replace: "from the App" },
//   { find: "through the Site",      replace: "through the App" },
//   { find: "our Site",              replace: "our App" },
//   { find: "the Site",              replace: "the App" },
//   { find: "the site",              replace: "the app" },
// ];
// phraseReplacements.forEach(({ find, replace }) => {
//   html = html.replaceAll(find, replace);
// });

// "our website" — only replace when NOT followed by a URL
// html = html.replace(
//   /our [Ww]ebsite(?![\s\S]{0,30}www\.)(?![\s\S]{0,30}http)/g,
//   (match) => match[4] === 'W' ? 'our App' : 'our app'
// );



        const baseTag = `<base href="${url}">`;
        const viewportMeta = `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">`;

        // Block ALL link clicks — user cannot navigate away
        const blockLinksScript = `
          <script>
            document.addEventListener('DOMContentLoaded', function() {
              document.addEventListener('click', function(e) {
                var el = e.target;
                while (el && el.tagName !== 'A') {
                  el = el.parentElement;
                }
                if (el && el.tagName === 'A') {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }
              }, true);
            });
          </script>
        `;

        // const injectedStyles = `
        //   <style>
        //     * {
        //       box-sizing: border-box;
        //       -webkit-tap-highlight-color: transparent;
        //     }
        //     body {
        //       font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif !important;
        //       font-size: 15px !important;
        //       line-height: 1.8 !important;
        //       color: #2c2c2c !important;
        //       background-color: #faf8f4 !important;
        //       padding: 16px 18px 40px 18px !important;
        //       margin: 0 !important;
        //       -webkit-text-size-adjust: 100%;
        //       word-wrap: break-word;
        //       overflow-x: hidden;
        //     }
        //     h1 {
        //       font-size: 20px !important;
        //       font-weight: 800 !important;
        //       color: #1a1a1a !important;
        //       margin-top: 0 !important;
        //       margin-bottom: 16px !important;
        //     }
        //     h2 {
        //       font-size: 16px !important;
        //       font-weight: 700 !important;
        //       color: #1a1a1a !important;
        //       margin-top: 28px !important;
        //       margin-bottom: 10px !important;
        //       padding-bottom: 6px !important;
        //       border-bottom: 2px solid #C9A84C !important;
        //     }
        //     h3, h4, h5, h6 {
        //       font-size: 14px !important;
        //       font-weight: 700 !important;
        //       color: #333 !important;
        //       margin-top: 20px !important;
        //       margin-bottom: 8px !important;
        //     }
        //     p { margin: 0 0 14px 0 !important; color: #444 !important; }
        //     ul, ol { padding-left: 20px !important; margin: 0 0 14px 0 !important; }
        //     li { margin-bottom: 6px !important; color: #444 !important; }
        //     /* Links styled but NOT clickable */
        //     a {
        //       color: #C9A84C !important;
        //       text-decoration: underline !important;
        //       pointer-events: none !important;
        //       cursor: default !important;
        //     }
        //     strong, b { color: #1a1a1a !important; font-weight: 700 !important; }
        //     img { max-width: 100% !important; height: auto !important; border-radius: 8px; }
        //     table { max-width: 100% !important; overflow-x: auto; display: block; border-collapse: collapse; font-size: 13px !important; }
        //     td, th { padding: 8px !important; border: 1px solid #e0ddd8 !important; }
        //     hr { border: none !important; border-top: 1px solid #e8e4dc !important; margin: 20px 0 !important; }

        //     /* Hide all website chrome — nav, header, footer, banners, etc. */
        //     nav, header, footer,
        //     .navbar, .nav, .header, .footer,
        //     .menu, .sidebar, .topbar, .top-bar,
        //     .site-header, .site-footer, .site-nav,
        //     .cookie-banner, .cookie-bar, .cookie-notice,
        //     .popup, .modal-overlay,
        //     .back-to-top, .scroll-top,
        //     .social-links, .social-icons,
        //     .breadcrumb, .breadcrumbs,
        //     .advertisement, .ads, .ad-banner,
        //     #header, #footer, #nav, #navbar,
        //     #menu, #sidebar, #cookie,
        //     [class*="header"]:not([class*="content"]),
        //     [class*="footer"]:not([class*="content"]),
        //     [class*="navbar"],
        //     [class*="cookie"],
        //     [class*="banner"],
        //     [id*="header"],
        //     [id*="footer"],
        //     [id*="cookie"],
        //     [id*="navbar"] {
        //       display: none !important;
        //     }

        //     /* Clean content wrapper */
        //     main, .main, #main,
        //     .content, .main-content, #content,
        //     .container, .wrapper, .page-content,
        //     article, .article, .post, .entry-content {
        //       max-width: 100% !important;
        //       width: 100% !important;
        //       padding: 0 !important;
        //       margin: 0 !important;
        //       float: none !important;
        //       background: transparent !important;
        //       box-shadow: none !important;
        //       border: none !important;
        //     }
        //   </style>
        // `;
        const injectedStyles = `
  <style>
    * {
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif !important;
      font-size: 15px !important;
      line-height: 1.8 !important;
      color: #2c2c2c !important;
      background-color: #faf8f4 !important;
      padding: 16px 18px 40px 18px !important;
      margin: 0 !important;
      -webkit-text-size-adjust: 100%;
      word-wrap: break-word;
      overflow-x: hidden;
    }
    h1 {
      font-size: 20px !important;
      font-weight: 800 !important;
      color: #1a1a1a !important;
      margin-top: 0 !important;
      margin-bottom: 16px !important;
    }
    h2 {
      font-size: 16px !important;
      font-weight: 700 !important;
      color: #1a1a1a !important;
      margin-top: 28px !important;
      margin-bottom: 10px !important;
      padding-bottom: 6px !important;
      border-bottom: 2px solid #C9A84C !important;
    }
    h3, h4, h5, h6 {
      font-size: 14px !important;
      font-weight: 700 !important;
      color: #333 !important;
      margin-top: 20px !important;
      margin-bottom: 8px !important;
    }
    p { margin: 0 0 14px 0 !important; color: #444 !important; }
    ul, ol { padding-left: 20px !important; margin: 0 0 14px 0 !important; }
    li { margin-bottom: 6px !important; color: #444 !important; }
    a {
      color: #C9A84C !important;
      text-decoration: underline !important;
      pointer-events: none !important;
      cursor: default !important;
    }
    strong, b { color: #1a1a1a !important; font-weight: 700 !important; }
    img { max-width: 100% !important; height: auto !important; border-radius: 8px; }
    table { max-width: 100% !important; overflow-x: auto; display: block; border-collapse: collapse; font-size: 13px !important; }
    td, th { padding: 8px !important; border: 1px solid #e0ddd8 !important; }
    hr { border: none !important; border-top: 1px solid #e8e4dc !important; margin: 20px 0 !important; }

    /* ✅ SAFE: Only hide very specific semantic elements, NOT attribute wildcards */
    nav,
    header,
    footer,
    .site-header,
    .site-footer,
    .site-nav,
    #site-header,
    #site-footer,
    #site-nav,
    .cookie-banner,
    .cookie-bar,
    .cookie-notice,
    #cookie-notice,
    #cookie-banner,
    .back-to-top,
    .scroll-top,
    .advertisement,
    #wpadminbar {
      display: none !important;
    }

    /* ✅ Clean content wrapper */
    main, .main, #main,
    .content, .main-content, #content,
    .container, .wrapper, .page-content,
    article, .article, .post, .entry-content {
      max-width: 100% !important;
      width: 100% !important;
      padding: 0 !important;
      margin: 0 !important;
      float: none !important;
      background: transparent !important;
      box-shadow: none !important;
      border: none !important;
    }
  </style>
`;

        if (/<head[\s>]/i.test(html)) {
          html = html.replace(
            /<head([^>]*)>/i,
            `<head$1>${baseTag}${viewportMeta}${injectedStyles}${blockLinksScript}`
          );
        } else {
          html = `<!DOCTYPE html><html><head>${baseTag}${viewportMeta}${injectedStyles}${blockLinksScript}</head><body>${html}</body></html>`;
        }

        setHtmlContent(html);
        setStatus("success");
      } catch (err) {
        console.warn("[InAppPage] Fetch error:", err);
        setStatus("error");
      }
    };

    fetchPage();
  }, [open, url, retryKey]);

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      sx={{
        paddingBottom:bottomInset,
        paddingTop:topInset,
        zIndex: 10000,
        "& .MuiDialog-paper": {
          zIndex: 10000,
          backgroundColor: "#faf8f4",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >

      {/* ── FIXED HEADER — always visible immediately ── */}
      <Box
  sx={{
    flexShrink: 0,
    // pt: isIOS ? `calc(${topInset} + 10px)` : "10px",
    pt: isIOS ? `calc(10px + var(--safe-area-top))` : "10px",
    pb: "10px",
    px: 1,
    backgroundColor: "#1a1a1a",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    minHeight: 52,
  }}
>
  {/* Back Button — left side */}
  <IconButton
    onClick={onClose}
    size="small"
    sx={{ color: "#fff" }}
  >
    <ArrowBackIcon />
  </IconButton>

  {/* Title — centered */}
  <Typography
    sx={{
      fontWeight: 700,
      fontSize: "1rem",
      color: "#fff",
      letterSpacing: "0.03em",
      textAlign: "center",
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
    }}
  >
    {title}
  </Typography>

  {/* Spacer — right side to keep title truly centered */}
  <Box sx={{ width: 34 }} />
</Box>

      {/* ── CONTENT AREA — loader shows here until page ready ── */}
      <Box sx={{ flex: 1, position: "relative", overflow: "hidden" }}>

        {/* Loading — sits inside content area, header & footer already visible */}
        {status === "loading" && (
          // <Box sx={{ position: "absolute", inset: 0, zIndex: 2 }}>
            <LoadingScreen />
          // </Box>
        )}

        {/* Error */}
        {status === "error" && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#faf8f4",
              gap: 2,
              px: 4,
              textAlign: "center",
            }}
          >
            <Typography sx={{ fontSize: "2rem" }}>😕</Typography>
            <Typography variant="h6" sx={{ color: "#1a1a1a", fontWeight: 700 }}>
              Could not load content
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please check your internet connection and try again.
            </Typography>
          </Box>
        )}

        {/* Success — iframe with fetched HTML */}
        {status === "success" && htmlContent && (
          <iframe
            key={retryKey}
            srcDoc={htmlContent}
            title={title}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              border: "none",
              backgroundColor: "#faf8f4",
            }}
            sandbox="allow-same-origin allow-scripts "
          />
        )}
      </Box>

      {/* ── FIXED BOTTOM BAR — always visible ── */}
      <Box
        sx={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          pt: 1,
          pb: isIOS ? `calc(${bottomInset} + 8px)` : "10px",
          backgroundColor: "#fff",
          borderTop: "1px solid #e8e4dc",
        }}
      >
        {/* Back Button */}
        <Button
          onClick={onClose}
          startIcon={
            <ArrowBackIosNewIcon sx={{ fontSize: "0.8rem !important" }} />
          }
          sx={{
            color: "#1a1a1a",
            fontWeight: 700,
            fontSize: "0.85rem",
            textTransform: "none",
            px: 2,
            py: 1,
            borderRadius: "10px",
            backgroundColor: "#f5f0e8",
            "&:hover": { backgroundColor: "#ede8df" },
          }}
        >
          Back
        </Button>

        {/* Refresh Button */}
        <IconButton
          onClick={() => setRetryKey((k) => k + 1)}
          sx={{
            color: "#C9A84C",
            backgroundColor: "#f5f0e8",
            borderRadius: "10px",
            p: 1,
            "&:hover": { backgroundColor: "#ede8df" },
          }}
        >
          <RefreshRoundedIcon />
        </IconButton>
      </Box>
    </Dialog>
  );
}

export default InAppPage;