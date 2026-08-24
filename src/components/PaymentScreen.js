import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import React, { useContext, useState, useEffect, useRef } from "react";
import theme from "../theme";
import { useNavigate } from "react-router-dom";

// Icons
import DateRangeOutlinedIcon from "@mui/icons-material/DateRangeOutlined";
import ReportOutlinedIcon from "@mui/icons-material/ReportOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import PlaylistRemoveIcon from "@mui/icons-material/PlaylistRemove";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import googlePayLogo from "../assets/img/icons/google-pay-logo-2020.svg";
import phonePeLogo from "../assets/img/icons/phonepe-icon.svg";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";
import APP_CONFIG from "../config/constants";

function PaymentScreen({ data, userInfo }) {
  //  console.log('paymentscreen',data);
  // console.log(data);

  const additionalPlanDetails = {
    group_code: data?.code,
    member_no: data?.member_no,
    sender_mobile: userInfo?.mobile,
    Installment_count: data?.installCnt,
    branch: data?.branch,
  };

  const isDigiMetalPurchase = !!data?.rateAtPurchase;
  // console.log(isDigiMetalPurchase);

  const [largeAmountDialog, setLargeAmountDialog] = useState(false);
  const goldRatePerGM = isDigiMetalPurchase
    ? data.rateAtPurchase
    : data.store_gold_rate;

  const { loginRole, adminUser } = useContext(AuthContext);
  const [paymentDialog, setPaymentDialog] = useState(false);
  // Hidden PhonePe iframe override dialog (user-only; see handleUserDetailsTap).
  const [iframeDialog, setIframeDialog] = useState(false);
  // const [schemeAdjustedDialog, setSchemeAdjustedDialog] = useState(false);
  const [blockDialog, setBlockDialog] = useState({
    open: false,
    message: "",
    title: "",
  });
  const [selectedOption, setSelectedOption] = useState("6");
  const [payableAmount, setPayableAmount] = useState(data.scheme_amount);
  const [fixedAmountSnackbar, setFixedAmountSnackbar] = useState(false);
  const [amountSnackbar, setAmountSnackbar] = useState({
    open: false,
    message: "",
  });
  const [alreadyPaidToday, setAlreadyPaidToday] = useState(false);
  const [dailyLimitSnackbar, setDailyLimitSnackbar] = useState(false);
  const [monthlyLimitReached, setMonthlyLimitReached] = useState(false);
  const [monthlyLimitSnackbar, setMonthlyLimitSnackbar] = useState(false);
  const [refNumber, setRefNumber] = useState("");
  const [firstInstDialog, setFirstInstDialog] = useState(false);
  // const [confirmedFirstPayment, setConfirmedFirstPayment] = useState(false);
  // const [goldCon, setGoldCon] = useState(() => {
  //   return parseFloat((payableAmount / data.store_gold_rate).toFixed(3));
  // });
  // console.log(userInfo);
  const maxDailyLimit = Number(data.minstl_amt_fixed) || 0;
  const [goldCon, setGoldCon] = useState(() => {
    return parseFloat((payableAmount / goldRatePerGM).toFixed(3));
  });
  const userMobile = adminUser?.mobile;
  const navigate = useNavigate();

  useEffect(() => {
    // window.scrollTo({ top: 0, behavior: "instant" });

    // if (data.isflexible !== "Y" && installmentDataObj.totalAmountPaid === 0) {
    //   setFirstInstDialog(true);
    // }
    const isFlexible = data?.isflexible === "Y";

    const isFixed =
      data?.hasOwnProperty("is_fixed") &&
      (data.is_fixed === 1 || data.is_fixed === "1" || data.is_fixed === true);

    const isFirstPayment = installmentDataObj?.totalAmountPaid === 0;

    if (!isFlexible && isFirstPayment && !isFixed) {
      setFirstInstDialog(true);
    }
  }, []);

  // useEffect(() => {
  //   const checkTodayTransaction = async () => {
  //     try {
  //       // Get today's date in YYYY-MM-DD format
  //       const today = new Date().toISOString().split('T')[0]; // "2026-03-26"

  //       const { data: json } = await axios.post(
  //         `${process.env.REACT_APP_API_BASE_URL}/api/phonepe/check-today-payment`,
  //         {
  //           date: today,
  //           mobile: userInfo?.mobile,      // 10-digit mobile
  //           branch_id: userInfo?.branch,
  //           store_id: userInfo?.store_id,
  //         }
  //       );

  //       // New API response structure:
  //       // { success: true, todaypaid: boolean, data: { tdate, amount, member_id, description } }

  //       if (json.success && json.todaypaid === true) {
  //         // Optional: verify mgroup matches current user
  //         const currentMgroup = `${data.mgroup}-${data.member_no}`;
  //         const paidForCorrectMgroup = json.data?.description === currentMgroup;

  //         if (paidForCorrectMgroup) {
  //           setAlreadyPaidToday(true);
  //         } else {
  //           // Paid today but for a different mgroup – treat as not paid for this mgroup
  //           setAlreadyPaidToday(false);
  //         }
  //       } else {
  //         setAlreadyPaidToday(false);
  //       }
  //     } catch (err) {
  //       console.error("Transaction check failed:", err);
  //       setAlreadyPaidToday(false); // On error, allow payment (fail-safe)
  //     }
  //   };

  //   checkTodayTransaction();
  // }, [data.mgroup]); // re-run if mgroup/member/user changes


  useEffect(() => {
    const checkTodayTransaction = async () => {
      try {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0]; // "2026-03-26"

        const { data: json } = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/phonepe/V2/check-today-payment2`,
          {
            date: today,
            mobile: userInfo?.mobile, // 10-digit mobile
            // branch_id: APP_CONFIG.BRANCH,
            branch_id: data?.branch,
            store_id: data?.store_id,
            member_no: data?.member_no,
            mgroup: data?.mgroup,
            member_id: data?.member_id,
          },
        );

       if (
  json.success &&
  json.todaypaid === true &&
  maxDailyLimit > 0 &&  // ✅ skip check if no limit set
  json.transactionCount >= maxDailyLimit  // ✅ >= instead of == 
) {
  setAlreadyPaidToday(true);
} else {
  setAlreadyPaidToday(false);
}
      } catch (err) {
        console.error("Transaction check failed:", err);
        setAlreadyPaidToday(false); // On error, allow payment (fail-safe)
      }
    };

    checkTodayTransaction();
  }, [data.mgroup]);

  useEffect(() => {
    const checkMonthlyLimit = async () => {
      if (!data.instal_limit_permonth || data.instal_limit_permonth <= 0)
        return;

      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/core/installment-count`,
          {
            params: {
              group: data.mgroup,
              memberNo: data.member_no,
              storeID: data.store_id,
              branch: data?.branch,
            },
          },
        );

        const instlCount = response.data.count;

        if (instlCount >= data.instal_limit_permonth) {
          setMonthlyLimitReached(true);
        }
      } catch (err) {
        console.error("Monthly limit check failed:", err);
        setMonthlyLimitReached(false);
      }
    };

    checkMonthlyLimit();
  }, [data.mgroup, data.member_no]);

  const paymentMapping = {
    0: "Cash",
    2: "Credit Card",
    7: "NEFT",
    // 7: "Net Banking",
    1: "Cheque",
    6: "Online Payment",
    8: "Card",
  };
  // Converting date to local format
  const dateConverter = (dateStr) => {
    if (dateStr === "" || !dateStr) {
      return "--";
    }
    //Calculate maturity date
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const calculateMaturityDate = (
    createdDate,
    totalInstallment,
    installmentCnt,
  ) => {
    const start = new Date(createdDate);

    // First day of current month (for full month calculation)
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    // Full months passed since creation
    const monthsPassed =
      (currentMonthStart.getFullYear() - start.getFullYear()) * 12 +
      (currentMonthStart.getMonth() - start.getMonth());

    const delay = Math.max(0, monthsPassed - installmentCnt);

    // Calculate the target maturity month
    const maturityMonth = new Date(start);
    maturityMonth.setMonth(maturityMonth.getMonth() + totalInstallment + delay);

    // Set date to last day of that maturity month
    const maturityDate = new Date(
      maturityMonth.getFullYear(),
      maturityMonth.getMonth() + 1, // move to next month
      0, // day = 0 => gives last day of previous month (i.e. target month)
    );

    return maturityDate;
  };
  // Setting gold rate as per the store
  // const goldRatePerGM = data.store_gold_rate;

  // const goldRateAmount = data.store_gold_rate;

  // Setting all the installments data
  const pendingInstallments = data.no_inst - data.installCnt;
  const pendingInstallmentAmount = Math.max(
    data.no_inst * data.scheme_amount - data.amountPaid,
    0,
  );

  // Installment details object
  const installmentDataObj = {
    totalAmountPaid: data.amountPaid,
    planCreationDate: data.member_created_at,
    noOfInstallments: data.no_inst,
    installmentsPaid: data.installCnt,
    // scheme_info :data.info,
    pendingInstallments,
    pendingInstallmentAmount,
    maturityDate: dateConverter(
      calculateMaturityDate(
        data.member_created_at,
        data.no_inst,
        data.installCnt,
      ),
    ),
    payDate: dateConverter(data.drawdate),
    // dueDate: "05 June 2025",
    gold_balance: data.gold_balance,
    isDigiGold: data.gold_scheme,
  };
  const isFixed =
    data?.is_fixed === 1 || data?.is_fixed === "1" || data?.is_fixed === true;
  const isAbhiScheme = data?.info === "C";
  const scheme_info = data?.info === "A";
  // const AllInstCompleted=data?.installCnt>=data?.no_inst
  const AllInstCompleted = Number(data?.installCnt) >= Number(data?.no_inst);

  // const isFixedAmount = data.isflexible !== "Y";
  const isFixedAmount =
    isFixed ||
    (data?.isflexible !== "Y" && installmentDataObj?.totalAmountPaid > 0);

  // const isFirstPayment = installmentDataObj?.totalAmountPaid === 0;
  const isFirstPayment = Number(installmentDataObj?.totalAmountPaid) === 0;

  // const minAmount = isFirstPayment ? data?.allowed_InstalAmt : (data?.min_instal_amt || 1);
  // const maxAmount = data?.max_instal_amt || Infinity;
  // ✅ amount rules
  const minAmount = isFirstPayment
    ? Number(data?.allowed_InstalAmt || 1)
    : Number(data?.min_instal_amt || 1);

  const maxAmount =
    Number(data?.max_instal_amt) > 0 ? Number(data.max_instal_amt) : Infinity;

  // Calculate due installment amount
  const dueInstallMentAmountGenerator = (
    planCreationDateStr,
    schemeAmount,
    amountPaid,
  ) => {
    const planCreationDate = new Date(planCreationDateStr);

    // Use first day of current month as cut-off
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    // Calculate full months between created date and start of current month
    const monthsPassed =
      (currentMonthStart.getFullYear() - planCreationDate.getFullYear()) * 12 +
      (currentMonthStart.getMonth() - planCreationDate.getMonth());

    const totalDue = monthsPassed * schemeAmount;

    const dueAmount = totalDue - amountPaid;

    return dueAmount > 0 ? dueAmount.toLocaleString("en-IN") : "0";
  };
  const dueInstallMentGenerator = (startingDate, installCnt) => {
    const start = new Date(startingDate);

    // First day of current month (so we exclude current month in calculation)
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    // Calculate how many full months have passed
    const monthsPassed =
      (currentMonthStart.getFullYear() - start.getFullYear()) * 12 +
      (currentMonthStart.getMonth() - start.getMonth());

    // Due installment count
    const dueInstallments = Math.max(0, monthsPassed - installCnt);

    return dueInstallments;
  };

  const user = {
    name: userInfo?.name || "N/A",
    mobile: userInfo?.mobile || "N/A",
    email: userInfo?.email || "",
    address:
      [userInfo?.address1, userInfo?.address2, userInfo?.address3]
        .filter((part) => part && part.trim() !== "")
        .join(", ") || "",
  };

  // Handling payment method selection
  const handlePaymentOptions = (e) => {
    setSelectedOption(e.target.value);
    setRefNumber("");
  };

  // Hidden override: 3 quick taps on the user-details card lets a USER switch
  // this payment to the PhonePe iframe flow (needed on some older Android where
  // the native SDK misbehaves). Agents are excluded; nothing else changes.
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef(null);
  const handleUserDetailsTap = () => {
    if (loginRole === "agent") return;
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      setIframeDialog(true);
      return;
    }
    tapTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 600);
  };

  // useIframe=true tags this payment for the iframe flow on SchemeDetailPageV2
  // (which still only uses it on an eligible device, else falls back to SDK).
  // Normal payments call this with no argument → default SDK.
  const confirmPayment = async (useIframe = false) => {
    const groupCode = data?.mgroup;
    const memberCode = data?.member_no;
    try {
      // ✅ Fetch a fresh member-with-group record at pay time and forward it,
      // so SchemeDetailPageV2 never has to call the API itself.
      const schemeResult = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/core/member-with-group`,
        {
          params: {
            // Separate fields, not a concatenated string — see the same
            // note in SchemeDetailPage.js.
            groupCode,
            memberCode,
            storeID: APP_CONFIG.STORE_ID,
            branch: data?.branch,
          },
        },
      );

      const freshRecord = schemeResult.data?.[0];

      // ✅ Recalculate gold weight with the pay-time rate so the saved
      // gross_wt always matches the rate actually used for this payment.
      // DigiMetal purchases keep their locked rateAtPurchase.
      const freshRate = isDigiMetalPurchase
        ? data.rateAtPurchase
        : freshRecord?.store_gold_rate;
      const freshGoldCon =
        freshRate && Number(freshRate) > 0
          ? parseFloat((payableAmount / freshRate).toFixed(3))
          : goldCon;

      navigate(
        `/schemepay/${groupCode}/${memberCode}/${payableAmount}/${selectedOption}`,
        {
          state: {
            goldCon: freshGoldCon,
            refNumber: refNumber,
            additionalPlanDetails,
            schemeRecord: freshRecord,
            paymentVersion: useIframe ? "iframe" : undefined,
          },
        },
      );
    } catch (err) {
      console.error("Failed to load scheme details:", err);
      setAmountSnackbar({
        open: true,
        message: "Unable to load scheme details. Please try again.",
      });
    }
  };

  const handlePayNowClick = async () => {
    // ✅ Show popup if scheme is adjusted
    if (Number(payableAmount) <= 0) {
      setAmountSnackbar({
        open: true,
        message: ` Please enter a valid amount `,
      });
      return;
    }
    if (scheme_info) {
      setBlockDialog({
        open: true,
        message:
          "This scheme has been adjusted. No further payments can be made.",
      });
      return;
    }
    if (AllInstCompleted) {
      setBlockDialog({
        open: true,
        message: "All installments completed. Please start a new scheme.",
      });
      return;
    }
    if (monthlyLimitReached) {
      setBlockDialog({
        open: true,
        title: "Limit Exceeded",
        message: `Install Payment Limit: ${data.instal_limit_permonth} Exceeded For Current Month.`,
      });
      return;
    }
    // ✅ ADD THIS
    if (Number(payableAmount) > 100000) {
      setLargeAmountDialog(true);
      return;
    }

    // Block if already paid today and fixed installment
    if (alreadyPaidToday && maxDailyLimit>0) {
      setDailyLimitSnackbar(true);
      return;
    }

    // Block if amount is below minimum
    if (Number(payableAmount) < minAmount) {
      setAmountSnackbar({
        open: true,
        message: `Minimum payable amount is ₹${minAmount.toLocaleString(
          "en-IN",
        )}`,
      });
      return;
    }

    // Block if amount is above maximum
    if (Number(payableAmount) > maxAmount) {
      setAmountSnackbar({
        open: true,
        message: `Maximum payable amount is ₹${maxAmount.toLocaleString(
          "en-IN",
        )}`,
      });
      return;
    }

    // Validate reference number for Cheque or NEFT
    if (
      (selectedOption === "1" ||
        selectedOption === "7" ||
        selectedOption === "8") &&
      !refNumber.trim()
    ) {
      setAmountSnackbar({
        open: true,
        message: ` ${
          selectedOption === "1"
            ? "Please enter the Cheque number"
            : selectedOption === "7"
            ? "Please enter the NEFT reference number"
            : "Please enter the Card number"
        }`,
      });

      return;
    }
    // ✅ NEW: Update scheme_amount in DB on first payment of a fixed scheme
    // Condition: isflexible !== "Y" AND totalAmountPaid === 0 (first payment)
    if (
      data.isflexible !== "Y" &&
      installmentDataObj.totalAmountPaid === 0 &&
      Number(payableAmount) >= minAmount
    ) {
      try {
        const updateRes = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/core/update-scheme-amount`,
          {
            member_id: data.member_id,
            member_no: data.member_no,
            mgroup: data.mgroup,
            store_id: data.store_id,
            branch: data?.branch,
            scheme_amount: Number(payableAmount),
          },
        );

        if (!updateRes.data.success) {
          setAmountSnackbar({
            open: true,
            message: "Failed to update scheme amount. Please try again.",
          });
          return;
        }
      } catch (err) {
        console.error("Scheme amount update failed:", err);
        setAmountSnackbar({
          open: true,
          message:
            "Something went wrong while saving amount. Please try again.",
        });
        return;
      }
    }

    if (
      paymentMapping[selectedOption].toLowerCase() === "cash" ||
      paymentMapping[selectedOption].toLowerCase() === "cheque" ||
      paymentMapping[selectedOption].toLowerCase() === "card" ||
      paymentMapping[selectedOption].toLowerCase() === "neft"
    ) {
      setPaymentDialog(true);
    } else {
      // Online payment → fetch fresh scheme record and navigate.
      confirmPayment();
    }
  };

  const handleAmountChange = (e) => {
    if (isFixedAmount) {
      setFixedAmountSnackbar(true);
      return;
    }
    const digits = Number(e.target.value.replace(/\D/g, ""));

    if (digits < minAmount) {
      setAmountSnackbar({
        open: true,
        message: `Minimum payable amount is ₹${minAmount.toLocaleString(
          "en-IN",
        )}`,
      });
    } else if (digits > maxAmount) {
      setAmountSnackbar({
        open: true,
        message: `Maximum payable amount is ₹${maxAmount.toLocaleString(
          "en-IN",
        )}`,
      });
    }

    setPayableAmount(digits);
    setGoldCon(parseFloat((digits / goldRatePerGM).toFixed(3)));
  };

  // const handleAmountChange = (e) => {
  //   //   if (isFixedAmount) {
  // //     setFixedAmountSnackbar(true);
  // //     return;
  // //   }
  //   const digits = Number(e.target.value.replace(/\D/g, ""));

  //   if (digits < minAmount) {
  //     setAmountSnackbar({
  //       open: true,
  //       message: `Minimum payable amount is ₹${minAmount.toLocaleString("en-IN")}`,
  //     });
  //   } else if (digits > maxAmount) {
  //     setAmountSnackbar({
  //       open: true,
  //       message: `Maximum payable amount is ₹${maxAmount.toLocaleString("en-IN")}`,
  //     });
  //   }

  //   setPayableAmount(digits);
  //   setGoldCon(parseFloat((digits / goldRatePerGM).toFixed(4)));
  // };

  return (
    <React.Fragment>
      {/* Summary card */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        sx={{
          borderTop: `0.5px solid #DFDFDF `,
          paddingX: "1.5rem",
          margin: "0 -24px",
          width: "100vw",
          // backgroundColor: "red",
        }}
      >
        {/*Total amount collected */}
        <Box
          sx={{
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `0.5px solid #DFDFDF`,
            paddingX: "1.5rem",
            margin: "0 -24px",
            width: "100vw",
            color: theme.paymentScreen.successText,
          }}
        >
          {/* Left side label */}
          <Typography
            fontSize="14px"
            sx={{ color: theme.paymentScreen.successText, width: "60%" }}
          >
            Payable Amount
          </Typography>

          {/* Right side input with ₹ and number together */}
          <TextField
            variant="standard"
            value={`₹ ${
              payableAmount
                ? Number(payableAmount).toLocaleString("en-IN")
                : "0"
            }`}
            onChange={handleAmountChange}
            InputProps={{
              disableUnderline: true,
              style: {
                fontSize: "22px",
                fontWeight: 700,
                color: theme.paymentScreen.successText,
                textAlign: "right",
              },
            }}
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
              style: {
                fontSize: "22px",
                fontWeight: 700,
                color: theme.paymentScreen.successText,
                textAlign: "right",
              },
            }}
          />
        </Box>

        {/*Gold conversion */}
        {data.gold_scheme == 1 && (
          <Box
            sx={{
              height: "56px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: `0.5px solid #DFDFDF`,
              paddingX: "1.5rem",
              margin: "0 -24px",
              width: "100vw",
              color: theme.paymentScreen.successText,
            }}
          >
            {/* Left side label */}
            <Typography
              fontSize="12px"
              sx={{ color: theme.paymentScreen.goldCon, width: "50%" }}
            >
              Gold Conversion
            </Typography>

            {/* Right side static display ₹ xxxx /gm */}
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: 700,
                color: theme.paymentScreen.goldCon,
                textAlign: "right",
              }}
            >
              {`${goldCon} gm`}
            </Typography>
          </Box>
        )}

        {/*Due amount */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: "56px",
            justifyContent: "space-between",
            color: theme.paymentScreen.warnText,
            borderBottom: `0.5px solid #DFDFDF `,
            paddingX: "1.5rem",
            margin: "0 -24px",
            width: "100vw",
            mb: 2,
          }}
        >
          <Typography fontSize="12px">Due Amount</Typography>
          <Typography fontSize="14px" fontWeight="700">
            ₹{" "}
            {dueInstallMentAmountGenerator(
              installmentDataObj.planCreationDate,
              data.scheme_amount,
              installmentDataObj.totalAmountPaid,
            )}
          </Typography>
        </Box>
      </Box>

 {/* Payment method */}
        {/* {loginRole === "agent" && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="100%"
            marginBottom="1rem"
            sx={{
              borderRadius: 4,
            }}
          >
            <FormControl fullWidth>
              <InputLabel
                id="pay-online-option-list"
                sx={{
                  fontWeight: "600",
                  color: theme.paymentScreen.textColHighlighted,
                  borderRadius: 2,
                }}
              >
                Pay Mode
              </InputLabel>
              <Select
                labelId="pay-online-option-list"
                id="pay-online-option"
                value={selectedOption}
                label="Choose Option"
                onChange={handlePaymentOptions}
              >
                <MenuItem value="0">
                  <Box
                    display="flex"
                    justifyContent="flex-start"
                    alignItems="center"
                    width="100%"
                  >
                    <Typography>Cash</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="1">Cheque</MenuItem>
                <MenuItem value="8">Card</MenuItem>
                <MenuItem value="7">NEFT</MenuItem>
                <MenuItem value="6">Online Payment</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )}
        {loginRole === "agent" &&
          (selectedOption === "1" ||
            selectedOption === "7" ||
            selectedOption === "8") && (
            <Box width="100%" marginBottom="1rem">
              <TextField
                fullWidth
                label={
                  selectedOption === "1"
                    ? "Cheque Number"
                    : selectedOption === "7"
                    ? "NEFT Reference Number"
                    : "Card Number"
                }
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                inputProps={{ inputMode: "text" }}
              />
            </Box>
          )} */}

