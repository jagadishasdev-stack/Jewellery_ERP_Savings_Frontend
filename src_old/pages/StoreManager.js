// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Grid,
//   TextField,
//   Button,
//   Typography,
//   Divider,
//   Paper,
//   List,
//   ListItem,
//   ListItemButton,
//   ListItemText,
//   InputAdornment,
//   Pagination
// } from '@mui/material';
// import SearchIcon from '@mui/icons-material/Search';
// import axios from 'axios';

// const StoreManager = () => {
//   const [form, setForm] = useState({
//     store_name: '', address: '', city: '', state: '', country: 'India',
//     store_pincode: '', store_phone: '', store_mobile: '', store_email: '',
//     gst_no: '', branch: '', sqno: '',
//     sender_id: '', smsgateway: '',
//     cut_start_time: '', cut_end_time: '',
//     privacy_policy: '', terms: '', refund_policy: '', contact_us: ''
//   });

//   const [stores, setStores] = useState([]);
//   const [selectedStoreId, setSelectedStoreId] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 5;


// const fetchStores = React.useCallback(async () => {
//   try {
//     const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/admin/stores`);
//     setStores(response.data);
//   } catch (error) {
//     console.error('Error fetching stores', error);
//   }
// }, []);

// useEffect(() => {
//   fetchStores();
// }, [fetchStores]);


//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async () => {
//     try {
//       if (selectedStoreId) {
//         await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/admin/updatestore/${selectedStoreId}`, form);
//       } else {
//         await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/admin/createstore`, form);
//       }
//       fetchStores();
//       clearForm();
//     } catch (err) {
//       console.error('Submit error:', err);
//     }
//   };

//   const clearForm = () => {
//     setForm({
//       store_name: '', address: '', city: '', state: '', country: 'India',
//       store_pincode: '', store_phone: '', store_mobile: '', store_email: '',
//       gst_no: '', branch: '', sqno: '',
//       sender_id: '', smsgateway: '',
//       cut_start_time: '', cut_end_time: '',
//       privacy_policy: '', terms: '', refund_policy: '', contact_us: ''
//     });
//     setSelectedStoreId(null);
//   };

//   const handleSelectStore = (store) => {

//     // console.log(store);
    
//     setSelectedStoreId(store.store_id);
//     setForm({
//       store_name: store.store_name || '',
//       address: store.store_address || '',
//       city: store.store_city || '',
//       state: store.store_state || '',
//       country: store.store_country || 'India',
//       store_pincode: store.store_pincode || '',
//       store_phone: store.store_phone || '',
//       store_mobile: store.store_mobile || '',
//       store_email: store.store_email || '',
//       gst_no: store.gst_no || '',
//       branch: store.branch || '',
//       sqno: store.sqno || '',
//       sender_id: store.sender_id || '',
//       smsgateway: store.smsgateway || '',
//       cut_start_time: store.cut_start_time || '',
//       cut_end_time: store.cut_end_time || '',
//       privacy_policy: store.privacy_policy || '',
//       terms: store.terms || '',
//       refund_policy: store.refund_policy || '',
//       contact_us: store.contact_us || ''
//     });
//   };

//   const filteredStores = stores.filter(store =>
//     store.store_name.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const paginatedStores = filteredStores.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
//   const totalPages = Math.ceil(filteredStores.length / itemsPerPage);

//   return (
//     <Box p={4}>
//       <Typography variant="h4" gutterBottom>Store Management</Typography>
//       <Grid container spacing={1}>
//         {/* Left Column - Address Info */}
//         <Grid item xs={12} md={6}>
//           <Paper elevation={24} sx={{ p: 1 }}>
//             <Typography variant="h6">Address Information</Typography>
//             {['store_name', 'address', 'city', 'state', 'country', 'store_pincode', 'store_phone', 'store_mobile', 'store_email', 'gst_no', 'branch', 'sqno'].map((field) => (
//               <TextField
//                 key={field}
//                 fullWidth
//                 size="small"
//                 margin="normal"
//                 label={field.replace(/_/g, ' ').toUpperCase()}
//                 name={field}
//                 value={form[field] || ''}
//                 onChange={handleChange}
//               />
//             ))}
//           </Paper>
//         </Grid>

