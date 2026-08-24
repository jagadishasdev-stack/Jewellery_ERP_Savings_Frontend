import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Container, Typography, TextField, Button, MenuItem, Snackbar, Alert
} from '@mui/material';
import axios from 'axios';
import { StoreContext } from '../contexts/StoreContext';

function StoreAdminManager() {
  const { stores } = useContext(StoreContext);
  const [selectedStore, setSelectedStore] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('A'); // Default Active
  const [admins, setAdmins] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    if (selectedStore) fetchAdmins(selectedStore);
  }, [selectedStore]);

  const fetchAdmins = async (storeId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/admin/getstoreadmin/${storeId}`);
      setAdmins(res.data);
    } catch (error) {
      console.error('Failed to fetch admins', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedStore || !phone || !email || !password || !name) {
      setSnackbar({ open: true, message: 'All fields are required', severity: 'warning' });
      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/admin/createstoreadmin`, {
        store_id: selectedStore,
        name,
        phone,
        email,
        password,
        status
      });

      setSnackbar({ open: true, message: res.data.message, severity: 'success' });
      fetchAdmins(selectedStore);
      clearForm();
    } catch (error) {
      const msg = error.response?.data?.message || 'Error saving admin';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const handleEdit = (admin) => {
    setName(admin.name);
    setPhone(admin.phone);
    setEmail(admin.email);
    setPassword(admin.password || '');
    setStatus(admin.status || 'A');
  };

  const clearForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setPassword('');
    setStatus('A');
  };

  return (
    <Container maxWidth="sm">
      <Box mt={4} p={3} boxShadow={3} borderRadius={2}>
        <Typography variant="h5" gutterBottom>Store Admin Management</Typography>

        <TextField
          select fullWidth label="Select Store" value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)} margin="normal"
        >
          {stores.map(store => (
            <MenuItem key={store.store_id} value={store.store_id}>{store.store_name}</MenuItem>
          ))}
        </TextField>

        <TextField fullWidth label="Admin Name" value={name} onChange={(e) => setName(e.target.value)} margin="normal" />
        <TextField fullWidth label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} margin="normal" />
        <TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" />
        <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} margin="normal" />
        <TextField
          select
          fullWidth
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          margin="normal"
        >
          <MenuItem value="A">Active</MenuItem>
          <MenuItem value="I">Inactive</MenuItem>
        </TextField>

        <Box display="flex" gap={2} mt={2}>
          <Button variant="contained" color="primary" onClick={handleSubmit}>Save Admin</Button>
          <Button variant="outlined" onClick={clearForm}>Clear</Button>
        </Box>
      </Box>

      {admins.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6">Existing Admins</Typography>
          {admins.map(admin => (
            <Box key={admin.store_admin_id} mt={1} p={2} boxShadow={1} borderRadius={1}
              onClick={() => handleEdit(admin)} sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}>
              <Typography>{admin.name} ({admin.phone})</Typography>
            </Box>
          ))}
        </Box>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default StoreAdminManager;
