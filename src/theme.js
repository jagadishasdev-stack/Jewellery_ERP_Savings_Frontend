import { Favorite } from "@mui/icons-material";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  // General
  typography: {
    fontFamily: "Inter, sans-serif",
  },

  palette: {
    primary: {
      main: "#3B4620",
    },
    secondary: {
      main: "#B98A46",
    },
    success: {
      main: "#4caf50",
    },
    danger: {
      main: "#f44336",
    },
    neutral: {
      main: "#8A8D80",
      contrastText: "#fff",
    },
    background: {
      default: "#ffff",
      paper: "#F6F6F4",
    },
  },

  customColors: {
    sidebarBg: "#1F260F",
    footerBg: "#EFEFEC",
    menuHover: "#EAEDE3",
    planbg: "#EFE9D6",
  },

  colors: {
    primaryHeading: "#3B4620",
    subHeading: "#3B4620",
    primaryButton: "#B98A46",
    bordercolor: "#DCDCD7",
    sidebarbg: "#F1F1EF",
    menuButton: "#B98A46",
  },

  // Dashboard screen
  dashboard: {
    dashboardScreenBg: "#F6F6F4",
  },

  // Theme 2
  theme2: {
    favorite: "#9C3B3B",
    headerBg: "#ffffff",
    productCardBg: "#F1F1ED",
    notificationBadge: "#4A5A28",
    secondaryBg: "#F7F7F4",
    borderCol: "#DCDCD7",
    digiGoldbg: "#F0DFA6",

    digi_card_bg:
      "linear-gradient(131deg, #262E12 0%, #5C6B34 50%, #B98A46 100%)",

    primaryHeading: "#3B4620",
    offersCardBg: "#3B4620",
    secondaryHeading: "#5A5A55",
    textCol: "#3B4620",
    textCol2: "#B98A46",

    loginBtn: "linear-gradient(90deg, #3B4620 0%, #B98A46 100%)",

    productCardGradient:
      "linear-gradient(90deg, #3B4620 0%, #B98A46 100%)",

    gradient: [
      "linear-gradient(180deg, #3B4620 0%, #1A2010 100%)",
      "linear-gradient(180deg, #3B4620 0%, #B98A46 100%)",
      "linear-gradient(180deg, #B98A46 0%, #E7AD4B 100%)",
      "linear-gradient(180deg, #1A2010 0%, #B98A46 100%)",
    ],

    primaryButton: "#B98A46",

    selectPlan: {
      primaryBtn:
        "linear-gradient(141deg, #3B4620 0%, #B98A46 80%)",
    },
  },

  // Plans screen
  plans: {
    cardBg: "#F7F7F4",
    cardBorderCol: "#DCDCD7",
    enrollBtnTxt: "#FFFEFA",
    gradient:
      "linear-gradient(90deg, #3B4620, #B98A46, #E7AD4B, #B98A46, #3B4620)",
    cardBg3: "#B98A46",
  },

  // Plan calculation screen
  calculatePlans: {
    textCol: "#4E4E49",
    mahaBenefitBgc: "#B98A46",
    investmentBgc: "#F1F1EC",
    amountBg: "#F7F5EC",
    sliderBarCol: "#E3E3DC",
    sliderThumbBorderCol: "#B98A46",
    calculateCardGradient1: "#ECEEE4",
    calculateCardGradient2: "#F6F1DC",
    enrollBtnBg: "#3B4620",
  },

  // Payment and Ledger screen
  paymentAndLedger: {
    payInfoTextCol: "#84837D",
    payInfoTabSectionBg: "#FFFEFA",
    payInfoTabColActive: "#3B4620",
  },

  // Payment screen
  paymentScreen: {
    textColHighlighted: "#3B4620",
    amountColHighlighted: "#3B4620",
    textCol: "#4E4E49",
    sectionSeparatorLineCol: "#E2E2DE",
    cardBorder: "#DCDCD7",
    payBtnBg: "#B98A46",
    successText: "#5FAC50",
    warnText: "#FB6129",
    goldCon: "#B98A46",
    cardBgHighlighted: "#EFE2BC",
    userInfoCardBg: "#F1F1EC",
  },

  // Ledger screen
  ledger: {
    primaryTextCol: "#4E4E49",
    secondaryTextCol: "#84837D",
    ledgerListSeparatorLineCol: "#EBEBE7",
    amountPaidLabelBg: "#E6EADA",
    amountPaidLabelTextCol: "#3F5A28",
    downloadIconCol: "#8A6D3B",
  },

  // Saving contact details
  savingContactDetails: {
    primaryTextCol: "#4E4E49",
    secondaryTextCol: "#B98A46",
  },

  // No saving plans screen
  noAddedPlans: {
    textCol: "#4E4E49",
    fillCol: "#B98A46",
    enrollNowCardBgCol: "#F7F7F4",
    enrollNowCardBorderCol: "#DCDCD7",
    giftCardSeeMoreTextCol: "#BB212199",
    trendingCardBgCol: "#F1EEE2",
  },

  // Cart screen
  cartScreen: {
    activeColor: "#B98A46",
    textColor: "#3B4620",
    connectorLineFallbackColor: "#ddd",
    circularIconFallbackColor: "#ccc",
    totalSummaryCardBgCol: "#FFF",
    totalSummaryCardBoxShadow: "0 -2px 10px rgba(0,0,0,0.08)",
    proceedToAddressBtnHoverCol: "#3B4620",
  },

  // Cart card
  cartCard: {
    cardBgCol: "#FFF",
    cardBoxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    itemNameCol: "#222",
    itemSalePriceCol: "#B98A46",
    itemActualPriceCol: "#aaa",
    itemQtyContainerBgCol: "#B98A46",
    itemQtyContainerTextCol: "#FFF",
    itemQtyManagerBgCol: "#FFF",
    itemQtyManagerTextCol: "#000",
  },

  // Categories page
  categoriesPage: {
    categoryHeadingCol: "#3B4620",
    skipCategoryTextCol: "#B98A46",
  },

  // Category product
  categoryProduct: {
    searchBarBGCol: "#F2F2EF",
    searchIconFillCol: "#3B4620",
    searchBarBorderCol: "#FFF",
    searchBarFieldsetCol: "#C1C1C1",
    filterAndSortIconBorderCol: "#8A8A8A",
    filterAndSortIconFillCol: "#3B4620",
    selectedFilterBorderCol: "#B98A46",
    selectedFilterTextCol: "#3B4620",
    noProductTextCol: "#C1C1C1",
  },

  // Sort screen
  sortScreen: {
    overlayBGCol: "rgba(0, 0, 0, 0.3)",
    sortSectionBGCol: "rgba(255,255,255,0.8)",
    sortSectionBoxShadow: "rgba(0,0,0,0.15)",
    sortSectionHeaderBorderBottomCol: "rgba(0,0,0,0.1)",
    activeSortOptionBorderCol: "#B98A46",
    inactiveSortOptionBorderCol: "#B7B7B7",
    activeSortOptionTextCol: "#333",
  },

  // Filter screen
  filterScreen: {
    filterLabelSectionBGCol: "#EBEBEB",
    activeFilterNameBGCol: "#FFF",
    activeFilterNameTextCol: "#3B4620",
    inactiveFilterNameBGCol: "#EBEBEB",
    inactiveFilterNameTextCol: "#000",
    activeFilterOptionBorderCol: "#B98A46",
    inactiveFilterOptionBorderCol: "#CACACA",
    filterOptionBGCol: "#FFF",
    cancelBtnBGCol: "#A83232",
    cancelBtnTextCol: "#FFF",
    applyBtnBGCol: "#3B4620",
    applyBtnTextCol: "#FFF",
  },

  // ─── DIGITAL GOLD / SILVER THEME ─────────────────────────────────────────
  // Added missing variables from the new theme structure.
  // Existing olive/gold theme colors are preserved.

  digiTheme: {
    // Gold
    goldAccent: "#B98A46",
    goldBadgeBg: "#F0DFA6",
    goldBadgeText: "#3B4620",
    goldBadgeIcon: "#B98A46",
    goldEnrolledBannerBg: "#F7F5EC",
    goldEnrolledBannerBorder: "#B98A46",
    goldEnrolledBannerLabel: "#3B4620",
    goldToggleBg: "#F0DFA6",
    goldToggleBorder: "#B98A46",
    goldToggleText: "#3B4620",
    goldShadow: "rgba(185, 138, 70, 0.15)",

    // Silver
    silverAccent: "#7A8068",
    silverBadgeBg: "#F1F1ED",
    silverBadgeText: "#4E4E49",
    silverBadgeIcon: "#7A8068",
    silverEnrolledBannerBg: "#F1F1ED",
    silverEnrolledBannerBorder: "#B7B7B0",
    silverEnrolledBannerLabel: "#4E4E49",
    silverToggleBg: "#E3E3DC",
    silverToggleBorder: "#B7B7B0",
    silverToggleText: "#3B4620",

    // Common
    rateTextColor: "#3B4620",
    purityTextColor: "#84837D",
    cardBorder: "#DCDCD7",
    cardBg: "#FFFFFF",
    whyInvestIconBg: "#F7F7F4",
    bodyText: "#4E4E49",
    labelText: "#84837D",
    dividerColor: "#EBEBE7",
    dialogBg: "rgba(255, 255, 255, 0.95)",
    dialogBorder: "rgba(185, 138, 70, 0.2)",
    backdropBg: "rgba(0, 0, 0, 0.5)",
    closeButtonBg: "rgba(0, 0, 0, 0.04)",
    closeButtonHover: "rgba(0, 0, 0, 0.08)",
    memberHoverBg: "rgba(185, 138, 70, 0.05)",
    disabledBtn: "#E0E0E0",
    warningDialogBg: "#FFFFFF",
  },

  // ─── E-COMMERCE ───────────────────────────────────────────────────────────
  // Added missing e-commerce variables from the new theme structure.
  // Colors are adapted only from this theme's existing olive/gold palette.

  ecommerce: {
    // Brand palette
    gold: "#B98A46",
    ink: "#3B4620",
    inkSoft: "#5A5A55",
    muted: "#84837D",
    line: "#DCDCD7",
    surface: "#FFFFFF",
    surfaceAlt: "#F7F7F4",
    cream: "#F7F5EC",
    imgBg: "#F1F1ED",

    // Olive → Gold gradient
    gradient:
      "linear-gradient(180deg, #3B4620 0%, #1A2010 100%)",

    // Typography
    fontBody: "Inter, system-ui, sans-serif",
    fontDisplay: "Inter, system-ui, sans-serif",

    // Radius scale
    radius: {
      card: "16px",
      tile: "20px",
      sheet: "24px",
      pill: "999px",
      sm: "10px",
    },

    // Premium shadow scale
    shadow: {
      sm: "0 1px 4px rgba(24,20,12,0.06)",
      md: "0 4px 16px rgba(24,20,12,0.08)",
      lg: "0 10px 30px rgba(24,20,12,0.12)",
      bar: "0 -6px 24px rgba(24,20,12,0.10)",
    },

    // Cart / order flow
    activeColor: "#B98A46",
    textColor: "#3B4620",
    proceedBtnHoverCol: "#3B4620",
    summaryCardBoxShadow: "0 -2px 10px rgba(0,0,0,0.08)",

    // Dashboard e-commerce section
    sectionHeadingCol: "#5A5A55",
    viewAllCol: "#3B4620",
  },
});

export default theme;