{/* Payment method */}
{loginRole === "agent" && (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    width="100%"
    marginBottom="1.25rem"
  >
    <FormControl fullWidth>
      <InputLabel
        id="pay-online-option-list"
        sx={{
          fontWeight: 600,
          color: theme.paymentScreen.textColHighlighted,
        }}
      >
        Pay Mode
      </InputLabel>
      <Select
        labelId="pay-online-option-list"
        id="pay-online-option"
        value={selectedOption}
        label="Choose Option"
        onChange={handlePaymentOptions}
        sx={{
          borderRadius: "14px",
          backgroundColor: "#fff",
          
          "& .MuiSelect-select": {
            minHeight: "18px",
            display: "flex",
            alignItems: "center",
            paddingTop: "12px",
            paddingBottom: "12px",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ccc",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#ccc",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.colors.primaryButton,
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              borderRadius: "14px",
              marginTop: "6px",
              
              "& .MuiMenuItem-root": {
                minHeight: "48px",
                fontSize: "15px",
              },
            },
          },
        }}
      >
        <MenuItem value="0">
          <Box display="flex" justifyContent="flex-start" alignItems="center" width="100%">
            <Typography>Cash</Typography>
          </Box>
        </MenuItem>
        <MenuItem value="1">
          <Box display="flex" justifyContent="flex-start" alignItems="center" width="100%">
            <Typography>Cheque</Typography>
          </Box>
        </MenuItem>
        <MenuItem value="8">
          <Box display="flex" justifyContent="flex-start" alignItems="center" width="100%">
            <Typography>Card</Typography>
          </Box>
        </MenuItem>
        <MenuItem value="7">
          <Box display="flex" justifyContent="flex-start" alignItems="center" width="100%">
            <Typography>NEFT</Typography>
          </Box>
        </MenuItem>
        <MenuItem value="6">
          <Box display="flex" justifyContent="flex-start" alignItems="center" width="100%">
            <Typography>Online Payment</Typography>
          </Box>
        </MenuItem>
      </Select>
    </FormControl>
  </Box>
)}

