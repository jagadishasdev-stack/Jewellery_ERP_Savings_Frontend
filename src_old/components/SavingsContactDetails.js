// Importing necessary React hooks and components from Material-UI
import React, { useContext, useEffect, useState, useRef } from "react";
import wallet from "../assets/img/icons/Wallet.svg";
import indianFlag from "../assets/img/icons/india.svg";
import TermsPage from "./TermsPage";
import PrivacyPolicyPage from "./PrivacyPolicyPage";
import { Geolocation } from "@capacitor/geolocation";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  Snackbar,
  Alert,
  Dialog,
  IconButton,
  CircularProgress,
  Grid,
  Collapse,
  DialogContent, // ← add this
  DialogActions, // ← add this
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import theme from "../theme";
import { StoreContext } from "../contexts/StoreContext";
import APP_CONFIG from "../config/constants";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import LoadingScreen from "./LoadingScreen";
import FallbackScreen from "./FallbackScreen";
import ImageViewer from "../utils/ImageViewer";
import { AuthContext } from "../contexts/AuthContext";

const SavingsContactDetails = ({ onComplete }) => {
  const { loginRole, adminUser } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const planDetails = location.state;

  const iframeTimeoutRef = useRef(null);

  const storeId = APP_CONFIG.STORE_ID;
  // const branch = adminUser.branch;
  const branch = APP_CONFIG.BRANCH;
  const { storeAssets, setAllPlan } = useContext(StoreContext);
  const termsUrl = storeAssets?.storeinfo?.[0]?.terms;
  // console.log(planDetails);

  // 🔧 Toggle the PAN & Aadhaar ID fields on/off.
  //   true  -> show PAN + Aadhaar inputs (for stores/users that need ID proof)
  //   false -> hide them completely (they just won't render or be required)
  const SHOW_ID_FIELDS = true;

  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  // Terms & Conditions: images / text / fallback (mirrors PlanCard "Know More")
  const [termsImageOpen, setTermsImageOpen] = useState(false);
  const [termsImages, setTermsImages] = useState([]);
  const [showDescDialog, setShowDescDialog] = useState(false);
  const [fetchingAddress, setFetchingAddress] = useState(false);

  const [isDisable, setIsDisable] = useState(false);
  const [agreement, setAgreement] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [amountSnackbar, setAmountSnackbar] = useState({
    open: false,
    message: "",
  });
  // Installment amount state
  const [installmentAmount, setInstallmentAmount] = useState(
    planDetails?.AMOUNT || 0,
  );
  const [showFixedConfirmDialog, setShowFixedConfirmDialog] = useState(false);
  // After the state declarations
  useEffect(() => {
    if (planDetails && installmentAmount === 0) {
      setInstallmentAmount(planDetails.AMOUNT);
    }
  }, [planDetails]);
  // Derived flags from planDetails
  const isFixed =
    planDetails?.is_fixed === "1" || planDetails?.is_fixed === true;
  const isFlexible = planDetails?.isflexible === "Y";

  const admin = adminUser;
  const role = loginRole;

  useEffect(() => {
    if (!location.state) {
      navigate("/select-plan");
    }
  }, [location.state]);
  // Set admin values into contact details when admin is available
  useEffect(() => {
    if (admin) {
      setSavingContactDetails((prev) => ({
        ...prev,
        mobile: (role === "user" && admin.mobile) || "",
        name: (role === "user" && admin.name) || "",
        address: (role === "user" && admin.address1) || "",
        pincode: (role === "user" && admin.pincode) || "",
        city: (role === "user" && admin.place) || "",
        email: (role === "user" && admin.email) || "",
        latitude: (role === "user" && admin.latitude) || "",
        longitude: (role === "user" && admin.longitude) || "",
      }));
    }
  }, []);

  // State for contact details
  const [savingContactDetails, setSavingContactDetails] = useState({
    name: "",
    panno: "",
    address: "",
    pincode: "",
    mobile: "",
    // city: "",
    // state: "",
    email: "",
    country: "India",
    nominee: "",
    nomineeRelationship: "",
    nomineeMobileNumber: "",
    nomAdd1: "",
    nomAdd2: "",
    nomPhone: "",
    dob: "",
    bankName: "",
    accHolderName: "",
    bankBranch: "",
    ifsc: "",
    accountNumber: "",
    latitude: "",
    longitude: "",
    aadhaar: "",
  });

  // Agent-only optional sections (collapsed by default)
  const [showNominee, setShowNominee] = useState(false);
  const [showBank, setShowBank] = useState(false);

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  // Form validation
  const validateForm = () => {
    const {
      name,
      address,
      pincode,
      // city,
      // state,
      country,
      nomineeMobileNumber,
      panno,
      mobile,
    } = savingContactDetails;

    if (
      !name ||
      !mobile ||
      !address ||
      !pincode ||
      // !city ||
      // !state ||
      !country
    ) {
      setSnackbar({
        open: true,
        message: "Please fill the required * fields.",
        severity: "warning",
      });
      setIsDisable(false);

      return false;
    }
    if (address.trim().length > 450) {
      setSnackbar({
        open: true,
        message:
          "Address max limit exceeded. Please enter within 450 characters.",
        severity: "error",
      });
      setIsDisable(false);
      return false;
    }
    if (!/^\d{6}$/.test(pincode.trim())) {
      setSnackbar({
        open: true,
        message: "Pincode must be exactly 6 digits.",
        severity: "error",
      });
      setIsDisable(false);

      return false;
    }

    if (mobile.trim() && !/^\d{10}$/.test(mobile.trim())) {
      setSnackbar({
        open: true,
        message: "Mobile number must be exactly 10 digits.",
        severity: "error",
      });
      setIsDisable(false);

      return false;
    }

    if (
      nomineeMobileNumber.trim() &&
      !/^\d{10}$/.test(nomineeMobileNumber.trim())
    ) {
      setSnackbar({
        open: true,
        message: "Mobile number must be exactly 10 digits.",
        severity: "error",
      });
      setIsDisable(false);

      return false;
    }

    // Optional: PAN validation (uncomment if needed)
    if (panno && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panno.toUpperCase())) {
      setSnackbar({
        open: true,
        message: "Invalid PAN number format.",
        severity: "error",
      });
      setIsDisable(false);

      return false;
    }
    if (
      savingContactDetails.aadhaar &&
      !/^\d{12}$/.test(savingContactDetails.aadhaar)
    ) {
      setSnackbar({
        open: true,
        message: "Aadhaar number must be exactly 12 digits.",
        severity: "error",
      });
      setIsDisable(false);
      return false;
    }
    // Optional nominee phone
    if (
      savingContactDetails.nomPhone.trim() &&
      !/^\d{10}$/.test(savingContactDetails.nomPhone.trim())
    ) {
      setSnackbar({
        open: true,
        message: "Nominee phone must be exactly 10 digits.",
        severity: "error",
      });
      setIsDisable(false);
      return false;
    }
    // Optional IFSC code
    if (
      savingContactDetails.ifsc.trim() &&
      !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(savingContactDetails.ifsc.trim())
    ) {
      setSnackbar({
        open: true,
        message: "Invalid IFSC code format.",
        severity: "error",
      });
      setIsDisable(false);
      return false;
    }
    return true;
  };

  // General handler for inputs
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (
      [
        "mobileNumber",
        "pincode",
        "aadhaar",
        "nomPhone",
        "accountNumber",
      ].includes(name)
    ) {
      const onlyDigits = value.replace(/\D/g, "");
      setSavingContactDetails((prev) => ({ ...prev, [name]: onlyDigits }));
      return;
    }

    if (name === "ifsc") {
      setSavingContactDetails((prev) => ({
        ...prev,
        ifsc: value.toUpperCase().replace(/\s/g, ""),
      }));
      return;
    }

    setSavingContactDetails((prev) => ({ ...prev, [name]: value }));
  };
  const isSubmitting = useRef(false); // ← add this

  // Submit handler
  //   const handleSubmit = async (e) => {
  //     e.preventDefault();
  //     let navigating = false;
  //   //    if (isSubmitting.current) return; // ← block immediately, synchronously
  //   // isSubmitting.current = true;
  //     setIsDisable(true);
  //     // Step 1: Validation
  //     if (!agreement) {
  //       setSnackbar({
  //         open: true,
  //         message: "Please accept the Terms & Conditions and Privacy Policy.",
  //         severity: "warning",
  //       });
  //       setIsDisable(false);
  //       return;
  //     }
  // // If amount NOT changed AND scheme is NOT flexible AND input is NOT disabled → show confirmation
  //   if (!amountChanged && !isFlexible && !isFixed) {
  //     setShowFixedConfirmDialog(true);
  //     setIsDisable(false);
  //     return;
  //   }
  //     if (!validateForm()) return;

  //     // Step 2: Prepare Payload
  //     const payload = {
  //       mgroup: planDetails.code,
  //       member_no: "1",
  //       name: savingContactDetails.name,
  //       address1: savingContactDetails.address,
  //       place: "",
  //       mobile: savingContactDetails.mobile,
  //       scheme_amount: installmentAmount,
  //       storeID: storeId,
  //       branch: branch,
  //       pincode: savingContactDetails.pincode,
  //       email: savingContactDetails.email,
  //       latitude: savingContactDetails.latitude,
  //       longitude: savingContactDetails.longitude,
  //       accuracy: 1017.6081455522805,
  //       goldconvyn: "0",
  //       panno: savingContactDetails.panno,
  //       nom_name: savingContactDetails.nominee,
  //       nom_mobile: savingContactDetails.nomineeMobileNumber,
  //       nom_relation: savingContactDetails.nomineeRelationship,
  //        aadhaar: savingContactDetails.aadhaar,
  //     };

  //     try {
  //       // Step 3: Enroll in the scheme
  //       const enrollUrl = `${process.env.REACT_APP_API_BASE_URL}/api/core/join-scheme`;

  //       const response = await axios.post(enrollUrl, payload);

  //       const { member_id, mgroup } = response.data;
  //       // Step 4: Fetch enrolled plans
  //       const planFetchUrl = `${process.env.REACT_APP_API_BASE_URL}/api/core/member-with-group?idAndGroup=${savingContactDetails.mobile}&storeID=${storeId}&branch=${branch}`;

  //       const { data: enrolledPlans } = await axios.get(planFetchUrl);
  //       // ✅ One API call, update context immediately
  //       setAllPlan(enrolledPlans);

  //       const currentPlan = enrolledPlans.find(
  //         (plan) => plan.member_id === member_id && plan.mgroup === mgroup
  //       );

  //       if (currentPlan) {
  //         setSnackbar({
  //           open: true,
  //           message: "Enrollment successful. Proceeding to payment...",
  //           severity: "success",
  //         });

  //         const userInfo = {
  //           name: currentPlan.name,
  //           email: currentPlan.email,
  //           address1: currentPlan.address1,
  //           address2: currentPlan.address2,
  //           mobile: currentPlan.mobile,
  //         };
  //         // setIsDisable(false);
  //         navigating = true;
  //         setTimeout(() => {
  //           onComplete();
  //           navigate("/select-plan/paymentandledger", {
  //             state: {
  //               data: currentPlan,
  //               userInfo,
  //             },
  //           });
  //         }, 1500);

  //       } else {
  //         setSnackbar({
  //           open: true,
  //           message: "Plan enrolled but unable to retrieve its details.",
  //           severity: "info",
  //         });
  //       }
  //     } catch (error) {
  //       setIsDisable(false);
  //       const status = error?.response?.status;

  //       setSnackbar({
  //         open: true,
  //         message:
  //           status === 409
  //             ? "You have already joined this plan. Please check your active plans."
  //             : "Something went wrong. Please try again.",
  //         severity: status === 409 ? "warning" : "error",
  //       });
  //     } finally {
  //      if (!navigating) {
  //     // isSubmitting.current = false;
  //     setIsDisable(false);
  //   }
  //   }
  //   };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsDisable(true);

    // Validation for terms and form
    if (!agreement) {
      setSnackbar({
        open: true,
        message: "Please accept the Terms & Conditions and Privacy Policy.",
        severity: "warning",
      });
      setIsDisable(false);
      return;
    }
    if (!validateForm()) {
      setIsDisable(false);
      return;
    }
    const amount = Number(installmentAmount);

    if (!installmentAmount || isNaN(amount)) {
      setAmountSnackbar({
        open: true,
        message: `Please enter an amount between ₹${Number(
          planDetails.min_instal_amt,
        ).toLocaleString("en-IN")} and ₹${Number(
          planDetails.max_instal_amt,
        ).toLocaleString("en-IN")}`,
      });
      setIsDisable(false);
      return;
    }

    if (amount < Number(planDetails.min_instal_amt)) {
      setAmountSnackbar({
        open: true,
        message: `Minimum installment amount is ₹${Number(
          planDetails.min_instal_amt,
        ).toLocaleString("en-IN")}`,
      });
      setIsDisable(false);
      return;
    }

    if (amount > Number(planDetails.max_instal_amt)) {
      setAmountSnackbar({
        open: true,
        message: `Maximum installment amount is ₹${Number(
          planDetails.max_instal_amt,
        ).toLocaleString("en-IN")}`,
      });
      setIsDisable(false);
      return;
    }
    const defaultAmount = Number(planDetails.AMOUNT);
    const amountChanged = Number(installmentAmount) !== defaultAmount;
    // If amount NOT changed AND scheme is NOT flexible AND input is NOT disabled → show confirmation
    if (!amountChanged && !isFlexible && !isFixed) {
      setShowFixedConfirmDialog(true);
      setIsDisable(false);
      return;
    }
    // If amount changed OR scheme is flexible OR input is disabled (fixed by scheme) → go directly

    // proceed with API call using installmentAmount
    await callJoinApi(Number(installmentAmount));
    // setIsDisable(false);
    return;
  };

  const callJoinApi = async (finalAmount) => {
    let navigating = false;
    const payload = {
      mgroup: planDetails.code,
      member_no: "1",
      name: savingContactDetails.name,
      address1: savingContactDetails.address,
      place: "",
      mobile: savingContactDetails.mobile,
      scheme_amount: finalAmount, // ← use the passed amount
      storeID: storeId,
      branch: planDetails?.branch,
      pincode: savingContactDetails.pincode,
      email: savingContactDetails.email,
      latitude: savingContactDetails.latitude,
      longitude: savingContactDetails.longitude,
      accuracy: 1017.6081455522805,
      goldconvyn: "0",
      panno: savingContactDetails.panno,
      dob: savingContactDetails.dob || null,
      nom_name: savingContactDetails.nominee,
      nom_mobile: savingContactDetails.nomineeMobileNumber,
      nom_relation: savingContactDetails.nomineeRelationship,
      nom_add1: savingContactDetails.nomAdd1,
      nom_add2: savingContactDetails.nomAdd2,
      nom_phone: savingContactDetails.nomPhone,
      aadhaar: savingContactDetails.aadhaar,
      // Bank details (optional, agent flow)
      bank_name: savingContactDetails.bankName,
      acc_holder_name: savingContactDetails.accHolderName,
      bank_branch: savingContactDetails.bankBranch,
      ifsc_code: savingContactDetails.ifsc,
      account_number: savingContactDetails.accountNumber,
    };

    try {
      const enrollUrl = `${process.env.REACT_APP_API_BASE_URL}/api/core/join-scheme`;
      const response = await axios.post(enrollUrl, payload);
      const { member_id, mgroup } = response.data;

      // const planFetchUrl = `${process.env.REACT_APP_API_BASE_URL}/api/core/member-with-group?idAndGroup=${savingContactDetails.mobile}&storeID=${storeId}&branch=${branch}`;
      const planFetchUrl = `${process.env.REACT_APP_API_BASE_URL}/api/core/member-with-group?idAndGroup=${savingContactDetails.mobile}&storeID=${storeId}`;
      const { data: enrolledPlans } = await axios.get(planFetchUrl);
      setAllPlan(enrolledPlans);

      const currentPlan = enrolledPlans.find(
        (plan) => plan.member_id === member_id && plan.mgroup === mgroup,
      );

      if (currentPlan) {
        navigating = true;
        setSnackbar({
          open: true,
          message: "Enrollment successful. Proceeding to payment...",
          severity: "success",
        });
        const userInfo = {
          name: currentPlan.name,
          email: currentPlan.email,
          address1: currentPlan.address1,
          address2: currentPlan.address2,
          mobile: currentPlan.mobile,
        };
        setTimeout(() => {
          onComplete();
          navigate("/select-plan/paymentandledger", {
            state: { data: currentPlan, userInfo },
          });
        }, 1500);
      } else {
        setSnackbar({
          open: true,
          message: "Plan enrolled but unable to retrieve its details.",
          severity: "info",
        });
      }
    } catch (error) {
      const status = error?.response?.status;
      setSnackbar({
        open: true,
        message:
          status === 409
            ? "You have already joined this plan. Please check your active plans."
            : "Something went wrong. Please try again.",
        severity: status === 409 ? "warning" : "error",
      });
    } finally {
      if (!navigating) {
        setIsDisable(false);
      }
    }
  };

  // Geo location
  const handleLocateMe = async () => {
    try {
      const permission = await Geolocation.requestPermissions();

      if (permission.location !== "granted") {
        throw new Error("Location permission not granted");
      }

      setFetchingAddress(true);

      const coords = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = coords.coords;

      const res = await axios.get(
        "https://nominatim.openstreetmap.org/reverse",
        {
          params: {
            format: "json",
            lat: latitude,
            lon: longitude,
          },
        },
      );

      const address = res.data.address;

      setSavingContactDetails((prev) => ({
        ...prev,
        address: address.road || "",
        city: address.city || address.town || address.village || "",
        state: address.state || "",
        pincode: address.postcode || "",
        country: address.country || "",
      }));

      setFetchingAddress(false);
    } catch (error) {
      setFetchingAddress(false);
      console.error("Geolocation error:", error);
      setSnackbar({
        open: true,
        message: "Location permission denied or unavailable.",
        severity: "error",
      });
    }
  };

  const handleInputFocus = (e) => {
    setTimeout(() => {
      e.target.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 300);
  };

  // Parse this plan's detail_images (JSON string or already an array), same as PlanCard
  const getTermsImages = () => {
    const raw = planDetails?.detail_images;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  };

  // Terms & Conditions link — three cases (mirrors "Know More" on the plan card):
  //   1) plan has images -> show them in the ImageViewer
  //   2) else plan has description text -> show the text dialog
  //   3) else -> open the existing TermsPage (unchanged fallback)
  const handleTermsClick = () => {
    const imgs = getTermsImages();
    if (imgs.length > 0) {
      setTermsImages(imgs);
      setTermsImageOpen(true);
    } else if ((planDetails?.description || "").trim()) {
      setShowDescDialog(true);
    } else {
      setShowTerms(true);
    }
  };

  // Description lines for the text dialog (supports the "=>" separated format)
  const rawTermsDescription = planDetails?.description || "";
  const termsDescriptionLines = rawTermsDescription.includes("=>")
    ? rawTermsDescription
        .split("=>")
        .map((line) => line.trim())
        .filter(Boolean)
    : rawTermsDescription
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

  return (
    <>
      {admin && planDetails ? (
        <>
          {/* Main Container */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              backgroundColor: theme.palette.background.default,
              py: 2,
              mb: 5,
              mt: 1,
              // marginTop: "60px",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontSize: "16px",
                lineHeight: "18px",
                color: theme.colors.subHeading,
                fontWeight: 500,
                marginBottom: 5,
                textAlign: "center",
              }}
            >
              Contact Details
            </Typography>

            {/* Info Card */}
            <Box
              sx={{
                height: 105,
                minWidth: 312,
                bgcolor: theme.theme2.secondaryBg,
                borderRadius: "10px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignContent: "center",
                marginBottom: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 57,
                  height: 57,
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: "50%",
                  margin: "-32px auto 10px",
                  boxShadow: "0 0 4px rgba(0, 0, 0, 0.1)",
                }}
              >
                <img src={wallet} alt="" />
              </Box>
              <div
                style={{ position: "relative", bottom: 5, textAlign: "center" }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: theme.savingContactDetails.primaryTextCol,
                  }}
                >
                  Namaste {role === "agent" ? admin?.agent_name : admin.name}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: theme.savingContactDetails.secondaryTextCol,
                  }}
                >
                  +91 {role === "agent" ? admin?.agent_mobile : admin?.mobile}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 12,
                    color: theme.savingContactDetails.secondaryTextCol,
                  }}
                >
                  {role === "agent" ? admin?.agent_email : admin?.email}
                </Typography>
              </div>
            </Box>

            {/* FORM */}
            <Box
              component="form"
              noValidate
              onSubmit={handleSubmit}
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {/* Installment Amount Section */}
              <Box sx={{ mb: 1, p: 1.5, bgcolor: "#f9f9f9", borderRadius: 3 }}>
                {/* 🔷 Heading */}
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    color: theme.colors.subHeading,
                    mb: 1,
                    fontSize: "14px",
                  }}
                >
                  Saving Plan Info
                </Typography>

                {/* 🔷 Scheme Name (if exists) */}
                {planDetails.scheme_name && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      color: "#444",
                      mb: 0.5,
                      fontWeight: 500,
                    }}
                  >
                    Scheme: <strong>{planDetails.scheme_name}</strong>
                  </Typography>
                )}

                {/* 🔷 Group Code */}
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "#666",
                    mb: 1.5,
                  }}
                >
                  Group : <strong>{planDetails.code}</strong>
                </Typography>

                {/* 🔷 Amount Input */}
                <TextField
                  label="Installment Amount (₹)"
                  name="installmentAmount"
                  fullWidth
                  type="number"
                  value={installmentAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    setInstallmentAmount(value);

                    const min = Number(planDetails.min_instal_amt);
                    const max = Number(planDetails.max_instal_amt);
                    const amount = Number(value);

                    if (value === "") return;

                    if (amount < min) {
                      setAmountSnackbar({
                        open: true,
                        message: `Minimum installment amount is ₹${min.toLocaleString(
                          "en-IN",
                        )}`,
                      });
                    } else if (amount > max) {
                      setAmountSnackbar({
                        open: true,
                        message: `Maximum installment amount is ₹${max.toLocaleString(
                          "en-IN",
                        )}`,
                      });
                    }
                  }}
                  disabled={isFixed}
                  InputProps={{
                    sx: { borderRadius: 2.5, backgroundColor: "#fff" },
                    inputProps: {
                      min: planDetails.min_instal_amt,
                      max: planDetails.max_instal_amt,
                    },
                  }}
                  InputLabelProps={{
                    sx: { color: theme.colors.subHeading },
                  }}
                  helperText={
                    !isFixed &&
                    `Min: ₹${planDetails.min_instal_amt} | Max: ₹${planDetails.max_instal_amt}`
                  }
                />

                {/* 🔷 Info Messages */}
                {!isFlexible && !isFixed && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 1,
                      color: theme.colors.primaryButton,
                    }}
                  >
                    This amount becomes fixed for the entire scheme duration.
                  </Typography>
                )}

                {isFixed && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mt: 1,
                      color: "#d32f2f",
                    }}
                  >
                    🔒 Amount is fixed by the scheme and cannot be changed.
                  </Typography>
                )}
              </Box>
              <Typography
                variant="body1"
                sx={{ fontWeight: 500, color: theme.colors.subHeading, mb: 2 }}
              >
                Please share your details.
              </Typography>
              <TextField
                label="Please enter your full name."
                name="name"
                fullWidth
                required
                value={savingContactDetails.name}
                onChange={handleChange}
                onFocus={handleInputFocus}
                InputLabelProps={{ sx: { color: theme.colors.subHeading } }}
                InputProps={{
                  sx: { borderRadius: 2.5, backgroundColor: "#fff" },
                }}
              />
              {role === "agent" && (
                <TextField
                  label="Enter Mobile Number"
                  name="mobile"
                  required
                  fullWidth
                  type="tel"
                  value={savingContactDetails.mobile}
                  onChange={handleChange}
                  onFocus={handleInputFocus}
                  inputProps={{
                    maxLength: 10,
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                  }}
                  InputLabelProps={{ sx: { color: theme.colors.subHeading } }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <img
                            src={indianFlag}
                            alt="flag"
                            style={{ height: 15 }}
                          />
                          <Typography sx={{ fontSize: 14, color: "#000" }}>
                            +91
                          </Typography>
                        </Box>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 2.5, backgroundColor: "#fff" },
                  }}
                />
              )}

              <TextField
                label="Address"
                name="address"
                required
                fullWidth
                multiline
                minRows={3}
                value={savingContactDetails.address}
                onChange={handleChange}
                onFocus={handleInputFocus}
                inputProps={{ maxLength: 450 }}
                InputLabelProps={{ sx: { color: theme.colors.subHeading } }}
                InputProps={{
                  sx: { borderRadius: 2.5, backgroundColor: "#fff" },
                }}
                helperText={`${savingContactDetails.address.length}/450`}
                FormHelperTextProps={{
                  sx: {
                    textAlign: "right",
                    color:
                      savingContactDetails.address.length > 450
                        ? "red"
                        : "inherit",
                  },
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2.3,
                  justifyContent: "space-between",
                }}
              >
                <Grid container spacing={2}>
                  {["pincode", "country"].map((name) => (
                    <Grid item xs={6} sm={6} key={name}>
                      <TextField
                        label={name.charAt(0).toUpperCase() + name.slice(1)}
                        name={name}
                        required
                        fullWidth
                        value={savingContactDetails[name]}
                        onChange={handleChange}
                        onFocus={handleInputFocus}
                        inputProps={
                          name === "pincode" ? { maxLength: 6 } : undefined
                        }
                        InputLabelProps={{
                          sx: { color: theme.colors.subHeading },
                        }}
                        InputProps={{
                          sx: { borderRadius: 2.5, backgroundColor: "#fff" },
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* PAN + Aadhaar — shown only when SHOW_ID_FIELDS is true */}
              {SHOW_ID_FIELDS && (
                <>
                  <TextField
                    label="Please enter your PAN Card number"
                    name="panno"
                    fullWidth
                    value={(savingContactDetails.panno || "").toUpperCase()}
                    onChange={handleChange}
                    onFocus={handleInputFocus}
                    inputProps={{ maxLength: 10 }}
                    InputLabelProps={{ sx: { color: theme.colors.subHeading } }}
                    InputProps={{
                      sx: { borderRadius: 2.5, backgroundColor: "#fff" },
                    }}
                  />

                  <TextField
                    label="Please enter your AADHAAR Card number"
                    name="aadhaar"
                    fullWidth
                    value={savingContactDetails.aadhaar}
                    onChange={handleChange}
                    onFocus={handleInputFocus}
                    inputProps={{
                      maxLength: 12,
                      inputMode: "numeric",
                      pattern: "[0-9]*",
                    }}
                    InputLabelProps={{ sx: { color: theme.colors.subHeading } }}
                    InputProps={{
                      sx: { borderRadius: 2.5, backgroundColor: "#fff" },
                    }}
                  />
                </>
              )}

              {/* ─── Agent-only optional sections: DOB, Nominee, Bank ─── */}
              {role === "agent" && (
                <>
                  <TextField
                    label="Date of Birth"
                    name="dob"
                    type="date"
                    fullWidth
                    value={savingContactDetails.dob}
                    onChange={handleChange}
                    onFocus={handleInputFocus}
                    InputLabelProps={{
                      shrink: true,
                      sx: { color: theme.colors.subHeading },
                    }}
                    InputProps={{
                      sx: { borderRadius: 2.5, backgroundColor: "#fff" },
                    }}
                  />

                  {/* Nominee (collapsible) */}
                  <Box
                    sx={{
                      border: "1px solid #e0e0e0",
                      borderRadius: 2.5,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      onClick={() => setShowNominee((v) => !v)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 1.5,
                        py: 1.3,
                        cursor: "pointer",
                        backgroundColor: "#f9f9f9",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: theme.colors.subHeading,
                        }}
                      >
                        Nominee Details (optional)
                      </Typography>
                      {showNominee ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </Box>
                    <Collapse in={showNominee} timeout={400} unmountOnExit>
                      <Box
                        sx={{
                          p: 1.5,
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        <TextField
                          label="Nominee Name"
                          name="nominee"
                          fullWidth
                          value={savingContactDetails.nominee}
                          onChange={handleChange}
                          onFocus={handleInputFocus}
                          InputLabelProps={{
                            sx: { color: theme.colors.subHeading },
                          }}
                          InputProps={{
                            sx: { borderRadius: 2.5, backgroundColor: "#fff" },
                          }}
                        />
                        <TextField
                          label="Relationship"
                          name="nomineeRelationship"
                          fullWidth
                          value={savingContactDetails.nomineeRelationship}
                          onChange={handleChange}
                          onFocus={handleInputFocus}
                          InputLabelProps={{
                            sx: { color: theme.colors.subHeading },
                          }}
                          InputProps={{
                            sx: { borderRadius: 2.5, backgroundColor: "#fff" },
                          }}
                        />
                        <TextField
                          label="Nominee Mobile Number"
                          name="nomineeMobileNumber"
                          fullWidth
                          type="tel"
                          value={savingContactDetails.nomineeMobileNumber}
                          onChange={handleChange}
                          onFocus={handleInputFocus}
                          inputProps={{
                            maxLength: 10,
                            inputMode: "numeric",
                            pattern: "[0-9]*",
                          }}
                          InputLabelProps={{
                            sx: { color: theme.colors.subHeading },
                          }}
                          InputProps={{
                            sx: { borderRadius: 2.5, backgroundColor: "#fff" },
                          }}
                        />

                        <TextField
                          label="Nominee Address Line 1"
                          name="nomAdd1"
                          fullWidth
                          value={savingContactDetails.nomAdd1}
                          onChange={handleChange}
                          onFocus={handleInputFocus}
                          inputProps={{ maxLength: 50 }}
                          InputLabelProps={{
                            sx: { color: theme.colors.subHeading },
                          }}
                          InputProps={{
                            sx: { borderRadius: 2.5, backgroundColor: "#fff" },
                          }}
                        />
                        <TextField
                          label="Nominee Address Line 2"
                          name="nomAdd2"
                          fullWidth
                          value={savingContactDetails.nomAdd2}
                          onChange={handleChange}
                          onFocus={handleInputFocus}
                          inputProps={{ maxLength: 50 }}
                          InputLabelProps={{
                            sx: { color: theme.colors.subHeading },
                          }}
                          InputProps={{
                            sx: { borderRadius: 2.5, backgroundColor: "#fff" },
                          }}
                        />
                      </Box>
                    </Collapse>
                  </Box>

                  {/* Bank Details (collapsible) */}
                  <Box
                    sx={{
                      border: "1px solid #e0e0e0",
                      borderRadius: 2.5,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      onClick={() => setShowBank((v) => !v)}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 1.5,
                        py: 1.3,
                        cursor: "pointer",
                        backgroundColor: "#f9f9f9",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: theme.colors.subHeading,
                        }}
                      >
                        Bank Details (optional)
                      </Typography>
                      {showBank ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </Box>
                    <Collapse in={showBank} timeout={400} unmountOnExit>
                      <Box
                        sx={{
                          p: 1.5,
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                        }}
                      >
                        <TextField
                          label="Bank Name"
                          name="bankName"
                          fullWidth
                          value={savingContactDetails.bankName}
                          onChange={handleChange}
                          onFocus={handleInputFocus}
                          inputProps={{ maxLength: 100 }}
                          InputLabelProps={{
                            sx: { color: theme.colors.subHeading },
                          }}
                          InputProps={{
                            sx: { borderRadius: 2.5, backgroundColor: "#fff" },
                          }}
                        />
                        <TextField
                          label="Account Holder Name"
                          name="accHolderName"
                          fullWidth
                          value={savingContactDetails.accHolderName}
                          onChange={handleChange}
                          onFocus={handleInputFocus}
                          inputProps={{ maxLength: 100 }}
                          InputLabelProps={{
                            sx: { color: theme.colors.subHeading },
                          }}
                          InputProps={{
                            sx: { borderRadius: 2.5, backgroundColor: "#fff" },
                          }}
                        />
                        <TextField
                          label="Branch"
                          name="bankBranch"
                          fullWidth
                          value={savingContactDetails.bankBranch}
                          onChange={handleChange}
                          onFocus={handleInputFocus}
                          inputProps={{ maxLength: 100 }}
                          InputLabelProps={{
                            sx: { color: theme.colors.subHeading },
                          }}
                          InputProps={{
                            sx: { borderRadius: 2.5, backgroundColor: "#fff" },
                          }}
                        />
                        <TextField
                          label="IFSC Code"
                          name="ifsc"
                          fullWidth
                          value={savingContactDetails.ifsc}
                          onChange={handleChange}
                          onFocus={handleInputFocus}
                          inputProps={{ maxLength: 11 }}
                          InputLabelProps={{
                            sx: { color: theme.colors.subHeading },
                          }}
                          InputProps={{
                            sx: { borderRadius: 2.5, backgroundColor: "#fff" },
                          }}
                        />
                        <TextField
                          label="Account Number"
                          name="accountNumber"
                          fullWidth
                          type="tel"
                          value={savingContactDetails.accountNumber}
                          onChange={handleChange}
                          onFocus={handleInputFocus}
                          inputProps={{
                            maxLength: 20,
                            inputMode: "numeric",
                            pattern: "[0-9]*",
                          }}
                          InputLabelProps={{
                            sx: { color: theme.colors.subHeading },
                          }}
                          InputProps={{
                            sx: { borderRadius: 2.5, backgroundColor: "#fff" },
                          }}
                        />
                      </Box>
                    </Collapse>
                  </Box>
                </>
              )}

              <FormControl required sx={{ mt: 1 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                  <input
                    type="checkbox"
                    checked={agreement}
                    onChange={(e) => setAgreement(e.target.checked)}
                    required
                    style={{ marginTop: 2, marginRight: 8 }}
                  />
                  <Typography
                    sx={{ fontSize: 12, color: theme.colors.subHeading }}
                  >
                    I agree to the{" "}
                    <u
                      onClick={handleTermsClick}
                      style={{ color: theme.colors.primaryButton }}
                    >
                      Terms & Conditions
                    </u>{" "}
                    and{" "}
                    <u
                      onClick={() => setShowPrivacy(true)}
                      style={{ color: theme.colors.primaryButton }}
                    >
                      Privacy Policy
                    </u>
                  </Typography>
                </Box>
              </FormControl>

              <Button
                variant="contained"
                type="submit"
                disabled={!agreement || isDisable}
                sx={{
                  mt: 2,
                  borderRadius: 2.5,
                  backgroundColor: theme.colors.primaryButton,
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "16px",
                  textTransform: "none",
                  width: "100%",
                  height: 46,
                }}
              >
                {isDisable ? (
                  <CircularProgress size={22} sx={{ color: "#fff" }} />
                ) : (
                  "Next"
                )}
              </Button>
            </Box>
            <Snackbar
              open={amountSnackbar.open}
              autoHideDuration={3000}
              onClose={() => setAmountSnackbar({ open: false, message: "" })}
              anchorOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
              sx={{
                top: "120px !important",
              }}
            >
              <Box
                sx={{
                  backgroundColor: "#9a6316",
                  color: "#fff",
                  borderRadius: "10px",
                  px: 3,
                  py: 1.2,
                  fontSize: "13px",
                  fontWeight: 600,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
                  textAlign: "center",
                }}
              >
                {/* <span style={{ fontSize: "18px" }}>⚠️</span> */}
                <span>{amountSnackbar.message}</span>
              </Box>
            </Snackbar>
            {/* Snackbar for feedback */}
            <Snackbar
              open={snackbar.open}
              autoHideDuration={4000}
              onClose={handleSnackbarClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
              sx={{ bottom: "72px !important" }} // Override default MUI style
            >
              <Alert
                onClose={handleSnackbarClose}
                severity={snackbar.severity}
                variant="filled"
                sx={{ width: "100%" }}
              >
                {snackbar.message}
              </Alert>
            </Snackbar>
          </Box>

          {/* Terms & Conditions — Case 1: plan images */}
          <ImageViewer
            open={termsImageOpen}
            onClose={() => setTermsImageOpen(false)}
            images={termsImages}
            title="Terms & Conditions"
          />

          {/* Terms & Conditions — Case 2: plan description text */}
          <Dialog
            open={showDescDialog}
            onClose={() => setShowDescDialog(false)}
            fullWidth
            maxWidth="sm"
            sx={{ zIndex: 10000 }}
            PaperProps={{ sx: { borderRadius: 3, mx: 2 } }}
          >
            <DialogContent sx={{ px: 2.5, py: 2.5 }}>
              <Typography
                sx={{ fontWeight: 700, fontSize: 16, color: "#111", mb: 1.5 }}
              >
                Terms & Conditions
              </Typography>
              {termsDescriptionLines.map((line, i) => (
                <Typography
                  key={i}
                  sx={{
                    fontSize: 13,
                    mb: 0.8,
                    color: theme.colors.subHeading,
                    lineHeight: 1.6,
                  }}
                >
                  {line}
                </Typography>
              ))}
            </DialogContent>
            <DialogActions sx={{ px: 2.5, pb: 2 }}>
              <Button
                onClick={() => setShowDescDialog(false)}
                variant="contained"
                fullWidth
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  backgroundColor: theme.colors.primaryButton,
                }}
              >
                Close
              </Button>
            </DialogActions>
          </Dialog>

          {/* Terms & Conditions — Case 3: fallback (unchanged) */}
          <TermsPage open={showTerms} onClose={() => setShowTerms(false)} />
          <PrivacyPolicyPage
            open={showPrivacy}
            onClose={() => setShowPrivacy(false)}
          />
        </>
      ) : !admin ? (
        <FallbackScreen open={true} message={"Log in to enroll in a plan :("} />
      ) : (
        <LoadingScreen />
      )}

      {/* Fixed Amount Confirmation Dialog */}
      <Dialog
        open={showFixedConfirmDialog}
        onClose={() => setShowFixedConfirmDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: "20px",
            background: "rgba(255, 255, 255, 0.72)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
            width: "88%",
            maxWidth: 340,
            mx: "auto",
          },
        }}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0,0,0,0.2)",
              backdropFilter: "blur(4px)",
            },
          },
        }}
      >
        <DialogContent sx={{ pt: 2.5, pb: 1, px: 2.5, textAlign: "center" }}>
          <Typography
            sx={{ fontWeight: 700, fontSize: 15, color: "#111", mb: 0.6 }}
          >
            Confirm Installment Amount
          </Typography>
          <Typography
            sx={{ fontSize: 13, color: "#4b5563", lineHeight: 1.5, mb: 2 }}
          >
            You have chosen the default amount of{" "}
            <strong>₹{planDetails.AMOUNT.toLocaleString("en-IN")}</strong>.
            <br />
            <span
              style={{ color: theme.colors.primaryButton, fontWeight: 700 }}
            >
              This becomes your fixed amount till scheme completion.
            </span>
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{ px: 2, pt: 1, pb: 2, flexDirection: "column", gap: 1 }}
        >
          <Button
            fullWidth
            variant="contained"
            onClick={async () => {
              setShowFixedConfirmDialog(false);
              setIsDisable(true);
              await callJoinApi(planDetails.AMOUNT);
              // setIsDisable(false);
            }}
            sx={{
              height: 42,
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: 13,
              textTransform: "none",
              backgroundColor: theme.colors.primaryButton,
            }}
          >
            Yes, Proceed
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setShowFixedConfirmDialog(false)}
            sx={{
              height: 38,
              borderRadius: "12px",
              textTransform: "none",
              fontSize: 12,
              fontWeight: 600,
              color: "#6b7280",
              borderColor: "rgba(0,0,0,0.1)",
            }}
          >
            Edit Amount
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SavingsContactDetails;
