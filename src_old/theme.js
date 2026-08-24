// // import { Favorite } from "@mui/icons-material";
// import { createTheme } from "@mui/material/styles";

// const theme = createTheme({
//   // General
//   typography: {
//     fontFamily: "Inter, sans-serif",
//   },

//   palette: {
//     primary: {
//       main: "#601696", // Base brand color
//     },
//     secondary: {
//       main: "#A855C4", // Text/accent color
//     },
//     success: {
//       main: "#4caf50", // green
//     },
//     danger: {
//       main: "#A72103", // crimson (secondary)
//     },
//     neutral: {
//       main: "#3D0F5C", // deep purple (secondary)
//       contrastText: "#fff",
//     },
//     background: {
//       default: "#ffff",
//       paper: "#FAF6EF", // warm off-white to complement gold palette
//     },
//   },

//   customColors: {
//     sidebarBg: "#1A0526",        // near-black purple (deep curtain shadow)
//     footerBg: "#F5EFE6",         // champagne-light
//     menuHover: "#E8F7FA",        // light teal tint
//     planbg: "#FBF3E0",           // warm cream
//   },

//   colors: {
//     primaryHeading: "#20072e",   
//     subHeading: "#3D0F5C",       
//     primaryButton: "#4c0f7a",    // Changed to base color for visibility
//     bordercolor: "#D9CCB7",
//     menubutton:"#ba9136"      
//   },

//   // Component Specific
//   // Dashboard screen
//   dashboard: {
//     dashboardScreenBg: "#FAF6EF",  
//   },

//   theme2: {
//     favorite: "#B057D6",            
//     headerBg: "rgb(51, 4, 86)",            
//     productCardBg: "#FBF3E0",       
//     notificationBadge: "#ba9136",   // Bright brand variant
//     secondaryBg: "#F5F0E8",         
//     borderCol: "#D9CCB7",           
//     digiGoldbg: "#F5E4A0",          
//     primaryHeading: "#4c0f7a",      
//     offersCardBg: "#4c0f7a",        
//     secondaryHeading: "#7A6350",    
//     textCol: "#8A7060",             
//     textCol2: "#A855C4",            
//     // Gradients modeled on the curtain image: light fold -> mid -> dark fold
//     digi_card_bg: "linear-gradient(131deg, #9333B0 0%, #601696 45%, #2C0847 100%)",  
//     loginBtn: "linear-gradient(90deg, #4c0f7a 0%, #8e24aa 100%)",      
//     productCardGradient: "linear-gradient(90deg, #1A0526 0%, #601696 100%)", 
//     gradient: [
//       "linear-gradient(180deg, #8e24aa 0%, #2C0847 100%)",  // Light fold to dark
//       "linear-gradient(135deg, #601696 0%, #1A0526 100%)",  // Mid to darkest
//       "linear-gradient(180deg, #4c0f7a 0%, #9333B0 100%)",  // Dark to bright fold
//       "linear-gradient(90deg, #2C0847 0%, #601696 50%, #1A0526 100%)", // Dark -> Mid -> Dark (curtain fold)
//     ],
//     primaryButton: "#c88f0a",       
//     selectPlan: {
//       primaryBtn:
//         "linear-gradient(141deg, #601696 0%, #2C0847 100%)", 
//     },
//   },

//   // Plans screen
//   plans: {
//     cardBg: "#FBF3E0",              
//     cardBorderCol: "#D9CCB7",       
//     enrollBtnTxt: "#FFFEFA",
//     gradient:
//       "linear-gradient(90deg, #1A0526, #601696, #9333B0, #601696, #1A0526)", 
//     cardBg3: "#4c0f7a",             
//   },

//   // Plan calculation screen
//   calculatePlans: {
//     textCol: "#5A4A3A",
//     mahaBenefitBgc: "#D29E0E",      
//     investmentBgc: "#F5EDE0",       
//     amountBg: "#FFF3DC",
//     sliderBarCol: "#D9CCB7",        
//     sliderThumbBorderCol: "#D29E0E",
//     calculateCardGradient1: "#FBF3E0",
//     calculateCardGradient2: "#E8F7FA", 
//     enrollBtnBg: "#4c0f7a",         
//   },

//   // Payment and Ledger screen
//   paymentAndLedger: {
//     payInfoTextCol: "#8A7060",
//     payInfoTabSectionBg: "#FFFEFA",
//     payInfoTabColActive: "#4c0f7a",  
//   },

