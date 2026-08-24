import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { PhonePePaymentPlugin } from 'ionic-capacitor-phonepe-pg';
import { Capacitor } from '@capacitor/core';
import APP_CONFIG from '../config/constants';
import { AuthContext } from "../contexts/AuthContext";
const PaymentGatewayContext = createContext();

export const usePaymentGateway = () => useContext(PaymentGatewayContext);

export const PaymentGatewayProvider = ({ children }) => {
  const [gateway, setGateway] = useState(null);
  const [phonePeReady, setPhonePeReady] = useState(false);
  const [loading, setLoading] = useState(true);
 const { adminUser } = useContext(AuthContext);
  useEffect(() => {
    if (!adminUser?.branch) return;

    const init = async () => {
      try {
        // 1️⃣ Fetch payment gateway details once
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/core/payment-gateway/${APP_CONFIG.STORE_ID}/${adminUser.branch}`
        );
        const pgDetails = response.data;
        setGateway(pgDetails);

        // 2️⃣ If PhonePe is the active gateway (std=52) and we are on native, initialise SDK once
        if (pgDetails.standered === "52" && Capacitor.isNativePlatform() && !phonePeReady) {
          await PhonePePaymentPlugin.init({
            environment: pgDetails.env_ment,
            merchantId: pgDetails.merchant_id,
            flowId: `FLOW_${Date.now()}`,
            enableLogging: false,
          });
          setPhonePeReady(true);
          console.log("✅ PhonePe SDK globally initialised");
        }
      } catch (err) {
        console.error("Failed to preload payment gateway:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [adminUser?.branch]);

  return (
    <PaymentGatewayContext.Provider value={{ gateway, phonePeReady, loading }}>
      {children}
    </PaymentGatewayContext.Provider>
  );
};