// import React, { useState, useEffect } from 'react';
// import {
//   StyleSheet, View, Text, Pressable,
//   PermissionsAndroid, Platform
// } from 'react-native';
// import { BleManager, Device } from 'react-native-ble-plx';
//
// const bleManager = new BleManager();
// const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
// const CHARACTERISTIC_UUID = 'abcd1234-5678-90ab-cdef-1234567890ab';
//
// const COMMANDS: Record<string, string> = {
//   X: 'WA==',
//   Y: 'WQ=='
// };
//
// export default function HomeScreen() {
//   const [device, setDevice] = useState<Device | null>(null);
//   const [status, setStatus] = useState('Searching...');
//
//   useEffect(() => {
//     requestPermissions().then(granted => { if (granted) scanForCar(); });
//     return () => { bleManager.destroy(); };
//   }, []);
//
//   const requestPermissions = async () => {
//     if (Platform.OS === 'android') {
//       if (Platform.Version >= 31) {
//         const granted = await PermissionsAndroid.requestMultiple([
//           PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
//           PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
//           PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
//         ]);
//         return (
//             granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
//             granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED
//         );
//       } else {
//         const g = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
//         return g === PermissionsAndroid.RESULTS.GRANTED;
//       }
//     }
//     return true;
//   };
//
//   const scanForCar = () => {
//     setStatus('Scanning...');
//     bleManager.startDeviceScan(null, null, (error, scannedDevice) => {
//       if (error) { console.warn(error); return; }
//       if (scannedDevice?.name === 'ESP32Car') {
//         bleManager.stopDeviceScan();
//         setStatus('Device found! Connecting...');
//         connectToDevice(scannedDevice);
//       }
//     });
//   };
//
//   const connectToDevice = async (d: Device) => {
//     try {
//       const conn = await d.connect();
//       await conn.discoverAllServicesAndCharacteristics();
//       setDevice(conn);
//       setStatus('Connected');
//     } catch (e) {
//       setStatus('Connection Failed');
//     }
//   };
//
//   const sendCommand = async (b64: string) => {
//     if (!device) return;
//
//     try {
//       const isConn = await device.isConnected();
//       if (!isConn) {
//         setStatus('Disconnected');
//         return;
//       }
//
//       console.log("Sending: ", b64);
//
//       await device.writeCharacteristicWithoutResponseForService(
//           SERVICE_UUID, CHARACTERISTIC_UUID, b64
//       );
//     } catch (e) {
//       console.log('Sending error:', String(e));
//     }
//   };
//
//   return (
//       <View style={styles.container}>
//         <Text style={styles.title}>ESP32 Car (ISOLATED TEST)</Text>
//         <Text style={styles.statusText}>Status: {status}</Text>
//
//         <View style={{ marginTop: 50 }}>
//           <Pressable
//               style={styles.bigButton}
//               onPressIn={() => sendCommand(COMMANDS.X)}
//               onPressOut={() => sendCommand(COMMANDS.Y)}
//           >
//             <Text style={styles.buttonText}>TEST LED</Text>
//           </Pressable>
//         </View>
//       </View>
//   );
// }
//
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#0A0A0A',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   title: {
//     color: '#FFFFFF',
//     fontSize: 24,
//     fontWeight: 'bold',
//   },
//   statusText: {
//     color: '#AAAAAA',
//     fontSize: 16,
//     marginTop: 20
//   },
//   bigButton: {
//     width: 250,
//     height: 100,
//     backgroundColor: '#4CAF50',
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderRadius: 20,
//   },
//   buttonText: {
//     color: '#FFFFFF',
//     fontSize: 28,
//     fontWeight: 'bold',
//   }
// });

/////////////////////////////////////////////////////////////////

import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, Pressable,
  PermissionsAndroid, Platform
} from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';

const bleManager = new BleManager();
const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
const CHARACTERISTIC_UUID = 'abcd1234-5678-90ab-cdef-1234567890ab';

const COMMANDS: Record<string, string> = {
  F: 'Rg==',
  B: 'Qg==',
  L: 'TA==',
  R: 'Ug==',
  S: 'Uw==',
  X: 'WA==',
  Y: 'WQ=='
};