//         {/* Right Column */}
//         <Grid item xs={12} md={6}>
//           <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
//             <Typography variant="h6">SMS Settings</Typography>
//             <TextField label="Sender ID" name="sender_id" fullWidth size="small" margin="normal" value={form.sender_id} onChange={handleChange} />
//             <TextField label="SMS Gateway" name="smsgateway" fullWidth size="small" margin="normal" value={form.smsgateway} onChange={handleChange} />
//           </Paper>

//           <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
//             <Typography variant="h6">Agent Collection Timing</Typography>
//             <TextField label="Cut Start Time" name="cut_start_time" type="time" fullWidth size="small" margin="normal" value={form.cut_start_time} onChange={handleChange} />
//             <TextField label="Cut End Time" name="cut_end_time" type="time" fullWidth size="small" margin="normal" value={form.cut_end_time} onChange={handleChange} />
//           </Paper>

//           <Paper elevation={3} sx={{ p: 2 }}>
//             <Typography variant="h6">URL Settings</Typography>
//             <TextField label="Privacy Policy" name="privacy_policy" fullWidth size="small" margin="normal" value={form.privacy_policy} onChange={handleChange} />
//             <TextField label="Terms & Conditions" name="terms" fullWidth size="small" margin="normal" value={form.terms} onChange={handleChange} />
//             <TextField label="Refund Policy" name="refund_policy" fullWidth size="small" margin="normal" value={form.refund_policy} onChange={handleChange} />
//             <TextField label="Contact Us" name="contact_us" fullWidth size="small" margin="normal" value={form.contact_us} onChange={handleChange} />
//           </Paper>
//         </Grid>

//         {/* Action Buttons */}
//         <Grid item xs={12}>
//           <Box display="flex" justifyContent="center" gap={2}>
//             <Button variant="contained" color="primary" onClick={handleSubmit}>{selectedStoreId ? 'Update Store' : 'Create Store'}</Button>
//             <Button variant="outlined" onClick={clearForm}>Clear</Button>
//           </Box>
//         </Grid>

//         {/* Store List */}
//         <Grid item xs={12}>
//           <Divider sx={{ my: 2 }} />
//           <Typography variant="h6" gutterBottom>Select Existing Store</Typography>

//           <TextField
//             placeholder="Search store by name"
//             fullWidth
//             size="small"
//             margin="normal"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <SearchIcon />
//                 </InputAdornment>
//               )
//             }}
//           />

//           <List>
//             {paginatedStores.map(store => (
//               <ListItem key={store.store_id} disablePadding>
//                 <ListItemButton selected={selectedStoreId === store.store_id} onClick={() => handleSelectStore(store)}>
//                   <ListItemText primary={store.store_name} secondary={store.city} />
//                 </ListItemButton>
//               </ListItem>
//             ))}
//           </List>

//           <Box display="flex" justifyContent="center" mt={2}>
//             <Pagination
//               count={totalPages}
//               page={currentPage}
//               onChange={(e, value) => setCurrentPage(value)}
//               color="primary"
//             />
//           </Box>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

// export default StoreManager;



import { useState, useEffect, useCallback } from "react";
import {
  ThemeProvider, createTheme, CssBaseline, Box, AppBar, Toolbar,
  Typography, Container, Paper, Grid, TextField, Button, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, Snackbar,
  Alert, CircularProgress, Divider, InputAdornment, Tooltip, Fab,
  Card, CardContent, Avatar, useMediaQuery, Drawer, List, ListItem,
  ListItemText, ListItemIcon, Tabs, Tab, Badge
} from "@mui/material";
import {
  Store as StoreIcon, Search, Edit, Add, Refresh, Close,
  Phone, Email, LocationOn, Business, CheckCircle, Cancel,
  Save, ArrowBack, Info, Language, Link, AccessTime, ReceiptLong,
  MenuBook, Policy, ContactSupport, Sms, Facebook, Twitter,
  Instagram, YouTube, ShoppingBag, AccountBalance, QrCode2, Menu
} from "@mui/icons-material";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1a237e", light: "#534bae", dark: "#000051" },
    secondary: { main: "#00bcd4", light: "#62efff", dark: "#008ba3" },
    background: { default: "#f0f4ff", paper: "#ffffff" },
    success: { main: "#2e7d32" },
    error: { main: "#c62828" },
  },
  typography: {
    fontFamily: "'Nunito', 'Segoe UI', sans-serif",
    h4: { fontWeight: 800 },
    h6: { fontWeight: 700 },
    subtitle2: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 700, borderRadius: 8 },
      },
    },
    MuiTextField: {
      defaultProps: { size: "small", variant: "outlined" },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
  },
});

