// printerService.js
// ─────────────────────────────────────────────────────────────────────────────
// Centralized Bluetooth thermal-printer service used by every screen that prints
// (Ledger, PaymentSuccessful, DetailScreen, SummaryScreen).
//
// ALL Bluetooth work here is ANDROID-ONLY. On iOS / web every function is a safe
// no-op, so callers don't need their own platform checks for the BT parts.
//
// Uses the cordova plugins already installed in this project:
//   - cordova-plugin-bluetooth-serial  -> window.bluetoothSerial (classic + isEnabled/enable)
//   - cordova-plugin-ble-central       -> window.ble             (BLE printers)
//
// Runtime permission prompt (Android 12+) uses window.cordova.plugins.permissions
// if that plugin is installed; if not, it silently skips so nothing breaks.
// ─────────────────────────────────────────────────────────────────────────────

import { Capacitor } from "@capacitor/core";

export const isAndroid = () => Capacitor.getPlatform() === "android";

// ── 1. Request Bluetooth runtime permissions (Android 12+) ───────────────────
// Resolves whether or not the permissions plugin exists, so it never blocks.
const requestBluetoothPermissions = () =>
  new Promise((resolve) => {
    const perms = window.cordova?.plugins?.permissions;
    if (!perms) {
      // cordova-plugin-android-permissions not installed -> nothing to request.
      console.warn(
        "[printer] permissions plugin not found; skipping explicit request"
      );
      resolve();
      return;
    }

    const required = [perms.BLUETOOTH_CONNECT, perms.BLUETOOTH_SCAN];
    let i = 0;

    const next = () => {
      if (i >= required.length) {
        resolve();
        return;
      }
      const permission = required[i++];
      perms.checkPermission(
        permission,
        (status) => {
          if (status.hasPermission) {
            next();
          } else {
            perms.requestPermission(
              permission,
              () => next(), // granted or denied -> continue either way
              () => next()
            );
          }
        },
        () => next() // check error -> continue
      );
    };

    next();
  });

// ── 2. Ensure Bluetooth is switched ON ───────────────────────────────────────
const ensureBluetoothEnabled = () =>
  new Promise((resolve, reject) => {
    const bt = window.bluetoothSerial;
    if (!bt) {
      reject(new Error("Bluetooth plugin not available"));
      return;
    }
    bt.isEnabled(
      () => resolve(true),
      () => {
        // Not enabled -> ask the user to turn it on
        bt.enable(
          () => resolve(true),
          () => reject(new Error("Bluetooth not enabled"))
        );
      }
    );
  });

// ── PUBLIC: call this before opening the printer dialog / scanning ───────────
// Returns true when the device is ready to scan, false otherwise.
export const preparePrinter = async () => {
  if (!isAndroid()) return false;
  await requestBluetoothPermissions();
  try {
    await ensureBluetoothEnabled();
    return true;
  } catch (e) {
    alert("Please enable Bluetooth and try again");
    return false;
  }
};

// ── 3. Scan for paired classic + BLE printers ────────────────────────────────
// onFound(printersArray) is called (possibly multiple times as BLE devices come in).
export const scanPrinters = (onFound) => {
  if (!isAndroid()) {
    onFound([]);
    return;
  }
  const bt = window.bluetoothSerial;
  if (!bt) {
    onFound([]);
    return;
  }

  const found = [];
  bt.list(
    (classicDevices) => {
      found.push(
        ...classicDevices.map((dev) => ({ ...dev, type: "classic" }))
      );
      if (window.ble) {
        window.ble.scan(
          [],
          5,
          (bleDevice) => {
            if (bleDevice.name?.toLowerCase().includes("printer")) {
              found.push({ ...bleDevice, type: "ble" });
            }
            onFound([...found]);
          },
          (err) => console.log("BLE scan error", err)
        );
      } else {
        onFound([...found]);
      }
    },
    (err) => {
      console.log("Bluetooth Serial error", err);
      onFound([]);
    }
  );
};

// ── 4. Connect to a printer and send an ESC/POS string ───────────────────────
// escposData: the fully-formatted receipt string (each screen builds its own).
// callbacks: { onDone, onError } — both optional.
export const connectAndPrint = (printer, escposData, callbacks = {}) => {
  const { onDone, onError } = callbacks;
  if (!isAndroid()) return;

  const byteArray = new TextEncoder().encode(escposData);

  if (printer.type === "classic") {
    window.bluetoothSerial.connect(
      printer.id,
      () => {
        // Xprinters: send in chunks
        const chunkSize = 100;
        let offset = 0;

        const sendNextChunk = () => {
          if (offset >= byteArray.length) {
            setTimeout(() => {
              window.bluetoothSerial.disconnect(
                () => {
                  console.log("Disconnected");
                  onDone && onDone();
                },
                (err) => console.log("Disconnect error", err)
              );
            }, 500);
            return;
          }

          const chunk = byteArray.slice(offset, offset + chunkSize);
          offset += chunkSize;

          window.bluetoothSerial.write(chunk.buffer, sendNextChunk, (err) => {
            (onError || alert)("Write error: " + err);
            window.bluetoothSerial.disconnect();
          });
        };

        sendNextChunk();
      },
      (err) => (onError || alert)("Connect failed: " + err)
    );
  } else if (printer.type === "ble") {
    window.ble.connect(
      printer.id,
      () => {
        const service = "0000FFE0-0000-1000-8000-00805F9B34FB";
        const characteristic = "0000FFE1-0000-1000-8000-00805F9B34FB";

        const chunkSize = 20; // BLE has a smaller MTU
        let offset = 0;

        const sendNextChunk = () => {
          if (offset >= byteArray.length) {
            setTimeout(() => {
              window.ble.disconnect(
                printer.id,
                () => {
                  console.log("Disconnected");
                  onDone && onDone();
                },
                (err) => console.log("Disconnect error", err)
              );
            }, 500);
            return;
          }

          const chunk = byteArray.slice(offset, offset + chunkSize);
          offset += chunkSize;

          window.ble.write(
            printer.id,
            service,
            characteristic,
            chunk.buffer,
            sendNextChunk,
            (err) => {
              (onError || alert)("BLE write error: " + err);
              window.ble.disconnect(printer.id);
            }
          );
        };

        sendNextChunk();
      },
      (err) => (onError || alert)("BLE connect failed: " + err)
    );
  }
};