//   // Payment screen
//   paymentScreen: {
//     textColHighlighted: "#4c0f7a",  
//     amountColHighlighted: "#4c0f7a",
//     textCol: "#5A4A3A",
//     sectionSeparatorLineCol: "#D9CCB7", 
//     cardBorder: "#D9CCB7",          
//     payBtnBg: "#4c0f7a",            
//     successText: "#5FAC50",
//     warnText: "#E26025",            
//     goldCon: "#D29E0E",             
//     cardBgHighlighted: "#F5E4A0",   
//     userInfoCardBg: "#FBF3E0",      
//   },

//   // Ledger screen
//   ledger: {
//     primaryTextCol: "#5A4A3A",
//     secondaryTextCol: "#8A7060",
//     ledgerListSeparatorLineCol: "#F0E8DA",
//     amountPaidLabelBg: "#E1F9D9",
//     amountPaidLabelTextCol: "#3D7030",
//     downloadIconCol: "#4c0f7a",     
//   },

//   // Saving contact details
//   savingContactDetails: {
//     primaryTextCol: "#5A4A3A",
//     secondaryTextCol: "#8A6020",
//   },

//   // No saving plans screen
//   noAddedPlans: {
//     textCol: "#5A4A3A",
//     fillCol: "#CAA667",             
//     enrollNowCardBgCol: "#FBF3E0",  
//     enrollNowCardBorderCol: "#D9CCB7", 
//     giftCardSeeMoreTextCol: "#B057D699", 
//     trendingCardBgCol: "#F5EDE0",   
//   },

//   // Cart screen
//   cartScreen: {
//     activeColor: "#4c0f7a",         
//     textColor: "#3D0F5C",           
//     connectorLineFallbackColor: "#D9CCB7",
//     circularIconFallbackColor: "#CAA667",
//     totalSummaryCardBgCol: "#FFF",
//     totalSummaryCardBoxShadow: "0 -2px 10px rgba(0,0,0,0.08)",
//     proceedToAddressBtnHoverCol: "#8e24aa", 
//   },

//   // Cart card
//   cartCard: {
//     cardBgCol: "#FFF",
//     cardBoxShadow: "0 2px 8px rgba(0,0,0,0.08)",
//     itemNameCol: "#222",
//     itemSalePriceCol: "#4c0f7a",    
//     itemActualPriceCol: "#aaa",
//     itemQtyContainerBgCol: "#4c0f7a", 
//     itemQtyContainerTextCol: "#FFF",
//     itemQtyManagerBgCol: "#FFF",
//     itemQtyManagerTextCol: "#000",
//   },

//   // Categories page
//   categoriesPage: {
//     categoryHeadingCol: "#4c0f7a",  
//     skipCategoryTextCol: "#8e24aa", 
//   },

//   // Category product
//   categoryProduct: {
//     searchBarBGCol: "#FFF7E0",      
//     searchIconFillCol: "#4c0f7a",   
//     searchBarBorderCol: "#FFF",
//     searchBarFieldsetCol: "#C1C1C1",
//     filterAndSortIconBorderCol: "#8A8A8A",
//     filterAndSortIconFillCol: "#4c0f7a", 
//     selectedFilterBorderCol: "#4c0f7a",
//     selectedFilterTextCol: "#8A6020",
//     noProductTextCol: "#C1C1C1",
//   },

//   // Sort screen
//   sortScreen: {
//     overlayBGCol: "rgba(0, 0, 0, 0.3)",
//     sortSectionBGCol: "rgba(255,255,255,0.8)",
//     sortSectionBoxShadow: "rgba(0,0,0,0.15)",
//     sortSectionHeaderBorderBottomCol: "rgba(0,0,0,0.1)",
//     activeSortOptionBorderCol: "#4c0f7a",  
//     inactiveSortOptionBorderCol: "#B7B7B7",
//     activeSortOptionTextCol: "#333",
//   },

//   // Filter screen
//   filterScreen: {
//     filterLabelSectionBGCol: "#EBEBEB",
//     activeFilterNameBGCol: "#FFF",
//     activeFilterNameTextCol: "#4c0f7a",
//     inactiveFilterNameBGCol: "#EBEBEB",
//     inactiveFilterNameTextCol: "#000",
//     activeFilterOptionBorderCol: "#4c0f7a",  
//     inactiveFilterOptionBorderCol: "#CACACA",
//     filterOptionBGCol: "#FFF",
//     cancelBtnBGCol: "#A72103",               
//     cancelBtnTextCol: "#FFF",
//     applyBtnBGCol: "#4c0f7a",                
//     applyBtnTextCol: "#FFF",
//   },
// });

