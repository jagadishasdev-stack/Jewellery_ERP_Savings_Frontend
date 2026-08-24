// export default APP_CONFIG;
const APP_CONFIG = {
  // Jewellery ERP Tenant_ID — the real identifier this build runs against
  // now (see server/src/routes/savingsScheme.js). Replaces the old
  // numeric STORE_ID scheme, which only existed in the separate
  // savings-app MySQL database DLJ was never part of.
  TENANT_ID: "DLJ",

  // Legacy field name, but now carries the SAME value as TENANT_ID above.
  // The old dashboard/plans/branches/rates screens (StoreContext.js,
  // DashboardPage3.js, etc.) all build request URLs/params around this
  // field — rather than rewrite every one of those call sites, the
  // Jewellery ERP server's compatibility routes (server/src/routes/
  // savingsAppCore.js) accept this same value and treat it as a Tenant_ID
  // string instead of a numeric legacy Store_ID. Must stay equal to
  // TENANT_ID.
  STORE_ID: "DLJ",

  THEME_ID: 3,
  appid: "com.jewelsphere.dlj",
  appleid: "",

  DEFAULT_BRANCH: "DLJ-HO",
  BRANCH: "DLJ-HO",
  STORE_NAME: "Dhanalakshmi Jewellers",
  app_name: "Dhanalakshmi Jewellers Savings",

  IS_ALPHA: 0,
};

export default APP_CONFIG;
