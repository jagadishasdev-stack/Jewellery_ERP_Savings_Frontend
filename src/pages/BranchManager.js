import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Container, Typography, TextField, Button, MenuItem, Snackbar, Alert, Stack
} from '@mui/material';
import axios from 'axios';
import { StoreContext } from '../contexts/StoreContext';

function BranchManager() {
  const { stores } = useContext(StoreContext);
  const [selectedStore, setSelectedStore] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [branches, setBranches] = useState([]);
  const [editing, setEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    if (selectedStore) {
      fetchBranches(selectedStore);
    } else {
      setBranches([]);
    }
  }, [selectedStore]);

  const fetchBranches = async (storeId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/admin/getbranch/${storeId}`);
      setBranches(res.data);
    } catch (error) {
      console.error('Failed to fetch branches', error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedStore || !branchCode || !branchName) {
      setSnackbar({ open: true, message: 'All fields required', severity: 'warning' });
      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/admin/createbranch`, {
        store_id: selectedStore,
        branch_code: branchCode,
        branch_name: branchName
      });

      setSnackbar({ open: true, message: res.data.message, severity: 'success' });
      fetchBranches(selectedStore);
      handleClear();
    } catch (error) {
      const msg = error.response?.data?.message || 'Error saving branch';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const handleEdit = (branch) => {
    setBranchCode(branch.branch_code);
    setBranchName(branch.branch_name);
    setEditing(true);
  };

  const handleClear = () => {
    setBranchCode('');
    setBranchName('');
    setEditing(false);
  };

  return (
    <Container maxWidth="sm">
      <Box mt={4} p={3} boxShadow={3} borderRadius={2}>
        <Typography variant="h5" gutterBottom>
          Branch Management
        </Typography>

        <TextField
          select
          fullWidth
          label="Select Store"
          value={selectedStore}
          onChange={(e) => {
            setSelectedStore(e.target.value);
            handleClear();
          }}
          margin="normal"
          SelectProps={{ native: false }}
        >
          {stores.map(store => (
            <MenuItem key={store.store_id} value={store.store_id}>
              {store.store_name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          label="Branch Code"
          value={branchCode}
          onChange={(e) => setBranchCode(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Branch Name"
          value={branchName}
          onChange={(e) => setBranchName(e.target.value)}
          margin="normal"
        />

        <Stack direction="row" spacing={2} mt={2}>
          <Button fullWidth variant="contained" color="primary" onClick={handleSubmit}>
            {editing ? 'Update Branch' : 'Create Branch'}
          </Button>
          <Button fullWidth variant="outlined" color="secondary" onClick={handleClear}>
            Clear
          </Button>
        </Stack>
      </Box>

      {branches.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6">Existing Branches</Typography>
          {branches.map(branch => (
            <Box
              key={branch.Id}
              mt={1}
              p={2}
              boxShadow={1}
              borderRadius={1}
              onClick={() => handleEdit(branch)}
              sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
            >
              <Typography>{branch.branch_code} - {branch.branch_name}</Typography>
            </Box>
          ))}
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default BranchManager;