// export default theme;






// Aabushan

// // import { Favorite } from "@mui/icons-material";
// import { createTheme } from "@mui/material/styles";

// const theme = createTheme({
//   // General
//   typography: {
//     fontFamily: "Inter, sans-serif",
//   },

//   palette: {
//     primary: {
//       main: "#691B1D", // Base brand color
//     },
//     secondary: {
//       main: "#A94547", // Text/accent color
//     },
//     success: {
//       main: "#4caf50", // green
//     },
//     danger: {
//       main: "#A72103", // crimson (secondary)
//     },
//     neutral: {
//       main: "#3D0F10", // deep maroon (secondary)
//       contrastText: "#fff",
//     },
//     background: {
//       default: "#ffff",
//       paper: "#FAF6EF", // warm off-white to complement gold palette
//     },
//   },

//   customColors: {
//     sidebarBg: "#1A0606",        // near-black maroon (deep curtain shadow)
//     footerBg: "#F5EFE6",         // champagne-light
//     menuHover: "#E8F7FA",        // light teal tint
//     planbg: "#FBF3E0",           // warm cream
//   },

//   colors: {
//     primaryHeading: "#2A0A0B",
//     subHeading: "#3D0F10",
//     primaryButton: "#8A2224",    // Changed to base color for visibility
//     bordercolor: "#D9CCB7",
//     menubutton:"#ba9136"      
//   },

//   // Component Specific
//   // Dashboard screen
//   dashboard: {
//     dashboardScreenBg: "#FAF6EF",  
//   },

//   theme2: {
//     favorite: "#C46567",            
//     headerBg: "rgb(51, 14, 15)",            
//     productCardBg: "#FBF3E0",       
//     notificationBadge: "#ba9136",   // Bright brand variant
//     secondaryBg: "#F5F0E8",         
//     borderCol: "#D9CCB7",           
//     digiGoldbg: "#F5E4A0",          
//     primaryHeading: "#8A2224",      
//     offersCardBg: "#8A2224",        
//     secondaryHeading: "#7A6350",    
//     textCol: "#8A7060",             
//     textCol2: "#A94547",            
//     // Gradients modeled on the curtain image: light fold -> mid -> dark fold
//     digi_card_bg: "linear-gradient(131deg, #B5585A 0%, #691B1D 45%, #2A0A0B 100%)",  
//     loginBtn: "linear-gradient(90deg, #8A2224 0%, #A13234 100%)",      
//     productCardGradient: "linear-gradient(90deg, #1A0606 0%, #691B1D 100%)", 
//     gradient: [
//       "linear-gradient(180deg, #A13234 0%, #2A0A0B 100%)",  // Light fold to dark
//       "linear-gradient(135deg, #691B1D 0%, #1A0606 100%)",  // Mid to darkest
//       "linear-gradient(180deg, #8A2224 0%, #B5585A 100%)",  // Dark to bright fold
//       "linear-gradient(90deg, #2A0A0B 0%, #691B1D 50%, #1A0606 100%)", // Dark -> Mid -> Dark (curtain fold)
//     ],
//     primaryButton: "#c88f0a",       
//     selectPlan: {
//       primaryBtn:
//         "linear-gradient(141deg, #691B1D 0%, #2A0A0B 100%)", 
//     },
//   },

//   // Plans screen
//   plans: {
//     cardBg: "#FBF3E0",              
//     cardBorderCol: "#D9CCB7",       
//     enrollBtnTxt: "#FFFEFA",
//     gradient:
//       "linear-gradient(90deg, #1A0606, #691B1D, #B5585A, #691B1D, #1A0606)", 
//     cardBg3: "#8A2224",             
//   },

//   // Plan calculation screen
//   calculatePlans: {
//     textCol: "#5A4A3A",
//     mahaBenefitBgc: "#D29E0E",      
//     investmentBgc: "#F5EDE0",       
//     amountBg: "#FFF3DC",
//     sliderBarCol: "#D9CCB7",        
//     sliderThumbBorderCol: "#D29E0E",
//     calculateCardGradient1: "#FBF3E0",
//     calculateCardGradient2: "#E8F7FA", 
//     enrollBtnBg: "#8A2224",         
//   },