function StaticCarButton({
                           label, cmd, size = 'normal', onPressIn, onPressOut,
                           styleColor = '#1E88E5', pressedColor = '#0D47A1'
                         }: {
  label: string; cmd: string; size?: 'normal' | 'large' | 'wide';
  onPressIn: (cmd: string) => void; onPressOut: () => void;
  styleColor?: string; pressedColor?: string;
}) {
  let w = 80; let h = 70;
  if (size === 'large') { w = 100; h = 85; }
  else if (size === 'wide') { w = 200; h = 60; }

  return (
      <Pressable
          style={({ pressed }) => [
            styles.button,
            { width: w, height: h, backgroundColor: pressed ? pressedColor : styleColor }
          ]}
          onPressIn={() => onPressIn(cmd)}
          onPressOut={() => onPressOut()}
      >
        <Text style={styles.buttonText}>{label}</Text>
      </Pressable>
  );
}

export default function HomeScreen() {
  const [device, setDevice] = useState<Device | null>(null);
  const [status, setStatus] = useState('Searching...');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    requestPermissions().then(granted => { if (granted) scanForCar(); });
    return () => { bleManager.destroy(); };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 31) {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        return (
            granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
            granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        const g = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        return g === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return true;
  };

  const scanForCar = () => {
    setStatus('Scanning...');
    bleManager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) { console.warn(error); return; }
      if (scannedDevice?.name === 'ESP32Car') {
        bleManager.stopDeviceScan();
        setStatus('Device found! Connecting...');
        connectToDevice(scannedDevice);
      }
    });
  };

  const connectToDevice = async (d: Device) => {
    try {
      const conn = await d.connect();
      await conn.discoverAllServicesAndCharacteristics();
      setDevice(conn);
      setStatus('Connected');
      setConnected(true);
    } catch (e) {
      setStatus('Error — restart');
      setConnected(false);
    }
  };

  const sendCommand = async (b64: string) => {
    if (!device) return;

    try {
      const isConn = await device.isConnected();
      if (!isConn) {
        setStatus('Disconnected');
        setConnected(false);
        return;
      }

      await device.writeCharacteristicWithoutResponseForService(
          SERVICE_UUID, CHARACTERISTIC_UUID, b64
      );
    } catch (e) {
      console.log('Sending error:', String(e));
    }
  };

  const startCommand = (cmd: string) => sendCommand(COMMANDS[cmd]);
  const stopCommand = () => sendCommand(COMMANDS.S);

  return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Parktronic 3000</Text>

          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: connected ? '#4CAF50' : '#F44336' }]} />
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <StaticCarButton label="▲" cmd="F" size="large" onPressIn={startCommand} onPressOut={stopCommand} />

          <View style={styles.row}>
            <StaticCarButton label="◄" cmd="L" size="large" onPressIn={startCommand} onPressOut={stopCommand} />

            <Pressable
                style={({ pressed }) => [styles.stopButton, { backgroundColor: pressed ? '#b71c1c' : '#D32F2F' }]}
                onPress={stopCommand}
            >
              <Text style={styles.stopText}>■</Text>
            </Pressable>

            <StaticCarButton label="►" cmd="R" size="large" onPressIn={startCommand} onPressOut={stopCommand} />
          </View>

          <StaticCarButton label="▼" cmd="B" size="large" onPressIn={startCommand} onPressOut={stopCommand} />
        </View>

        <View style={{ marginTop: 50 }}>
          <StaticCarButton
              label="TEST LED"
              cmd="X"
              size="wide"
              styleColor="#4CAF50"
              pressedColor="#388E3C"
              onPressIn={startCommand}
              onPressOut={() => sendCommand(COMMANDS.Y)}
          />
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 40
  },
  header: {
    alignItems: 'center',
    gap: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    color: '#AAAAAA',
    fontSize: 16,
  },
  controls: {
    alignItems: 'center',
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  button: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1E88E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
  },
  stopButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  stopText: {
    color: '#ffffff',
    fontSize: 24,
  }
});