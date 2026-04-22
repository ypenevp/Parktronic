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
  S: 'Uw==',
  X: 'WA==',
  Y: 'WQ=='
};

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
      console.log('Error sending command:', String(e));
    }
  };

  return (
      <View style={styles.container}>
        <Text style={styles.title}>ESP32 Car (NO ANIMATIONS)</Text>

        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: connected ? '#4CAF50' : '#F44336' }]} />
          <Text style={styles.statusText}>{status}</Text>
        </View>

        <View style={styles.controls}>

          <Pressable
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: pressed ? '#0D47A1' : '#1E88E5' }
              ]}
              onPressIn={() => sendCommand(COMMANDS.F)}
              onPressOut={() => sendCommand(COMMANDS.S)}
          >
            <Text style={styles.buttonText}>НАПРЕД (F)</Text>
          </Pressable>


          <Pressable
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: pressed ? '#388E3C' : '#4CAF50', marginTop: 40 }
              ]}
              onPressIn={() => sendCommand(COMMANDS.X)}
              onPressOut={() => sendCommand(COMMANDS.Y)}
          >
            <Text style={styles.buttonText}>TEST LED</Text>
          </Pressable>

        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 50
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
    gap: 20,
  },
  button: {
    width: 200,
    height: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  }
});