{loginRole === "agent" &&
  (selectedOption === "1" ||
    selectedOption === "7" ||
    selectedOption === "8") && (
    <Box width="100%" marginBottom="1.25rem">
      <TextField
        fullWidth
        label={
          selectedOption === "1"
            ? "Cheque Number"
            : selectedOption === "7"
            ? "NEFT Reference Number"
            : "Card Number"
        }
        value={refNumber}
        onChange={(e) => setRefNumber(e.target.value)}
        inputProps={{ inputMode: "text" }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "14px",
            backgroundColor: "#fff",
            minHeight: "48px",
            "& fieldset": { borderColor: "#ccc" },
            "&:hover fieldset": { borderColor: "#ccc" },
            "&.Mui-focused fieldset": {
              borderColor: theme.colors.primaryButton,
            },
          },
        }}
      />
    </Box>
  )}

      {/* Pay now button */}
      {userMobile !== "6352635201" && (
        <Box marginBottom="2.4rem" width="100%">
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            component="button"
            // disabled={scheme_info} // disables if 0, "", NaN
            // disabled
            sx={{
              width: "100%",
              bgcolor: theme.paymentScreen.payBtnBg,
              padding: "0.4rem",
              borderRadius: 2,
              border: "none",
              opacity: !Number(payableAmount) ? 0.5 : 1, // visual feedback
              cursor: !Number(payableAmount) ? "not-allowed" : "pointer",
            }}
            onClick={handlePayNowClick}
          >
            <Typography variant="h6" color="#fff">
              Pay Now
            </Typography>
          </Box>
        </Box>
      )}

      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        width="100%"
        overflow="scroll"
        marginBottom="2rem"
      >
        {/* Amount and no. of installments */}
        <Box
          marginBottom="1.2rem"
          width="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          sx={{
            borderRadius: 2,
            border: `1px solid ${theme.paymentScreen.cardBorder}`,
            backgroundColor: theme.paymentAndLedger.payInfoTabSectionBg,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            width="100%"
            padding="1.2rem"
          >
            <Box
              display="flex"
              justifyContent="center"
              alignItems="flex-start"
              flexDirection="column"
            >
              <Typography
                variant="body2"
                fontWeight="500"
                color={theme.paymentScreen.textColHighlighted}
              >
                Amount
              </Typography>
              {/* <Typography
                fontSize="12px"
                fontWeight="500"
                color={theme.paymentScreen.textColHighlighted}
              >
                Gold Price & Weight
              </Typography> */}
              <Typography
                fontSize="12px"
                fontWeight="500"
                color={theme.paymentScreen.textColHighlighted}
              >
                {isDigiMetalPurchase
                  ? `${
                      data.metal?.charAt(0).toUpperCase() + data.metal?.slice(1)
                    } Price & Weight`
                  : "Gold Price & Weight"}
              </Typography>
              {/* <Typography fontSize="12px" fontWeight="500" color="#000">
                ₹{goldRatePerGM.toLocaleString("en-IN")}/gm | 22KT
              </Typography> */}
              <Typography fontSize="12px" fontWeight="500" color="#000">
                ₹{goldRatePerGM.toLocaleString("en-IN")}/gm |{" "}
                {isDigiMetalPurchase ? data.kt : "22KT"}
              </Typography>
            </Box>
            <Box
              width="35%"
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{
                bgcolor: theme.paymentScreen.cardBgHighlighted,
                padding: "0.4rem",
                borderRadius: 1,
              }}
            >
              <Typography
                variant="body2"
                color={theme.paymentScreen.amountColHighlighted}
                fontWeight="600"
              >
                ₹ {goldRatePerGM.toLocaleString("en-IN")}
              </Typography>
            </Box>
          </Box>

          {/* Separator line */}
          <Box
            sx={{
              height: "1px",
              bgcolor: theme.paymentScreen.sectionSeparatorLineCol,
              width: "100%",
            }}
          />

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            width="100%"
            padding="1.2rem"
            sx
          >
            <Box>
              <Typography
                variant="body2"
                color={theme.paymentScreen.textColHighlighted}
                fontWeight="500"
              >
                No of Installment
              </Typography>
            </Box>
            <Box
              width="35%"
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{
                bgcolor: theme.paymentScreen.cardBgHighlighted,
                padding: "0.4rem",
                borderRadius: 1,
              }}
            >
              <Typography
                variant="body2"
                color={theme.paymentScreen.amountColHighlighted}
                fontWeight="600"
              >
                {installmentDataObj.noOfInstallments}
              </Typography>
            </Box>
          </Box>
        </Box>

       

        {userMobile === "6352635201" && (
          <>
            {" "}
            <Typography
              sx={{ fontSize: 16, color: theme.paymentScreen.warnText }}
              fontWeight="bold"
              gutterBottom
            >
              Payments Disabled in Demo Mode
            </Typography>
            <Typography
              sx={{ fontSize: 14, color: theme.paymentScreen.textCol }}
              paragraph
            >
              This is a demo account created for App Review. Payment
              functionality is disabled here. In the live app, users can
              securely complete payments via UPI.
            </Typography>
          </>
        )}

        {/* Maturity and current installments */}
        <Box
          marginBottom="1.2rem"
          width="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          sx={{
            borderRadius: 2,
            border: `1px solid ${theme.paymentScreen.cardBorder}`,
            backgroundColor: theme.paymentAndLedger.payInfoTabSectionBg,
          }}
        >
          <Box
            display="flex"
            justifyContent="center"
            alignItems="flex-start"
            flexDirection="column"
            width="100%"
            padding="1.2rem"
          >
            {/* Total plan amount */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
            >
              <Box display="flex" alignItems="center" gap="0.4rem">
                <AccountBalanceWalletOutlinedIcon
                  sx={{
                    height: "16px",
                    width: "16px",
                  }}
                />
                <Typography variant="body2" fontWeight="500">
                  Total Amount Paid:
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  color={theme.paymentScreen.textCol}
                  fontWeight="600"
                >
                  ₹{installmentDataObj.totalAmountPaid.toLocaleString("en-IN")}
                </Typography>
              </Box>
            </Box>

            {/* Gold conversion */}
            {/* { console.log('sdfgdfggh',installmentDataObj)} */}

            {installmentDataObj.isDigiGold == 1 && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                width="100%"
              >
                <Box display="flex" alignItems="center" gap="0.4rem">
                  <AccountBalanceWalletOutlinedIcon
                    sx={{
                      height: "16px",
                      width: "16px",
                    }}
                  />
                  <Typography variant="body2" fontWeight="500">
                    Total Gold Balance
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    color={theme.paymentScreen.textCol}
                    fontWeight="600"
                  >
                    {/* {installmentDataObj.gold_balance.toFixed(3)} gm */}
                    {Number(installmentDataObj.gold_balance || 0).toFixed(3)} gm
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Maturity date */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
            >
              <Box display="flex" alignItems="center" gap="0.4rem">
                <DateRangeOutlinedIcon
                  sx={{
                    height: "16px",
                    width: "16px",
                  }}
                />
                <Typography variant="body2" fontWeight="500">
                  Maturity Date:
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  color={theme.paymentScreen.textCol}
                  fontWeight="600"
                >
                  {installmentDataObj.maturityDate}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Separator line */}
          <Box
            sx={{
              height: "1px",
              bgcolor: theme.paymentScreen.sectionSeparatorLineCol,
              width: "100%",
            }}
          />

          {/* Number of installments paid currently */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexDirection="column"
            width="100%"
            padding="1.2rem"
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
            >
              <Box display="flex" alignItems="center" gap="0.4rem">
                <PlaylistAddCheckIcon
                  sx={{
                    height: "16px",
                    width: "16px",
                  }}
                />
                <Typography variant="body2" fontWeight="500">
                  {scheme_info
                    ? "All Installments Cleared"
                    : "Current Installment:"}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  color={theme.paymentScreen.textCol}
                  fontWeight="600"
                >
                  {installmentDataObj.installmentsPaid}
                </Typography>
              </Box>
            </Box>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
            >
              {/* <Box display="flex" alignItems="center" gap="0.4rem">
                <DateRangeOutlinedIcon
                  sx={{
                    height: "16px",
                    width: "16px",
                  }}
                />
                <Typography variant="body2" fontWeight="500">
                  Paid Date:
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="body2"
                  color={theme.paymentScreen.textCol}
                  fontWeight="600"
                >
                  {installmentDataObj.installmentsPaid === 0
                    ? "--"
                    : installmentDataObj.payDate}
                </Typography>
              </Box> */}
            </Box>
          </Box>
        </Box>

        {/* Pending installments and due date */}
        {!scheme_info && (
          <Box
            width="100%"
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
            sx={{
              borderRadius: 2,
              border: `1px solid #E2E2E2`,
              backgroundColor: theme.paymentAndLedger.payInfoTabSectionBg,
            }}
          >
            <Box
              display="flex"
              justifyContent="center"
              alignItems="flex-start"
              flexDirection="column"
              width="100%"
              padding="1.2rem"
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                width="100%"
              >
                <Box display="flex" alignItems="center" gap="0.4rem">
                  <PlaylistRemoveIcon
                    sx={{
                      height: "16px",
                      width: "16px",
                    }}
                  />

                  <Typography variant="body2" fontWeight="500">
                    Pending Installments:
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    color={theme.paymentScreen.textCol}
                    fontWeight="600"
                  >
                    {installmentDataObj.pendingInstallments}
                  </Typography>
                </Box>
              </Box>

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                width="100%"
              >
                <Box display="flex" alignItems="center" gap="0.4rem">
                  <AccountBalanceWalletOutlinedIcon
                    sx={{
                      height: "16px",
                      width: "16px",
                    }}
                  />
                  <Typography variant="body2" fontWeight="500">
                    Pending Amount:
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    color={theme.paymentScreen.textCol}
                    fontWeight="600"
                  >
                    ₹
                    {installmentDataObj.pendingInstallmentAmount.toLocaleString(
                      "en-IN",
                    )}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Separator line */}
            <Box
              sx={{
                height: "1px",
                bgcolor: theme.paymentScreen.sectionSeparatorLineCol,
                width: "100%",
              }}
            />

            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              flexDirection="column"
              width="100%"
              padding="1.2rem"
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                width="100%"
              >
                <Box display="flex" alignItems="center" gap="0.4rem">
                  <ReportOutlinedIcon
                    sx={{
                      height: "16px",
                      width: "16px",
                    }}
                  />
                  <Typography variant="body2" fontWeight="500">
                    Due Installment:
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    color={theme.paymentScreen.textCol}
                    fontWeight="600"
                  >
                    {dueInstallMentGenerator(
                      installmentDataObj.planCreationDate,
                      installmentDataObj.installmentsPaid,
                    )}
                  </Typography>
                </Box>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                width="100%"
              >
                <Box display="flex" alignItems="center" gap="0.4rem">
                  <ReportOutlinedIcon
                    sx={{
                      height: "16px",
                      width: "16px",
                    }}
                  />
                  <Typography variant="body2" fontWeight="500">
                    Due Amount:
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    color={theme.paymentScreen.textCol}
                    fontWeight="600"
                  >
                    ₹
                    {dueInstallMentAmountGenerator(
                      installmentDataObj.planCreationDate,
                      data.scheme_amount,
                      installmentDataObj.totalAmountPaid,
                    )}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* User's details */}
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          marginTop="3.2rem"
          marginBottom="1.2rem"
          width="100%"
          onClick={handleUserDetailsTap}
          sx={{
            bgcolor: theme.paymentScreen.userInfoCardBg,
            borderRadius: 2,
            padding: "1.2rem",
            position: "relative",
          }}
        >
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
          >
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{
                height: "45px",
                width: "45px",
                bgcolor: "#fff",
                borderRadius: "100%",
                position: "absolute",
                top: "-22.5px",
              }}
            >
              <AccountCircleOutlinedIcon
                sx={{
                  color: theme.paymentScreen.payBtnBg,
                }}
              />
            </Box>
            <Box sx={{ paddingTop: "0.4rem" }}>
              <Typography variant="body2" color="#000" fontWeight="600">
                {user.name}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap="0.4rem">
              <CallOutlinedIcon
                sx={{
                  fontSize: "1.2rem",
                }}
              />
              <Typography variant="body2" color="#000" fontWeight="600">
                +91 {user.mobile}
              </Typography>
            </Box>

            {user.email !== "" && (
              <>
                <Box display="flex" alignItems="center" gap="0.4rem">
                  <EmailOutlinedIcon
                    sx={{
                      fontSize: "1.2rem",
                    }}
                  />
                  <Typography variant="body2" color="#000" fontWeight="600">
                    {user.email}
                  </Typography>
                </Box>
              </>
            )}
            <Box display="flex" alignItems="center" gap="0.4rem">
              <PlaceOutlinedIcon
                sx={{
                  fontSize: "1.2rem",
                }}
              />
              <Typography
                sx={{ textAlign: "center" }}
                variant="body2"
                color="#000"
                fontWeight="600"
              >
                {user.address}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      {/* ── Large Amount Warning Dialog ─────────────────────────────────── */}
      <Dialog
        open={largeAmountDialog}
        onClose={() => setLargeAmountDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: "20px",
            background: "rgba(255, 255, 255, 0.6)", // more transparent
            backdropFilter: "blur(18px)", // strong blur
            WebkitBackdropFilter: "blur(18px)", // safari support
            border: "1px solid rgba(255,255,255,0.3)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            width: "88%",
            maxWidth: 340,
            px: 1,
          },
        }}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0,0,0,0.25)", // lighter dim
              backdropFilter: "blur(6px)", // blur whole background
            },
          },
        }}
      >
        <DialogContent sx={{ pt: 3, pb: 2, textAlign: "center" }}>
          {/* Icon */}
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(254, 243, 199, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <Typography sx={{ fontSize: 26 }}>⚠️</Typography>
          </Box>

          {/* Title */}
          <Typography
            sx={{ fontWeight: 700, fontSize: 16, color: "#111", mb: 1 }}
          >
            Amount Too Large
          </Typography>

          {/* Message */}
          <Typography sx={{ fontSize: 13, color: "#4b5563", lineHeight: 1.6 }}>
            Payments above{" "}
            <span
              style={{ fontWeight: 700, color: theme.colors.primaryButton }}
            >
              ₹1,00,000
            </span>{" "}
            are not allowed.
            <br />
            <br />
            Please enter a smaller amount to continue.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 2, pb: 3 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setLargeAmountDialog(false)}
            sx={{
              height: 44,
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: 14,
              textTransform: "none",
              backgroundColor: theme.colors.primaryButton,
              boxShadow: "none",
              "&:hover": {
                opacity: 0.9,
                boxShadow: "none",
              },
            }}
          >
            Got it
          </Button>
        </DialogActions>
      </Dialog>
      {/* ── First Installment Amount Dialog ── */}
      <Dialog
        open={firstInstDialog}
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
            // KEY FIX: let dialog shrink when keyboard opens
            maxHeight: "80vh",
            display: "flex",
            flexDirection: "column",
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
        {/* Scrollable content area — scrolls when keyboard pushes up */}
        <DialogContent
          sx={{
            pt: 2.5,
            pb: 1,
            px: 2.5,
            textAlign: "center",
            overflowY: "auto", // ← KEY FIX: this makes it scrollable
            flexShrink: 1,
          }}
        >
          <Typography
            sx={{ fontWeight: 700, fontSize: 15, color: "#111", mb: 0.6 }}
          >
            Set Your Installment Amount
          </Typography>

          <Typography
            sx={{ fontSize: 12, color: "#4b5563", lineHeight: 1.5, mb: 2 }}
          >
            Enter your <b>first installment</b> amount. This becomes your{" "}
            <span
              style={{ color: theme.colors.primaryButton, fontWeight: 700 }}
            >
              fixed amount
            </span>{" "}
            till scheme completion.
          </Typography>

          {/* Amount Input */}
          <Box
            sx={{
              background: "rgba(255,255,255,0.8)",
              border: `1.5px solid ${theme.colors.primaryButton}33`,
              borderRadius: "12px",
              px: 1.5,
              py: 0.4,
              mb: 0.2,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 700,
                color: theme.colors.primaryButton,
              }}
            >
              ₹
            </Typography>
            <TextField
              fullWidth
              variant="standard"
              placeholder={`Min ₹${minAmount.toLocaleString("en-IN")}${
                maxAmount !== Infinity
                  ? ` – Max ₹${maxAmount.toLocaleString("en-IN")}`
                  : ""
              }`}
              value={
                payableAmount
                  ? Number(payableAmount).toLocaleString("en-IN")
                  : ""
              }
              onChange={(e) => {
                const digits = Number(e.target.value.replace(/\D/g, ""));
                setPayableAmount(digits);
                setGoldCon(parseFloat((digits / goldRatePerGM).toFixed(3)));
              }}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              InputProps={{ disableUnderline: true }}
              sx={{
                "& input": {
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#111",
                  textAlign: "left",
                  py: 0.5,
                },
              }}
            />
          </Box>

          {/* Min/Max hint */}
          <Typography sx={{ fontSize: 10.5, color: "#9ca3af", mb: 0.4 }}>
            {maxAmount !== Infinity
              ? `Allowed: ₹${minAmount.toLocaleString(
                  "en-IN",
                )} – ₹${maxAmount.toLocaleString("en-IN")}`
              : `Minimum: ₹${minAmount.toLocaleString("en-IN")}`}
          </Typography>

          <Typography
            sx={{ fontSize: 10.5, color: "#090908", fontWeight: 500 }}
          >
            ⚠️ Cannot be changed after first payment.
          </Typography>
        </DialogContent>

        {/* Actions — fixed at bottom, never scrolls away */}
        <DialogActions
          sx={{
            px: 2,
            pt: 1,
            pb: 2,
            flexDirection: "column",
            gap: 1,
            flexShrink: 0, // ← stays at bottom always
          }}
        >
          {/* Continue button */}
          <Button
            fullWidth
            variant="contained"
            disabled={
              !payableAmount ||
              Number(payableAmount) < minAmount ||
              Number(payableAmount) > maxAmount
            }
            onClick={() => setFirstInstDialog(false)}
            sx={{
              height: 42,
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: 13,
              textTransform: "none",
              backgroundColor: theme.colors.primaryButton,
              boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
              "&:hover": { opacity: 0.92, boxShadow: "none" },
              "&.Mui-disabled": {
                backgroundColor: "rgba(0,0,0,0.07)",
                color: "rgba(0,0,0,0.28)",
                boxShadow: "none",
              },
            }}
          >
            {!payableAmount ||
            Number(payableAmount) < minAmount ||
            Number(payableAmount) > maxAmount
              ? "Enter valid amount"
              : `Continue with ₹${Number(payableAmount).toLocaleString(
                  "en-IN",
                )}`}
          </Button>

          {/* OR divider */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              gap: 1,
            }}
          >
            <Box sx={{ flex: 1, height: "1px", bgcolor: "rgba(0,0,0,0.07)" }} />
            <Typography
              sx={{ fontSize: 10, color: "#9ca3af", fontWeight: 500 }}
            >
              or
            </Typography>
            <Box sx={{ flex: 1, height: "1px", bgcolor: "rgba(0,0,0,0.07)" }} />
          </Box>

          {/* Skip button */}
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              setPayableAmount(data.scheme_amount);
              setGoldCon(
                parseFloat((data.scheme_amount / goldRatePerGM).toFixed(3)),
              );
              setFirstInstDialog(false);
            }}
            sx={{
              height: 38,
              borderRadius: "12px",
              textTransform: "none",
              fontSize: 12,
              fontWeight: 600,
              color: "#6b7280",
              borderColor: "rgba(0,0,0,0.1)",
              backgroundColor: "rgba(255,255,255,0.4)",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.03)",
                boxShadow: "none",
              },
            }}
          >
            Skip · Continue with ₹
            {Number(data.scheme_amount).toLocaleString("en-IN")}/Installment
          </Button>
        </DialogActions>
      </Dialog>

      {/* ✅ Scheme Adjusted Popup */}
      <Dialog open={blockDialog.open} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: "1rem", py: 1.5 }}>
          {blockDialog.title ||
            (scheme_info ? "Scheme Adjusted" : "Installments Completed")}
        </DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          <Typography variant="body2">{blockDialog.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 1.5 }}>
          <Button
            onClick={() =>
              setBlockDialog({ open: false, message: "", title: "" })
            }
            variant="contained"
            size="small"
            sx={{ backgroundColor: theme.colors.primaryButton }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={paymentDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: "1rem", py: 1.5 }}>
          Confirm Payment
        </DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          <Typography variant="body2">
            Are you sure you want to proceed with the payment?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 1.5 }}>
          <Button
            onClick={() => setPaymentDialog(false)}
            color="error"
            variant="outlined"
            size="small"
          >
            Cancel
          </Button>
          <Button
            onClick={() => confirmPayment(false)}
            variant="contained"
            size="small"
            sx={{ backgroundColor: theme.colors.primaryButton }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hidden PhonePe iframe override — opened via 3 taps on user details.
          Same key summary as the screen, plus a Pay Now that routes to the
          iframe flow (user-only; SchemeDetailPageV2 still gates by device). */}
      <Dialog
        open={iframeDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontSize: "1rem", py: 1.5, textAlign: "center" }}>
          Confirm Payment
        </DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}
          >
            <Typography variant="body2" color="text.secondary">
              Scheme
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {data?.mgroup}-{data?.member_no}
            </Typography>
          </Box>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}
          >
            <Typography variant="body2" color="text.secondary">
              Installment No
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {data?.installCnt}
            </Typography>
          </Box>
          {/* Gold conversion — same condition/value as the main screen */}
          {Number(data?.gold_scheme) === 1 && (
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}
            >
              <Typography variant="body2" color="text.secondary">
                Gold Conversion
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {goldCon} gm
              </Typography>
            </Box>
          )}
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              Amount
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              ₹{Number(payableAmount || 0).toLocaleString("en-IN")}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 1.5, gap: 1 }}>
          <Button
            onClick={() => setIframeDialog(false)}
            color="error"
            variant="outlined"
            size="small"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setIframeDialog(false);
              confirmPayment(true);
            }}
            variant="contained"
            size="small"
            sx={{ backgroundColor: theme.colors.primaryButton }}
          >
            Pay Now
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={fixedAmountSnackbar}
        autoHideDuration={3000}
        onClose={() => setFixedAmountSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ top: "120px !important" }}
      >
        <Box
          sx={{
            backgroundColor: "#605f5e",
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
          Installment amount is fixed. You can't edit it.
        </Box>
      </Snackbar>
      {/* Min/Max amount snackbar */}
      <Snackbar
        open={amountSnackbar.open}
        autoHideDuration={3000}
        onClose={() => setAmountSnackbar({ open: false, message: "" })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ top: "120px !important" }}
      >
        <Box
          sx={{
            backgroundColor: "#b45309",
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
          {amountSnackbar.message}
        </Box>
      </Snackbar>

      {/* Daily limit snackbar */}
      <Snackbar
        open={dailyLimitSnackbar}
        autoHideDuration={4000}
        onClose={() => setDailyLimitSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ top: "120px !important" }}
      >
        <Box
          sx={{
            backgroundColor: "#991b1b",
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
        { ` You have already reached your daily payment limit. Only ${maxDailyLimit} transaction per day is
          allowed.`}
        </Box>
      </Snackbar>
    </React.Fragment>
  );
}

export default PaymentScreen;
