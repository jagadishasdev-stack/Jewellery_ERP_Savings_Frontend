import React, { useContext } from "react";
import { Box, Typography, Avatar, Divider, Grid, Link } from "@mui/material";
import phoneIcon from "../assets/img/icons/call-calling.svg";
import whatsappIcon from "../assets/img/icons/whats-app.svg";
import { StoreContext } from "../contexts/StoreContext";
import LoadingScreen from "./LoadingScreen";
import ContactUsImage from "../assets/img/contact_us.png";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
// import TwitterIcon from "@mui/icons-material/Twitter";
import XIcon from "@mui/icons-material/X"; // or XIcon if using MUI v6+
// Icons
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { AppLauncher } from "@capacitor/app-launcher";
import PhoneInTalkRoundedIcon from "@mui/icons-material/PhoneInTalkRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import LocationOnRoundedIcon from "@mui/icons-material/LocationOnRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CallIcon from "@mui/icons-material/Call";
import theme from "../theme";
import APP_CONFIG from "../config/constants";
const ContactInfo = () => {
  const { storeAssets } = useContext(StoreContext);
  // console.log('stiore');

  if (!storeAssets) {
    return <LoadingScreen open={true} message="Loading..." />;
  }

  const phoneNumber = storeAssets?.storeinfo[0]?.store_phone;
  const whatsappNumber = storeAssets?.storeinfo[0]?.store_mobile;
  const name = storeAssets?.storeinfo[0]?.store_name;
  const email = storeAssets?.storeinfo[0]?.store_email;
  const address = storeAssets?.storeinfo[0]?.store_address;
  const city = storeAssets?.storeinfo[0]?.store_city;
  const pincode = storeAssets?.storeinfo[0]?.store_pincode;
  const state = storeAssets?.storeinfo[0]?.store_state;
  const country = storeAssets?.storeinfo[0]?.store_country;
  const fbPath = storeAssets?.storeinfo[0]?.fb_path;
  const ytPath = storeAssets?.storeinfo[0]?.yt_path;
  const twitterPath = storeAssets?.storeinfo[0]?.twitter_path;
  const instaPath = storeAssets?.storeinfo[0]?.insta_path;
  // console.log('hgfghf',storeAssets);

  // Clean numbers
  const phoneHref = `tel:${phoneNumber.replace(/\s+/g, "")}`;
  const whatsappHref = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}`;
  // const openSocialLink = async (url) => {
  //   if (Capacitor.isNativePlatform()) {
  //     await Browser.open({ url }); // Opens in native browser, which triggers app deep links
  //   } else {
  //     window.open(url, "_blank");
  //   }
  // };

  const openSocialLink = async (url) => {
    // Web fallback
    if (!Capacitor.isNativePlatform()) {
      window.open(url, "_blank");
      return;
    }

    let appUrl = null;

    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace("www.", "");
      const path = parsed.pathname;

      // -------- INSTAGRAM --------
      if (host.includes("instagram.com")) {
        const username = path.split("/")[1];
        if (username) {
          appUrl = `instagram://user?username=${username}`;
        }
      }

      // -------- X (TWITTER) --------
      else if (host.includes("x.com") || host.includes("twitter.com")) {
        const username = path.split("/")[1];
        if (username) {
          appUrl = `twitter://user?screen_name=${username}`;
        }
      }

      // -------- YOUTUBE --------
      else if (host.includes("youtube.com") || host.includes("youtu.be")) {
        const videoId = parsed.searchParams.get("v") || path.split("/").pop();

        if (videoId) {
          appUrl = `vnd.youtube://${videoId}`;
        }
      }

      // -------- FACEBOOK --------
      else if (host.includes("facebook.com")) {
        await Browser.open({ url });
        return;
      }

      // -------- TRY OPENING APP --------
      if (appUrl) {
        const canOpen = await AppLauncher.canOpenUrl({ url: appUrl });

        if (canOpen.value) {
          await AppLauncher.openUrl({ url: appUrl });
          return; // ✅ opened in app
        }
      }
    } catch (err) {
      console.warn("Deep link parsing failed:", err);
    }

    // -------- FALLBACK --------
    await Browser.open({ url });
  };

  const openInMaps = async () => {
    const fullAddress = `${address}, ${city} - ${pincode}, ${state}, ${country}`;
    const encodedAddress = encodeURIComponent(fullAddress);

    const webUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

    if (!Capacitor.isNativePlatform()) {
      window.open(webUrl, "_blank");
      return;
    }

    // Native: try Google Maps app first
    const nativeUrl = `geo:0,0?q=${encodedAddress}`;

    try {
      const canOpen = await AppLauncher.canOpenUrl({ url: nativeUrl });
      if (canOpen.value) {
        await AppLauncher.openUrl({ url: nativeUrl });
        return;
      }
    } catch (err) {
      console.warn("Maps app open failed:", err);
    }

    // Fallback to browser
    await Browser.open({ url: webUrl });
  };

  // export default openSocialLink;

  return (
    <Box sx={{ overflow: "hidden" }}>
      {/* ── Store Info Card (Address + Email) ── */}
      <Box
        sx={{
          px: 2.25,
          py: 2,
          bgcolor: theme.theme2.secondaryBg,
          border: `1px solid ${theme.theme2.primaryButton}`,
          borderRadius: 2,
          mt: 4,
          mb: 1.5,
          display: "flex",
          flexDirection: "column",
          gap: 1.8,
        }}
      >
        {/* Store Name */}
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 700,
            color: theme.theme2.primaryHeading,
          }}
        >
          {name}
        </Typography>

        {/* Address Row */}
        <Box
          onClick={openInMaps}
          sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
        >
          <LocationOnRoundedIcon
            sx={{
              fill: theme.theme2.primaryHeading,
              fontSize: 18,
              mt: 0.2,
              flexShrink: 0,
            }}
          />
          <Typography
            sx={{
              fontSize: 13,
              color: theme.theme2.primaryHeading,
              lineHeight: 1.6,
            }}
          >
            {address},{"\n"}
            {city} - {pincode},{"\n"}
            {state}, {country}.
          </Typography>
        </Box>
        {/* Phone Numbers Row */}
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <PhoneInTalkRoundedIcon
            sx={{
              fill: theme.theme2.primaryHeading,
              fontSize: 18,
              mt: 0.2,
              flexShrink: 0,
            }}
          />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
            <Link
              href={`tel:+91${phoneNumber}`}
              underline="none"
              color="inherit"
            >
              <Typography
                sx={{ fontSize: 13, color: theme.theme2.primaryHeading }}
              >
                +91{phoneNumber}
              </Typography>
            </Link>
            <Link
              href={`tel:+91${whatsappNumber}`}
              underline="none"
              color="inherit"
            >
              <Typography
                sx={{ fontSize: 13, color: theme.theme2.primaryHeading }}
              >
                +91{whatsappNumber}
              </Typography>
            </Link>
          </Box>
        </Box>
        {/* Address Row */}
        {/* <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <LocationOnRoundedIcon
            sx={{
              fill: theme.theme2.primaryHeading,
              fontSize: 18,
              mt: 0.2,
              flexShrink: 0,
            }}
          />
          <Typography
            sx={{
              fontSize: 13,
              color: theme.theme2.primaryHeading,
              lineHeight: 1.6,
            }}
          >
            NO 25/1/21, DVG ROAD,{"\n"}
            OPP TO REDDY ELECTRONICS, BAGEPALLI - 561207.,{"\n"}
            KARNATAKA ,INDIA
          </Typography>
        </Box> */}
        {/* Phone Numbers Row */}
        {/* <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <PhoneInTalkRoundedIcon
            sx={{
              fill: theme.theme2.primaryHeading,
              fontSize: 18,
              mt: 0.2,
              flexShrink: 0,
            }}
          />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
            <Link
              href={`tel:+91${7393056961}`}
              underline="none"
              color="inherit"
            >
              <Typography
                sx={{ fontSize: 13, color: theme.theme2.primaryHeading }}
              >
                +91{7393056961}
              </Typography>
            </Link>
            <Link
              href={`tel:+91${9187474705}`}
              underline="none"
              color="inherit"
            >
              <Typography
                sx={{ fontSize: 13, color: theme.theme2.primaryHeading }}
              >
                +91{9187474705}
              </Typography>
            </Link>
          </Box>
        </Box> */}

        {/* Email Row */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <EmailRoundedIcon
            sx={{
              fill: theme.theme2.primaryHeading,
              fontSize: 18,
              flexShrink: 0,
            }}
          />
          <Link href={`mailto:${email}`} underline="none" color="inherit">
            <Typography
              sx={{ fontSize: 13, color: theme.theme2.primaryHeading }}
            >
              {email}
            </Typography>
          </Link>
        </Box>
      </Box>

      {/* Customer Support */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",

          px: 2.25,
          py: 1.75,
          bgcolor: theme.theme2.secondaryBg,
          border: `1px solid ${theme.theme2.primaryButton}`,
          borderRadius: 2,
          mt: 4,
          mb: 1.5,
        }}
      >
        {/* Icon & Label */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <SupportAgentRoundedIcon sx={{ fill: theme.theme2.primaryHeading }} />
          <Typography sx={{ fontSize: 14, color: theme.theme2.primaryHeading }}>
            Customer Support
          </Typography>
        </Box>

        {/* Number */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* <Link href={phoneHref} underline="none" color="inherit">
            <Typography
              sx={{ fontSize: 16, color: theme.theme2.primaryHeading }}
            >
              {phoneNumber}
            </Typography>
          </Link> */}
          <Link href={phoneHref} underline="none" color="inherit">
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <CallIcon sx={{ fontSize: 18, color: "#1181e9" }} />
              <Typography
                sx={{ fontSize: 16, color: theme.theme2.primaryHeading }}
              >
                {phoneNumber}
              </Typography>
            </Box>
          </Link>
        </Box>
      </Box>

      {/* Manager */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",

          mb: 1.5,
          px: 2.25,
          py: 1.75,
          bgcolor: theme.theme2.secondaryBg,
          border: `1px solid ${theme.theme2.primaryButton}`,
          borderRadius: 2,
        }}
      >
        {/* Icon & Label */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <PhoneInTalkRoundedIcon sx={{ fill: theme.theme2.primaryHeading }} />
          <Typography sx={{ fontSize: 14, color: theme.theme2.primaryHeading }}>
            Message
          </Typography>
        </Box>

        {/* Number */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Link
            href={whatsappHref}
            target="_blank"
            underline="none"
            color="inherit"
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <WhatsAppIcon sx={{ fontSize: 18, color: "#25D366" }} />
              <Typography
                sx={{ fontSize: 16, color: theme.theme2.primaryHeading }}
              >
                {whatsappNumber}
              </Typography>
            </Box>
          </Link>
        </Box>
      </Box>
      {/* Social Media Links */}
      {(fbPath || ytPath || twitterPath || instaPath) && (
        <Box
          sx={{
            px: 2.25,
            py: 1.75,
            bgcolor: theme.theme2.secondaryBg,
            border: `1px solid ${theme.theme2.primaryButton}`,
            borderRadius: 2,
            // mb: 5,
            display: "flex",
            flexDirection: "column",
            gap: 1.2,
          }}
        >
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 600,
              color: theme.theme2.primaryHeading,
            }}
          >
            Follow Us
          </Typography>

          <Box sx={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {fbPath && (
              <Box
                onClick={() => openSocialLink(fbPath)}
                sx={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.6,
                }}
              >
                <FacebookIcon sx={{ fontSize: 26, color: "#1877F2" }} />
              </Box>
            )}

            {instaPath && (
              <Box
                onClick={() => openSocialLink(instaPath)}
                sx={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.6,
                }}
              >
                <InstagramIcon sx={{ fontSize: 26, color: "#E1306C" }} />
              </Box>
            )}

            {ytPath && (
              <Box
                onClick={() => openSocialLink(ytPath)}
                sx={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.6,
                }}
              >
                <YouTubeIcon sx={{ fontSize: 26, color: "#FF0000" }} />
              </Box>
            )}

            {twitterPath && (
              <Box
                onClick={() => openSocialLink(twitterPath)}
                sx={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.6,
                }}
              >
                <XIcon sx={{ fontSize: 22, color: "#121415" }} />
              </Box>
            )}
          </Box>
        </Box>
      )}
      {/* Contact Us Image */}
      <Box
        sx={{
          width: "100%",
          height: 300,
          backgroundImage: `url(${ContactUsImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
    </Box>
  );
};

export default ContactInfo;
