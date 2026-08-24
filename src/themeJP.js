import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: "Inter, sans-serif",
  },

  palette: {
    primary: {
      main: "#C9922A",
    },
    secondary: {
      main: "#8B6914",
    },
    success: {
      main: "#4a7c59",
    },
    danger: {
      main: "#c0392b",
    },
    neutral: {
      main: "#9A8060",
      contrastText: "#fff",
    },
    background: {
      default: "#FFFBF3",
      paper: "#FFF6E6",
    },
  },

  customColors: {
    sidebarBg: "#2C1E08",
    footerBg: "#F5E6C8",
    menuHover: "#FFF0D0",
    planbg: "#FDF0D5",
  },

  colors: {
    primaryHeading: "#6B4400",
    subHeading: "#8B6914",
    primaryButton: "#C9922A",
    bordercolor: "#D4A843",
    sidebarbg: "#F5E6C8",
    menuButton: "#D4A843",
  },

  dashboard: {
    dashboardScreenBg: "#FFFBF3",
  },

  theme2: {
    favorite: "#C9922A",
    headerBg: "#FFF6E6",
    productCardBg: "#FDF0D5",
    notificationBadge: "#B8860B",
    secondaryBg: "#FFFBF3",
    borderCol: "#E8D5A3",
    digiGoldbg: "#F5C842",

    digi_card_bg:
      "linear-gradient(131deg, #8B6914 0%, #C9922A 50%, #F5C842 100%)",

    primaryHeading: "#6B4400",
    offersCardBg: "#8B6914",
    secondaryHeading: "#9A7840",
    textCol: "#7A6040",
    textCol2: "#C9922A",

    loginBtn: "linear-gradient(90deg, #8B6914 0%, #D4A843 100%)",

    productCardGradient:
      "linear-gradient(90deg, #C9922A 0%, #FDF0D5 100%)",

    gradient: [
      "linear-gradient(180deg, #8B6914 0%, #F5C842 100%)",
      "linear-gradient(180deg, #C9922A 0%, #FFF0D0 100%)",
      "linear-gradient(180deg, #A07828 0%, #F5D980 100%)",
      "linear-gradient(180deg, #6B4400 0%, #D4A843 100%)",
    ],

    primaryButton: "#C9922A",

    selectPlan: {
      primaryBtn:
        "linear-gradient(141deg, rgba(139,105,20,1) 0%, rgba(212,168,67,1) 80%)",
    },
  },

  plans: {
    cardBg: "#FFFBF3",
    cardBorderCol: "#E8D5A3",
    enrollBtnTxt: "#FFFBF3",
    gradient:
      "linear-gradient(90deg, #6B4400, #C9922A, #D4A843, #F5C842, #C9922A)",
    cardBg3: "#C9922A",
  },

  calculatePlans: {
    textCol: "#7A6040",
    mahaBenefitBgc: "#C9922A",
    investmentBgc: "#FFF6E6",
    amountBg: "#FDF0D5",
    sliderBarCol: "#E8D5A3",
    sliderThumbBorderCol: "#C9922A",
    calculateCardGradient1: "#FFF0D0",
    calculateCardGradient2: "#FDF8E1",
    enrollBtnBg: "#C9922A",
  },

  paymentAndLedger: {
    payInfoTextCol: "#9A8060",
    payInfoTabSectionBg: "#FFFBF3",
    payInfoTabColActive: "#C9922A",
  },

  paymentScreen: {
    textColHighlighted: "#6B4400",
    amountColHighlighted: "#8B6914",
    textCol: "#7A6040",
    sectionSeparatorLineCol: "#E8D5A3",
    cardBorder: "#E8D5A3",
    payBtnBg: "#C9922A",
    successText: "#4a7c59",
    warnText: "#E8900A",
    goldCon: "#D4A843",
    cardBgHighlighted: "#FDF0D5",
    userInfoCardBg: "#FFF6E6",
  },

  ledger: {
    primaryTextCol: "#7A6040",
    secondaryTextCol: "#9A8060",
    ledgerListSeparatorLineCol: "#F0E2C4",
    amountPaidLabelBg: "#E6F5E1",
    amountPaidLabelTextCol: "#4a7c59",
    downloadIconCol: "#C9922A",
  },

  savingContactDetails: {
    primaryTextCol: "#7A6040",
    secondaryTextCol: "#8B6914",
  },

  noAddedPlans: {
    textCol: "#7A6040",
    fillCol: "#C9922A",
    enrollNowCardBgCol: "#FFFBF3",
    enrollNowCardBorderCol: "#E8D5A3",
    giftCardSeeMoreTextCol: "#C9922A99",
    trendingCardBgCol: "#FDF0D5",
  },

  cartScreen: {
    activeColor: "#C9922A",
    textColor: "#6B4400",
    connectorLineFallbackColor: "#E8D5A3",
    circularIconFallbackColor: "#D4A843",
    totalSummaryCardBgCol: "#FFFBF3",
    totalSummaryCardBoxShadow: "0 -2px 10px rgba(201,146,42,0.12)",
    proceedToAddressBtnHoverCol: "#8B6914",
  },

  cartCard: {
    cardBgCol: "#FFFBF3",
    cardBoxShadow: "0 2px 8px rgba(201,146,42,0.10)",
    itemNameCol: "#4A3000",
    itemSalePriceCol: "#C9922A",
    itemActualPriceCol: "#B0A080",
    itemQtyContainerBgCol: "#C9922A",
    itemQtyContainerTextCol: "#FFFBF3",
    itemQtyManagerBgCol: "#FFF6E6",
    itemQtyManagerTextCol: "#4A3000",
  },

  categoriesPage: {
    categoryHeadingCol: "#C9922A",
    skipCategoryTextCol: "#8B6914",
  },

  categoryProduct: {
    searchBarBGCol: "#FFF6E6",
    searchIconFillCol: "#C9922A",
    searchBarBorderCol: "#E8D5A3",
    searchBarFieldsetCol: "#D4A843",
    filterAndSortIconBorderCol: "#D4A843",
    filterAndSortIconFillCol: "#C9922A",
    selectedFilterBorderCol: "#C9922A",
    selectedFilterTextCol: "#8B6914",
    noProductTextCol: "#C8B898",
  },

  sortScreen: {
    overlayBGCol: "rgba(107, 68, 0, 0.25)",
    sortSectionBGCol: "rgba(255,251,243,0.97)",
    sortSectionBoxShadow: "rgba(201,146,42,0.15)",
    sortSectionHeaderBorderBottomCol: "rgba(212,168,67,0.25)",
    activeSortOptionBorderCol: "#C9922A",
    inactiveSortOptionBorderCol: "#E8D5A3",
    activeSortOptionTextCol: "#6B4400",
  },

  filterScreen: {
    filterLabelSectionBGCol: "#F5E6C8",
    activeFilterNameBGCol: "#FFFBF3",
    activeFilterNameTextCol: "#C9922A",
    inactiveFilterNameBGCol: "#F5E6C8",
    inactiveFilterNameTextCol: "#7A6040",
    activeFilterOptionBorderCol: "#C9922A",
    inactiveFilterOptionBorderCol: "#E8D5A3",
    filterOptionBGCol: "#FFFBF3",
    cancelBtnBGCol: "#A83232",
    cancelBtnTextCol: "#FFF",
    applyBtnBGCol: "#C9922A",
    applyBtnTextCol: "#FFF",
  },

  // ─── DIGITAL GOLD / SILVER THEME ───────────────────────────────────────────
  // Added from the newer theme structure while keeping this theme's original
  // gold, cream, brown and neutral colors.

  digiTheme: {
    // Gold
    goldAccent: "#C9922A",
    goldBadgeBg: "#FFF0D0",
    goldBadgeText: "#6B4400",
    goldBadgeIcon: "#C9922A",
    goldEnrolledBannerBg: "#FDF0D5",
    goldEnrolledBannerBorder: "#C9922A",
    goldEnrolledBannerLabel: "#6B4400",
    goldToggleBg: "#FFF0D0",
    goldToggleBorder: "#C9922A",
    goldToggleText: "#6B4400",
    goldShadow: "rgba(201, 146, 42, 0.15)",

    // Silver
    silverAccent: "#7A806B",
    silverBadgeBg: "#F0F2ED",
    silverBadgeText: "#4F5547",
    silverBadgeIcon: "#7A806B",
    silverEnrolledBannerBg: "#F0F2ED",
    silverEnrolledBannerBorder: "#A7AD9A",
    silverEnrolledBannerLabel: "#4F5547",
    silverToggleBg: "#E5E8DF",
    silverToggleBorder: "#A7AD9A",
    silverToggleText: "#3F4439",

    // Common
    rateTextColor: "#6B4400",
    purityTextColor: "#9A8060",
    cardBorder: "#E8D5A3",
    cardBg: "#FFFBF3",
    whyInvestIconBg: "#FFF0D0",
    bodyText: "#7A6040",
    labelText: "#9A8060",
    dividerColor: "#F0E2C4",
    dialogBg: "rgba(255, 251, 243, 0.95)",
    dialogBorder: "rgba(201, 146, 42, 0.2)",
    backdropBg: "rgba(44, 30, 8, 0.5)",
    closeButtonBg: "rgba(107, 68, 0, 0.04)",
    closeButtonHover: "rgba(107, 68, 0, 0.08)",
    memberHoverBg: "rgba(201, 146, 42, 0.05)",
    disabledBtn: "#E0D5C0",
    warningDialogBg: "#FFFBF3",
  },

  // ─── E-COMMERCE ────────────────────────────────────────────────────────────
  // Added from the newer theme structure and adapted to this theme's
  // existing gold / cream / brown color palette.

  ecommerce: {
    // Brand palette
    gold: "#C9922A",
    ink: "#4A3000",
    inkSoft: "#7A6040",
    muted: "#9A8060",
    line: "#E8D5A3",
    surface: "#FFFBF3",
    surfaceAlt: "#FFF6E6",
    cream: "#FDF0D5",
    imgBg: "#F5E6C8",

    // Theme-matched gold → dark brown gradient
    gradient: "linear-gradient(180deg, #C9922A 0%, #2C1E08 100%)",

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

    // Soft premium shadow scale
    shadow: {
      sm: "0 1px 4px rgba(74,48,0,0.06)",
      md: "0 4px 16px rgba(74,48,0,0.08)",
      lg: "0 10px 30px rgba(74,48,0,0.12)",
      bar: "0 -6px 24px rgba(74,48,0,0.10)",
    },

    // Cart / order flow accents
    activeColor: "#C9922A",
    textColor: "#4A3000",
    proceedBtnHoverCol: "#8B6914",
    summaryCardBoxShadow: "0 -2px 10px rgba(201,146,42,0.12)",

    // Dashboard section headings
    sectionHeadingCol: "#7A6040",
    viewAllCol: "#8B6914",
  },
});

export default theme;
