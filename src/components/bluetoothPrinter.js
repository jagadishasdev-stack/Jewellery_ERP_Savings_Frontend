// bluetoothPrinter.js
import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, List, ListItem } from '@mui/material';

const BluetoothPrinter = () => {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    requestPermissions();
    scanBluetoothDevices();
  }, []);

  const requestPermissions = async () => {
    if (window.cordova?.plugins?.diagnostic) {
      const diagnostic = window.cordova.plugins.diagnostic;
      diagnostic.requestBluetoothAuthorization(() => {}, () => {});
    }
  };

  const scanBluetoothDevices = () => {
    const foundDevices = [];

    // Classic Bluetooth
    if (window.bluetoothSerial) {
      window.bluetoothSerial.list(
        (classicDevices) => {
          foundDevices.push(...classicDevices.map(dev => ({ ...dev, type: 'classic' })));

          // BLE Scan
          if (window.ble) {
            window.ble.scan([], 5,
              (bleDevice) => {
                if (bleDevice.name?.toLowerCase().includes('printer')) {
                  foundDevices.push({ ...bleDevice, type: 'ble' });
                }
                setDevices([...foundDevices]);
              },
              (err) => console.error('BLE scan error', err)
            );
          } else {
            setDevices([...foundDevices]);
          }
        },
        (err) => console.error('Bluetooth Serial error', err)
      );
    }
  };

  const connectAndPrint = (printer, text) => {
    if (printer.type === 'classic') {
      window.bluetoothSerial.connect(
        printer.id,
        () => {
          window.bluetoothSerial.write(text,
            () => alert('Printed via Bluetooth Classic'),
            (err) => alert('Classic write error: ' + err)
          );
        },
        (err) => alert('Classic connect failed: ' + err)
      );
    } else if (printer.type === 'ble') {
      window.ble.connect(printer.id,
        (peripheral) => {
          const service = peripheral?.services?.[0];
          const characteristic = peripheral?.characteristics?.[0]?.characteristic || peripheral?.characteristics?.[0];

          if (service && characteristic) {
            const encoder = new TextEncoder();
            const data = encoder.encode(text);

            window.ble.write(printer.id, service, characteristic, data.buffer,
              () => alert('Printed via BLE'),
              (err) => alert('BLE write error: ' + err)
            );
          } else {
            alert('BLE service/characteristic not found.');
          }
        },
        (err) => alert('BLE connect failed: ' + err)
      );
    }
  };

  const handlePrint = (printer) => {
    const text = 'Voucher: #123\nAmount: \u20B9100\nStatus: Paid';
    connectAndPrint(printer, text);
  };

  return (
    <Box p={2}>
      <Typography variant="h6">Available Printers</Typography>
      <List>
        {devices.map((dev, idx) => (
          <ListItem key={idx} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography>{dev.name || dev.id} ({dev.type})</Typography>
            <Button variant="contained" onClick={() => handlePrint(dev)}>Print</Button>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default BluetoothPrinter;