//   // Payment and Ledger screen
//   paymentAndLedger: {
//     payInfoTextCol: "#8A7060",
//     payInfoTabSectionBg: "#FFFEFA",
//     payInfoTabColActive: "#8A2224",  
//   },

//   // Payment screen
//   paymentScreen: {
//     textColHighlighted: "#8A2224",  
//     amountColHighlighted: "#8A2224",
//     textCol: "#5A4A3A",
//     sectionSeparatorLineCol: "#D9CCB7", 
//     cardBorder: "#D9CCB7",          
//     payBtnBg: "#8A2224",            
//     successText: "#5FAC50",
//     warnText: "#E26025",            
//     goldCon: "#D29E0E",             
//     cardBgHighlighted: "#F5E4A0",   
//     userInfoCardBg: "#FBF3E0",      
//   },

//   // Ledger screen
//   ledger: {
//     primaryTextCol: "#5A4A3A",
//     secondaryTextCol: "#8A7060",
//     ledgerListSeparatorLineCol: "#F0E8DA",
//     amountPaidLabelBg: "#E1F9D9",
//     amountPaidLabelTextCol: "#3D7030",
//     downloadIconCol: "#8A2224",     
//   },

//   // Saving contact details
//   savingContactDetails: {
//     primaryTextCol: "#5A4A3A",
//     secondaryTextCol: "#8A6020",
//   },

//   // No saving plans screen
//   noAddedPlans: {
//     textCol: "#5A4A3A",
//     fillCol: "#CAA667",             
//     enrollNowCardBgCol: "#FBF3E0",  
//     enrollNowCardBorderCol: "#D9CCB7", 
//     giftCardSeeMoreTextCol: "#C4656799", 
//     trendingCardBgCol: "#F5EDE0",   
//   },

//   // Cart screen
//   cartScreen: {
//     activeColor: "#8A2224",         
//     textColor: "#3D0F10",           
//     connectorLineFallbackColor: "#D9CCB7",
//     circularIconFallbackColor: "#CAA667",
//     totalSummaryCardBgCol: "#FFF",
//     totalSummaryCardBoxShadow: "0 -2px 10px rgba(0,0,0,0.08)",
//     proceedToAddressBtnHoverCol: "#A13234", 
//   },

//   // Cart card
//   cartCard: {
//     cardBgCol: "#FFF",
//     cardBoxShadow: "0 2px 8px rgba(0,0,0,0.08)",
//     itemNameCol: "#222",
//     itemSalePriceCol: "#8A2224",    
//     itemActualPriceCol: "#aaa",
//     itemQtyContainerBgCol: "#8A2224", 
//     itemQtyContainerTextCol: "#FFF",
//     itemQtyManagerBgCol: "#FFF",
//     itemQtyManagerTextCol: "#000",
//   },

//   // Categories page
//   categoriesPage: {
//     categoryHeadingCol: "#8A2224",  
//     skipCategoryTextCol: "#A13234", 
//   },

//   // Category product
//   categoryProduct: {
//     searchBarBGCol: "#FFF7E0",      
//     searchIconFillCol: "#8A2224",   
//     searchBarBorderCol: "#FFF",
//     searchBarFieldsetCol: "#C1C1C1",
//     filterAndSortIconBorderCol: "#8A8A8A",
//     filterAndSortIconFillCol: "#8A2224", 
//     selectedFilterBorderCol: "#8A2224",
//     selectedFilterTextCol: "#8A6020",
//     noProductTextCol: "#C1C1C1",
//   },

//   // Sort screen
//   sortScreen: {
//     overlayBGCol: "rgba(0, 0, 0, 0.3)",
//     sortSectionBGCol: "rgba(255,255,255,0.8)",
//     sortSectionBoxShadow: "rgba(0,0,0,0.15)",
//     sortSectionHeaderBorderBottomCol: "rgba(0,0,0,0.1)",
//     activeSortOptionBorderCol: "#8A2224",  
//     inactiveSortOptionBorderCol: "#B7B7B7",
//     activeSortOptionTextCol: "#333",
//   },

