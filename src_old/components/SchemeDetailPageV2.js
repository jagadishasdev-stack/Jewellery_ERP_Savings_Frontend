import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
} from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { Checkout } from "capacitor-razorpay";
import { PhonePePaymentPlugin } from "ionic-capacitor-phonepe-pg";
import MyRazorpay from "../plugins/my-razorpay";
import axios from "axios";

import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import {
  Box,
  CircularProgress,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

import APP_CONFIG from "../config/constants";
import { AuthContext } from "../contexts/AuthContext";
import { usePaymentGateway } from "../contexts/PaymentGatewayProvider";
import "./PhonePePayment.css";

const API_BASE = process.env.REACT_APP_API_BASE_URL;

/**
 * A global flag so the app-wide hardware back-button handler (in App.js)
 * knows a payment is being verified and must NOT navigate away.
 */
const setVerifyingFlag = (val) => {
  if (typeof window !== "undefined") {
    window.__PAYMENT_VERIFYING__ = val;
  }
};

const showAlert = (header, message) => {
  // Simple cross-platform alert (same behaviour as the original component).
  window.alert(message);
};

const SchemeDetailPageV2 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { memberCode, groupCode, payableAmount, selectedOption } = useParams();

  const goldCon = location?.state?.goldCon;
  const refNumber = location?.state?.refNumber || "";
  const additionalPlanDetails = location?.state?.additionalPlanDetails;
  // ✅ Optimisation: PaymentScreen already holds the full member-with-group
  // record. When it is forwarded here we reuse it and skip the API call.
  const passedRecord = location?.state?.schemeRecord;
  const useBranch = additionalPlanDetails?.branch;

  const { adminUser, loginRole } = useContext(AuthContext);
  const { gateway, phonePeReady } = usePaymentGateway();

  // ── UI state ────────────────────────────────────────────────────────────
  const [pageLoading, setPageLoading] = useState(true);
  const [verifying, setVerifyingState] = useState(false);
  const [showBackWarning, setShowBackWarning] = useState(false);

  // ── Refs (avoid re-renders / capture latest value in async flows) ─────────
  const paymentInProgress = useRef(false);
  const isCancelled = useRef(false);
  const verifyingRef = useRef(false);
  const storeEmailForPg = useRef("");

  const setVerifying = useCallback((val) => {
    verifyingRef.current = val;
    setVerifyingFlag(val);
    setVerifyingState(val);
  }, []);

  // Agent identity (only meaningful for agent logins)
  const agentId = loginRole === "agent" ? adminUser?.agent_id || 0 : 0;
  const agentName = loginRole === "agent" ? adminUser?.agent_name || "" : "";

  const goToSuccess = useCallback(
    (paymentData) => {
      navigate("/paymentsuccess", {
        state: { paymentResult: paymentData, additionalPlanDetails },
        replace: true,
      });
    },
    [navigate, additionalPlanDetails],
  );

  const goAfterCancel = useCallback(() => {
    if (loginRole === "agent") {
      navigate("/searchcustomers", { replace: true });
    } else {
      navigate("/savingplanslist", { replace: true });
    }
  }, [loginRole, navigate]);

  // ──────────────────────────────────────────────────────────────────────────
  // Prevent the user from leaving while a payment is being verified.
  // Works on Android (hardware back) and iOS/web (history / swipe back).
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let backHandler = null;

    // Seed a history entry so a swipe/gesture back has something to consume.
    window.history.pushState({ paymentPage: true }, "", window.location.href);

    const handlePopState = () => {
      if (verifyingRef.current) {
        // Re-push to keep blocking, then warn the user.
        window.history.pushState(
          { paymentPage: true },
          "",
          window.location.href,
        );
        setShowBackWarning(true);
      }
    };
    window.addEventListener("popstate", handlePopState);

    const registerHardwareBack = async () => {
      if (Capacitor.getPlatform() !== "android") return;
      backHandler = await App.addListener("backButton", () => {
        // While verifying, block and warn. Otherwise let the global
        // handler in App.js manage navigation (avoids double-handling).
        if (verifyingRef.current) {
          setShowBackWarning(true);
        }
      });
    };
    registerHardwareBack();

    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (backHandler) backHandler.remove();
      setVerifyingFlag(false);
    };
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // Initial load: resolve the payment gateway + scheme record, then start pay.
  // ──────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    isCancelled.current = false;
    initialise();
    return () => {
      isCancelled.current = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resolvePaymentGateway = useCallback(async () => {
    // Prefer the globally cached gateway; only fetch when unavailable.
    let pgDetails = gateway;
    if (!pgDetails) {
      const response = await axios.get(
        `${API_BASE}/api/core/payment-gateway/${APP_CONFIG.STORE_ID}/${useBranch}`,
      );
      pgDetails = response.data;
    }
    storeEmailForPg.current = pgDetails.store_email || "";
    // Map to the same shape the payment flows expect.
    return {
      ...pgDetails,
      razorpay_merchant_id: pgDetails.merchant_id,
      razorpay_merchant_name: pgDetails.merchant_name,
      razorpay_key_id: pgDetails.key_id,
      razorpay_key_secret: pgDetails.key_secret,
      razorpay_url: pgDetails.url,
      razorpay_posturl: pgDetails.posturl,
      razorpay_callbackurl: pgDetails.callbackurl,
      razorpay_std: pgDetails.standered,
      razorpay_env: pgDetails.env_ment,
    };
  }, [gateway, useBranch]);

  const initialise = async () => {
    try {
      // ✅ PaymentScreen always forwards a fresh member-with-group record,
      // so this page only needs to resolve the payment gateway.
      const pg = await resolvePaymentGateway();
      if (isCancelled.current) return;
      await startPayment(pg, passedRecord);
    } catch (error) {
      console.error("Error loading payment data:", error);
      setPageLoading(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Build the exact payForScheme payload (unchanged backend contract).
  // ──────────────────────────────────────────────────────────────────────────
  const buildPaymentPayload = (record) => ({
    agent_id: agentId,
    agentName: agentName,
    scheme_id: record.Scheme_id + "",
    group_id: record.mgroup,
    tenure: record.No_of_draw + "",
    member_id: record.member_id + "",
    amount_collected: payableAmount + "",
    mode: selectedOption,
    grossWt: goldCon + "",
    goldRate: record.store_gold_rate + "",
    mcode: `${groupCode}-${memberCode}`,
    txDate: new Date().toISOString(),
    customerMobileNumber: record.mobile,
    name: record.name,
    chqNo: refNumber || record.chqNo,
    storeID: APP_CONFIG.STORE_ID,
    branch: record.branch,
    order_Iid: "",
    pay_Iid: "",
    pay_sign: "",
    MaturityDate: record.MaturityDate + "",
    dueInstallNo: record.dueInstallNo + "",
    latitude: "",
    longitude: "",
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
    cardchq: record.cardchq || "0",
    extracash: record.extracash || "0",
    chequedt: record.chequedt || "",
    bank: record.bank || "0",
    gold_scheme: record.gold_scheme,
    goldconvyn: record.goldconvyn,
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Payment orchestration.
  // ──────────────────────────────────────────────────────────────────────────
  const startPayment = async (pgateway, record) => {
    if (paymentInProgress.current) return;
    paymentInProgress.current = true;
    setPageLoading(true);

    const obj = buildPaymentPayload(record);

    // All user-facing validation (amount limits, adjusted/completed scheme,
    // daily & monthly limits, ref-number for cheque/NEFT/card) is performed in
    // PaymentScreen before it navigates here. This page only orchestrates the
    // actual payment.

    // ── Route to the correct payment method ────────────────────────────────
    if (selectedOption === "6") {
      if (pgateway.razorpay_std === "0") {
        await runRazorpay(pgateway, record, obj);
      } else if (pgateway.razorpay_std === "52") {
        await runPhonePe(pgateway, record, obj);
      } else {
        showAlert("Payment Unavailable", "Online payment is not configured.");
        setPageLoading(false);
      }
    } else {
      // Offline: Cash / Cheque / Card / NEFT (agent "Pay with Cash")
      await runOffline(record, obj);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RAZORPAY  (merged iOS + Android + Web, razorpay_std === "0")
  // ══════════════════════════════════════════════════════════════════════════
  const runRazorpay = async (pgateway, record, obj) => {
    try {
      // 1️⃣ Unique payment-gateway reference number.
      const epayRefRes = await axios.get(
        `${API_BASE}/api/core/getPaymentGatewayReference`,
      );
      const epayRefId = Number(
        `${APP_CONFIG.STORE_ID}` + epayRefRes.data.refno,
      );

      // 2️⃣ Create the Razorpay order via backend (unchanged payload).
      const rpay_obj = {
        rpay_amount: payableAmount,
        rpay_currency: "INR",
        rpay_receipt: `${record.member_id}-${record.installCnt}`,
        rpay_MembId: record.member_id,
        rpay_keyId: pgateway.razorpay_key_id,
        rpay_KeySecret: pgateway.razorpay_key_secret,
        store_id: APP_CONFIG.STORE_ID,
        branch_id: useBranch,
        member_id: record.member_id,
        gold_scheme: record.gold_scheme,
        goldconvyn: record.goldconvyn,
        // ✅ Fresh gold rate from the pay-time member-with-group call, plus the
        // reference number generated for this order.
        rate: record.store_gold_rate,
        voucher_no: epayRefId,
      };

      const createOrderRes = await axios.post(
        `${API_BASE}/api/razorpay/v2/create-order`,
        rpay_obj,
      );
      const order = createOrderRes.data?.order;
      const order_ID = order?.id;
      if (!order_ID) {
        showAlert("Error creating order", "No order ID returned from server");
        setPageLoading(false);
        return;
      }

      // 3️⃣ Shared verify → save → navigate for every platform.
      const finalizeSuccess = async (response) => {
        setVerifying(true);
        if (!response.razorpay_payment_id || !response.razorpay_order_id) {
          setVerifying(false);
          showAlert("Payment Error", "Payment information incomplete");
          return;
        }
        try {
          const verifyRes = await axios.post(
            `${API_BASE}/api/razorpay/v2/verify-payment`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              member_id: record.member_id,
              amount: payableAmount,
              currency: "INR",
              raw_response: response,
              rpay_keySecret: pgateway.razorpay_key_secret,
              store_id: APP_CONFIG.STORE_ID,
              branch_id: useBranch,
              rpay_receipt: `${record.member_id}-${record.installCnt}`,
              mobile: record.mobile,
            },
          );

          if (!verifyRes.data.success) {
            setVerifying(false);
            showAlert("Payment Verification Failed", "Please contact shop");
            return;
          }

          obj.pay_sign = response.razorpay_payment_id;
          obj.order_Iid = response.razorpay_order_id;
          obj.pay_Iid = epayRefId;
          obj.amount_collected =
            verifyRes.data?.order?.amount ?? payableAmount * 100;

          const paymentResult = await axios.post(
            `${API_BASE}/api/core/payForScheme`,
            obj,
          );
          setVerifying(false);

          if (paymentResult) {
            goToSuccess({
              voucher: paymentResult?.data?.voucherNo,
              agent_name: obj.agentName,
              pmode: obj.mode,
              name: obj.name,
              gross_wt: obj.grossWt,
              rate: obj.goldRate,
              voucher_date: new Date().toLocaleDateString(),
              amount: payableAmount,
            });
          } else {
            showAlert("Error", "Save Failed.. Contact Shop..");
          }
        } catch (err) {
          setVerifying(false);
          console.error("Error verifying payment:", err);
          showAlert("Error", "Payment verification failed. Please contact shop.");
        }
      };

      const options = {
        key: pgateway.razorpay_key_id,
        order_id: order_ID,
        amount: order.amount?.toString() ?? String(Number(payableAmount) * 100),
        currency: order.currency || "INR",
        name: record.name || "Customer Payment",
        description: `Installment #${record.installCnt}`,
        email: record.email || storeEmailForPg.current || "",
        contact: record.mobile,
        prefill: {
          name: record.name,
          email: record.email || storeEmailForPg.current || "",
          contact: record.mobile,
        },
        notes: {
          member_id: record.member_id,
          receipt: rpay_obj.rpay_receipt,
        },
      };

      const platform = Capacitor.getPlatform();

      // 4️⃣ iOS → capacitor-razorpay Checkout plugin.
      if (Capacitor.isNativePlatform() && platform === "ios") {
        setPageLoading(false);
        try {
          const result = await Checkout.open({
            key: options.key,
            amount: options.amount,
            currency: options.currency,
            name: options.name,
            description: options.description,
            order_id: order_ID,
            prefill: options.prefill,
            theme: { color: "#563ef1" },
          });
          const res = result.response;
          await finalizeSuccess({
            razorpay_payment_id: res.razorpay_payment_id,
            razorpay_order_id: res.razorpay_order_id || order_ID,
            razorpay_signature:
              res.razorpay_signature || "native_flow_no_signature",
          });
        } catch (err) {
          console.error("❌ iOS Razorpay error:", err);
          setPageLoading(false);
          goAfterCancel();
        }
        return;
      }

      // 5️⃣ Android → MyRazorpay custom native plugin.
      if (Capacitor.isNativePlatform()) {
        setPageLoading(false);
        try {
          const result = await MyRazorpay.pay({
            keyId: options.key,
            name: options.name,
            orderId: order_ID,
            description: options.description,
            amount: Number(payableAmount) * 100,
            email: options.email,
            contact: options.contact,
          });
          await finalizeSuccess({
            razorpay_payment_id: result.paymentId,
            razorpay_order_id: order_ID,
            razorpay_signature: "native_flow_no_signature",
          });
        } catch (err) {
          console.error("❌ Android Razorpay error:", err);
          setPageLoading(false);
          goAfterCancel();
        }
        return;
      }

      // 6️⃣ Web → Razorpay checkout.js.
      const loaded = await loadRazorpayWebScript();
      if (!loaded || typeof window.Razorpay !== "function") {
        showAlert("Error", "Failed to load Razorpay SDK. Please check connection.");
        setPageLoading(false);
        return;
      }
      setPageLoading(false);
      const rzp = new window.Razorpay({
        ...options,
        handler: finalizeSuccess,
        modal: {
          ondismiss: () => goAfterCancel(),
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
    } catch (error) {
      console.error("Error during Razorpay payment:", error);
      setPageLoading(false);
    }
  };

  const loadRazorpayWebScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  // ══════════════════════════════════════════════════════════════════════════
  // PHONEPE  (razorpay_std === "52", native only)
  // ══════════════════════════════════════════════════════════════════════════
  const runPhonePe = async (pgateway, record, obj) => {
    if (isCancelled.current) return;
    try {
      const epayRefRes = await axios.get(
        `${API_BASE}/api/core/getPaymentGatewayReference`,
      );
      const epayRefId = Number(
        `${APP_CONFIG.STORE_ID}` + epayRefRes.data.refno,
      );

      const ppay_obj = {
        store_id: APP_CONFIG.STORE_ID,
        branch_id: useBranch,
        member_id: record.member_id,
        amount: payableAmount,
        mobile: record.mobile,
        scheme_id: `${record.mgroup}-${record.member_no}`,
        receiptno: `${record.member_id}-${record.installCnt}`,
        gold_scheme: record.gold_scheme,
        goldconvyn: record.goldconvyn,
        // ✅ Fresh gold rate from the pay-time member-with-group call, plus the
        // reference number generated for this order.
        rate: record.store_gold_rate,
        voucher_no: epayRefId,
      };

      if (isCancelled.current) return;

      const createOrderRes = await axios.post(
        `${API_BASE}/api/phonepe/create-order`,
        ppay_obj,
      );
      const order_token = createOrderRes.data?.orderToken;
      const order_ID = createOrderRes.data?.orderId;
      const merchant_order_id = createOrderRes.data?.merchantOrderId;

      if (!order_token || !order_ID) {
        showAlert("Error creating order", "No order token returned from server");
        setPageLoading(false);
        return;
      }

      const goToFailed = (reason, message) => {
        setVerifying(false);
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
      };

      const savePhonePeSuccess = async (verifiedPayment) => {
        try {
          obj.pay_sign = verifiedPayment?.transactionId || "";
          obj.order_Iid = verifiedPayment?.orderid;
          obj.pay_Iid = epayRefId;
          obj.amount_collected = payableAmount * 100;

          const payResult = await axios.post(
            `${API_BASE}/api/core/payForScheme`,
            obj,
          );

          if (payResult?.data?.voucherNo) {
            setVerifying(false);
            goToSuccess({
              voucher: payResult?.data?.voucherNo,
              agent_name: obj.agentName,
              pmode: obj.mode,
              name: obj.name,
              gross_wt: obj.grossWt,
              rate: obj.goldRate,
              voucher_date: new Date().toLocaleDateString(),
              amount: payableAmount,
            });
          } else {
            setVerifying(false);
            showAlert("Error", "Payment done but save failed. Contact shop.");
          }
        } catch (err) {
          setVerifying(false);
          console.error("payForScheme error:", err);
          showAlert("Error", "Payment done but save failed. Contact shop.");
        }
        setPageLoading(false);
      };

      const handleSuccess = async () => {
        // ✅ Sandbox: skip verification and go straight to success.
        if (pgateway?.razorpay_env === "SANDBOX") {
          setVerifying(false);
          goToSuccess({
            voucher: "testing",
            agent_name: obj.agentName,
            pmode: obj.mode,
            name: obj.name,
            gross_wt: obj.grossWt,
            rate: obj.goldRate,
            voucher_date: new Date().toLocaleDateString(),
            amount: payableAmount,
          });
          return;
        }

        setVerifying(true);
        await verifyPhonePe(merchant_order_id, savePhonePeSuccess, goToFailed);
      };

      // 3️⃣ Native PhonePe transaction (Android/iOS).
      if (Capacitor.isNativePlatform()) {
        if (isCancelled.current) return;
        try {
          if (!phonePeReady) {
            const initResult = await PhonePePaymentPlugin.init({
              environment: pgateway.razorpay_env,
              merchantId: pgateway.razorpay_merchant_id,
              flowId: `FLOW_${Date.now()}`,
              enableLogging: false,
            });
            if (!initResult.status) {
              showAlert("Error", "PhonePe SDK initialization failed");
              setPageLoading(false);
              return;
            }
          }
          if (isCancelled.current) return;

          const paymentRequest = {
            merchantId: pgateway.razorpay_merchant_id,
            token: order_token,
            orderId: order_ID,
            paymentMode: { type: "PAY_PAGE" },
          };

          const result = await PhonePePaymentPlugin.startTransaction({
            request: JSON.stringify(paymentRequest),
            appSchema: "myapp",
            showLoaderFlag: true,
          });
          setPageLoading(false);

          if (result.status === "SUCCESS") {
            await handleSuccess();
          } else if (
            result.status === "FAILURE" ||
            result.status === "INTERRUPTED"
          ) {
            try {
              await axios.post(`${API_BASE}/api/phonepe/cancel-pending`, {
                merchant_order_id,
              });
            } catch (e) {
              console.error("Cancel pending failed:", e);
            }
            navigate("/paymentfailed", {
              state: {
                reason: "CANCELLED",
                message:
                  result.status === "FAILURE"
                    ? result.error || "Transaction failed."
                    : "Payment was cancelled.",
                merchantOrderId: merchant_order_id,
                amount: payableAmount,
              },
              replace: true,
            });
          }
        } catch (err) {
          console.error("❌ Native PhonePe error:", err);
          showAlert("Error", `Payment failed: ${err.message}`);
          setPageLoading(false);
          goAfterCancel();
        }
      } else {
        showAlert(
          "Web Payment Not Available",
          "PhonePe payments are only available in the mobile app. Please use the app to make payments.",
        );
        setPageLoading(false);
      }
    } catch (error) {
      console.error("Error during PhonePe payment:", error);
      showAlert("Error", `Payment failed: ${error.message}`);
      setPageLoading(false);
      goAfterCancel();
    }
  };

  // PhonePe verification loop: poll the DB, fall back to manual checks,
  // up to a 5-minute ceiling (unchanged backend contract & timings).
  const verifyPhonePe = async (merchantOrderId, onSuccess, onFailed) => {
    const MAX_DURATION = 300000; // 5 minutes
    const CHECK_INTERVAL = 5000;
    const ROUND_DURATION = 15000;
    const startTime = Date.now();

    const runVerifyRound = () =>
      new Promise((resolve) => {
        const roundStart = Date.now();
        const checkDB = async () => {
          try {
            const { data } = await axios.post(
              `${API_BASE}/api/phonepe/verify-payment`,
              { merchantOrderId },
            );
            if (data.success) {
              onSuccess(data.paymentDetails);
              return resolve("SUCCESS");
            }
            if (data.status === "FAILED" || data.status === "EXPIRED") {
              onFailed(data.errorCode || data.status, data.message);
              return resolve("FAILED");
            }
            if (Date.now() - roundStart >= ROUND_DURATION) {
              return resolve("PENDING");
            }
            setTimeout(checkDB, CHECK_INTERVAL);
          } catch (err) {
            console.error("Error in verifyPayment check:", err);
            resolve("ERROR");
          }
        };
        setTimeout(checkDB, CHECK_INTERVAL);
      });

    const runManualCheck = async () => {
      try {
        const { data } = await axios.post(
          `${API_BASE}/api/phonepe/verify-payment-manually`,
          { merchantOrderId },
        );
        if (data.success) {
          onSuccess(data.paymentDetails);
          return "SUCCESS";
        }
        if (data.status === "FAILED" || data.status === "EXPIRED") {
          onFailed(data.errorCode || data.status, data.message);
          return "FAILED";
        }
        return "PENDING";
      } catch (err) {
        console.error("Error in verifyManually check:", err);
        return "ERROR";
      }
    };

    while (true) {
      if (Date.now() - startTime >= MAX_DURATION) {
        const finalResult = await runManualCheck();
        if (finalResult === "PENDING" || finalResult === "ERROR") {
          onFailed(
            "TIMEOUT",
            "Payment could not be confirmed. Please contact shop.",
          );
        }
        return;
      }

      const roundResult = await runVerifyRound();
      if (roundResult === "SUCCESS" || roundResult === "FAILED") return;
      if (roundResult === "ERROR") {
        onFailed("ERROR", "Payment verification failed. Please contact shop.");
        return;
      }

      const manualResult = await runManualCheck();
      if (manualResult === "SUCCESS" || manualResult === "FAILED") return;
      if (manualResult === "ERROR") {
        onFailed("ERROR", "Payment verification failed. Please contact shop.");
        return;
      }
      // both pending → next round
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // OFFLINE  (Cash / Cheque / Card / NEFT — single shared implementation)
  // ══════════════════════════════════════════════════════════════════════════
  const runOffline = async (record, obj) => {
    try {
      obj.amount_collected = payableAmount * 100;
      const paymentResult = await axios.post(
        `${API_BASE}/api/core/payForScheme`,
        obj,
      );
      if (paymentResult) {
        setPageLoading(false);
        goToSuccess({
          voucher: paymentResult?.data?.nextVoucherNo,
          agent_name: obj.agentName,
          pmode: obj.mode,
          name: obj.name,
          gross_wt: obj.grossWt,
          rate: obj.goldRate,
          voucher_date: obj.txDate,
          amount: obj.amount_collected / 100,
        });
      } else {
        showAlert(
          "Save Failed.. Contact Shop..",
          "Save Failed " + record.scheme_amount,
        );
        setPageLoading(false);
      }
    } catch (error) {
      console.error("Error making payment:", error);
      setPageLoading(false);
    } finally {
      paymentInProgress.current = false;
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────────────────
  if (verifying) {
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
              onClick={() => setShowBackWarning(false)}
              sx={{ backgroundColor: "#B98A46", color: "#fff" }}
            >
              Stay & Wait
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

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

export default SchemeDetailPageV2;
