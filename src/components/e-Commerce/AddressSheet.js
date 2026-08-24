import React, { useContext, useEffect, useState } from "react";
import { Box, Typography, TextField } from "@mui/material";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BottomSheet from "./ui/BottomSheet";
import { PrimaryCTA } from "./ui/Buttons";
import { AuthContext } from "../../contexts/AuthContext";
import APP_CONFIG from "../../config/constants";
import { GOLD, INK, INK_SOFT, MUTED, LINE, RADIUS } from "./ui/ecomTokens";

// ─── AddressSheet ─────────────────────────────────────────────────────────────
// Shared "Select delivery address" bottom sheet used by the Product page and the
// Order Summary. Single address per user (users row): save === update === replace.
//  • Guest (no user_id): can view, but saving is gated behind login.
//  • Logged-in with address: shows the saved address + edit.
//  • Logged-in without address: opens the add-address form directly.
// The saved address lives on `adminUser`; on save we PUT it and mirror it back
// via updateAdminUser so every screen reflects the change (no prop drilling).

const emptyForm = {
  name: "",
  mobile: "",
  address1: "",
  address2: "",
  address3: "",
  place: "",
  pincode: "",
  latitude: "",
  longitude: "",
};

const buildFormFromUser = (u) => ({
  name: u?.name || "",
  mobile: u?.mobile || "",
  address1: u?.address1 || "",
  address2: u?.address2 || "",
  address3: u?.address3 || "",
  place: u?.place || "",
  pincode: u?.pincode || "",
  latitude: u?.latitude || "",
  longitude: u?.longitude || "",
});

const fieldSx = {
  "& .MuiOutlinedInput-root": { borderRadius: RADIUS.sm },
};

