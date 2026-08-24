import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import APP_CONFIG from "../config/constants";

export const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [storeAssets, setStoreAssets] = useState(null);
  const [storePlans, setStorePlans] = useState([]);
  const [digiGoldPlan, setDigiGoldPlan] = useState(null);
  const [dgGold22Plan, setDgGold22Plan] = useState(null);
  const [dgGold24Plan, setDgGold24Plan] = useState(null);
  const [dgSilverPlan, setDgSilverPlan] = useState(null);
  const [isEcomEnable, setIsEcomEnable] = useState(false); // <-- new state
  const STORE_ID = APP_CONFIG.STORE_ID;

  // --- branches list (unchanged) ---
  const [branches, setBranches] = useState([]);
  const [plan, setPlan] = useState(null);
  const [Allplan, setAllPlan] = useState([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const branchId = APP_CONFIG.BRANCH;

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/core/getbranch/${STORE_ID}`,
        );
        setBranches(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to fetch branches:", err);
      }
    };
    if (STORE_ID) fetchBranches();
  }, [STORE_ID]);

  // Fetch store data & plans
  useEffect(() => {
    const fetchStoreData = async () => {
      const BRANCH = APP_CONFIG.BRANCH;
      if (!STORE_ID || !BRANCH) {
        console.warn("Missing STORE_ID or BRANCH in APP_CONFIG");
        return;
      }

      try {
        // ---- Fetch Store Assets ----
        const assetsUrl = `${process.env.REACT_APP_API_BASE_URL}/api/auth/store-assets/${STORE_ID}`;
        const assetsRes = await axios.get(assetsUrl);
        const data = assetsRes.data.data;
        setStoreAssets(data);

        // Extract is_ecom_enable from storeinfo
        const storeInfo = data?.storeinfo?.[0];
        if (storeInfo && typeof storeInfo.is_ecom_enable === "boolean") {
          setIsEcomEnable(storeInfo.is_ecom_enable);
        } else {
          setIsEcomEnable(false); // fallback
        }

        // ---- Fetch Plans ----
        const plansUrl = `${process.env.REACT_APP_API_BASE_URL}/api/core/getGroups?store_id=${STORE_ID}&branch=${branchId}`;
        const plansRes = await axios.get(plansUrl);
        const plans = plansRes?.data || [];
        setStorePlans(plans);

        // ---- Extract DigiGold plans ----
        const dgPlan = plans.find((plan) => plan.gold_scheme === "1");
        setDigiGoldPlan(dgPlan || null);

        const extracted = plans.reduce(
          (acc, p) => {
            if (p.gold_scheme === "1") {
              const name = p.code?.toUpperCase();
              if (name === "DIGIG22") acc.gold22 = p;
              if (name === "DIGIG24") acc.gold24 = p;
              if (name === "DIGIS") acc.silver = p;
            }
            return acc;
          },
          { gold24: null, gold22: null, silver: null },
        );

        setDgGold22Plan(extracted.gold22);
        setDgGold24Plan(extracted.gold24);
        setDgSilverPlan(extracted.silver);
      } catch (err) {
        console.error("Failed to load store data:", err);
        setStoreAssets(null);
        setStorePlans([]);
        setDigiGoldPlan(null);
        setDgGold22Plan(null);
        setDgGold24Plan(null);
        setDgSilverPlan(null);
        setIsEcomEnable(false);
      }
    };

    fetchStoreData();
  }, [STORE_ID]);

  // const fetchUserPlan = async (userInfo) => {
  //   // ... unchanged ...
  //   if (!userInfo) return;
  //   setIsLoadingPlans(true);
  //   const { STORE_ID } = APP_CONFIG;
  //   const url = `${process.env.REACT_APP_API_BASE_URL}/api/core/member-with-group?idAndGroup=${userInfo.mobile}&storeID=${STORE_ID}`;

  //   try {
  //     const { data } = await axios.get(url);
  //     if (data.length === 0) {
  //       setPlan([]);
  //       setAllPlan([]);
  //     } else {
  //       const latestPlan = data.reduce((latest, current) =>
  //         new Date(current.member_created_at) >
  //         new Date(latest.member_created_at)
  //           ? current
  //           : latest,
  //       );
  //       setPlan(latestPlan);
  //       setAllPlan(data);
  //     }
  //   } catch (err) {
  //     console.error("Failed to fetch plans:", err);
  //     setPlan([]);
  //   } finally {
  //     setIsLoadingPlans(false);
  //   }
  // };

  const fetchUserPlan = async (userInfo) => {
    if (!userInfo || userInfo?.role === "agent") return;
    setIsLoadingPlans(true);
    const { STORE_ID } = APP_CONFIG;
    const url = `${process.env.REACT_APP_API_BASE_URL}/api/core/member-with-group?idAndGroup=${userInfo.mobile}&storeID=${STORE_ID}`;

    try {
      const { data } = await axios.get(url);
      const currentDate = new Date(); // current date and time

      // Filter out plans where info === "A" AND MaturityDate < currentDate
      const filteredData = data.filter((plan) => {
        const isInfoA = plan.info === "A";
        const maturityDate = new Date(plan.MaturityDate);
        const isPast = maturityDate < currentDate;
        // Keep the plan if NOT (both conditions true)
        return !(isInfoA && isPast);
      });

      if (filteredData.length === 0) {
        setPlan([]);
        setAllPlan([]);
      } else {
        const latestPlan = filteredData.reduce((latest, current) =>
          new Date(current.member_created_at) >
          new Date(latest.member_created_at)
            ? current
            : latest,
        );
        setPlan(latestPlan);
        setAllPlan(filteredData);
      }
    } catch (err) {
      console.error("Failed to fetch plans:", err);
      setPlan([]);
    } finally {
      setIsLoadingPlans(false);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        storeAssets,
        storePlans,
        digiGoldPlan,
        dgGold22Plan,
        dgGold24Plan,
        dgSilverPlan,
        branches,
        isEcomEnable, // <-- exposed
        plan,
        Allplan,
        setAllPlan,
        fetchUserPlan,
        isLoadingPlans,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
