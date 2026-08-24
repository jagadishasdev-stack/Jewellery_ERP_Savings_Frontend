import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Geolocation } from "@capacitor/geolocation";
import { Browser } from "@capacitor/browser";
import { App } from "@capacitor/app";
import { InAppBrowser } from "@awesome-cordova-plugins/in-app-browser";
import { Capacitor } from "@capacitor/core";
import MyRazorpay from "../plugins/my-razorpay";
import { socket } from "../utils/socket";
// import { Capacitor } from '@capacitor/core';

import { PhonePePaymentPlugin } from "ionic-capacitor-phonepe-pg";
import "./PhonePePayment.css";
import useRazorpayPayment from "./RazorpayPayment"; // adjust path
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { usePaymentGateway } from "../contexts/PaymentGatewayProvider";
// import { RazorpayNative } from "../plugins/razorpayNative";
// import { InAppBrowser } from '@ionic-native/in-app-browser';
import {
  NativeGeocoder,
  NativeGeocoderResult,
  NativeGeocoderOptions,
} from "@ionic-native/native-geocoder";

import APP_CONFIG from "../config/constants";
// Assuming these providers are available as React context or custom hooks
// import { useWebClient } from '../../providers/web-client/web-client';
// import { useData } from '../../providers/data/data';
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import { Box, CircularProgress, Typography } from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
const SchemeDetailPage = () => {
  const location = useLocation();

  const goldCon = location?.state?.goldCon;
  const refNumber = location?.state?.refNumber || "";
  const additionalPlanDetails = location?.state?.additionalPlanDetails;
  const useBranch = additionalPlanDetails.branch;
  // const { initiatePayment } = useRazorpayPayment();
  const { initiatePayment: startRazorpayPayment, loading: razorpayLoading } =
    useRazorpayPayment();
  // console.log("gold conversion from payment screen : ", goldCon);
  const { memberCode, groupCode, payableAmount, selectedOption } = useParams();
  const navigate = useNavigate();
  const paymentInProgress = useRef(false);
  // Providers/hooks equivalent
  // const apiClient = useWebClient();
  const { adminUser, loginRole } = useContext(AuthContext);
  const { gateway, phonePeReady } = usePaymentGateway();
  const adminUserRaw = adminUser;
  // const [phonePeVerifying, setPhonePeVerifying] = useState(false);
  const [phonePeVerifying, setPhonePeVerifying] = useState(false);
  const phonePeVerifyingRef = useRef(false); // ✅ ADD ONLY THIS LINE

  let agentId = 0;
  let agentName = "";

  if (adminUserRaw && loginRole === "agent") {
    try {
      const adminUser = adminUserRaw;
      agentId = adminUser.agent_id;
      agentName = adminUser.agent_name;
    } catch (err) {
      console.error("Error parsing adminUser:", err);
    }
  }

  // const [schemeData, setSchemeData] = useState({
  const [schemeData, setSchemeData] = useState({
    g_balance: 0,
    initial: "mr",
    mode: "6",
    PayInstall: 1,
    ldgrCurrBal: 0,
    ldgrPaidInstall: 0,
    chqNo: "",
    extracash: "0",
    cardchq: "0",
    chequedt: undefined,
    bank: "0",
  });

  let count = 0;

  const [pgateway, setPgateway] = useState({});
  const [banklist, setBanklist] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [Todaysdate, setTodaysdate] = useState(null);
  const [last_recpt_dt, setLastRecptDt] = useState(null);
  const [geo_address1, setGeoAddress1] = useState("");
  const [geo_address2, setGeoAddress2] = useState("");
  const [geo_place, setGeoPlace] = useState("");
  const [geoLatitude, setGeoLatitude] = useState(0);
  const [geoLongitude, setGeoLongitude] = useState(0);
  const [geoAccuracy, setGeoAccuracy] = useState(0);
  // const [instlcnt, setInstlcnt] = useState(0);
  const [is_Email_Valid, setIsEmailValid] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [isAuthorize, setIsAuthorize] = useState(false);
  const [viewMode, setViewMode] = useState("Pay");
  const [goldCollected, setGoldCollected] = useState(0);
  const [amountCollected, setAmountCollected] = useState(0);
  const [adjustedscheme, setAdjustedScheme] = useState(false);
  const [isflexigroup, setIsFlexiGroup] = useState(false);
  const [groupMemberNo, setGroupMemberNo] = useState("");
  const [installmentdetails, setInstallmentdetails] = useState("");
  const [store_email_for_pg, setStoreEmailForPg] = useState("");
  const [rz_pay_res_id, setRzPayResId] = useState(null);
  const [rz_pay_res_ordid, setRzPayResOrdid] = useState(null);
  const [rz_pay_res_signid, setRzPayResSignid] = useState(null);
  const [rozar_orderId, setRozarOrderId] = useState("");
  const [pageLoading, setPageLoading] = useState(true);

  const data = {
    razorpay_key_id: "rzp_test_1234567890", // replace with your actual key
    razorpay_std: "00",
    razorpay_key_secret: "yqdni1ugwd1e12",
    esypay_merchant_id: "isdnfih8112",
    esypay_version: "42",
    esypay_ChecksumKey: "fcdnaifcw2178y18rhdbqei",
    esypay_type: "eltn",
  };

  let paymentResult = "12345";

  const geoencoderOptions = {
    useLocale: true,
    maxResults: 5,
  };

  ///==============================================
  // cancel payment process if user go back or press back button or app will get closed
  //=============================================
  // const phonePeVerifyingRef = useRef(false);
  const showBackWarningRef = useRef(false);
  const setVerifying = (val) => {
    phonePeVerifyingRef.current = val;
    setPhonePeVerifying(val);
  };

  const [showBackWarning, setShowBackWarning] = useState(false);
  const setBackWarning = (val) => {
    showBackWarningRef.current = val;
    setShowBackWarning(val);
  };
  const isCancelled = useRef(false);
  // Load initial data
  useEffect(() => {
    isCancelled.current = false;
    const runSequentially = async () => {
      await loadInitialData(); // Step 1
      // await loadRazorpayScript();    // Step 2 (only runs after step 1)
    };

    runSequentially();

    return () => {
      // Cleanup if needed
      isCancelled.current = true;
      // console.log("🛑 Component cleanup - cancelling all processes");
    };
  }, []);

  // ✅ KEEP ONLY THIS
  // useEffect(() => {
  //   let backHandler = null;
  //   const setupBackHandler = async () => {
  //     if (Capacitor.getPlatform() !== 'android') return;
  //     backHandler = await App.addListener('backButton', () => {
  //       if (phonePeVerifyingRef.current) { // ✅ ref instead of state
  //         setShowBackWarning(true);
  //       } else {
  //         isCancelled.current = true;
  //       }
  //     });
  //   };
  //   setupBackHandler();
  //   return () => {
  //     if (backHandler) backHandler.remove();
  //   };
  // }, []); // ✅ empty array - no more dependency

  // useEffect(() => {
  //   if (Capacitor.getPlatform() !== 'ios') return;

  //   const handlePopState = () => {
  //     if (phonePeVerifyingRef.current) { // ✅ ref instead of state
  //       window.history.pushState(null, '', window.location.href);
  //       setShowBackWarning(true);
  //     }
  //   };

  //   window.history.pushState(null, '', window.location.href);
  //   window.addEventListener('popstate', handlePopState);

  //   return () => {
  //     window.removeEventListener('popstate', handlePopState);
  //   };
  // }, []); // ✅ empty array - no more dependency
  useEffect(() => {
    let backHandler = null;

    const setupBackHandler = async () => {
      if (Capacitor.getPlatform() !== "android") return;

      // ✅ Push a fake history entry so WebView back is blocked
      window.history.pushState({ blocked: true }, "", window.location.href);

      // ✅ Block WebView history back (swipe or system nav gesture)
      const handlePopState = (event) => {
        // console.log(
          // "🔙 PopState fired, verifying:",
          // phonePeVerifyingRef.current,
        // );
        if (phonePeVerifyingRef.current) {
          // Push again to keep blocking
          window.history.pushState({ blocked: true }, "", window.location.href);
          setShowBackWarning(true);
        }
      };

      window.addEventListener("popstate", handlePopState);

      // ✅ Hardware back button
      backHandler = await App.addListener("backButton", ({ canGoBack }) => {
        // console.log(
          // "🔙 Hardware back, verifying:",
          // phonePeVerifyingRef.current,
        // );
        if (phonePeVerifyingRef.current) {
          setShowBackWarning(true);
        } else {
          isCancelled.current = true;
          if (canGoBack) {
            window.history.back();
          } else {
            App.exitApp();
          }
        }
      });

      // Store popstate cleanup
      backHandler._popstate = handlePopState;
    };

    setupBackHandler();

    return () => {
      if (backHandler) {
        backHandler.remove();
        if (backHandler._popstate) {
          window.removeEventListener("popstate", backHandler._popstate);
        }
      }
    };
  }, []); // ✅ empty deps - refs handle latest value
  //==================================================================

  const loadInitialData = async () => {
    try {
      // apiClient.showLoader();

      // Fetch bank list
      // const bankRes = await apiClient.getBankList();
      setBanklist("bankRes");

      // Fetch payment gateway details
      // const pgResult = await apiClient.getPaymentGatewayDetails();
      let pgDetails;
      if (gateway) {
        // Use cached gateway
        pgDetails = gateway;
        // alert("Using cached payment gateway");
      } else {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/core/payment-gateway/${APP_CONFIG.STORE_ID}/${useBranch}`,
        );
        pgDetails = response.data;
      }
      setPgateway(pgDetails);
      // console.log("merchant data", pgateway);

      // Update data context with PG details
      pgateway.razorpay_merchant_id = pgDetails.merchant_id;
      pgateway.razorpay_merchant_name = pgDetails.merchant_name;
      pgateway.razorpay_key_id = pgDetails.key_id;
      pgateway.razorpay_key_secret = pgDetails.key_secret;
      pgateway.razorpay_url = pgDetails.url;
      pgateway.razorpay_posturl = pgDetails.posturl;
      pgateway.razorpay_callbackurl = pgDetails.callbackurl;
      pgateway.razorpay_std = pgDetails.standered;
      pgateway.razorpay_env = pgDetails.env_ment;
      setStoreEmailForPg(pgDetails.store_email);

      // Fetch scheme details
      //   const schemeResult = await apiClient.schemeDetail(memberCode);

      const schemeResult = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/core/member-with-group`,
        {
          params: {
            idAndGroup: `${groupCode}-${memberCode}`,
            storeID: APP_CONFIG.STORE_ID,
            branch: useBranch,
          },
        },
      );
      //  console.log("scheme payment gateway", schemeResult.data[0]);

      const schemeDatadetails = schemeResult.data[0];

      setSchemeData((prev) => ({
        ...prev,
        ...schemeDatadetails,
        g_balance: 0,
        initial: "mr",
        mode: loginRole !== "agent" ? "6" : "",
        PayInstall: 1,
        ldgrCurrBal: 0,
        ldgrPaidInstall: 0,
        Todaysdate: schemeData.todaydt,
      }));

      setTodaysdate(schemeData.todaydt);
      setGroupMemberNo(`${schemeData.mgroup} - ${schemeData.member_no}`);
      setIsFlexiGroup(schemeData.isflexible === "Y");
      setAdjustedScheme(schemeData.info === "A" || schemeData.info === "a");

      // Handle gold scheme calculations
      if (schemeData.gold_scheme === "1") {
        if (schemeData.group_type === "G") {
          setSchemeData((prev) => ({
            ...prev,
            g_balance: schemeData.scheme_amount,
            scheme_amount: (
              schemeData.scheme_amount * schemeData.store_gold_rate
            ).toFixed(3),
          }));
        } else {
          setSchemeData((prev) => ({
            ...prev,
            g_balance: (
              schemeData.scheme_amount / schemeData.store_gold_rate
            ).toFixed(3),
          }));
        }
      } else {
        setSchemeData((prev) => ({ ...prev, g_balance: 0 }));
      }

      // Handle installment calculations
      if (schemeData.isflexible === "Y") {
        setSchemeData((prev) => ({
          ...prev,
          paidInsatllments: schemeData.installCnt,
          currentInstalment: schemeData.installCnt + 1,
          pendingInstalment: schemeData.no_inst - schemeData.installCnt,
        }));
      } else {
        setSchemeData((prev) => ({
          ...prev,
          paidInsatllments: schemeData.amountPaid / schemeData.scheme_amount,
          currentInstalment:
            schemeData.amountPaid / schemeData.scheme_amount + 1,
          pendingInstalment:
            schemeData.no_inst -
            schemeData.amountPaid / schemeData.scheme_amount,
        }));
      }

      setSchemeData((prev) => ({
        ...prev,
        schemeToPayAmount: schemeData.scheme_amount,
      }));

      if (adjustedscheme) {
        setSchemeData((prev) => ({
          ...prev,
          pendingInstalment: 0,
          currentInstalment: 0,
          schemeToPayAmount: 0,
        }));
      }

      setInstallmentdetails(
        `${schemeData.no_inst} / ${schemeData.pendingInstalment} / ${schemeData.dueInstallNo} / ${schemeData.currentInstalment}`,
      );

      // console.log("agent payload 2",adminUser.branch);

      // Fetch user ledger
      // const ledgerresponse = await axios.post(
      //   `${process.env.REACT_APP_API_BASE_URL}/api/core/userledger`,
      //   {
      //     mobile: schemeData.mobile,
      //     mcode: `${groupCode}-${memberCode}`,
      //     storeID: APP_CONFIG.STORE_ID,
      //     branchId: adminUser.branch,
      //   },
      // );
      // setLedger(ledgerresponse.data);

      // let goldTotal = 0;
      // let amountTotal = 0;
      // ledgerresponse.data.forEach((item, index) => {
      //   if (index === 0) {
      //     setLastRecptDt(item.voucher_date);
      //   }
      //   goldTotal += item.gross_wt;
      //   amountTotal += item.amount;
      // });

      // if (adjustedscheme) {
      //   setGoldCollected(0);
      //   setAmountCollected(0);
      // } else {
      //   setGoldCollected(goldTotal);
      //   setAmountCollected(amountTotal);
      // }

      // apiClient.dismissLoader();
      // GetLocation_Onlyccords();
      // console.log(schemeDatadetails);

      goToPaymentPage(schemeDatadetails); // now it will likely see the updated state
    } catch (error) {
      console.error("Error loading initial data:", error);
      // apiClient.dismissLoader();
    }
  };

  const segmentChanged = (event) => {
    setViewMode(event.detail.value);
  };

  // const goBack = () => {
  //   if (groupCode) {
  //     navigate(`/tabs/join-chit-success/${memberCode}/${groupCode}`);
  //   } else {
  //     navigate("/tabs/search");
  //   }
  // };

  const goBack = () => {
    if (phonePeVerifying) {
      setShowBackWarning(true);
      return;
    }
    isCancelled.current = true;
    if (groupCode) {
      navigate(`/tabs/join-chit-success/${memberCode}/${groupCode}`);
    } else {
      navigate("/tabs/search");
    }
  };

  const GetLocation_Onlyccords = async () => {
    try {
      const position = await Geolocation.getCurrentPosition();
      setGeoLatitude(position.coords.latitude);
      setGeoLongitude(position.coords.longitude);
      setGeoAccuracy(position.coords.accuracy);
    } catch (error) {
      console.error("Error getting location", error);
    }
  };

  const goToPaymentPage = async (schemeDatadetails) => {
    if (paymentInProgress.current) return;
    paymentInProgress.current = true;
    setDisabled(true);
    setPageLoading(true);
    const obj = {
      // agent_id: data.agentID + "",
      agent_id: agentId,
      agentName: agentName,
      scheme_id: schemeDatadetails.Scheme_id + "",
      group_id: schemeDatadetails.mgroup,
      tenure: schemeDatadetails.No_of_draw + "",
      member_id: schemeDatadetails.member_id + "",
      amount_collected: payableAmount + "",
      // mode: schemeDatadetails.mode,
      mode: selectedOption,
      // grossWt: schemeDatadetails.gold_balance + "",
      grossWt: goldCon + "",

      goldRate: schemeDatadetails.store_gold_rate + "",
      mcode: `${groupCode}-${memberCode}`,
      txDate: new Date().toISOString(),
      customerMobileNumber: schemeDatadetails.mobile,
      name: schemeDatadetails.name,
      chqNo: refNumber || schemeDatadetails.chqNo,
      storeID: APP_CONFIG.STORE_ID,
      branch: schemeDatadetails.branch,
      order_Iid: "",
      pay_Iid: "",
      pay_sign: "",
      MaturityDate: schemeDatadetails.MaturityDate + "",
      dueInstallNo: schemeDatadetails.dueInstallNo + "",
      latitude: geoLatitude + "",
      longitude: geoLongitude + "",
      location: "",
      epay_brn: "",
      epay_trn: "",
      epay_cid: "",
      epay_rid: "",
      epay_type: "",
      epay_crn: "",
      epay_chksumkey: "",
      epay_ver: "",
      epay_stc: "",
      epay_pmd: "",
      cardchq: schemeDatadetails.cardchq || "0",
      extracash: schemeDatadetails.extracash || "0",
      chequedt: schemeDatadetails.chequedt || "",
      bank: schemeDatadetails.bank || "0",
      gold_scheme: schemeDatadetails.gold_scheme,
      goldconvyn: schemeDatadetails.goldconvyn,
    };

    const pg_obj = {
      // agent_id: data.agentID + "",
      agent_id: "",
      scheme_id: schemeDatadetails.Scheme_id + "",
      group_id: schemeDatadetails.mgroup,
      tenure: schemeDatadetails.No_of_draw + "",
      member_id: schemeDatadetails.member_id + "",
      amount_collected: payableAmount + "",
      mode: schemeDatadetails.mode,
      // grossWt: schemeDatadetails.g_balance + "",
      grossWt: goldCon + "",
      goldRate: schemeDatadetails.store_gold_rate + "",
      mcode: `${groupCode}-${memberCode}`,
      txDate: new Date().toISOString(),
      customerMobileNumber: schemeDatadetails.mobile,
      name: schemeDatadetails.name,
      chqNo: refNumber || schemeDatadetails.chqNo,
      storeID: APP_CONFIG.STORE_ID,
      branch: useBranch,
      order_Iid: "",
      pay_Iid: "",
      pay_sign: "",
    };

    // Check Installment Restrict Per Month
    //     if (schemeDatadetails.instal_limit_permonth > 0) {
    //       const response = await axios.get(
    //         `${process.env.REACT_APP_API_BASE_URL}/api/core/installment-count`,
    //         {
    //           params: {
    //             group: schemeDatadetails.mgroup,
    //             memberNo: schemeDatadetails.member_no,
    //             storeID: APP_CONFIG.STORE_ID,
    //             branch: adminUser.branch, // or use schemeDatadetails.branch
    //           },
    //         },
    //       );
    // // console.log('kdhfkhd',schemeDatadetails.mgroup,schemeDatadetails.member_no);

    //       const instlCount = response.data.count;

    //       setInstlcnt(instlCount);

    //       if (
    //         instlCount >= schemeDatadetails.instal_limit_permonth &&
    //         schemeDatadetails.instal_limit_permonth > 0
    //       ) {
    //         showAlert(
    //           "Install Payment Limit For Month Exceed",
    //           `Install Payment Limit: ${schemeDatadetails.instal_limit_permonth} Exceeded For Current Month`,
    //         );
    //         setDisabled(false);
    //         setPageLoading(false);
    //         navigate(-1)
    //         return;
    //       }
    //     }

    // Validate email
    // const emailValid = await validate_Email();
    // if (!emailValid && (schemeDatadetails.mode === "6" || schemeDatadetails.mode === "2")) {
    //     console.log("email",store_email_for_pg);

    //     console.log("schrme",schemeDatadetails)
    //     schemeDatadetails.email = store_email_for_pg;
    //     const emailValidAgain = await validate_Email();
    //     if (!emailValidAgain) {
    //         showAlert("Email Missing", "Email Address Not Valid, Specify Valid Email");
    //         setDisabled(false);
    //         return;
    //     }
    // }

    // Other validations

    if (
      schemeDatadetails.mode === "1" &&
      (!refNumber || refNumber.trim().length === 0)
    ) {
      showAlert("Data Missing", "Cheque Number Missing");
      setDisabled(false);
      return;
    } else if (schemeDatadetails.pendingInstalment <= 0) {
      showAlert("No Pending Installment", "Already All Installments Paid");
      setPageLoading(false);
      setDisabled(false);
      return;
    } else if (
      schemeDatadetails.app_duecnt_block > 0 &&
      schemeDatadetails.dueInstallNo > schemeDatadetails.app_duecnt_block
    ) {
      showAlert(
        "Due Install Exceeds Limit",
        "Contact Shop to Pay Installments..",
      );
      setDisabled(false);
      return;
    } else if (!selectedOption) {
      showAlert("Data Missing", "Select Proper Paymode");
      setDisabled(false);
      return;
    }

    // Handle gold schemeDatadetails calculations
    if (schemeDatadetails.gold_scheme === "1") {
      setSchemeData((prev) => ({
        ...prev,
        g_balance: (payableAmount / schemeDatadetails.store_gold_rate).toFixed(
          3,
        ),
      }));
    } else {
      setSchemeData((prev) => ({ ...prev, g_balance: 0.0 }));
    }

    // Check for multiples of schemeDatadetails amount or flexible group

    // console.log("🔍 payableAmount:", payableAmount, typeof payableAmount);
    // console.log(
      // "🔍 scheme_amount:",
      // schemeDatadetails.scheme_amount,
      // typeof schemeDatadetails.scheme_amount,
    // );
    // console.log("🔍 isflexible:", schemeDatadetails.isflexible);
    // console.log(
      // "🔍 modulo result:",
      // Number(payableAmount) % Number(schemeDatadetails.scheme_amount),
    // );

    let schemeToPayAmount = payableAmount;

    // if (
    //   schemeDatadetails.isflexible == "Y" ||
    //   payableAmount % schemeDatadetails.scheme_amount === 0
    // )
    const numPayable = Number(payableAmount);
    const numSchemeAmt = Number(schemeDatadetails.scheme_amount);
    if (
      schemeDatadetails.isflexible == "Y" ||
      numSchemeAmt === 0 || // safety: avoid division by zero
      numPayable % numSchemeAmt === 0
    ) {
      // ================================================================
      // Pay online
      // ================================================================
      if (selectedOption === "6") {
        // *******************************
        // Axis Bank PG
        // *******************************
        if (pgateway.razorpay_std === "10") {
          // console.log("standard 10!!", pgateway);

          const rpay_obj = {
            rpay_amount: payableAmount * 100 + "",
            rpay_currency: "INR",
            rpay_receipt: `${schemeDatadetails.member_id}-${schemeDatadetails.installCnt}`,
            rpay_MembId: schemeDatadetails.member_id,
            rpay_keyId: data.razorpay_key_id,
            rpay_KeySecret: data.razorpay_key_secret,
          };

          const storeID = APP_CONFIG.STORE_ID;
          const branch = useBranch;
          const amount = rpay_obj.rpay_amount;
          const receipt = rpay_obj.rpay_receipt; // Escape special chars
          const memberId = rpay_obj.rpay_MembId;

          try {
            const orderResult = await axios.get(
              `${process.env.REACT_APP_API_BASE_URL}/api/core/GetRazorOrder_ID/${storeID}/${branch}/${amount}/${receipt}/${memberId}`,
            );

            const epayRefRes = await axios.get(
              `${process.env.REACT_APP_API_BASE_URL}/api/core/getPaymentGatewayReference`,
            );
            const epayRefId = epayRefRes.data.refno; // assuming API returns { refno: 123 }
            // console.log("epayRefId :" + epayRefId);

            const uniqueId = Date.now();
            if (epayRefId) {
              const epay_obj = {
                epay_cid: data.esypay_merchant_id + "",
                epay_rid: epayRefId + "",
                epay_crn: epayRefId + "",
                epay_amt: payableAmount + "",
                epay_ver: data.esypay_version + "",
                epay_chsmkey: data.esypay_ChecksumKey + "",
                epay_type: data.esypay_type + "",
                epay_cyn: "INR",
                key_id: schemeDatadetails.member_id + "",
                order_id: `${schemeDatadetails.mgroup}-${schemeDatadetails.member_no}`,
                name: schemeDatadetails.name + "",
                description: schemeDatadetails.currentInstalment + "",
                email: schemeDatadetails.email + "",
                contact: schemeDatadetails.mobile + "",
                transaction_id: `${schemeDatadetails.member_id}-${schemeDatadetails.currentInstalment}-${uniqueId}`,
                store_id: APP_CONFIG.STORE_ID + "",
                branch: schemeDatadetails.branch + "",
                epay_memId: schemeDatadetails.member_id + "",
                epay_currInstl: schemeDatadetails.currentInstalment + "",
                RAZORPAY_KEY_ID: pgateway.razorpay_key_id,
                RAZORPAY_KEY_SECRET: pgateway.razorpay_key_secret,
                callback_url: `${process.env.REACT_APP_API_BASE_URL}/api/axis/axis-payment-success?store_id=${storeID}&branch_id=${branch}`,
              };

              // console.log("calling Function");

              // const url = 'http://192.168.0.114:3003/create-payment-link';
              const url = `${process.env.REACT_APP_API_BASE_URL}/api/axis/axiscreatepaymentlink`;
              try {
                const response = await axios.post(url, epay_obj);
                // console.log(
                  // "Data sent successfully:!! axis",
                  // response.data.short_url,
                // );

                if (response.data) {
                  // await Browser.open({
                  //     url: response.data.short_url,
                  //     presentationStyle: 'fullscreen'
                  // })
                  const browser = InAppBrowser.create(
                    response.data.short_url,
                    "_blank",
                    {
                      location: "yes",
                      toolbar: "yes",
                      closebuttoncaption: "Close",
                      hardwareback: "yes",
                      mediaPlaybackRequiresUserAction: "no",
                      shouldPauseOnSuspend: "no",
                      fullscreen: "yes",
                    },
                  );

                  let pollingStopped = false;
                  const razorpay_payment_link_id = response.data.id;
                  // const url1 = "http://192.168.0.114:3003/fetchaxis-details";
                  const url1 = `${process.env.REACT_APP_API_BASE_URL}/api/axis/fetchaxis-details`;
                  const requestBody = { razorpay_payment_link_id };
                  let attempts = 0;
                  const maxAttempts = 180;
                  const timeout = 1000;

                  const checkApiResponse = async () => {
                    if (pollingStopped) return;
                    attempts++;

                    try {
                      const response = await axios.post(url1, requestBody);
                      // console.log("API Response axis:", response.data);

                      const successData = response.data?.[0];

                      if (successData?.code === "PAYMENT_SUCCESS") {
                        pollingStopped = true;
                        // console.log(
                          // "✅ Payment successful. Closing the browser.",
                        // );

                        const {
                          amount,
                          checksum,
                          transactionId,
                          providerReferenceId,
                          code,
                        } = successData;

                        obj.pay_sign = checksum;
                        obj.order_Iid = `${schemeDatadetails.mgroup}-${schemeDatadetails.member_no}`;
                        obj.pay_Iid = providerReferenceId;
                        obj.amount_collected = amount;

                        const paymentResult = await axios.post(
                          `${process.env.REACT_APP_API_BASE_URL}/api/core/payForScheme`,
                          obj,
                        );

                        if (paymentResult) {
                          obj.voucher = paymentResult;
                          obj.agentName = agentName;
                          obj.pmode = obj.mode;
                          obj.gross_wt = obj.grossWt;
                          obj.rate = obj.goldRate;
                          obj.voucher_date = new Date().toLocaleDateString();

                          obj.PaidIntall =
                            schemeDatadetails.PayInstall > 1
                              ? `${schemeDatadetails.currentInstalment} - ${
                                  schemeDatadetails.currentInstalment +
                                  (schemeDatadetails.PayInstall - 1)
                                }`
                              : schemeDatadetails.currentInstalment;

                          obj.PrevBal = amountCollected;
                          obj.PrevGold = goldCollected;
                          obj.CurrBal = amountCollected + payableAmount;
                          obj.CurrGold =
                            goldCollected + schemeDatadetails.g_balance;

                          try {
                            obj.latitude = geoLatitude + "";
                            obj.longitude = geoLongitude + "";
                          } catch (e) {}

                          try {
                            setGeoAddress2("");
                            obj.location = geo_address2 + "";
                          } catch (e) {}

                          const paymentData = {
                            voucher: paymentResult?.data?.nextVoucherNo,
                            agent_name: obj.agentName,
                            pmode: obj.mode,
                            name: obj.name,
                            gross_wt: obj.grossWt,
                            rate: obj.rate,
                            voucher_date: obj.voucher_date,
                            amount: obj.amount_collected / 100,
                          };

                          // navigate("/paymentsuccess", { state: { paymentResult: paymentData } });
                          navigate("/paymentsuccess", {
                            state: {
                              paymentResult: paymentData,
                              additionalPlanDetails,
                            },
                            replace: true,
                          });

                          browser.close();
                        } else {
                          showAlert(
                            "Save Failed.. Contact Shop..",
                            "Save Failed " + schemeDatadetails.scheme_amount,
                          );
                          browser.close();
                        }
                      } else if (attempts >= maxAttempts) {
                        pollingStopped = true;
                        // console.log(
                          // "❌ Max attempts reached. Closing the browser.",
                        // );
                        browser.close();
                        showAlert(
                          "Payment Failed",
                          "Unable to confirm payment. Please try again.",
                        );
                      } else {
                        setTimeout(checkApiResponse, timeout);
                      }
                    } catch (error) {
                      console.error("API Error:", error);

                      if (attempts >= maxAttempts) {
                        pollingStopped = true;
                        console.log(
                          "❌ Max attempts reached due to error. Closing the browser.",
                        );
                        browser.close();
                        // showAlert(
                        //   "Network Error",
                        //   "Could not verify payment. Try again."
                        // );
                      } else {
                        setTimeout(checkApiResponse, timeout);
                      }
                    }
                  };

                  // ✅ Start polling
                  checkApiResponse();
                  browser.on("exit").subscribe(() => {
                    if (!pollingStopped) {
                      // Only navigate if polling wasn't stopped by a successful payment
                      // console.log("Browser was closed by user");

                      if (loginRole === "agent") {
                        navigate("/searchcustomers", { replace: true });
                      } else {
                        navigate("/savingplanslist", { replace: true });
                      }
                    }
                  });
                }
              } catch (error) {
                console.error("Error sending data:", error);
              }
            }
          } catch (error) {
            console.error("Error in online payment process:", error);
            setDisabled(false);
          }
        }

        // *******************************
        // Anonymous PG
        // *******************************
        else if (pgateway.razorpay_std === "12") {
          // console.log("standard 12!!", schemeDatadetails);

          const rpay_obj = {
            rpay_amount: payableAmount * 100 + "",
            rpay_currency: "INR",
            rpay_receipt: `${schemeDatadetails.member_id}-${schemeDatadetails.installCnt}`,
            rpay_MembId: schemeDatadetails.member_id,
            rpay_keyId: data.razorpay_key_id,
            rpay_KeySecret: data.razorpay_key_secret,
          };

          const storeID = APP_CONFIG.STORE_ID;
          const branch = useBranch;
          const amount = rpay_obj.rpay_amount;
          const receipt = rpay_obj.rpay_receipt; // Escape special chars
          const memberId = rpay_obj.rpay_MembId;

          try {
            const orderResult = await axios.get(
              `${process.env.REACT_APP_API_BASE_URL}/api/core/GetRazorOrder_ID/${storeID}/${branch}/${amount}/${receipt}/${memberId}`,
            );

            const epayRefRes = await axios.get(
              `${process.env.REACT_APP_API_BASE_URL}/api/core/getPaymentGatewayReference`,
            );
            const epayRefId = epayRefRes.data.refno; // assuming API returns { refno: 123 }
            // console.log("epayRefId :" + epayRefId);

            // let uniqueId = Date.now();
            let uniqueId = get8DigitRandom(); // Example: 58273645

            if (epayRefId) {
              const epay_obj = {
                epay_cid: data.esypay_merchant_id + "",
                epay_rid: epayRefId + "",
                epay_crn: epayRefId + "",
                epay_amt: payableAmount + "",
                epay_ver: data.esypay_version + "",
                epay_chsmkey: data.esypay_ChecksumKey + "",
                epay_type: data.esypay_type + "",
                epay_cyn: "INR",
                key_id: schemeDatadetails.member_id + "",
                order_id: `${schemeDatadetails.mgroup}-${schemeDatadetails.member_no}`,
                name: schemeDatadetails.name + "",
                description: schemeDatadetails.installCnt + "",
                email: schemeDatadetails.email + "",
                contact: schemeDatadetails.mobile + "",
                transaction_id: `${schemeDatadetails.member_id}${schemeDatadetails.installCnt}${uniqueId}`,
                store_id: APP_CONFIG.STORE_ID + "",
                branch: schemeDatadetails.branch + "",
                epay_memId: schemeDatadetails.member_id + "",
                epay_currInstl: schemeDatadetails.installCnt + "",
              };

              // console.log("calling icici Function", epay_obj);

              // const url = 'http://192.168.0.114:3003/create-payment-link';
              const url = "http://103.160.106.159:3037/initiate_payment";
              try {
                const response = await axios.post(url, epay_obj);

                const icicitxnid = `${schemeDatadetails.member_id}${schemeDatadetails.installCnt}${uniqueId}`;

                if (response.data) {
                  // await Browser.open({
                  //     url: response.data.short_url,
                  //     presentationStyle: 'fullscreen'
                  // })

                  let browser = "";
                  const platform = Capacitor.getPlatform();

                  if (platform === "ios") {
                    // iOS → Use data URL instead of blob
                    const html = response.data;
                    const base64Html = btoa(unescape(encodeURIComponent(html)));
                    const dataUrl = `data:text/html;base64,${base64Html}`;
                    // console.log("Opening iOS payment screen via data URL");

                    browser = InAppBrowser.create(dataUrl, "_blank", {
                      location: "yes",
                      toolbar: "yes",
                      closebuttoncaption: "Close",
                      hardwareback: "yes",
                      mediaPlaybackRequiresUserAction: "no",
                      shouldPauseOnSuspend: "no",
                      fullscreen: "yes",
                    });
                  } else {
                    const blob = new Blob([response.data], {
                      type: "text/html",
                    });
                    const blobUrl = URL.createObjectURL(blob);

                    browser = InAppBrowser.create(blobUrl, "_blank", {
                      location: "yes",
                      toolbar: "yes",
                      closebuttoncaption: "Close",
                      hardwareback: "yes",
                      mediaPlaybackRequiresUserAction: "no",
                      shouldPauseOnSuspend: "no",
                      fullscreen: "yes",
                    });
                  }

                  let pollingStopped = false;
                  //   const razorpay_payment_link_id = response.data.id;
                  // const url1 = "http://192.168.0.114:3003/fetchaxis-details";
                  const url1 = "http://103.160.106.159:3037/get-transaction";

                  //   const requestBody = { razorpay_payment_link_id };
                  let attempts = 0;
                  const maxAttempts = 180;
                  const timeout = 1000;

                  const checkApiResponse = async () => {
                    if (pollingStopped) return;
                    attempts++;

                    try {
                      // const response = await axios.get(url1 / txnid);
                      const response = await axios.get(`${url1}/${icicitxnid}`);
                      // console.log("API Response axis:", response.data);

                      const successData = response?.data?.data;

                      if (
                        response?.data?.success == true &&
                        response.data &&
                        successData?.Message == "Transaction Successful"
                      ) {
                        pollingStopped = true;
                        // console.log(
                          // "✅ Payment successful. Closing the browser.",
                          // response?.success,
                        // );

                        const {
                          TxnRefNo,
                          Amount,
                          BankId,
                          City,
                          Currency,
                          Email,
                          FirstName,
                          LastName,
                          MerchantId,
                          Message,
                          OrderInfo,
                          PassCode,
                          Phone,
                          RespDate,
                          RespTime,
                          ResponseCode,
                          RetRefNo,
                          State,
                          Street,
                          TerminalId,
                          ZIP,
                        } = successData;

                        obj.pay_sign = TxnRefNo;
                        obj.order_Iid = `${schemeDatadetails.mgroup}-${schemeDatadetails.member_no}`;
                        obj.pay_Iid = TxnRefNo;
                        obj.amount_collected = Amount * 100;

                        const paymentResult = await axios.post(
                          `${process.env.REACT_APP_API_BASE_URL}/api/core/payForScheme`,
                          obj,
                        );

                        if (paymentResult) {
                          obj.voucher = paymentResult;
                          obj.agentName = agentName;
                          obj.pmode = obj.mode;
                          obj.gross_wt = obj.grossWt;
                          obj.rate = obj.goldRate;
                          obj.voucher_date = new Date().toLocaleDateString();

                          obj.PaidIntall =
                            schemeDatadetails.PayInstall > 1
                              ? `${schemeDatadetails.currentInstalment} - ${
                                  schemeDatadetails.currentInstalment +
                                  (schemeDatadetails.PayInstall - 1)
                                }`
                              : schemeDatadetails.currentInstalment;

                          obj.PrevBal = amountCollected;
                          obj.PrevGold = goldCollected;
                          obj.CurrBal = amountCollected + payableAmount;
                          obj.CurrGold =
                            goldCollected + schemeDatadetails.g_balance;

                          try {
                            obj.latitude = geoLatitude + "";
                            obj.longitude = geoLongitude + "";
                          } catch (e) {}

                          try {
                            setGeoAddress2("");
                            obj.location = geo_address2 + "";
                          } catch (e) {}

                          const paymentData = {
                            voucher: paymentResult?.data?.nextVoucherNo,
                            agent_name: obj.agentName,
                            pmode: obj.mode,
                            name: obj.name,
                            gross_wt: obj.grossWt,
                            rate: obj.rate,
                            voucher_date: obj.voucher_date,
                            amount: Amount,
                          };

                          // navigate("/paymentsuccess", { state: { paymentResult: paymentData } });
                          navigate("/paymentsuccess", {
                            state: {
                              paymentResult: paymentData,
                              additionalPlanDetails,
                            },
                            replace: true,
                          });

                          browser.close();
                        } else {
                          showAlert(
                            "Save Failed.. Contact Shop..",
                            "Save Failed " + schemeDatadetails.scheme_amount,
                          );
                          browser.close();
                        }
                      } else if (
                        response?.data?.success == true &&
                        response.data &&
                        successData?.Message == "Transaction Canceled"
                      ) {
                        showAlert(
                          "Payment Failed",
                          "Unable to confirm payment. Please try again.",
                        );
                        if (loginRole === "agent") {
                          navigate("/searchcustomers", { replace: true });
                        } else {
                          navigate("/savingplanslist", { replace: true });
                        }
                      } else if (attempts >= maxAttempts) {
                        pollingStopped = true;
                        // console.log(
                          // "❌ Max attempts reached. Closing the browser.",
                        // );
                        browser.close();
                        // showAlert(
                        //   "Payment Failed",
                        //   "Unable to confirm payment. Please try again."
                        // );
                      } else {
                        setTimeout(checkApiResponse, timeout);
                      }
                    } catch (error) {
                      console.error("API Error:", error);

                      if (attempts >= maxAttempts) {
                        pollingStopped = true;
                        console.log(
                          "❌ Max attempts reached due to error. Closing the browser.",
                        );
                        browser.close();
                        // showAlert(
                        //   "Network Error",
                        //   "Could not verify payment. Try again."
                        // );
                      } else {
                        setTimeout(checkApiResponse, timeout);
                      }
                    }
                  };

                  // ✅ Start polling
                  checkApiResponse();
                  browser.on("exit").subscribe(() => {
                    if (!pollingStopped) {
                      // Only navigate if polling wasn't stopped by a successful payment
                      // console.log("Browser was closed by user");

                      if (loginRole === "agent") {
                        navigate("/searchcustomers", { replace: true });
                      } else {
                        navigate("/savingplanslist", { replace: true });
                      }
                    }
                  });
                }
              } catch (error) {
                console.error("Error sending data:", error);
              }
            }
          } catch (error) {
            console.error("Error in online payment process:", error);
            setDisabled(false);
          }
        }

        // *******************************
        // Phone Phi PG
        // *******************************
        else if (pgateway.razorpay_std === "15") {
          // console.log("standard 15!!", schemeDatadetails);

          const rpay_obj = {
            rpay_amount: payableAmount * 100 + "",
            rpay_currency: "INR",
            rpay_receipt: `${schemeDatadetails.member_id}-${schemeDatadetails.installCnt}`,
            rpay_MembId: schemeDatadetails.member_id,
            rpay_keyId: data.razorpay_key_id,
            rpay_KeySecret: data.razorpay_key_secret,
          };

          const storeID = APP_CONFIG.STORE_ID;
          const branch = useBranch;
          const amount = rpay_obj.rpay_amount;
          const receipt = rpay_obj.rpay_receipt; // Escape special chars
          const memberId = rpay_obj.rpay_MembId;

          try {
            const orderResult = await axios.get(
              `${process.env.REACT_APP_API_BASE_URL}/api/core/GetRazorOrder_ID/${storeID}/${branch}/${amount}/${receipt}/${memberId}`,
            );

            const epayRefRes = await axios.get(
              `${process.env.REACT_APP_API_BASE_URL}/api/core/getPaymentGatewayReference`,
            );
            const epayRefId = epayRefRes.data.refno; // assuming API returns { refno: 123 }
            // console.log("epayRefId :" + epayRefId);

            // let uniqueId = Date.now();
            let uniqueId = get8DigitRandom(); // Example: 58273645

            const merchantTxnNo = `${schemeDatadetails.member_id}${schemeDatadetails.installCnt}${uniqueId}`;

            if (epayRefId) {
              const epay_obj = {
                epay_cid: data.esypay_merchant_id + "",
                epay_rid: epayRefId + "",
                currencyCode: "356",
                payType: "0",
                epay_crn: epayRefId + "",
                amount: payableAmount + "",
                epay_ver: data.esypay_version + "",
                epay_chsmkey: data.esypay_ChecksumKey + "",
                epay_type: data.esypay_type + "",
                epay_cyn: "INR",
                key_id: schemeDatadetails.member_id + "",
                order_id: `${schemeDatadetails.mgroup}-${schemeDatadetails.member_no}`,
                name: schemeDatadetails.name + "",
                returnURL: `${process.env.REACT_APP_API_BASE_URL}/api/phonephi/paymentreturn`,
                description: schemeDatadetails.installCnt + "",
                customerEmailID: schemeDatadetails.email + "",
                customerMobileNo: schemeDatadetails.mobile + "",
                merchantTxnNo: merchantTxnNo,
                store_id: APP_CONFIG.STORE_ID + "",
                branch: schemeDatadetails.branch + "",
                epay_memId: schemeDatadetails.member_id + "",
                epay_currInstl: schemeDatadetails.installCnt + "",
                addlParam1: "Test1",
                addlParam2: "Test2",
              };

              // console.log("calling icici Function", epay_obj);

              // const url = 'http://192.168.0.114:3003/create-payment-link';
              const url = `${process.env.REACT_APP_API_BASE_URL}/api/phonephi/initialsales`;

              try {
                const response = await axios.post(url, epay_obj);

                const icicitxnid = `${schemeDatadetails.member_id}${schemeDatadetails.installCnt}${uniqueId}`;

                if (response.data) {
                  // await Browser.open({
                  //     url: response.data.short_url,
                  //     presentationStyle: 'fullscreen'
                  // })

                  const resp = response.data;

                  // console.log("========resp============================");
                  // console.log(resp);
                  // console.log("====================================");

                  let browser = "";
                  const platform = Capacitor.getPlatform();

                  const paymentUrl = `${
                    resp.redirectURI
                  }?tranCtx=${encodeURIComponent(resp.tranCtx)}`;

                  if (platform === "ios") {
                    // iOS also uses the redirect meta instead of raw HTML
                    const blob = new Blob(
                      [
                        `<meta http-equiv="refresh" content="0;url=${paymentUrl}">`,
                      ],
                      { type: "text/html" },
                    );
                    const blobUrl = URL.createObjectURL(blob);

                    browser = InAppBrowser.create(blobUrl, "_blank", {
                      location: "yes",
                      toolbar: "yes",
                      closebuttoncaption: "Close",
                      hardwareback: "yes",
                      mediaPlaybackRequiresUserAction: "no",
                      shouldPauseOnSuspend: "no",
                      fullscreen: "yes",
                    });
                  } else {
                    // or include merchantTxnNo if doc says so:
                    // const paymentUrl = `${resp.redirectURI}?merchantTxnNo=${resp.merchantTxnNo}&tranCtx=${resp.tranCtx}`;

                    console.log(
                      "================paymentUrl====================",
                    );
                    console.log(paymentUrl);
                    console.log("====================================");

                    // Now open in in-app browser
                    const blob = new Blob(
                      [
                        `<meta http-equiv="refresh" content="0;url=${paymentUrl}">`,
                      ],
                      { type: "text/html" },
                    );
                    const blobUrl = URL.createObjectURL(blob);

                    browser = InAppBrowser.create(blobUrl, "_blank", {
                      location: "yes",
                      toolbar: "yes",
                      closebuttoncaption: "Close",
                      hardwareback: "yes",
                      mediaPlaybackRequiresUserAction: "no",
                      shouldPauseOnSuspend: "no",
                      fullscreen: "yes",
                    });
                  }

                  let pollingStopped = false;
                  //   const razorpay_payment_link_id = response.data.id;
                  // const url1 = "http://192.168.0.114:3003/fetchaxis-details";
                  const url1 = `${process.env.REACT_APP_API_BASE_URL}/api/phonephi/transaction`;

                  //   const requestBody = { razorpay_payment_link_id };
                  let attempts = 0;
                  const maxAttempts = 360;
                  const timeout = 700;

                  const checkApiResponse = async () => {
                    if (pollingStopped) return;
                    attempts++;

                    try {
                      // const response = await axios.get(url1 / txnid);
                      const response = await axios.get(
                        `${url1}/${merchantTxnNo}`,
                      );
                      // console.log(
                        // "API Response axis: merchantTxnNo",
                        // response.data,
                      // );

                      const successData = response?.data;

                      if (
                        successData.data &&
                        successData.data.responseCode === "0000"
                      ) {
                        pollingStopped = true;
                        // console.log(
                          // "✅ Payment successful. Closing the browser phone phi.",
                          // successData,
                        // );

                        const {
                          merchantTxnNo,
                          amount,
                          BankId,
                          City,
                          Currency,
                          Email,
                          FirstName,
                          LastName,
                          MerchantId,
                          Message,
                          OrderInfo,
                          PassCode,
                          Phone,
                          RespDate,
                          RespTime,
                          ResponseCode,
                          RetRefNo,
                          State,
                          Street,
                          TerminalId,
                          ZIP,
                        } = successData.data;

                        obj.pay_sign = merchantTxnNo;
                        obj.order_Iid = `${schemeDatadetails.mgroup}-${schemeDatadetails.member_no}`;
                        obj.pay_Iid = merchantTxnNo;
                        obj.amount_collected = amount * 100;

                        const paymentResult = await axios.post(
                          `${process.env.REACT_APP_API_BASE_URL}/api/core/payForScheme`,
                          obj,
                        );

                        if (paymentResult) {
                          obj.voucher = paymentResult;
                          obj.agentName = agentName;
                          obj.pmode = obj.mode;
                          obj.gross_wt = obj.grossWt;
                          obj.rate = obj.goldRate;
                          obj.voucher_date = new Date().toLocaleDateString();

                          obj.PaidIntall =
                            schemeDatadetails.PayInstall > 1
                              ? `${schemeDatadetails.currentInstalment} - ${
                                  schemeDatadetails.currentInstalment +
                                  (schemeDatadetails.PayInstall - 1)
                                }`
                              : schemeDatadetails.currentInstalment;

                          obj.PrevBal = amountCollected;
                          obj.PrevGold = goldCollected;
                          obj.CurrBal = amountCollected + payableAmount;
                          obj.CurrGold =
                            goldCollected + schemeDatadetails.g_balance;

                          try {
                            obj.latitude = geoLatitude + "";
                            obj.longitude = geoLongitude + "";
                          } catch (e) {}

                          try {
                            setGeoAddress2("");
                            obj.location = geo_address2 + "";
                          } catch (e) {}

                          const paymentData = {
                            voucher: paymentResult?.data?.nextVoucherNo,
                            agent_name: obj.agentName,
                            pmode: obj.mode,
                            name: obj.name,
                            gross_wt: obj.grossWt,
                            rate: obj.rate,
                            voucher_date: obj.voucher_date,
                            amount: amount,
                          };

                          // navigate("/paymentsuccess", { state: { paymentResult: paymentData } });
                          navigate("/paymentsuccess", {
                            state: {
                              paymentResult: paymentData,
                              additionalPlanDetails,
                            },
                            replace: true,
                          });

                          browser.close();
                        } else {
                          showAlert(
                            "Save Failed.. Contact Shop..",
                            "Save Failed " + schemeDatadetails.scheme_amount,
                          );
                          browser.close();
                        }
                      } else if (
                        response?.data?.success == true &&
                        response.data &&
                        successData?.Message == "Transaction Canceled"
                      ) {
                        showAlert(
                          "Payment Failed",
                          "Unable to confirm payment. Please try again.",
                        );
                        if (loginRole === "agent") {
                          navigate("/searchcustomers", { replace: true });
                        } else {
                          navigate("/savingplanslist", { replace: true });
                        }
                      } else if (attempts >= maxAttempts) {
                        pollingStopped = true;
                        // console.log(
                          // "❌ Max attempts reached. Closing the browser.",
                        // );
                        browser.close();
                        // showAlert(
                        //   "Payment Failed",
                        //   "Unable to confirm payment. Please try again."
                        // );
                      } else {
                        setTimeout(checkApiResponse, timeout);
                      }
                    } catch (error) {
                      console.error("API Error:", error);

                      if (attempts >= maxAttempts) {
                        pollingStopped = true;
                        console.log(
                          "❌ Max attempts reached due to error. Closing the browser.",
                        );
                        browser.close();
                        // showAlert(
                        //   "Network Error",
                        //   "Could not verify payment. Try again."
                        // );
                      } else {
                        setTimeout(checkApiResponse, timeout);
                      }
                    }
                  };

                  // ✅ Start polling
                  checkApiResponse();
                  browser.on("exit").subscribe(() => {
                    if (!pollingStopped) {
                      // Only navigate if polling wasn't stopped by a successful payment
                      // console.log("Browser was closed by user");

                      if (loginRole === "agent") {
                        navigate("/searchcustomers", { replace: true });
                      } else {
                        navigate("/savingplanslist", { replace: true });
                      }
                    }
                  });
                }
              } catch (error) {
                console.error("Error sending data:", error);
              }
            }
          } catch (error) {
            console.error("Error in online payment process:", error);
            setDisabled(false);
          }
        }

        // *******************************
        // Federal Bank PG
        // *******************************
        else if (pgateway.razorpay_std === "16") {
          const rpay_obj = {
            rpay_amount: payableAmount * 100 + "",
            rpay_currency: "INR",
            rpay_receipt: `${schemeDatadetails.member_id}-${schemeDatadetails.installCnt}`,
            rpay_MembId: schemeDatadetails.member_id,
            rpay_keyId: data.razorpay_key_id,
            rpay_KeySecret: data.razorpay_key_secret,
          };

          const storeID = APP_CONFIG.STORE_ID;
          const branch = useBranch;
          const amount = rpay_obj.rpay_amount;
          const receipt = rpay_obj.rpay_receipt;
          const memberId = rpay_obj.rpay_MembId;

          try {
            const orderResult = await axios.get(
              `${process.env.REACT_APP_API_BASE_URL}/api/core/GetRazorOrder_ID/${storeID}/${branch}/${amount}/${receipt}/${memberId}`,
            );

            const epayRefRes = await axios.get(
              `${process.env.REACT_APP_API_BASE_URL}/api/core/getPaymentGatewayReference`,
            );
            const epayRefId = epayRefRes.data.refno;

            let uniqueId = get8DigitRandom();
            const merchantTxnNo = `${schemeDatadetails.member_id}${schemeDatadetails.installCnt}${uniqueId}`;

            if (epayRefId) {
              const epayObj = {
                amount: payableAmount.toString(),
                currency: "INR",
                description: schemeDatadetails.installCnt + "",
                name: schemeDatadetails.name + "",
                email: schemeDatadetails.email + "",
                phone: schemeDatadetails.mobile + "",
                city: "Bangalore",
                country: "India",
                zip_code: "560001",
                return_url: `${process.env.REACT_APP_API_BASE_URL}/api/federal/federalpayresp`,
                order_id: merchantTxnNo,
                mode: "TEST",
                address_line_1: "123 Street",
                address_line_2: "Suite 4",
                state: "KARNATAKA",
                // api_key: "6f8fd7b6-5771-4e48-9b80-d373cf1902b7",
                api_key: "fb6bca86-b429-4abf-a42f-824bdd29022e",
              };

              try {
                // 1️⃣ Request hash
                const { data: hashResponse } = await axios.post(
                  `${process.env.REACT_APP_API_BASE_URL}/api/federal/generatehash`,
                  epayObj,
                );

                const paymentPayload = { ...epayObj, hash: hashResponse.hash };

                // 2️⃣ Generate auto-submit form HTML string
                const { data: formHTML } = await axios.post(
                  `${process.env.REACT_APP_API_BASE_URL}/api/federal/federalstartpayment`,
                  paymentPayload,
                );

                // ---------------------------------------------------------
                // 🚀 NEW FIX: Upload form HTML so Android can load it
                // ---------------------------------------------------------
                const { data: tempUrlResponse } = await axios.post(
                  `${process.env.REACT_APP_API_BASE_URL}/api/federal/temphtml`,
                  { html: formHTML },
                );

                // This URL works on Android (no blob issues)
                const hostedFormUrl = tempUrlResponse.url;

                let pollingStopped = false;
                let attempts = 0;
                const maxAttempts = 360;
                const timeout = 700;

                // ---------------------------------------------------------
                // 🔥 Handle UPI / Intent Redirect (Android)
                // ---------------------------------------------------------
                // App.addListener("appUrlOpen", async (event) => {
                //   const url = event.url;

                //   if (url.startsWith("upi://") || url.startsWith("intent://")) {
                //     await Browser.close();
                //     window.open(url, "_system");
                //   }
                // });

                const checkApiResponse = async () => {
                  if (pollingStopped) return;
                  attempts++;

                  try {
                    const response = await axios.get(
                      `${process.env.REACT_APP_API_BASE_URL}/api/federal/transaction-status/${merchantTxnNo}`,
                    );

                    // console.log("resp frd", response.data);

                    if (response.data.transaction.response_code === "0") {
                      pollingStopped = true;
                      await Browser.close();

                      const txnData = response.data.transaction;

                      obj.pay_sign = txnData.merchantTxnNo;
                      obj.order_Iid = `${schemeDatadetails.mgroup}-${schemeDatadetails.member_no}`;
                      obj.pay_Iid = txnData.merchantTxnNo;
                      obj.amount_collected = txnData.amount * 100;

                      const paymentResult = await axios.post(
                        `${process.env.REACT_APP_API_BASE_URL}/api/core/payForScheme`,
                        obj,
                      );

                      if (paymentResult) {
                        obj.voucher = paymentResult;
                        obj.agentName = agentName;
                        obj.pmode = obj.mode;
                        obj.gross_wt = obj.grossWt;
                        obj.rate = obj.goldRate;
                        obj.voucher_date = new Date().toLocaleDateString();

                        obj.PaidIntall =
                          schemeDatadetails.PayInstall > 1
                            ? `${schemeDatadetails.currentInstalment} - ${
                                schemeDatadetails.currentInstalment +
                                (schemeDatadetails.PayInstall - 1)
                              }`
                            : schemeDatadetails.currentInstalment;

                        obj.PrevBal = amountCollected;
                        obj.PrevGold = goldCollected;
                        obj.CurrBal = amountCollected + payableAmount;
                        obj.CurrGold =
                          goldCollected + schemeDatadetails.g_balance;

                        try {
                          obj.latitude = geoLatitude + "";
                          obj.longitude = geoLongitude + "";
                        } catch (e) {}

                        try {
                          setGeoAddress2("");
                          obj.location = geo_address2 + "";
                        } catch (e) {}

                        const paymentData = {
                          voucher: paymentResult?.data?.nextVoucherNo,
                          agent_name: obj.agentName,
                          pmode: obj.mode,
                          name: obj.name,
                          gross_wt: obj.grossWt,
                          rate: obj.rate,
                          voucher_date: obj.voucher_date,
                          amount: txnData.amount,
                        };

                        navigate("/paymentsuccess", {
                          state: {
                            paymentResult: paymentData,
                            additionalPlanDetails,
                          },
                          replace: true,
                        });
                      }
                    } else if (
                      response.data.transaction.response_code === "1000"
                    ) {
                      pollingStopped = true;
                      await Browser.close();
                      showAlert("Payment Failed", "Unable to confirm payment.");

                      if (loginRole === "agent") {
                        navigate("/searchcustomers", { replace: true });
                      } else {
                        navigate("/savingplanslist", { replace: true });
                      }
                    } else if (attempts >= maxAttempts) {
                      pollingStopped = true;
                      await Browser.close();
                    } else {
                      setTimeout(checkApiResponse, timeout);
                    }
                  } catch (error) {
                    if (attempts >= maxAttempts) {
                      pollingStopped = true;
                      await Browser.close();
                    } else {
                      setTimeout(checkApiResponse, timeout);
                    }
                  }
                };

                // ---------------------------------------------------------
                // 🔥 Open Payment Page in Capacitor Browser
                // ---------------------------------------------------------

                socket.emit("register_payment", merchantTxnNo);

                let paymentCompleted = false;

                // ⭐ Socket Listener for instant update
                const socketHandler = async (resp) => {
                  if (resp.order_id !== merchantTxnNo) return;

                  paymentCompleted = true;
                  socket.off("payment_update", socketHandler);
                  await Browser.close();

                  if (resp.success) {
                    const txn = resp.data;

                    obj.pay_sign = txn.order_id;
                    obj.order_Iid = `${schemeDatadetails.mgroup}-${schemeDatadetails.member_no}`;
                    obj.pay_Iid = txn.order_id;
                    obj.amount_collected = Number(txn.amount) * 100;

                    const paymentResult = await axios.post(
                      `${process.env.REACT_APP_API_BASE_URL}/api/core/payForScheme`,
                      obj,
                    );

                    const paymentData = {
                      voucher: paymentResult?.data?.nextVoucherNo,
                      agent_name: agentName,
                      pmode: obj.mode,
                      name: obj.name,
                      gross_wt: obj.grossWt,
                      rate: obj.rate,
                      voucher_date: new Date().toLocaleDateString(),
                      amount: txn.amount,
                    };

                    navigate("/paymentsuccess", {
                      state: {
                        paymentResult: paymentData,
                        additionalPlanDetails,
                      },
                      replace: true,
                    });
                  } else {
                    showAlert("Payment Failed", "Unable to confirm payment.");
                    if (loginRole === "agent") navigate("/searchcustomers");
                    else navigate("/savingplanslist");
                  }
                };

                socket.on("payment_update", socketHandler);

                // ⭐ PLUS fallback polling (if socket fails)
                const pollStatus = async () => {
                  if (paymentCompleted) return;

                  try {
                    const res = await axios.get(
                      `${process.env.REACT_APP_API_BASE_URL}/api/federal/transaction-status/${merchantTxnNo}`,
                    );

                    if (res.data.transaction.response_code === "0") {
                      paymentCompleted = true;
                      socket.off("payment_update", socketHandler);
                      await Browser.close();

                      const txnData = res.data.transaction;
                      obj.pay_sign = txnData.merchantTxnNo;
                      obj.order_Iid = `${schemeDatadetails.mgroup}-${schemeDatadetails.member_no}`;
                      obj.pay_Iid = txnData.merchantTxnNo;
                      obj.amount_collected = txnData.amount * 100;

                      const paymentResult = await axios.post(
                        `${process.env.REACT_APP_API_BASE_URL}/api/core/payForScheme`,
                        obj,
                      );

                      const paymentData = {
                        voucher: paymentResult?.data?.nextVoucherNo,
                        agent_name: agentName,
                        pmode: obj.mode,
                        name: obj.name,
                        gross_wt: obj.grossWt,
                        rate: obj.rate,
                        voucher_date: new Date().toLocaleDateString(),
                        amount: txnData.amount,
                      };

                      navigate("/paymentsuccess", {
                        state: {
                          paymentResult: paymentData,
                          additionalPlanDetails,
                        },
                        replace: true,
                      });
                    }
                  } catch (err) {}

                  if (!paymentCompleted) {
                    setTimeout(pollStatus, 1000);
                  }
                };

                setTimeout(pollStatus, 1500);

                await Browser.open({
                  url: hostedFormUrl, // FIXED ✔
                  presentationStyle: "fullscreen",
                });

                // checkApiResponse();

                // ---------------------------------------------------------
                // 🔥 Detect Browser Close Event
                // ---------------------------------------------------------
                // Browser.addListener("browserFinished", () => {
                //   if (!pollingStopped) {
                //     if (loginRole === "agent") {
                //       navigate("/searchcustomers", { replace: true });
                //     } else {
                //       navigate("/savingplanslist", { replace: true });
                //     }
                //   }
                // });

                // ---------------------------------------------------------
                // 🔥 Polling for Payment Status
                // ---------------------------------------------------------

                // Start polling
                // checkApiResponse();
              } catch (err) {
                console.error("Error:", err);
              }
            }
          } catch (error) {
            console.error("Error in online payment process:", error);
            setDisabled(false);
          }
        }

        // *******************************
        // Razor Pay PG
        // *******************************
        else if (pgateway.razorpay_std === "0") {
          // ✅ iOS — completely separate, runs ONLY on iOS
          if (
            Capacitor.isNativePlatform() &&
            Capacitor.getPlatform() === "ios"
          ) {
            const epayRefRes = await axios.get(
              `${process.env.REACT_APP_API_BASE_URL}/api/core/getPaymentGatewayReference`,
            );
            const epayRefId = Number(
              `${APP_CONFIG.STORE_ID}` + epayRefRes.data.refno,
            );

            try {
              setPageLoading(true);
              const paymentResult = await startRazorpayPayment({
                amount: payableAmount,
                currency: "INR",
                customerName: schemeDatadetails.name,
                customerEmail: schemeDatadetails.email || store_email_for_pg,
                customerPhone: schemeDatadetails.mobile,
                description: `Installment #${schemeDatadetails.installCnt}`,
                memberId: schemeDatadetails.member_id,
                installCnt: schemeDatadetails.installCnt,
                keyId: pgateway.razorpay_key_id,
                keySecret: pgateway.razorpay_key_secret,
                storeid: APP_CONFIG.STORE_ID, // dynamic from pgateway
                branchid: useBranch,
                rpayreceipt: `${schemeDatadetails.member_id}-${schemeDatadetails.installCnt}`,
                gold_scheme: schemeDatadetails.gold_scheme,
                goldconvyn: schemeDatadetails.goldconvyn,
              });

              obj.pay_sign = paymentResult.razorpay_payment_id;
              obj.order_Iid = paymentResult.razorpay_order_id;
              obj.pay_Iid = epayRefId;
              obj.amount_collected =
                paymentResult.verificationData?.order?.amount ||
                payableAmount * 100;

              const savePaymentResult = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/api/core/payForScheme`,
                obj,
              );

              if (savePaymentResult) {
                const successPaymentData = {
                  voucher: savePaymentResult?.data?.voucherNo,
                  agent_name: agentName,
                  pmode: obj.mode,
                  nafme: obj.name,
                  gross_wt: obj.grossWt,
                  rate: obj.rate,
                  voucher_date: new Date().toLocaleDateString(),
                  amount: payableAmount,
                };
                navigate("/paymentsuccess", {
                  state: {
                    paymentResult: successPaymentData,
                    additionalPlanDetails,
                  },
                  replace: true,
                });
                setPageLoading(false);
              } else {
                showAlert(
                  "Save Failed",
                  "Failed to save payment. Contact shop.",
                );
                setPageLoading(false);
              }
            } catch (error) {
              console.error("❌ Payment failed:", error);
              setPageLoading(false);
              if (loginRole === "agent") {
                navigate("/searchcustomers", { replace: true });
              } else {
                navigate("/savingplanslist", { replace: true });
              }
            } finally {
              setDisabled(false);
              paymentInProgress.current = false;
              setPageLoading(false);
            }

            // ✅ Android + Web — runs ONLY on android or web
          } else if (
            Capacitor.getPlatform() === "android" ||
            Capacitor.getPlatform() === "web"
          ) {
            // Generate Unique Ref Number
            const epayRefRes = await axios.get(
              `${process.env.REACT_APP_API_BASE_URL}/api/core/getPaymentGatewayReference`,
            );
            const epayRefId = Number(
              `${APP_CONFIG.STORE_ID}` + epayRefRes.data.refno,
            );

            const rpay_obj = {
              rpay_amount: payableAmount, // Razorpay expects amount in paise
              rpay_currency: "INR",
              rpay_receipt: `${schemeDatadetails.member_id}-${schemeDatadetails.installCnt}`,
              rpay_MembId: schemeDatadetails.member_id,
              rpay_keyId: pgateway.razorpay_key_id,
              rpay_KeySecret: pgateway.razorpay_key_secret,
              store_id: APP_CONFIG.STORE_ID, // dynamic from pgateway
              branch_id: useBranch, // dynamic from pgateway
              member_id: schemeDatadetails.member_id,
              gold_scheme: schemeDatadetails.gold_scheme,
              goldconvyn: schemeDatadetails.goldconvyn,
            };

            const amount = rpay_obj.rpay_amount;
            const key_id = rpay_obj.rpay_keyId;

            try {
              // 1️⃣ Create Razorpay order via backend
              const createOrderRes = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL}/api/razorpay/v2/create-order`,
                rpay_obj,
              );

              const order_ID = createOrderRes.data?.order?.id;
              if (!order_ID) {
                showAlert(
                  "Error creating order",
                  "No order ID returned from server",
                );
                return;
              }
              // 2️⃣ Create payment options
              const options = {
                key: key_id,
                order_id: order_ID,
                amount: amount.toString(),
                currency: "INR",
                name: schemeDatadetails.name || "Customer Payment",
                description: `Installment #${schemeDatadetails.installCnt}`,
                email: schemeDatadetails.email || "",
                contact: schemeDatadetails.mobile,
                notes: {
                  member_id: schemeDatadetails.member_id,
                  receipt: rpay_obj.rpay_receipt,
                },
              };

              // 3️⃣ Success handler for Razorpay (native or web)
              const handleSuccess = async (response) => {
                // console.log("🔥 Razorpay payment success callback:", response);

                setVerifying(true); // ADD THIS LINE
                // ✅ Validate response has required fields
                if (
                  !response.razorpay_payment_id ||
                  !response.razorpay_order_id
                ) {
                  console.error("Incomplete payment response:", response);
                  showAlert("Payment Error", "Payment information incomplete");
                  return;
                }

                try {
                  const verifyPayload = {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    member_id: schemeDatadetails.member_id,
                    amount: payableAmount,
                    currency: "INR",
                    raw_response: response,
                    rpay_keySecret: pgateway.razorpay_key_secret,
                    store_id: APP_CONFIG.STORE_ID, // dynamic from pgateway
                    branch_id: useBranch,
                    rpay_receipt: `${schemeDatadetails.member_id}-${schemeDatadetails.installCnt}`,
                    mobile: schemeDatadetails.mobile,
                  };

                  const verifyRes = await axios.post(
                    `${process.env.REACT_APP_API_BASE_URL}/api/razorpay/v2/verify-payment`,
                    verifyPayload,
                  );

                  if (verifyRes.data.success) {
                    const amountPaid = verifyRes.data?.order?.amount;

                    obj.pay_sign = response.razorpay_payment_id;
                    obj.order_Iid = response.razorpay_order_id;
                    // obj.pay_Iid = response.razorpay_payment_id;
                    obj.amount_collected = amountPaid;
                    obj.pay_Iid = epayRefId;

                    const paymentResult = await axios.post(
                      `${process.env.REACT_APP_API_BASE_URL}/api/core/payForScheme`,
                      obj,
                    );

                    if (paymentResult) {
                      setVerifying(false); // ADD THIS LINE
                      const paymentData = {
                        voucher: paymentResult?.data?.voucherNo,
                        agent_name: obj.agentName,
                        pmode: obj.mode,
                        name: obj.name,
                        gross_wt: obj.grossWt,
                        rate: obj.rate,
                        voucher_date: new Date().toLocaleDateString(),
                        amount: payableAmount,
                      };

                      navigate("/paymentsuccess", {
                        state: {
                          paymentResult: paymentData,
                          additionalPlanDetails,
                        },
                        replace: true,
                      });
                    } else {
                      setVerifying(false); // ADD THIS LINE
                      showAlert("Error", "Save Failed.. Contact Shop..");
                    }
                  } else {
                    setVerifying(false); // ADD THIS LINE
                    showAlert(
                      "Payment Verification Failed",
                      "Please contact shop",
                    );
                  }
                } catch (err) {
                  setVerifying(false); // ADD THIS LINE
                  console.error("Error verifying payment:", err);
                  showAlert(
                    "Error",
                    "Payment verification failed. Please contact shop.",
                  );
                }
              };

              // 4️⃣ Native (Android/iOS) flow
              if (Capacitor.isNativePlatform()) {
                setPageLoading(false);
                try {
                  // ✅ ADD THESE
                  // console.log("🔍 About to call MyRazorpay.pay");
                  // console.log("🔍 options.key:", options.key);
                  // console.log("🔍 order_ID:", order_ID);
                  // console.log("🔍 options.amount:", options.amount);
                  // console.log(
                    // "🔍 amount in paise:",
                    // Number(payableAmount) * 100,
                  // );
                  // console.log("🔍 email:", options.email);
                  // console.log("🔍 contact:", options.contact);

                  const result = await MyRazorpay.pay({
                    keyId: options.key,
                    name: options.name,
                    orderId: order_ID,
                    description: options.description,
                    amount: Number(payableAmount) * 100, // ✅ FIXED: was parseInt(options.amount)*100
                    email: options.email,
                    contact: options.contact,
                  });

                  // console.log(
                    // "🔍 MyRazorpay.pay SUCCESS result:",
                    // JSON.stringify(result),
                  // );

                  await handleSuccess({
                    razorpay_payment_id: result.paymentId,
                    razorpay_order_id: order_ID,
                    razorpay_signature: "native_flow_no_signature",
                  });
                } catch (err) {
                  // ✅ ADD THESE - this is where your flow is dying
                  console.error("❌ MyRazorpay.pay threw an error");
                  console.error("❌ err.message:", err?.message);
                  console.error("❌ err.code:", err?.code);
                  console.error("❌ err:", JSON.stringify(err));

                  setPageLoading(false);
                  setDisabled(false);
                  if (loginRole === "agent") {
                    navigate("/searchcustomers", { replace: true });
                  } else {
                    navigate("/savingplanslist", { replace: true }); // ← YOUR PROBLEM IS HERE
                  }
                }
              } else {
                // 5️⃣ Web checkout flow
                const loadRazorpayScript = () =>
                  new Promise((resolve) => {
                    if (window.Razorpay) return resolve(true);
                    const script = document.createElement("script");
                    script.src = "https://checkout.razorpay.com/v1/checkout.js";
                    script.onload = () => resolve(true);
                    script.onerror = () => resolve(false);
                    document.body.appendChild(script);
                  });

                const loaded = await loadRazorpayScript();
                if (!loaded || typeof window.Razorpay !== "function") {
                  showAlert(
                    "Error",
                    "Failed to load Razorpay SDK. Please check connection.",
                  );
                  return;
                }

                const rzp = new window.Razorpay({
                  ...options,
                  handler: handleSuccess,
                  modal: {
                    ondismiss: () => {
                      console.log("🔍 Razorpay modal dismissed by user");
                      setDisabled(false);

                      const targetRoute =
                        loginRole === "agent"
                          ? "/searchcustomers"
                          : "/savingplanslist";
                      console.log("🔍 Navigating to:", targetRoute);
                      navigate(targetRoute, { replace: true });
                    },
                    escape: true,
                    confirm_close: false,
                  },
                  config: {
                    method: { upi: { flow: "intent" } },
                    display: { preferences: { show_default_blocks: true } },
                    webview_intent: true,
                  },
                });

                rzp.open();
              }
            } catch (error) {
              console.error("Error during Razorpay payment:", error);
              setDisabled(false);
            }
          }
        }

        // else if (pgateway.razorpay_std === "0") {

        //   // Generate Unique Ref Number
        //   const epayRefRes = await axios.get(
        //     `${process.env.REACT_APP_API_BASE_URL}/api/core/getPaymentGatewayReference`
        //   );
        //   const epayRefId = Number(
        //     `${APP_CONFIG.STORE_ID}` + epayRefRes.data.refno
        //   );

        //   try {
        //     setPageLoading(true);

        //     // ✅ Single call — hook handles web, android, ios internally
        //     const paymentResult =  await startRazorpayPayment({
        //       amount: payableAmount,
        //       currency: "INR",
        //       customerName: schemeDatadetails.name,
        //       customerEmail: schemeDatadetails.email || store_email_for_pg,
        //       customerPhone: schemeDatadetails.mobile,
        //       description: `Installment #${schemeDatadetails.installCnt}`,
        //       memberId: schemeDatadetails.member_id,
        //       installCnt: schemeDatadetails.installCnt,
        //       keyId: pgateway.razorpay_key_id,
        //       keySecret: pgateway.razorpay_key_secret,
        //     });

        //     // Update obj with payment details
        //     obj.pay_sign = paymentResult.razorpay_payment_id;
        //     obj.order_Iid = `${schemeDatadetails.mgroup}-${schemeDatadetails.member_no}`;
        //     obj.pay_Iid = epayRefId;
        //     obj.amount_collected = paymentResult.verificationData?.order?.amount || (payableAmount * 100);

        //     // Save payment to backend
        //     const savePaymentResult = await axios.post(
        //       `${process.env.REACT_APP_API_BASE_URL}/api/core/payForScheme`,
        //       obj
        //     );

        //     if (savePaymentResult) {
        //       const successPaymentData = {
        //         voucher: savePaymentResult?.data?.voucherNo,
        //         agent_name: agentName,
        //         pmode: obj.mode,
        //         name: obj.name,          // ✅ fixed typo: was "nafme"
        //         gross_wt: obj.grossWt,
        //         rate: obj.rate,
        //         voucher_date: new Date().toLocaleDateString(),
        //         amount: payableAmount,
        //       };

        //       navigate("/paymentsuccess", {
        //         state: { paymentResult: successPaymentData },
        //         replace: true,
        //       });
        //     } else {
        //       showAlert("Save Failed", "Failed to save payment. Contact shop.");
        //     }

        //   } catch (error) {
        //     console.error("❌ Payment failed:", error);
        //     if (loginRole === "agent") {
        //       navigate("/searchcustomers", { replace: true });
        //     } else {
        //       navigate("/savingplanslist", { replace: true });
        //     }
        //   } finally {
        //     setDisabled(false);
        //     paymentInProgress.current = false;
        //     setPageLoading(false);
        //   }
        // }
        else if (pgateway.razorpay_std === "52") {
          // ========================== PhonePe Payment Gateway Flow =======================
          if (isCancelled.current) return;
          // Generate Unique Ref Number
          const epayRefRes = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/api/core/getPaymentGatewayReference`,
          );
          const epayRefId = Number(
            `${APP_CONFIG.STORE_ID}` + epayRefRes.data.refno,
          );

          const ppay_obj = {
            store_id: APP_CONFIG.STORE_ID, // dynamic from pgateway
            branch_id: useBranch, // dynamic from pgateway
            member_id: schemeDatadetails.member_id,
            amount: payableAmount,
            mobile: schemeDatadetails.mobile,
            scheme_id: `${schemeDatadetails.mgroup}-${schemeDatadetails.member_no}`,
            receiptno: `${schemeDatadetails.member_id}-${schemeDatadetails.installCnt}`,
            gold_scheme: schemeDatadetails.gold_scheme,
            goldconvyn: schemeDatadetails.goldconvyn,
          };
          const amount = ppay_obj.ppay_amount;
          // console.log(ppay_obj);
          if (isCancelled.current) return; // ✅ ADD
          try {
            // 1️⃣ Create PhonePe order via backend
            const createOrderRes = await axios.post(
              `${process.env.REACT_APP_API_BASE_URL}/api/phonepe/create-order`,
              ppay_obj,
            );

            // console.log("📦 PhonePe Order Response:", createOrderRes.data);

            const order_token = createOrderRes.data?.orderToken;
            const order_ID = createOrderRes.data?.orderId;
            const merchant_order_id = createOrderRes.data?.merchantOrderId;
            const orderamount = createOrderRes.data?.amount;
            // console.log("token:", order_token);
            // console.log("orderId:", order_ID);

            if (!order_token || !order_ID) {
              showAlert(
                "Error creating order",
                "No order token returned from server",
              );
              setPageLoading(false);
              setDisabled(false);
              return;
            }

            const handleSuccess = async (response) => {
              // ✅ SANDBOX MODE: skip all verification + API calls
              if (pgateway?.razorpay_env === "SANDBOX") {
                setVerifying(false);

                navigate("/paymentsuccess", {
                  state: {
                    paymentResult: {
                      voucher: "testing",
                      agent_name: obj.agentName,
                      pmode: obj.mode,
                      name: obj.name,
                      gross_wt: obj.grossWt,
                      rate: obj.rate,
                      voucher_date: new Date().toLocaleDateString(),
                      amount: payableAmount,
                    },
                    additionalPlanDetails,
                  },
                  replace: true,
                });

                return; // 🚨 STOP everything below
              }

              // console.log("🔥 PhonePe payment success callback:", response);
              setVerifying(true); // 🔥 START LOADER HERE
              const MAX_DURATION = 300000; // 5 minutes total
              const CHECK_INTERVAL = 5000; // ✅ was 3000// check DB every 5 seconds
              const ROUND_DURATION = 15000; // ✅ was 9000// each round is 15 seconds
              const startTime = Date.now();

              // ✅ Navigate to success page
              const goToSuccess = async (verifiedPayment) => {
                try {
                  // ✅ Update obj same as old pattern
                  obj.pay_sign = verifiedPayment?.transactionId || "";
                  obj.order_Iid = verifiedPayment?.orderid;
                  obj.pay_Iid = epayRefId;
                  obj.amount_collected = payableAmount * 100;

                  const payResult = await axios.post(
                    `${process.env.REACT_APP_API_BASE_URL}/api/core/payForScheme`,
                    obj,
                  );

                  if (payResult?.data?.voucherNo) {
                    setVerifying(false);
                    navigate("/paymentsuccess", {
                      state: {
                        paymentResult: {
                          voucher: payResult?.data?.voucherNo,
                          agent_name: obj.agentName,
                          pmode: obj.mode,
                          name: obj.name,
                          gross_wt: obj.grossWt,
                          rate: obj.rate,
                          voucher_date: new Date().toLocaleDateString(),
                          amount: payableAmount,
                        },
                        additionalPlanDetails,
                      },
                      replace: true,
                    });
                  } else {
                    setVerifying(false);
                    showAlert(
                      "Error",
                      "Payment done but save failed. Contact shop.",
                    );
                    setDisabled(false);
                  }
                } catch (err) {
                  setVerifying(false);
                  console.error("payForScheme error:", err);
                  alert(
                    "📱 Frontend] verifyPayment response:\n\n" +
                      JSON.stringify(err, null, 2),
                  );
                  showAlert(
                    "Error",
                    "Payment done but save failed. Contact shop.",
                  );
                  setDisabled(false);
                }

                setPageLoading(false);
              };

              // ✅ Navigate to failed page
              const goToFailed = (reason, message) => {
                setVerifying(false); // 🔥 STOP LOADER
                navigate("/paymentfailed", {
                  state: {
                    reason: reason || "FAILED",
                    message: message || "Payment failed",
                    merchantOrderId: merchant_order_id,
                    amount: payableAmount,
                  },
                  replace: true,
                });
                setPageLoading(false);
                setDisabled(false);
              };

              // ✅ One round = check DB every 5 sec for 100 seconds
              const runVerifyRound = () => {
                return new Promise((resolve) => {
                  const roundStart = Date.now();

                  const checkDB = async () => {
                    try {
                      const verifyRes = await axios.post(
                        `${process.env.REACT_APP_API_BASE_URL}/api/phonepe/verify-payment`,
                        { merchantOrderId: merchant_order_id },
                      );

                      const data = verifyRes.data;
                      // alert(
                      //   "📱 Frontend] verifyPayment response:\n\n" +
                      //     JSON.stringify(data, null, 2),
                      // );
                      // console.log(
                      //   `[Frontend] verifyPayment response: ${
                      //     data.status
                      //   }, elapsed: ${Math.floor(
                      //     (Date.now() - startTime) / 1000,
                      //   )}s`,
                      // );

                      if (data.success) {
                        goToSuccess(data.paymentDetails);
                        resolve("SUCCESS");
                        return;
                      }

                      if (
                        data.status === "FAILED" ||
                        data.status === "EXPIRED"
                      ) {
                        goToFailed(data.errorCode || data.status, data.message);
                        resolve("FAILED");
                        return;
                      }

                      // ✅ Still PENDING - check if round is done
                      const roundElapsed = Date.now() - roundStart;
                      if (roundElapsed >= ROUND_DURATION) {
                        // console.log(
                          // `[Frontend] 100 seconds round done, calling verifyManually`,
                        // );
                        resolve("PENDING"); // round ended, go to manual check
                        return;
                      }

                      // ✅ Round not done, wait 5 sec and check DB again
                      setTimeout(checkDB, CHECK_INTERVAL);
                    } catch (err) {
                      console.error("Error in verifyPayment check:", err);
                      resolve("ERROR");
                    }
                  };

                  // Start first check after 5 seconds
                  setTimeout(checkDB, CHECK_INTERVAL);
                });
              };

              // ✅ Call verifyPaymentManually once between rounds
              const runManualCheck = async () => {
                try {
                  const manualRes = await axios.post(
                    `${process.env.REACT_APP_API_BASE_URL}/api/phonepe/verify-payment-manually`,
                    { merchantOrderId: merchant_order_id },
                  );

                  const data = manualRes.data;
                  // alert(
                  //   "📱 Frontend] verifyPayment response:\n\n" +
                  //     JSON.stringify(data, null, 2),
                  // );

                  if (data.success) {
                    goToSuccess(data.paymentDetails);
                    return "SUCCESS";
                  }

                  if (data.status === "FAILED" || data.status === "EXPIRED") {
                    goToFailed(data.errorCode || data.status, data.message);
                    return "FAILED";
                  }

                  return "PENDING";
                } catch (err) {
                  console.error("Error in verifyManually check:", err);
                  return "ERROR";
                }
              };

              // ✅ Main loop - keep running rounds until 5 minutes
              const runLoop = async () => {
                while (true) {
                  const totalElapsed = Date.now() - startTime;

                  // ✅ 5 minutes exceeded
                  if (totalElapsed >= MAX_DURATION) {
                    // console.log(
                      // `[Frontend] 5 minutes exceeded, final manual check`,
                    // );
                    const finalResult = await runManualCheck();
                    if (finalResult === "PENDING" || finalResult === "ERROR") {
                      goToFailed(
                        "TIMEOUT",
                        "Payment could not be confirmed. Please contact shop.",
                      );
                    }
                    return;
                  }

                  // ✅ Run one 100 second round of DB checking
                  const roundResult = await runVerifyRound();

                  if (roundResult === "SUCCESS" || roundResult === "FAILED") {
                    return; // already navigated
                  }

                  if (roundResult === "ERROR") {
                    goToFailed(
                      "ERROR",
                      "Payment verification failed. Please contact shop.",
                    );
                    return;
                  }

                  // ✅ Round ended with PENDING - call manual check once
                  const manualResult = await runManualCheck();

                  if (manualResult === "SUCCESS" || manualResult === "FAILED") {
                    return; // already navigated
                  }

                  if (manualResult === "ERROR") {
                    goToFailed(
                      "ERROR",
                      "Payment verification failed. Please contact shop.",
                    );
                    return;
                  }

                  // ✅ Manual also PENDING - start next round
                  // console.log(
                    // `[Frontend] Manual check also pending, starting next round`,
                  // );
                }
              };

              // ✅ Start the loop
              runLoop();
            };

            // 3️⃣ Native (Android/iOS) flow
            if (Capacitor.isNativePlatform()) {
              if (isCancelled.current) return; // ✅ ADD
              try {
                if (!phonePeReady) {
                  // Initialize PhonePe SDK if not already initialized
                  const initResult = await PhonePePaymentPlugin.init({
                    environment: pgateway.razorpay_env, // SANDBOX or PRODUCTION pgateway.razorpay_env
                    merchantId: pgateway.razorpay_merchant_id,
                    flowId: `FLOW_${Date.now()}`,
                    enableLogging: false,
                  });

                  //console.log("✅ PhonePe SDK initialized:", initResult);
                  //  alert("📱 PhonePe Transaction Result:\n\n" + JSON.stringify(initResult, null, 2));
                  if (!initResult.status) {
                    showAlert("Error", "PhonePe SDK initialization failed");
                    setPageLoading(false); // 🔥 STOP LOADER - SDK init failed
                    setDisabled(false);
                    return;
                  }
                }
                if (isCancelled.current) return;
                // Start PhonePe transaction
                const paymentRequest = {
                  merchantId: pgateway.razorpay_merchant_id,
                  token: order_token,
                  orderId: order_ID,
                  paymentMode: {
                    type: "PAY_PAGE", // Shows all payment options
                  },
                };

                //console.log("💳 Starting PhonePe transaction:", paymentRequest);
                if (isCancelled.current) return;
                const result = await PhonePePaymentPlugin.startTransaction({
                  request: JSON.stringify(paymentRequest),
                  appSchema: "myapp", // Your app's deep link scheme
                  showLoaderFlag: true,
                });
                setPageLoading(false);
                // console.log("📱 PhonePe Transaction Result:", result);
                // alert(
                //   "📱 PhonePe Transaction Result:\n\n" +
                //     JSON.stringify(result, null, 2),
                // );

                if (result.status === "SUCCESS") {
                  await handleSuccess({
                    transactionId: result.transactionId || merchant_order_id,
                    status: "SUCCESS",
                  });
                } else if (result.status === "FAILURE") {
                  try {
                    await axios.post(
                      `${process.env.REACT_APP_API_BASE_URL}/api/phonepe/cancel-pending`,
                      { merchant_order_id: merchant_order_id },
                    );
                  } catch (e) {
                    console.error("Cancel pending failed:", e);
                  }
                  navigate("/paymentfailed", {
                    state: {
                      reason: "CANCELLED",
                      message: result.error || "Transaction failed.",
                      merchantOrderId: merchant_order_id,
                      amount: payableAmount,
                    },
                    replace: true,
                  });
                  setDisabled(false);
                } else if (result.status === "INTERRUPTED") {
                  try {
                    await axios.post(
                      `${process.env.REACT_APP_API_BASE_URL}/api/phonepe/cancel-pending`,
                      { merchant_order_id: merchant_order_id },
                    );
                  } catch (e) {
                    console.error("Cancel pending failed:", e);
                  }
                  navigate("/paymentfailed", {
                    state: {
                      reason: "CANCELLED",
                      message: "Payment was cancelled.",
                      merchantOrderId: merchant_order_id,
                      amount: payableAmount,
                    },
                    replace: true,
                  });
                  setDisabled(false);
                }
              } catch (err) {
                console.error("❌ Native PhonePe error:", err);
                showAlert("Error", `Payment failed: ${err.message}`);
                setPageLoading(false);
                setDisabled(false);
                if (loginRole === "agent") {
                  navigate("/searchcustomers", { replace: true });
                } else {
                  navigate("/savingplanslist", { replace: true });
                }
              }
            } else {
              // 4️⃣ Web flow (not implemented yet)
              showAlert(
                "Web Payment Not Available",
                "PhonePe payments are only available in the mobile app. Please use the app to make payments.",
              );
              setPageLoading(false);
              setDisabled(false);
            }
          } catch (error) {
            console.error("Error during PhonePe payment:", error);
            showAlert("Error", `Payment failed: ${error.message}`);
            setPageLoading(false);
            setDisabled(false);
            if (loginRole === "agent") {
              navigate("/searchcustomers", { replace: true });
            } else {
              navigate("/savingplanslist", { replace: true });
            }
          }
        }
      }

      // ================================================================
      // Pay with cash
      // ================================================================
      else {
        console.log("without online payment", count++);
        // apiClient.showLoader();

        try {
          // const paymentResult = await apiClient.makePayment(obj);
          obj.amount_collected = payableAmount * 100;
          const paymentResult = await axios.post(
            `${process.env.REACT_APP_API_BASE_URL}/api/core/payForScheme`,
            obj, // This is the request body (req.body on backend)
          );
          if (paymentResult) {
            obj["voucher"] = paymentResult;
            obj["agent_name"] = "agent_name";
            obj["pmode"] = obj["mode"];
            obj["gross_wt"] = obj["grossWt"];
            obj["rate"] = obj["goldRate"];

            if (schemeDatadetails.PayInstall > 1) {
              obj["PaidIntall"] = `${schemeDatadetails.currentInstalment} - ${
                schemeDatadetails.currentInstalment +
                (schemeDatadetails.PayInstall - 1)
              }`;
            } else {
              obj["PaidIntall"] = schemeDatadetails.currentInstalment;
            }

            obj["PrevBal"] = amountCollected;
            obj["PrevGold"] = goldCollected;
            obj["CurrBal"] = amountCollected + payableAmount;
            obj["CurrGold"] = goldCollected + schemeDatadetails.g_balance;
            obj["voucher_date"] = new Date().toLocaleDateString();

            // console.log('====================================');
            // console.log("payment obj", obj);
            // console.log('====================================');

            const paymentData = {
              voucher: paymentResult?.data?.nextVoucherNo, // if needed
              agent_name: obj.agentName,
              pmode: obj.mode,
              name: obj.name,
              gross_wt: obj.grossWt,
              rate: obj.rate,
              voucher_date: obj.txDate,
              amount: obj.amount_collected / 100,
              // Add any other plain fields you want to display
            };

            // data.printMessage = data.paymentSuccessPrintMsg(obj);
            // navigate("/paymentsuccess", {
            //     state: { paymentResult: paymentData }
            // });
            setPageLoading(false);
            navigate("/paymentsuccess", {
              state: { paymentResult: paymentData, additionalPlanDetails },
              replace: true,
            });
          } else {
            showAlert(
              "Save Failed.. Contact Shop..",
              "Save Failed " + schemeDatadetails.scheme_amount,
            );
            setSchemeData((prev) => ({
              ...prev,
              schemeToPayAmount: schemeDatadetails.scheme_amount,
            }));
          }
        } catch (error) {
          console.error("Error making payment:", error);
          //   showAlert("Error", "Payment processing failed");
          setPageLoading(false);
        } finally {
          paymentInProgress.current = false;
          setDisabled(false);
          setPageLoading(false);
        }
      }
    } else {
      showAlert(
        "Amount Not Accepted",
        `Amount can only be multiples of ${schemeDatadetails.scheme_amount}`,
      );
      setPageLoading(false);
      navigate("/savingplanslist");
      setSchemeData((prev) => ({
        ...prev,
        schemeToPayAmount: schemeDatadetails.scheme_amount,
      }));
      setDisabled(false);
    }
  };

  const onAmountChange = () => {
    if (schemeData.gold_scheme === "1") {
      setSchemeData((prev) => ({
        ...prev,
        g_balance: (
          schemeData.schemeToPayAmount / schemeData.store_gold_rate
        ).toFixed(3),
      }));
    } else {
      setSchemeData((prev) => ({ ...prev, g_balance: 0 }));
    }
  };

  const incrementQty = async () => {
    if (
      schemeData.PayInstall + 1 > schemeData.instal_limit_permonth &&
      schemeData.instal_limit_permonth > 0
    ) {
      showAlert(
        "Monthly Install Limit Exceeds",
        `Only ${schemeData.instal_limit_permonth} Installments allowed Per Month`,
      );
    } else {
      const newPayInstall = schemeData.PayInstall + 1;
      const newSchemeToPayAmount = schemeData.scheme_amount * newPayInstall;

      setSchemeData((prev) => ({
        ...prev,
        PayInstall: newPayInstall,
        schemeToPayAmount: newSchemeToPayAmount,
        g_balance:
          schemeData.gold_scheme === "1"
            ? (newSchemeToPayAmount / schemeData.store_gold_rate).toFixed(3)
            : 0,
      }));
    }
  };

  const decrementQty = () => {
    const newPayInstall = Math.max(schemeData.PayInstall - 1, 1);
    const newSchemeToPayAmount = schemeData.scheme_amount * newPayInstall;

    setSchemeData((prev) => ({
      ...prev,
      PayInstall: newPayInstall,
      schemeToPayAmount: newSchemeToPayAmount,
      g_balance:
        schemeData.gold_scheme === "1"
          ? (newSchemeToPayAmount / schemeData.store_gold_rate).toFixed(3)
          : 0,
    }));
  };

  const getGeoencoder = async (latitude, longitude) => {
    try {
      // console.log("Requesting reverse geocode for: ", latitude, longitude);
      const result = await NativeGeocoder.reverseGeocode(
        JSON.parse(latitude),
        JSON.parse(longitude),
        geoencoderOptions,
      );

      // console.log("Geocoding result: ", result);

      if (result && result.length > 0) {
        const addressObj = result[0];
        // console.log("Address Object: ", addressObj);
        const obj = [];

        for (let key in addressObj) {
          if (addressObj.hasOwnProperty(key)) {
            obj.push(addressObj[key]);
          }
        }

        // console.log("Address components: ", obj);
        obj.reverse();

        if (obj.length > 4) {
          setGeoAddress1((obj[0] + " " + obj[1]).trim());
          setGeoAddress2((obj[2] + " " + obj[3] + " " + obj[4]).trim());
          setGeoPlace(obj[6] || "");
        } else {
          setGeoAddress1("");
          setGeoAddress2("");
          setGeoPlace("");
        }

        // console.log("geo_address1: " + geo_address1);
        // console.log("geo_address2: " + geo_address2);
        // console.log("geo_place: " + geo_place);
        return "1";
      }
    } catch (error) {
      console.error("Error getting location", error);
      throw error;
    }
  };

  const print = async (obj) => {
    // console.log(obj);
    obj.voucher = obj.voucher_no;
    obj.amount_collected = obj.amount;
    obj.group_id = obj.mcode;
    // obj.agentName = obj.ent_by;
    obj.customerMobileNumber = obj.mobile;
    obj.mcode = `${obj.mgroup}-${obj.member_no}`;
    obj.agent_name = obj.ent_by;
    obj.PrevBal = obj.CurInstlAmt - obj.amount;
    obj.PrevGold = obj.CurInstlGrs - obj.gross_wt;
    obj.CurrBal = obj.CurInstlAmt;
    obj.CurrGold = obj.CurInstlGrs;
    obj.pmode = obj.pmode;
    obj.PaidIntall = obj.CurInstlCnt;

    if (obj.usrlatitude && obj.usrlongitude) {
      try {
        setGeoAddress2("");
        // console.log("GeoAddress:" + obj.usrlatitude + " - " + obj.usrlongitude);

        try {
          await getGeoencoder(obj.usrlatitude, obj.usrlongitude);
          obj.location = geo_address2 + "";
          // console.log("With Location");
          // console.log(obj);
          // data.printMessage = data.paymentSuccessPrintMsg(obj);
          // console.log(data.printMessage);

          // Show print modal
          // const modal = await ModalController.create({
          //     component: PrinterListComponent,
          // });
          // await modal.present();
        } catch (e) {
          console.log("With Err");
        }
      } catch (e) {
        console.log("With out Location - catch eee");
        console.log(obj);
        // data.printMessage = data.paymentSuccessPrintMsg(obj);

        // const modal = await ModalController.create({
        //     component: PrinterListComponent,
        //     cssClass: "clynic-modal-class",
        //     backdropDismiss: false,
        // });
        // await modal.present();
      }
    } else {
      obj.location = "";
      console.log("With out Location");
      console.log(obj);
      // data.printMessage = data.paymentSuccessPrintMsg(obj);

      // const modal = await ModalController.create({
      //     component: PrinterListComponent,
      //     cssClass: "clynic-modal-class",
      //     backdropDismiss: false,
      // });
      // await modal.present();
    }
  };

  const payWithRazor_hdfc = (obj, pg_obj) => {
    return new Promise((resolve, reject) => {
      const email = schemeData.email || store_email_for_pg;
      const mobile = schemeData.mobile || "0";
      let isBackPress = true;
      setIsAuthorize(false);

      const pageContent = `
        <form id='MyForm' method="POST" action="https://api.razorpay.com/v1/checkout/embedded">
          <input type="hidden" name="key_id" value="${data.razorpay_key_id}">
          <input type="hidden" name="order_id" value="${obj.rpay_okey}">
          <input type="hidden" name="amount" value="${
            schemeData.schemeToPayAmount * 100
          }">
          <input type="hidden" name="name" value="${schemeData.name}">
          <input type="hidden" name="description" value="${
            schemeData.store_name
          } Gold Advance Purchase Payment">
          <input type="hidden" name="prefill[email]" value="${email}">
          <input type="hidden" name="prefill[contact]" value="${mobile}">
          <input type="hidden" name="notes[transaction_id]" value="${
            obj.rpay_transid
          }">
          <input type="hidden" name="callback_url" value="https://kumuduapps.in:8443/hdfcRpayResponse.jsp">
          <button>Submit</button>
        </form>
        <script type="text/javascript">document.getElementById("MyForm").submit();</script>
      `;

      const pageContentUrl = "data:text/html;base64," + btoa(pageContent);
      const theOtherUrl = "https://kumuduapps.in:8443/hdfcRpayResponse.jsp";
      // const browserRef = InAppBrowser.create(pageContentUrl, "_self", "hidden=no,location=no");
      const browserRef = "";

      browserRef.on("loadstart").subscribe((event) => {
        if (event.url.includes("paysuccess.jsp")) {
          const Myurl = event.url;
          const params = {};
          const regex = /[?&]([^=#]+)=([^&#]*)/g;
          let match;

          while ((match = regex.exec(Myurl))) {
            params[match[1]] = match[2];
          }

          setRzPayResId(params.razorpay_payment_id);
          setRzPayResOrdid(params.razorpay_order_id);
          setRzPayResSignid(params.razorpay_signature);

          const pay_res1 = {
            res_pay_id: params.razorpay_payment_id,
            res_ord_id: params.razorpay_order_id,
            res_sign: params.razorpay_signature,
          };

          const res = `${params.razorpay_payment_id}|${params.razorpay_signature}`;
          browserRef.close();
          resolve(res);
        }
      });

      browserRef.on("loadstop").subscribe((event) => {
        if (event.url.includes("authorized")) {
          setIsAuthorize(true);
          isBackPress = false;
        }

        if (event.url.includes("status=failed")) {
          setIsAuthorize(false);
          isBackPress = false;
          browserRef.close();
          resolve("0");
          reject("0");
        }

        if (event.url === theOtherUrl) {
          // console.log("Match");
        }

        browserRef.on("exit").subscribe(() => {
          if (isBackPress) {
            // console.log("Browser Closed");
            resolve("0");
            reject("0");
          }
        });
      });
    });
  };

  const validate_Email = async () => {
    let valid = false;
    if (schemeData.email) {
      const re =
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      valid = re.test(schemeData.email);
    }
    setIsEmailValid(valid);
    return valid;
  };

  const payWithRazor = (obj, pg_obj) => {
    return new Promise((resolve, reject) => {
      const options = {
        description: "City Gold Fashion Jewellery",
        currency: "INR",
        key: data.razorpay_key_id,
        amount: schemeData.schemeToPayAmount * 100,
        order_id: obj.rpay_okey,
        name: "HDFC VAS",
        notes: {
          transaction_id: obj.rpay_transid,
        },
        prefill: {
          email: schemeData.email,
          contact: schemeData.mobile,
          name: schemeData.name,
        },
        theme: {
          color: "#F37254",
        },
        modal: {
          ondismiss: function () {
            alert("dismissed");
          },
        },
      };

      const successCallback = (success) => {
        const pay_iid = success.razorpay_payment_id;
        const order_iid = success.razorpay_order_id;
        const signature = success.razorpay_signature;

        setRzPayResId(success.razorpay_payment_id);
        setRzPayResOrdid(success.razorpay_order_id);
        setRzPayResSignid(success.razorpay_signature);

        const pay_res1 = {
          res_pay_id: success.razorpay_payment_id,
          res_ord_id: success.razorpay_order_id,
          res_sign: success.razorpay_signature,
        };

        const res = `${success.razorpay_payment_id}|${success.razorpay_signature}`;
        resolve(res);
      };

      const cancelCallback = (error) => {
        resolve("0");
        reject("0");
      };

      console.log("RazorPayCheckuot");
      // RazorpayCheckout.on("payment.success", successCallback);
      // RazorpayCheckout.on("payment.cancel", cancelCallback);
      // RazorpayCheckout.open(options);
    });
  };

  const RazorPay_WithOptions = async (obj, pg_obj) => {
    try {
      const amount = schemeData.schemeToPayAmount * 100;
      const orderId = obj.rpay_okey;
      const options = {
        key: data.razorpay_key_id,
        amount: String(amount),
        name: schemeData.store_name,
        description: "Payment for Order ID: " + orderId,
        order_id: orderId,
        prefill: {
          name: schemeData.name,
          email: schemeData.email || "default@example.com",
          contact: schemeData.mobile || "0000000000",
        },
        method: {
          upi: true,
        },
      };

      // const data = await Checkout.open(options);

      if (data && data.response) {
        const response = data.response;
        const result = `${response.razorpay_payment_id}|${response.razorpay_signature}`;
        return result;
      } else {
        throw new Error("Payment response is invalid");
      }
    } catch (error) {
      console.error("Payment Error:", error);
      const errorAlertData = JSON.stringify(error, null, 2);
      // alert(`Payment Error:\n${errorAlertData}`);
      throw (
        error.response?.error?.description ||
        "An unexpected error occurred during payment."
      );
    }
  };

  const loadRazorpayScript = () => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      // console.log("Razorpay script loaded successfully.");
    };
    document.body.appendChild(script);
  };

  const generateAddress = (addressObj) => {
    return new Promise((resolve, reject) => {
      // console.log("inside address2");
      const obj = [];
      for (let key in addressObj) {
        obj.push(addressObj[key]);
      }
      obj.reverse();
      setGeoAddress1((obj[0] + " " + obj[1]).trim());
      setGeoAddress2((obj[2] + " " + obj[3] + " " + obj[4]).trim());
      setGeoPlace(obj[6]);
      // console.log("geo_address1 : " + geo_address1);
      // console.log("geo_address2 : " + geo_address2);
      // console.log("geo_place : " + geo_place);
      resolve("1");
    });
  };

  const setFocus = (nextElement) => {
    nextElement.focus();
  };

  const CaclCardChqAmt = async () => {
    if (+schemeData.extracash <= +schemeData.schemeToPayAmount) {
      const crdchq = +schemeData.schemeToPayAmount - +schemeData.extracash;
      setSchemeData((prev) => ({ ...prev, cardchq: crdchq }));
    } else {
      showAlert(
        "Cash Amt Exceeds",
        "Enter Cash Amount Less than Credit Card / Neft / Cheque Amt",
      );
      setSchemeData((prev) => ({ ...prev, extracash: 0 }));
    }
  };

  function get8DigitRandom() {
    return Math.floor(10000000 + Math.random() * 90000000);
  }

  const showAlert = async (header, message) => {
    alert(message);
  };
  //   if (showBackWarning){
  //  return(<Dialog open={showBackWarning} disableEscapeKeyDown>
  //         <DialogTitle>⚠️  Please wait! Payment In Progress... </DialogTitle>
  //         <DialogContent>
  //           <Typography>
  //             We are saving your payment. Do not go back or close the app —
  //       if you do, your payment will be lost and your money will be deducted.
  //           </Typography>
  //         </DialogContent>
  //         <DialogActions>
  //           <Button
  //             variant="contained"
  //             fullWidth
  //             onClick={() => setShowBackWarning(false)}
  //             sx={{ backgroundColor: "#B98A46", color: "#fff" }}
  //           >
  //             Stay & Wait
  //           </Button>
  //         </DialogActions>
  //       </Dialog>)}
  // 🔥 PhonePe verification loader
  if (phonePeVerifying) {
    return (
      <Box
        position="fixed"
        top="50%"
        left="50%"
        sx={{ transform: "translate(-50%, -50%)" }}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <CircularProgress size={60} sx={{ color: "#B98A46" }} />
        <Typography variant="h7" mt={2} textAlign="center">
          Verifying Payment...
          <br />
          Please do not press the back button.
        </Typography>
        {/* ✅ Warning dialog renders ON TOP of the loader */}
        <Dialog open={showBackWarning} disableEscapeKeyDown>
          <DialogTitle sx={{ textAlign: "center" }}>
            <WarningAmberRoundedIcon
              sx={{ fontSize: 40, color: "#B98A46", mb: 1 }}
            />
            <br />
            Please wait! Payment In Progress...
          </DialogTitle>
          <DialogContent>
            <Typography
              variant="body2"
              sx={{ fontSize: "0.9rem", textAlign: "center" }}
            >
              We are saving your payment. Do not go back or close the app — if
              you do, your payment will be lost and your money will be deducted.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              fullWidth
              onClick={() => setBackWarning(false)} // ✅ use setBackWarning
              sx={{ backgroundColor: "#B98A46", color: "#fff" }}
            >
              Stay & Wait
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }
  // 🔥 ADD THIS - Show loader when pageLoading is true
  if (pageLoading) {
    return (
      <Box
        position="fixed"
        top="50%"
        left="50%"
        sx={{ transform: "translate(-50%, -50%)" }}
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <CircularProgress size={60} sx={{ color: "#B98A46" }} />
        <Typography variant="h7" mt={2} textAlign="center" whiteSpace="nowrap">
          Redirecting to Payment...
          <br />
          Please do not press the back button.
        </Typography>
      </Box>
    );
  }
  return null;
};

export default SchemeDetailPage;