const AddressSheet = ({ open, onClose, branchId }) => {
  const navigate = useNavigate();
  const { adminUser, loginRole, updateAdminUser } = useContext(AuthContext);

  const isLoggedIn = !!adminUser?.user_id && loginRole !== "guest";
  const hasSavedAddress = !!(adminUser?.address1 || adminUser?.address2);

  const [view, setView] = useState("list"); // "list" | "form"
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Reset each time the sheet opens: prefill from the saved address, and land on
  // the form directly for a logged-in user who has no address yet (Scenario 1).
  useEffect(() => {
    if (!open) return;
    setForm(buildFormFromUser(adminUser));
    setError("");
    setView(isLoggedIn && !hasSavedAddress ? "form" : "list");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const setField = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const goLogin = () => {
    onClose?.();
    navigate("/");
  };

  const handleSave = async () => {
    if (!isLoggedIn) {
      goLogin();
      return;
    }
    if (!form.address1.trim() || !form.pincode.trim()) {
      setError("Please enter at least the address and pincode.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const baseURL = process.env.REACT_APP_API_BASE_URL;
      // Branch comes from the product/stock (passed as branchId), per spec — sent
      // as context only; the backend does not overwrite the user's branch.
      const payload = {
        user_id: adminUser.user_id,
        store_id: adminUser.store_id ?? APP_CONFIG.STORE_ID,
        branch_id: branchId ?? APP_CONFIG.BRANCH,
        name: form.name,
        mobile: form.mobile,
        address1: form.address1,
        address2: form.address2,
        address3: form.address3,
        place: form.place,
        pincode: form.pincode,
        latitude: form.latitude,
        longitude: form.longitude,
      };
      const res = await axios.put(`${baseURL}/api/e-com/address`, payload);
      const saved = res.data?.data || {};

      // Mirror into adminUser so Product page + Order Summary reflect it.
      updateAdminUser({
        name: saved.name ?? form.name,
        address1: saved.address1 ?? form.address1,
        address2: saved.address2 ?? form.address2,
        address3: saved.address3 ?? form.address3,
        place: saved.place ?? form.place,
        pincode: saved.pincode ?? form.pincode,
        latitude: saved.latitude ?? form.latitude,
        longitude: saved.longitude ?? form.longitude,
      });
      onClose?.();
    } catch (e) {
      console.error("Save address failed:", e);
      setError("Failed to save address. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const savedLine = [
    adminUser?.address1,
    adminUser?.address2,
    adminUser?.address3,
    adminUser?.place,
    adminUser?.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <BottomSheet open={open} onClose={onClose} title="Select delivery address">
      {view === "list" ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: INK }}>
            Saved addresses
          </Typography>

          {!isLoggedIn ? (
            <Box
              onClick={goLogin}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                p: 1.5,
                borderRadius: RADIUS.sm,
                border: `1px solid ${LINE}`,
                cursor: "pointer",
              }}
            >
              <PersonOutlineRoundedIcon sx={{ color: GOLD, fontSize: 22 }} />
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: GOLD }}>
                Login to see saved addresses
              </Typography>
            </Box>
          ) : hasSavedAddress ? (
            <Box
              sx={{
                p: 1.5,
                borderRadius: RADIUS.sm,
                border: `1px solid ${GOLD}`,
                bgcolor: "rgba(185,138,70,0.05)",
              }}
            >
              <Box sx={{ display: "flex", gap: 1.25 }}>
                <LocationOnOutlinedIcon sx={{ color: GOLD, fontSize: 22, mt: 0.25 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {adminUser?.name && (
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: INK }}>
                      {adminUser.name}
                    </Typography>
                  )}
                  <Typography sx={{ fontSize: 12.5, color: INK_SOFT, mt: 0.25 }}>
                    {savedLine}
                  </Typography>
                  {adminUser?.mobile && (
                    <Typography sx={{ fontSize: 12.5, color: INK, mt: 0.5, fontWeight: 600 }}>
                      {adminUser.mobile}
                    </Typography>
                  )}
                </Box>
              </Box>
              <Box
                onClick={() => {
                  setForm(buildFormFromUser(adminUser));
                  setView("form");
                }}
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.5,
                  mt: 1,
                  cursor: "pointer",
                }}
              >
                <EditOutlinedIcon sx={{ fontSize: 16, color: GOLD }} />
                <Typography sx={{ fontSize: 13, fontWeight: 700, color: GOLD }}>
                  Change / Edit address
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box
              onClick={() => {
                setForm(buildFormFromUser(adminUser));
                setView("form");
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                p: 1.5,
                borderRadius: RADIUS.sm,
                border: `1px solid ${LINE}`,
                cursor: "pointer",
              }}
            >
              <LocationOnOutlinedIcon sx={{ color: GOLD, fontSize: 22 }} />
              <Typography sx={{ flex: 1, fontSize: 14, fontWeight: 600, color: GOLD }}>
                Add delivery address
              </Typography>
              <ChevronRightRoundedIcon sx={{ color: MUTED }} />
            </Box>
          )}

          {error && (
            <Typography sx={{ fontSize: 12.5, color: "#D32F2F", mt: 0.5 }}>
              {error}
            </Typography>
          )}
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <TextField
            label="Full Name"
            value={form.name}
            onChange={setField("name")}
            size="small"
            fullWidth
            sx={fieldSx}
          />
          <TextField
            label="Mobile Number"
            value={form.mobile}
            size="small"
            fullWidth
            disabled
            helperText="Your registered number"
            sx={fieldSx}
          />
          <TextField
            label="Pincode"
            value={form.pincode}
            onChange={setField("pincode")}
            size="small"
            fullWidth
            inputProps={{ inputMode: "numeric" }}
            sx={fieldSx}
          />
          <TextField
            label="Address (House / Flat / Building)"
            value={form.address1}
            onChange={setField("address1")}
            size="small"
            fullWidth
            sx={fieldSx}
          />
          <TextField
            label="Area / Street"
            value={form.address2}
            onChange={setField("address2")}
            size="small"
            fullWidth
            sx={fieldSx}
          />
          <TextField
            label="Landmark (optional)"
            value={form.address3}
            onChange={setField("address3")}
            size="small"
            fullWidth
            sx={fieldSx}
          />
          <TextField
            label="City / Town"
            value={form.place}
            onChange={setField("place")}
            size="small"
            fullWidth
            sx={fieldSx}
          />

          {error && (
            <Typography sx={{ fontSize: 12.5, color: "#D32F2F" }}>
              {error}
            </Typography>
          )}

          <PrimaryCTA onClick={handleSave} loading={saving} height={48}>
            Save address
          </PrimaryCTA>

          {(hasSavedAddress || !isLoggedIn) && (
            <Typography
              onClick={() => setView("list")}
              sx={{
                textAlign: "center",
                fontSize: 13,
                fontWeight: 600,
                color: MUTED,
                cursor: "pointer",
              }}
            >
              Back
            </Typography>
          )}
        </Box>
      )}
    </BottomSheet>
  );
};

export default AddressSheet;
