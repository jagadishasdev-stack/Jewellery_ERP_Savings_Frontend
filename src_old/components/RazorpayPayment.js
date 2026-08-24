import { useState, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { Checkout } from "capacitor-razorpay";
import axios from "axios";
import MyRazorpay from "../plugins/my-razorpay";
// Custom Hook for Razorpay Payment
const useRazorpayPayment = () => {
  const [loading, setLoading] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  //  rpayreceipt: paymentConfig.rpayreceipt,
  //             installCnt: paymentConfig.installCnt,
  //             keyId: paymentConfig.keyId,
  //             keySecret: paymentConfig.keySecret,
  //             store_id:paymentConfig.storeid,
  //             branch_id:paymentConfig.branchid,
  // Create Razorpay Order
  const createOrder = useCallback(async (orderData) => {
    try {
      const orderPayload = {
        rpay_amount: orderData.amount, // Convert to paise
        rpay_currency: orderData.currency || "INR",
        rpay_receipt: orderData.rpayreceipt,
        member_id: orderData.memberId,
        rpay_keyId: orderData.keyId,
        rpay_KeySecret: orderData.keySecret,
        store_id: orderData.store_id,
        branch_id: orderData.branch_id,
        gold_scheme: orderData.gold_scheme,
        goldconvyn: orderData.goldconvyn,
      };

      //console.log("📦 Creating order with payload:", orderPayload);

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/razorpay/v2/create-order`,
        orderPayload,
      );

      // console.log("✅ Order created successfully:", response.data);
      return response.data.order;
    } catch (error) {
      console.error("❌ Error creating order:", error);
      throw new Error("Failed to create order. Please try again.");
    }
  }, []);

  const verifyPayment = useCallback(
    async ({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      raw_response,
      memberId,
      amount,
      currency,
      keySecret,
      store_id,
      branch_id,
      mobile,
      rpay_receipt, // ✅ ADD THIS
    }) => {
      try {
        const verifyPayload = {
          razorpay_order_id: razorpay_order_id,
          razorpay_payment_id: razorpay_payment_id,
          razorpay_signature: razorpay_signature,
          raw_response: raw_response,
          member_id: memberId,
          amount: amount,
          currency: currency,
          rpay_keySecret: keySecret,
          store_id: store_id,
          branch_id: branch_id,
          mobile: mobile,
          rpay_receipt: rpay_receipt, // ✅ ADD THIS
        };

        const verifyRes = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/razorpay/v2/verify-payment`,
          verifyPayload,
        );

        return verifyRes.data;
      } catch (error) {
        console.error("❌ Verification error:", error);
        throw error;
      }
    },
    [],
  );

  // Handle Native iOS Payment
  const handleNativePayment = useCallback(
    async (order, paymentConfig) => {
      try {
        const options = {
          key: paymentConfig.keyId,
          amount: order.amount.toString(),
          currency: order.currency,
          name: paymentConfig.customerName || "Payment",
          description: paymentConfig.description || "Payment for services",
          order_id: order.id,
          //callback_url: "Mehta Anand://razorpay",
          prefill: {
            name: paymentConfig.customerName,
            email: paymentConfig.customerEmail,
            contact: paymentConfig.customerPhone,
          },
          //recurring: 1 , // This key value pair is mandatory for Intent Recurring Payment.
          theme: {
            color: "#563ef1",
          },
        };

        //console.log("📱 Opening native checkout with options:", options);

        // Open Razorpay checkout for native
        const result = await Checkout.open(options);

        //console.log("✅ Native payment result:", result);

        if (
          result.response.razorpay_order_id &&
          result.response.razorpay_payment_id
        ) {
          const paymentResponse = result.response;

          // Verify payment
          const verificationResult = await verifyPayment({
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_signature: "native_flow_no_signature",
            memberId: paymentConfig.memberId,
            amount: paymentConfig.amount,
            raw_response: paymentResponse,
            currency: paymentConfig.currency,
            keySecret: paymentConfig.keySecret,
            store_id: paymentConfig.storeid,
            branch_id: paymentConfig.branchid,
            mobile: paymentConfig.customerPhone,
            rpay_receipt: paymentConfig.rpayreceipt,
          });

          if (verificationResult.success) {
            return {
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              amount: paymentConfig.amount,
              verificationData: verificationResult,
            };
          } else {
            throw new Error("Payment verification failed");
          }
        } else {
          throw new Error("Invalid payment response");
        }
      } catch (error) {
        console.error("❌ Error in native payment:", error);
        throw error;
      }
    },
    [verifyPayment],
  );

  // const handleNativePayment = useCallback(async (order, paymentConfig) => {
  //     const platform = Capacitor.getPlatform(); // "android" or "ios"

  //     try {
  //         if (platform === "android") {
  //             // ✅ Android - uses MyRazorpay plugin
  //             const result = await MyRazorpay.pay({
  //                 keyId: paymentConfig.keyId,
  //                 name: paymentConfig.customerName || "Payment",
  //                 orderId: order.id,
  //                 description: paymentConfig.description || "Payment for services",
  //                 amount: order.amount, // already in paise from backend
  //                 email: paymentConfig.customerEmail,
  //                 contact: paymentConfig.customerPhone,
  //             });

  //             if (!result || !result.paymentId) {
  //                 throw new Error("Invalid payment response from Android");
  //             }

  //             // ✅ Verify payment for Android too
  //             const verificationResult = await verifyPayment({
  //                 razorpay_order_id: order.id,
  //                 razorpay_payment_id: result.paymentId,
  //                 razorpay_signature: result.signature || "native_android_no_signature",
  //                 memberId: paymentConfig.memberId,
  //                 amount: paymentConfig.amount,
  //                 raw_response: result,
  //                 currency: paymentConfig.currency,
  //                 keySecret: paymentConfig.keySecret,
  //             });

  //             if (!verificationResult.success) {
  //                 throw new Error("Android payment verification failed");
  //             }

  //             return {
  //                 razorpay_payment_id: result.paymentId,
  //                 razorpay_order_id: order.id,
  //                 razorpay_signature: result.signature || "native_android_no_signature",
  //                 amount: paymentConfig.amount,
  //                 verificationData: verificationResult,
  //             };

  //         } else {
  //             // ✅ iOS - uses Checkout plugin (capacitor-razorpay)
  //             const options = {
  //                 key: paymentConfig.keyId,
  //                 amount: order.amount.toString(),
  //                 currency: order.currency,
  //                 name: paymentConfig.customerName || "Payment",
  //                 description: paymentConfig.description || "Payment for services",
  //                 order_id: order.id,
  //                 prefill: {
  //                     name: paymentConfig.customerName,
  //                     email: paymentConfig.customerEmail,
  //                     contact: paymentConfig.customerPhone,
  //                 },
  //                 theme: {
  //                     color: "#563ef1",
  //                 },
  //             };

  //             const result = await Checkout.open(options);

  //             if (!result || !result.response) {
  //                 throw new Error("Invalid payment response from iOS");
  //             }

  //             const paymentResponse = result.response;

  //             // ✅ Verify payment for iOS
  //             const verificationResult = await verifyPayment({
  //                 razorpay_order_id: paymentResponse.razorpay_order_id,
  //                 razorpay_payment_id: paymentResponse.razorpay_payment_id,
  //                 razorpay_signature: paymentResponse.razorpay_signature || "native_flow",
  //                 memberId: paymentConfig.memberId,
  //                 amount: paymentConfig.amount,
  //                 raw_response: paymentResponse,
  //                 currency: paymentConfig.currency,
  //                 keySecret: paymentConfig.keySecret,
  //             });

  //             if (!verificationResult.success) {
  //                 throw new Error("iOS payment verification failed");
  //             }

  //             return {
  //                 razorpay_payment_id: paymentResponse.razorpay_payment_id,
  //                 razorpay_order_id: paymentResponse.razorpay_order_id,
  //                 razorpay_signature: paymentResponse.razorpay_signature,
  //                 amount: paymentConfig.amount,
  //                 verificationData: verificationResult,
  //             };
  //         }

  //     } catch (error) {
  //         console.error("❌ Error in native payment:", error);
  //         throw error;
  //     }
  // }, [verifyPayment]);

  // Main payment initiator

  const initiatePayment = useCallback(
    async (paymentConfig) => {
      if (loading) {
        console.warn("⚠️ Payment already in progress");
        return;
      }
      //console.log('amount',paymentConfig.amount);
      try {
        setLoading(true);

        // Step 1: Create order
        const order = await createOrder({
          amount: paymentConfig.amount,
          currency: paymentConfig.currency || "INR",
          memberId: paymentConfig.memberId,
          rpayreceipt: paymentConfig.rpayreceipt,
          installCnt: paymentConfig.installCnt,
          keyId: paymentConfig.keyId,
          keySecret: paymentConfig.keySecret,
          store_id: paymentConfig.storeid,
          branch_id: paymentConfig.branchid,
        });

        if (!order || !order.id) {
          throw new Error("Invalid order response");
        }

        // console.log("✅ Order created, order ID:", order);

        // Step 2: Process payment based on platform
        const paymentResult = await handleNativePayment(order, paymentConfig);

        setLoading(false);
        return paymentResult;
      } catch (error) {
        console.error("❌ Error initiating payment:", error);
        setLoading(false);
        throw error;
      }
    },
    [isNative, createOrder, handleNativePayment],
  );

  return {
    initiatePayment,
    loading,
    isNative,
  };
};

export default useRazorpayPayment;