//   // Filter screen
//   filterScreen: {
//     filterLabelSectionBGCol: "#EBEBEB",
//     activeFilterNameBGCol: "#FFF",
//     activeFilterNameTextCol: "#8A2224",
//     inactiveFilterNameBGCol: "#EBEBEB",
//     inactiveFilterNameTextCol: "#000",
//     activeFilterOptionBorderCol: "#8A2224",  
//     inactiveFilterOptionBorderCol: "#CACACA",
//     filterOptionBGCol: "#FFF",
//     cancelBtnBGCol: "#A72103",               
//     cancelBtnTextCol: "#FFF",
//     applyBtnBGCol: "#8A2224",                
//     applyBtnTextCol: "#FFF",
//   },
// });

// export default theme;



// import { Favorite } from "@mui/icons-material";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  // General
  typography: {
    fontFamily: "Inter, sans-serif",
  },

  palette: {
    primary: {
      main: "#112246", // Base brand color
    },
    secondary: {
      main: "#2C4F8F", // Text/accent color
    },
    success: {
      main: "#4caf50", // green
    },
    danger: {
      main: "#A72103", // crimson (secondary)
    },
    neutral: {
      main: "#0A1730", // deep navy (secondary)
      contrastText: "#fff",
    },
    background: {
      default: "#ffff",
      paper: "#F0F3F8", // cool off-white to complement navy palette
    },
  },

  customColors: {
    sidebarBg: "#050C1A",        // near-black navy (deep curtain shadow)
    footerBg: "#EDF1F7",         // cool champagne-light
    menuHover: "#E8F7FA",        // light teal tint
    planbg: "#EAF0F8",           // cool cream
  },

  colors: {
    primaryHeading: "#0A1730",
    subHeading: "#1B3A73",
    primaryButton: "#112246",    // Changed to base color for visibility
    bordercolor: "#C7D0E0",
    menubutton:"#ba9136"      
  },

  // Component Specific
  // Dashboard screen
  dashboard: {
    dashboardScreenBg: "#F0F3F8",  
  },

  theme2: {
    favorite: "#4A6FB3",            
    headerBg: "rgb(17, 34, 70)",            
    productCardBg: "#EAF0F8",       
    notificationBadge: "#ba9136",   // Bright brand variant
    secondaryBg: "#EDF1F7",         
    borderCol: "#C7D0E0",           
    digiGoldbg: "#F5E4A0",          
    primaryHeading: "#112246",      
    offersCardBg: "#112246",        
    secondaryHeading: "#4A5A7A",    
    textCol: "#5A6B8C",             
    textCol2: "#2C4F8F",            
    // Gradients modeled on the curtain image: light fold -> mid -> dark fold
    digi_card_bg: "linear-gradient(131deg, #4A6FB3 0%, #112246 45%, #050C1A 100%)",  
    loginBtn: "linear-gradient(90deg, #112246 0%, #2C4F8F 100%)",      
    productCardGradient: "linear-gradient(90deg, #050C1A 0%, #112246 100%)", 
    gradient: [
      "linear-gradient(180deg, #2C4F8F 0%, #050C1A 100%)",  // Light fold to dark
      "linear-gradient(135deg, #112246 0%, #050C1A 100%)",  // Mid to darkest
      "linear-gradient(180deg, #112246 0%, #4A6FB3 100%)",  // Dark to bright fold
      "linear-gradient(90deg, #050C1A 0%, #112246 50%, #050C1A 100%)", // Dark -> Mid -> Dark (curtain fold)
    ],
    primaryButton: "#c88f0a",       
    selectPlan: {
      primaryBtn:
        "linear-gradient(141deg, #112246 0%, #050C1A 100%)", 
    },
  },

  // Plans screen
  plans: {
    cardBg: "#EAF0F8",              
    cardBorderCol: "#C7D0E0",       
    enrollBtnTxt: "#FFFEFA",
    gradient:
      "linear-gradient(90deg, #050C1A, #112246, #4A6FB3, #112246, #050C1A)", 
    cardBg3: "#112246",             
  },

  // Plan calculation screen
  calculatePlans: {
    textCol: "#3A4A6A",
    mahaBenefitBgc: "#D29E0E",      
    investmentBgc: "#EDF1F7",       
    amountBg: "#F5F8FC",
    sliderBarCol: "#C7D0E0",        
    sliderThumbBorderCol: "#D29E0E",
    calculateCardGradient1: "#EAF0F8",
    calculateCardGradient2: "#E8F7FA", 
    enrollBtnBg: "#112246",         
  },

  // Payment and Ledger screen
  paymentAndLedger: {
    payInfoTextCol: "#5A6B8C",
    payInfoTabSectionBg: "#FFFEFA",
    payInfoTabColActive: "#112246",  
  },

  // Payment screen
  paymentScreen: {
    textColHighlighted: "#112246",  
    amountColHighlighted: "#112246",
    textCol: "#3A4A6A",
    sectionSeparatorLineCol: "#C7D0E0", 
    cardBorder: "#C7D0E0",          
    payBtnBg: "#112246",            
    successText: "#5FAC50",
    warnText: "#E26025",            
    goldCon: "#D29E0E",             
    cardBgHighlighted: "#F5E4A0",   
    userInfoCardBg: "#EAF0F8",      
  },

  // Ledger screen
  ledger: {
    primaryTextCol: "#3A4A6A",
    secondaryTextCol: "#5A6B8C",
    ledgerListSeparatorLineCol: "#E4EAF3",
    amountPaidLabelBg: "#E1F9D9",
    amountPaidLabelTextCol: "#3D7030",
    downloadIconCol: "#112246",     
  },

  // Saving contact details
  savingContactDetails: {
    primaryTextCol: "#3A4A6A",
    secondaryTextCol: "#6A7A9A",
  },

  // No saving plans screen
  noAddedPlans: {
    textCol: "#3A4A6A",
    fillCol: "#CAA667",             
    enrollNowCardBgCol: "#EAF0F8",  
    enrollNowCardBorderCol: "#C7D0E0", 
    giftCardSeeMoreTextCol: "#4A6FB399", 
    trendingCardBgCol: "#EDF1F7",   
  },

  // Cart screen
  cartScreen: {
    activeColor: "#112246",         
    textColor: "#1B3A73",           
    connectorLineFallbackColor: "#C7D0E0",
    circularIconFallbackColor: "#CAA667",
    totalSummaryCardBgCol: "#FFF",
    totalSummaryCardBoxShadow: "0 -2px 10px rgba(0,0,0,0.08)",
    proceedToAddressBtnHoverCol: "#2C4F8F", 
  },

  // Cart card
  cartCard: {
    cardBgCol: "#FFF",
    cardBoxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    itemNameCol: "#222",
    itemSalePriceCol: "#112246",    
    itemActualPriceCol: "#aaa",
    itemQtyContainerBgCol: "#112246", 
    itemQtyContainerTextCol: "#FFF",
    itemQtyManagerBgCol: "#FFF",
    itemQtyManagerTextCol: "#000",
  },

  // Categories page
  categoriesPage: {
    categoryHeadingCol: "#112246",  
    skipCategoryTextCol: "#2C4F8F", 
  },

  // Category product
  categoryProduct: {
    searchBarBGCol: "#EEF2F8",      
    searchIconFillCol: "#112246",   
    searchBarBorderCol: "#FFF",
    searchBarFieldsetCol: "#C1C1C1",
    filterAndSortIconBorderCol: "#8A8A8A",
    filterAndSortIconFillCol: "#112246", 
    selectedFilterBorderCol: "#112246",
    selectedFilterTextCol: "#4A5A7A",
    noProductTextCol: "#C1C1C1",
  },

  // Sort screen
  sortScreen: {
    overlayBGCol: "rgba(0, 0, 0, 0.3)",
    sortSectionBGCol: "rgba(255,255,255,0.8)",
    sortSectionBoxShadow: "rgba(0,0,0,0.15)",
    sortSectionHeaderBorderBottomCol: "rgba(0,0,0,0.1)",
    activeSortOptionBorderCol: "#112246",  
    inactiveSortOptionBorderCol: "#B7B7B7",
    activeSortOptionTextCol: "#333",
  },

  // Filter screen
  filterScreen: {
    filterLabelSectionBGCol: "#EBEBEB",
    activeFilterNameBGCol: "#FFF",
    activeFilterNameTextCol: "#112246",
    inactiveFilterNameBGCol: "#EBEBEB",
    inactiveFilterNameTextCol: "#000",
    activeFilterOptionBorderCol: "#112246",  
    inactiveFilterOptionBorderCol: "#CACACA",
    filterOptionBGCol: "#FFF",
    cancelBtnBGCol: "#A72103",               
    cancelBtnTextCol: "#FFF",
    applyBtnBGCol: "#112246",                
    applyBtnTextCol: "#FFF",
  },
});

export default theme;