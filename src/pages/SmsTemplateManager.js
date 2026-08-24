import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Container, Grid, TextField, MenuItem, Typography, Button, Snackbar, Alert
} from '@mui/material';
import axios from 'axios';
import { StoreContext } from '../contexts/StoreContext';

const templateTypes = [
  { label: 'OTP', key: 'opt' },
  { label: 'Visit', key: 'mna' },
  { label: 'Thanks', key: 'rec' },
  { label: 'Schedule', key: 'mnxt_sch' },
  { label: 'Join', key: 'join' },
  { label: 'Password', key: 'recover_pwd' },
  { label: 'OTP Verify', key: 'userReg_opt' },
  { label: 'Agent OTP', key: 'recg' }
];

function SmsTemplateManager() {
  // const { stores } = useContext(StoreContext);
  const { stores = [] } = useContext(StoreContext);
  const [selectedStore, setSelectedStore] = useState('');
  const [smsGateway, setSmsGateway] = useState('');
  const [selectedTemplateType, setSelectedTemplateType] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [templates, setTemplates] = useState(null);
  const [testMobile, setTestMobile] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
  if (selectedStore && stores?.length > 0) {
    const store = stores.find(s => s.store_id === parseInt(selectedStore)); 
    setSmsGateway(store?.smsgateway || '');
    fetchTemplates(selectedStore);
  }
}, [selectedStore, stores]);


  useEffect(() => {
    if (templates && selectedTemplateType) {
      const msgKey = `${selectedTemplateType}_msg`;
      const idKey = `${selectedTemplateType}_template_id`;
      setTemplateContent(templates[msgKey] || '');
      setTemplateId(templates[idKey] || '');
    }
  }, [selectedTemplateType, templates]);

  const fetchTemplates = async (storeId) => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/admin/getsmstemplates/${storeId}`);
      setTemplates(res.data[0] || {});
    } catch (err) {
      console.error('Error fetching templates', err);
    }
  };

  const handleSubmit = async () => {
    if (!templateContent || !templateId || !selectedStore || !selectedTemplateType) {
      setSnackbar({ open: true, message: 'All fields required', severity: 'warning' });
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/admin/createsmstemplate`, {
        store_id: selectedStore,
        type: selectedTemplateType,
        content: templateContent,
        template_id: templateId
      });
      setSnackbar({ open: true, message: 'Template saved successfully.', severity: 'success' });
      fetchTemplates(selectedStore);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save template';
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

const handleSendTestSMS = async () => {
  if (!testMobile || !templateContent || !templateId || !smsGateway) {
    setSnackbar({ open: true, message: 'Please enter all test details', severity: 'warning' });
    return;
  }

  try {
    const filledMessage = templateContent
      .replace(/<OTP>/gi, '123456')
      .replace(/<name>/gi, 'Test User');

    const encodedMsg = encodeURIComponent(filledMessage);

    // Replace <TO>, <MESSAGE>, <TMPLTID> in the raw URL
    const finalUrl = smsGateway
      .replace(/<TO>/g, testMobile)
      .replace(/<MESSAGE>/g, encodedMsg)
      .replace(/<TMPLTID>/g, templateId);

    const response = await fetch(finalUrl);
    if (response.ok) {
      setSnackbar({ open: true, message: 'Test SMS sent successfully.', severity: 'success' });
      setTestMobile('');
    } else {
      setSnackbar({ open: true, message: 'Failed to send SMS.', severity: 'error' });
    }
  } catch (err) {
    console.error('Error sending SMS:', err);
    setSnackbar({ open: true, message: 'An error occurred while sending SMS.', severity: 'error' });
  }
};



  return (
    <Container maxWidth="md">
      <Box mt={4} p={3} boxShadow={3} borderRadius={2}>
        <Typography variant="h5" gutterBottom>SMS Template Manager</Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Select Store"
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              margin="normal"
            >
              {stores?.map(store => (
                <MenuItem key={store.store_id} value={store.store_id}>
                  {store.store_name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="SMS Gateway"
              value={smsGateway}
              margin="normal"
              disabled
            />
          </Grid>
        </Grid>

        {selectedStore && (
          <Box mt={2}>
            <TextField
              fullWidth
              select
              label="Template Type"
              value={selectedTemplateType}
              onChange={(e) => setSelectedTemplateType(e.target.value)}
              margin="normal"
            >
              {templateTypes.map((type) => (
                <MenuItem key={type.key} value={type.key}>{type.label}</MenuItem>
              ))}
            </TextField>

            {selectedTemplateType && (
              <>
                <TextField
                  fullWidth
                  label="Template ID"
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  label="Template Content"
                  value={templateContent}
                  onChange={(e) => setTemplateContent(e.target.value)}
                  margin="normal"
                />
                <Button fullWidth variant="contained" onClick={handleSubmit} sx={{ mt: 2 }}>
                  Save Template
                </Button>

                <Box mt={4}>
                  <Typography variant="h6">Send Test SMS</Typography>
                  <Grid container spacing={2} mt={1}>
                    <Grid item xs={12} md={8}>
                      <TextField
                        fullWidth
                        label="Enter Mobile Number"
                        value={testMobile}
                        onChange={(e) => setTestMobile(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Button fullWidth variant="outlined" onClick={handleSendTestSMS} sx={{ height: '100%' }}>
                        Send Test SMS
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </>
            )}  
          </Box>
        )}

        {templates && selectedTemplateType && (
          <Box mt={4}>
            <Typography variant="h6">Existing Template</Typography>
            <Box mt={2} p={2} boxShadow={1} borderRadius={1}>
              <Typography><strong>Template ID:</strong> {templates[`${selectedTemplateType}_template_id`] || 'N/A'}</Typography>
              <Typography variant="body2">{templates[`${selectedTemplateType}_msg`] || 'No template content available'}</Typography>
            </Box>
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
      </Box>
    </Container>
  );
}

export default SmsTemplateManager;