const API_BASE = "https://savingappbackend-etducad0cuhkbud8.centralindia-01.azurewebsites.net/api/store";
// const API_BASE = "http://192.168.0.108:8000/api/store";

const EMPTY_FORM = {
  store_name: "", store_address: "", store_city: "", store_state: "",
  store_country: "India", store_pincode: "", store_phone: "", store_mobile: "",
  store_email: "", status: "A", rate: "", sqno: 0, sender_id: "", gst_no: "",
  branch: "", cut_start_time: "", cut_end_time: "", privacy_policy: "",
  terms: "", refund_policy: "", contact_us: "", smsgateway: "",
  fb_path: "", twitter_path: "", insta_path: "", yt_path: "",
  getythelplink: "", NextCust_Id: "", playstore_path: "",
};

const TABS = [
  { label: "Basic Info", icon: <Business fontSize="small" /> },
  { label: "Contact", icon: <Phone fontSize="small" /> },
  { label: "Timing", icon: <AccessTime fontSize="small" /> },
  { label: "Policies", icon: <Policy fontSize="small" /> },
  { label: "Social", icon: <Language fontSize="small" /> },
];

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

function StoreFormDialog({ open, onClose, initialData, onSave, loading }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [tab, setTab] = useState(0);
  const isEdit = !!initialData?.store_id;

  useEffect(() => {
    if (open) {
      setForm(initialData ? { ...EMPTY_FORM, ...initialData } : EMPTY_FORM);
      setTab(0);
    }
  }, [open, initialData]);

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const field = (name, label, props = {}) => (
    <TextField fullWidth name={name} label={label} value={form[name] ?? ""} onChange={handle} {...props} />
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
      PaperProps={{ sx: { borderRadius: 3, maxHeight: "92vh" } }}>
      <DialogTitle sx={{ bgcolor: "primary.main", color: "#fff", display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ bgcolor: "secondary.main", width: 36, height: 36 }}>
          {isEdit ? <Edit fontSize="small" /> : <Add fontSize="small" />}
        </Avatar>
        <Box flex={1}>
          <Typography variant="h6">{isEdit ? "Edit Store" : "Create New Store"}</Typography>
          {isEdit && <Typography variant="caption" sx={{ opacity: 0.8 }}>Store ID: {initialData?.store_id}</Typography>}
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "#fff" }}><Close /></IconButton>
      </DialogTitle>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: "divider", px: 2, bgcolor: "#f8faff" }}>
        {TABS.map((t, i) => (
          <Tab key={i} label={t.label} icon={t.icon} iconPosition="start"
            sx={{ minHeight: 48, textTransform: "none", fontWeight: 600, fontSize: 13 }} />
        ))}
      </Tabs>

      <DialogContent sx={{ pt: 1.5 }}>
        {/* Basic Info */}
        <TabPanel value={tab} index={0}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>{field("store_name", "Store Name *")}</Grid>
            <Grid item xs={12} sm={6}>{field("branch", "Branch Code")}</Grid>
            <Grid item xs={12}>{field("store_address", "Address")}</Grid>
            <Grid item xs={12} sm={4}>{field("store_city", "City")}</Grid>
            <Grid item xs={12} sm={4}>{field("store_state", "State")}</Grid>
            <Grid item xs={12} sm={4}>{field("store_country", "Country")}</Grid>
            <Grid item xs={12} sm={4}>{field("store_pincode", "Pincode")}</Grid>
            <Grid item xs={12} sm={4}>{field("gst_no", "GST Number")}</Grid>
            <Grid item xs={12} sm={4}>{field("rate", "Rate", { type: "number" })}</Grid>
            <Grid item xs={12} sm={4}>{field("status", "Status", { select: true, SelectProps: { native: true } })}{
              /* fallback */}
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField select fullWidth name="status" label="Status" value={form.status} onChange={handle}
                SelectProps={{ native: true }}>
                <option value="A">Active</option>
                <option value="I">Inactive</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>{field("sqno", "Sequence No", { type: "number" })}</Grid>
            <Grid item xs={12} sm={4}>{field("NextCust_Id", "Next Customer ID", { type: "number" })}</Grid>
          </Grid>
        </TabPanel>

        {/* Contact */}
        <TabPanel value={tab} index={1}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              {field("store_phone", "Phone", { InputProps: { startAdornment: <InputAdornment position="start"><Phone sx={{ fontSize: 18 }} /></InputAdornment> } })}
            </Grid>
            <Grid item xs={12} sm={6}>
              {field("store_mobile", "Mobile", { InputProps: { startAdornment: <InputAdornment position="start"><Phone sx={{ fontSize: 18 }} /></InputAdornment> } })}
            </Grid>
            <Grid item xs={12}>
              {field("store_email", "Email", { type: "email", InputProps: { startAdornment: <InputAdornment position="start"><Email sx={{ fontSize: 18 }} /></InputAdornment> } })}
            </Grid>
            <Grid item xs={12}>{field("sender_id", "SMS Sender ID")}</Grid>
            <Grid item xs={12}>{field("smsgateway", "SMS Gateway Config")}</Grid>
            <Grid item xs={12}>{field("contact_us", "Contact Us URL")}</Grid>
          </Grid>
        </TabPanel>

        {/* Timing */}
        <TabPanel value={tab} index={2}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>{field("cut_start_time", "Cut Start Time", { type: "time", InputLabelProps: { shrink: true } })}</Grid>
            <Grid item xs={12} sm={6}>{field("cut_end_time", "Cut End Time", { type: "time", InputLabelProps: { shrink: true } })}</Grid>
          </Grid>
        </TabPanel>

        {/* Policies */}
        <TabPanel value={tab} index={3}>
          <Grid container spacing={2}>
            <Grid item xs={12}>{field("privacy_policy", "Privacy Policy URL")}</Grid>
            <Grid item xs={12}>{field("terms", "Terms & Conditions URL")}</Grid>
            <Grid item xs={12}>{field("refund_policy", "Refund Policy URL")}</Grid>
          </Grid>
        </TabPanel>

        {/* Social */}
        <TabPanel value={tab} index={4}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              {field("fb_path", "Facebook URL", { InputProps: { startAdornment: <InputAdornment position="start"><Facebook sx={{ fontSize: 18, color: "#1877f2" }} /></InputAdornment> } })}
            </Grid>
            <Grid item xs={12} sm={6}>
              {field("twitter_path", "Twitter / X URL", { InputProps: { startAdornment: <InputAdornment position="start"><Twitter sx={{ fontSize: 18, color: "#1da1f2" }} /></InputAdornment> } })}
            </Grid>
            <Grid item xs={12} sm={6}>
              {field("insta_path", "Instagram URL", { InputProps: { startAdornment: <InputAdornment position="start"><Instagram sx={{ fontSize: 18, color: "#e1306c" }} /></InputAdornment> } })}
            </Grid>
            <Grid item xs={12} sm={6}>
              {field("yt_path", "YouTube URL", { InputProps: { startAdornment: <InputAdornment position="start"><YouTube sx={{ fontSize: 18, color: "#ff0000" }} /></InputAdornment> } })}
            </Grid>
            <Grid item xs={12}>{field("getythelplink", "Help Link URL")}</Grid>
            <Grid item xs={12}>{field("playstore_path", "Play Store URL")}</Grid>
          </Grid>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1, borderTop: "1px solid", borderColor: "divider" }}>
        <Button onClick={onClose} startIcon={<ArrowBack />} variant="outlined" color="inherit">Cancel</Button>
        <Button onClick={() => onSave(form)} startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Save />}
          variant="contained" disabled={loading} sx={{ minWidth: 120 }}>
          {isEdit ? "Update Store" : "Create Store"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function StoreCard({ store, onEdit }) {
  return (
    <Card elevation={2} sx={{ borderRadius: 2, transition: "all 0.2s", "&:hover": { elevation: 6, transform: "translateY(-2px)", boxShadow: "0 8px 24px rgba(26,35,126,0.12)" } }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1.5}>
          <Box display="flex" gap={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>
              <StoreIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>{store.store_name || "—"}</Typography>
              <Typography variant="caption" color="text.secondary">ID: {store.store_id} {store.branch ? `· ${store.branch}` : ""}</Typography>
            </Box>
          </Box>
          <Chip size="small" label={store.status === "A" ? "Active" : "Inactive"}
            color={store.status === "A" ? "success" : "error"}
            icon={store.status === "A" ? <CheckCircle sx={{ fontSize: "14px !important" }} /> : <Cancel sx={{ fontSize: "14px !important" }} />}
            sx={{ fontWeight: 700, fontSize: 11 }} />
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        <Box display="flex" flexDirection="column" gap={0.6}>
          {store.store_city && (
            <Box display="flex" gap={1} alignItems="center">
              <LocationOn sx={{ fontSize: 15, color: "primary.main" }} />
              <Typography variant="caption" color="text.secondary">
                {[store.store_city, store.store_state, store.store_country].filter(Boolean).join(", ")}
              </Typography>
            </Box>
          )}
          {store.store_mobile && (
            <Box display="flex" gap={1} alignItems="center">
              <Phone sx={{ fontSize: 15, color: "primary.main" }} />
              <Typography variant="caption" color="text.secondary">{store.store_mobile}</Typography>
            </Box>
          )}
          {store.store_email && (
            <Box display="flex" gap={1} alignItems="center">
              <Email sx={{ fontSize: 15, color: "primary.main" }} />
              <Typography variant="caption" color="text.secondary" noWrap>{store.store_email}</Typography>
            </Box>
          )}
        </Box>

        <Box display="flex" justifyContent="flex-end" mt={1.5}>
          <Button size="small" startIcon={<Edit fontSize="small" />} onClick={() => onEdit(store)}
            variant="outlined" color="primary" sx={{ fontSize: 12 }}>
            Edit
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function App() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchId, setSearchId] = useState("");
  const [selectedStore, setSelectedStore] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editStore, setEditStore] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });
  const [view, setView] = useState("grid"); // grid | table
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const notify = (msg, severity = "success") => setSnack({ open: true, msg, severity });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/all`);
      const data = await res.json();
      if (data.success) setStores(data.data);
      else notify(data.message || "Failed to load stores", "error");
    } catch {
      notify("Cannot reach server. Check API_BASE URL.", "error");
    } finally { setLoading(false); }
  }, []);

  // const fetchById = async () => {
  //   if (!searchId.trim()) return fetchAll();
  //   setLoading(true);
  //   try {
  //     const res = await fetch(`${API_BASE}/${searchId.trim()}`);
  //     const data = await res.json();
  //     if (data.success) { setStores([data.data]); setSelectedStore(data.data); }
  //     else notify(data.message || "Store not found", "warning");
  //   } catch {
  //     notify("Error fetching store.", "error");
  //   } finally { setLoading(false); }
  // };

  const fetchById = async () => {
  if (!searchId.trim()) return fetchAll();

  const isNumeric = /^\d+$/.test(searchId.trim());

  if (isNumeric) {
    // Search by Store ID (existing logic)
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/${searchId.trim()}`);
      const data = await res.json();
      if (data.success) { setStores([data.data]); setSelectedStore(data.data); }
      else notify(data.message || "Store not found", "warning");
    } catch {
      notify("Error fetching store.", "error");
    } finally { setLoading(false); }
  } else {
    // Search by Store Name (filter from already loaded stores)
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/all`);
      const data = await res.json();
      if (data.success) {
        const filtered = data.data.filter(store =>
          store.store_name?.toLowerCase().includes(searchId.trim().toLowerCase())
        );
        if (filtered.length > 0) setStores(filtered);
        else notify("No stores found with that name", "warning");
      } else {
        notify(data.message || "Failed to load stores", "error");
      }
    } catch {
      notify("Error fetching stores.", "error");
    } finally { setLoading(false); }
  }
};
  
  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSave = async (form) => {
    setSaving(true);
    const isEdit = !!form.store_id;
    const url = isEdit ? `${API_BASE}/update/${form.store_id}` : `${API_BASE}/create`;
    const method = isEdit ? "PUT" : "POST";
    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.success) {
        notify(data.message);
        setDialogOpen(false);
        fetchAll();
      } else {
        notify(data.message || "Operation failed", "error");
      }
    } catch {
      notify("Network error.", "error");
    } finally { setSaving(false); }
  };

  const openCreate = () => { setEditStore(null); setDialogOpen(true); };
  const openEdit = (store) => { setEditStore(store); setDialogOpen(true); };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        {/* AppBar */}
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: "primary.main", borderBottom: "3px solid", borderColor: "secondary.main" }}>
          <Toolbar sx={{ gap: 1.5 }}>
            <Avatar sx={{ bgcolor: "secondary.main", width: 36, height: 36 }}>
              <StoreIcon fontSize="small" />
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" fontWeight={800} lineHeight={1}>Store Manager</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>Manage your store records</Typography>
            </Box>
            <Chip label={`${stores.length} Stores`} size="small" color="secondary"
              sx={{ fontWeight: 700, color: "#fff", bgcolor: "secondary.dark" }} />
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* Search & Actions */}
          <Paper elevation={0} sx={{ p: 2, mb: 3, border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={4}>
                <TextField fullWidth placeholder="Enter Store ID or Name..."
                  value={searchId} onChange={(e) => setSearchId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchById()}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>,
                    endAdornment: searchId ? (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => { setSearchId(""); fetchAll(); }}><Close fontSize="small" /></IconButton>
                      </InputAdornment>
                    ) : null,
                  }} />
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <Button fullWidth variant="contained" onClick={fetchById} startIcon={<Search />}>Search</Button>
              </Grid>
              <Grid item xs={6} sm={3} md={2}>
                <Button fullWidth variant="outlined" onClick={fetchAll} startIcon={<Refresh />}>Refresh</Button>
              </Grid>
              <Grid item xs={12} md={4} display="flex" justifyContent={{ xs: "flex-start", md: "flex-end" }}>
                <Button variant="contained" color="secondary" startIcon={<Add />} onClick={openCreate}
                  sx={{ bgcolor: "secondary.dark", "&:hover": { bgcolor: "secondary.main" } }}>
                  Add New Store
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Content */}
          {loading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress size={48} />
            </Box>
          ) : stores.length === 0 ? (
            <Paper elevation={0} sx={{ p: 6, textAlign: "center", border: "2px dashed", borderColor: "divider", borderRadius: 3 }}>
              <StoreIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">No stores found</Typography>
              <Typography variant="body2" color="text.disabled" mb={2}>Try a different Store ID or add a new one</Typography>
              <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Add First Store</Button>
            </Paper>
          ) : (
            <>
              {/* Table View */}
              <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, overflow: "hidden", display: { xs: "none", md: "block" } }}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#1a237e" }}>
                        {["ID", "Store Name", "City", "State", "Mobile", "Email", "GST No", "Status", "Actions"].map((h) => (
                          <TableCell key={h} sx={{ color: "#fff", fontWeight: 700, py: 1.5, fontSize: 13, whiteSpace: "nowrap" }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stores.map((s, i) => (
                        <TableRow key={s.store_id} hover sx={{ bgcolor: i % 2 === 0 ? "#fff" : "#f8faff" }}>
                          <TableCell sx={{ fontWeight: 700, color: "primary.main" }}>{s.store_id}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{s.store_name || "—"}</TableCell>
                          <TableCell>{s.store_city || "—"}</TableCell>
                          <TableCell>{s.store_state || "—"}</TableCell>
                          <TableCell>{s.store_mobile || "—"}</TableCell>
                          <TableCell sx={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.store_email || "—"}</TableCell>
                          <TableCell>{s.gst_no || "—"}</TableCell>
                          <TableCell>
                            <Chip size="small" label={s.status === "A" ? "Active" : "Inactive"}
                              color={s.status === "A" ? "success" : "error"} sx={{ fontWeight: 700, fontSize: 11 }} />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Edit Store">
                              <IconButton size="small" onClick={() => openEdit(s)} color="primary">
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              {/* Card Grid (mobile & md) */}
              <Grid container spacing={2} sx={{ display: { xs: "flex", md: "none" } }}>
                {stores.map((s) => (
                  <Grid item xs={12} sm={6} key={s.store_id}>
                    <StoreCard store={s} onEdit={openEdit} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Container>

        {/* FAB on mobile */}
        {isMobile && (
          <Fab color="secondary" sx={{ position: "fixed", bottom: 24, right: 24, boxShadow: "0 4px 20px rgba(0,188,212,0.4)" }} onClick={openCreate}>
            <Add />
          </Fab>
        )}

        {/* Form Dialog */}
        <StoreFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)}
          initialData={editStore} onSave={handleSave} loading={saving} />

        {/* Snackbar */}
        <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert severity={snack.severity} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}