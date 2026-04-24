// import React, { useState, useEffect } from 'react';
// import {
//   StyleSheet, View, Text, Pressable,
//   PermissionsAndroid, Platform
// } from 'react-native';
// import { BleManager, Device } from 'react-native-ble-plx';

// const bleManager = new BleManager();
// const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
// const CHARACTERISTIC_UUID = 'abcd1234-5678-90ab-cdef-1234567890ab';

// const COMMANDS: Record<string, string> = {
//   F: 'Rg==',
//   B: 'Qg==',
//   L: 'TA==',
//   R: 'Ug==',
//   S: 'Uw==',
//   X: 'WA==',
//   Y: 'WQ=='
// };

// function StaticCarButton({
//                            label, cmd, size = 'normal', onPressIn, onPressOut,
//                            styleColor = '#1E88E5', pressedColor = '#0D47A1'
//                          }: {
//   label: string; cmd: string; size?: 'normal' | 'large' | 'wide';
//   onPressIn: (cmd: string) => void; onPressOut: () => void;
//   styleColor?: string; pressedColor?: string;
// }) {
//   let w = 80; let h = 70;
//   if (size === 'large') { w = 100; h = 85; }
//   else if (size === 'wide') { w = 200; h = 60; }

//   return (
//       <Pressable
//           style={({ pressed }) => [
//             styles.button,
//             { width: w, height: h, backgroundColor: pressed ? pressedColor : styleColor }
//           ]}
//           onPressIn={() => onPressIn(cmd)}
//           onPressOut={() => onPressOut()}
//       >
//         <Text style={styles.buttonText}>{label}</Text>
//       </Pressable>
//   );
// }

// export default function HomeScreen() {
//   const [device, setDevice] = useState<Device | null>(null);
//   const [status, setStatus] = useState('Searching...');
//   const [connected, setConnected] = useState(false);

//   useEffect(() => {
//     requestPermissions().then(granted => { if (granted) scanForCar(); });
//     return () => { bleManager.destroy(); };
//   }, []);

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

//   const connectToDevice = async (d: Device) => {
//     try {
//       const conn = await d.connect();
//       await conn.discoverAllServicesAndCharacteristics();
//       setDevice(conn);
//       setStatus('Connected');
//       setConnected(true);
//     } catch (e) {
//       setStatus('Error — restart');
//       setConnected(false);
//     }
//   };

//   const sendCommand = async (b64: string) => {
//     if (!device) return;

//     try {
//       const isConn = await device.isConnected();
//       if (!isConn) {
//         setStatus('Disconnected');
//         setConnected(false);
//         return;
//       }

//       await device.writeCharacteristicWithoutResponseForService(
//           SERVICE_UUID, CHARACTERISTIC_UUID, b64
//       );
//     } catch (e) {
//       console.log('Sending error:', String(e));
//     }
//   };

//   const startCommand = (cmd: string) => sendCommand(COMMANDS[cmd]);
//   const stopCommand = () => sendCommand(COMMANDS.S);

//   return (
//       <View style={styles.container}>
//         <View style={styles.header}>
//           <Text style={styles.title}>Parktronic 3000</Text>

//           <View style={styles.statusRow}>
//             <View style={[styles.dot, { backgroundColor: connected ? '#4CAF50' : '#F44336' }]} />
//             <Text style={styles.statusText}>{status}</Text>
//           </View>
//         </View>

//         <View style={styles.controls}>
//           <StaticCarButton label="▲" cmd="F" size="large" onPressIn={startCommand} onPressOut={stopCommand} />

//           <View style={styles.row}>
//             <StaticCarButton label="◄" cmd="L" size="large" onPressIn={startCommand} onPressOut={stopCommand} />

//             <Pressable
//                 style={({ pressed }) => [styles.stopButton, { backgroundColor: pressed ? '#b71c1c' : '#D32F2F' }]}
//                 onPress={stopCommand}
//             >
//               <Text style={styles.stopText}>■</Text>
//             </Pressable>

//             <StaticCarButton label="►" cmd="R" size="large" onPressIn={startCommand} onPressOut={stopCommand} />
//           </View>

//           <StaticCarButton label="▼" cmd="B" size="large" onPressIn={startCommand} onPressOut={stopCommand} />
//         </View>

//         <View style={{ marginTop: 50 }}>
//           <StaticCarButton
//               label="TEST LED"
//               cmd="X"
//               size="wide"
//               styleColor="#4CAF50"
//               pressedColor="#388E3C"
//               onPressIn={startCommand}
//               onPressOut={() => sendCommand(COMMANDS.Y)}
//           />
//         </View>
//       </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#0A0A0A',
//     alignItems: 'center',
//     justifyContent: 'space-around',
//     paddingVertical: 40
//   },
//   header: {
//     alignItems: 'center',
//     gap: 10,
//   },
//   title: {
//     color: '#FFFFFF',
//     fontSize: 28,
//     fontWeight: 'bold',
//     letterSpacing: 3,
//   },
//   statusRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   dot: {
//     width: 12,
//     height: 12,
//     borderRadius: 6,
//   },
//   statusText: {
//     color: '#AAAAAA',
//     fontSize: 16,
//   },
//   controls: {
//     alignItems: 'center',
//     gap: 16,
//   },
//   row: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 16,
//   },
//   button: {
//     borderRadius: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     shadowColor: '#1E88E5',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.4,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   buttonText: {
//     color: '#FFFFFF',
//     fontSize: 26,
//     fontWeight: 'bold',
//   },
//   stopButton: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 8,
//   },
//   stopText: {
//     color: '#ffffff',
//     fontSize: 24,
//   }
// });

////////////////////////////////////////////////////////////////////////////////


import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, Pressable, PermissionsAndroid, Platform, Animated, PanResponder,
} from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import * as ScreenOrientation from 'expo-screen-orientation';

const bleManager = new BleManager();
const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
const CHARACTERISTIC_UUID = 'abcd1234-5678-90ab-cdef-1234567890ab';

const COMMANDS: Record<string, string> = {
  F: 'Rg==', // Forward
  B: 'Qg==', // Back
  L: 'TA==', // Left
  R: 'Ug==', // Right
  S: 'Uw==', // Stop
  T: 'VA==', // Test LED
};

export default function HomeScreen() {
  const [device, setDevice] = useState<Device | null>(null);
  const [connected, setConnected] = useState(false);
  const [mode, setMode] = useState<'arrows' | 'joystick'>('arrows');

  // Lock landscape
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  // Permissions + scan + connect
  useEffect(() => {
    (async () => {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
      }
      scanAndConnect();
    })();
    return () => {
      bleManager.destroy();
    };
  }, []);

  const scanAndConnect = () => {
    bleManager.startDeviceScan(null, null, async (error, scanned) => {
      if (error) return;
      if (scanned && scanned.name && scanned.name.includes('ESP32')) {
        bleManager.stopDeviceScan();
        try {
          const d = await scanned.connect();
          await d.discoverAllServicesAndCharacteristics();
          setDevice(d);
          setConnected(true);
        } catch (e) {}
      }
    });
  };

  const sendCommand = async (cmd: string) => {
    if (!device) return;
    try {
      await device.writeCharacteristicWithResponseForService(
        SERVICE_UUID, CHARACTERISTIC_UUID, COMMANDS[cmd],
      );
    } catch (e) {}
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#05080f', paddingHorizontal: 20, paddingVertical: 12 }}>
      {/* HEADER */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <View>
          <Text style={{
            color: '#ffffff', fontSize: 28, fontWeight: '900', letterSpacing: 2,
            textShadowColor: '#3b82f6', textShadowRadius: 12, textShadowOffset: { width: 0, height: 0 },
          }}>
            PARKTRONIC 3000
          </Text>
          <View style={{ height: 2, backgroundColor: '#3b82f6', width: 140, marginTop: 4, shadowColor: '#3b82f6', shadowOpacity: 1, shadowRadius: 8 }} />
          <Text style={{ color: '#64748b', fontSize: 11, letterSpacing: 4, marginTop: 4 }}>
            {mode === 'joystick' ? 'JOYSTICK MODE' : 'ARROWS MODE'}
          </Text>
        </View>

        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 8,
          backgroundColor: '#0b1220', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8,
          borderWidth: 1, borderColor: '#1e293b',
        }}>
          <View style={{
            width: 10, height: 10, borderRadius: 999,
            backgroundColor: connected ? '#22c55e' : '#ef4444',
            shadowColor: connected ? '#22c55e' : '#ef4444', shadowOpacity: 1, shadowRadius: 6,
          }} />
          <Text style={{ color: '#e2e8f0', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 }}>
            {connected ? 'CONNECTED' : 'SEARCHING'}
          </Text>
        </View>
      </View>

      {/* MAIN ROW */}
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* LEFT: Controls */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {mode === 'arrows' ? <Arrows onPress={sendCommand} /> : <Joystick onMove={sendCommand} />}
        </View>

        {/* RIGHT: Actions + Mode */}
        <View style={{ width: 260, alignItems: 'stretch', gap: 12 }}>
          <View style={{
            backgroundColor: 'rgba(15,23,42,0.6)', borderRadius: 18,
            borderWidth: 1, borderColor: '#1e293b', padding: 14,
          }}>
            <Text style={{ color: '#94a3b8', fontSize: 11, letterSpacing: 4, textAlign: 'center', marginBottom: 10 }}>
              ACTIONS
            </Text>
            <Pressable
              onPress={() => sendCommand('T')}
              style={({ pressed }) => ({
                backgroundColor: pressed ? '#16a34a' : '#22c55e',
                paddingVertical: 16, borderRadius: 12, alignItems: 'center',
                shadowColor: '#22c55e', shadowOpacity: 0.6, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
                elevation: 6,
              })}
            >
              <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '900', letterSpacing: 3 }}>
                TEST LED
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => setMode((m) => (m === 'arrows' ? 'joystick' : 'arrows'))}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
              backgroundColor: pressed ? '#0b1220' : 'transparent',
              borderRadius: 999, borderWidth: 1.5, borderColor: '#3b82f6',
              paddingVertical: 12, paddingHorizontal: 16,
            })}
          >
            <View style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: '#3b82f6' }} />
            <Text style={{ color: '#e2e8f0', fontSize: 13, fontWeight: '800', letterSpacing: 2 }}>
              MODE: {mode.toUpperCase()}
            </Text>
            <Text style={{ color: '#94a3b8', fontSize: 14 }}>⇄</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

/* ---------- Arrows (no center stop) ---------- */
function Arrows({ onPress }: { onPress: (c: string) => void }) {
  const btn = (label: string, cmd: string) => (
    <Pressable
      onPressIn={() => onPress(cmd)}
      onPressOut={() => onPress('S')}
      style={({ pressed }) => ({
        width: 78, height: 78, borderRadius: 18,
        backgroundColor: pressed ? '#1d4ed8' : '#3b82f6',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#3b82f6', shadowOpacity: 0.7, shadowRadius: 14, shadowOffset: { width: 0, height: 6 },
        elevation: 8,
      })}
    >
      <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900' }}>{label}</Text>
    </Pressable>
  );

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {btn('▲', 'F')}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 78, marginVertical: 10 }}>
        {btn('◀', 'L')}
        {btn('▶', 'R')}
      </View>
      {btn('▼', 'B')}
    </View>
  );
}

/* ---------- Joystick ---------- */
function Joystick({ onMove }: { onMove: (c: string) => void }) {
  const SIZE = 200;
  const KNOB = 70;
  const MAX = (SIZE - KNOB) / 2;
  const pan = useRef(new Animated.ValueXY()).current;
  const lastCmd = useRef<string>('S');

  const dispatch = (dx: number, dy: number) => {
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 25) { if (lastCmd.current !== 'S') { onMove('S'); lastCmd.current = 'S'; } return; }
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    let cmd: string;
    if (angle >= -45 && angle < 45) cmd = 'R';
    else if (angle >= 45 && angle < 135) cmd = 'B';
    else if (angle >= -135 && angle < -45) cmd = 'F';
    else cmd = 'L';
    if (cmd !== lastCmd.current) { onMove(cmd); lastCmd.current = cmd; }
  };

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        const dx = Math.max(-MAX, Math.min(MAX, g.dx));
        const dy = Math.max(-MAX, Math.min(MAX, g.dy));
        pan.setValue({ x: dx, y: dy });
        dispatch(dx, dy);
      },
      onPanResponderRelease: () => {
        Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        onMove('S'); lastCmd.current = 'S';
      },
    }),
  ).current;

  return (
    <View style={{
      width: SIZE, height: SIZE, borderRadius: SIZE / 2,
      backgroundColor: 'rgba(59,130,246,0.05)',
      borderWidth: 2, borderColor: '#1e3a8a',
      alignItems: 'center', justifyContent: 'center',
      shadowColor: '#3b82f6', shadowOpacity: 0.5, shadowRadius: 20,
    }}>
      {[0.7, 0.5, 0.35].map((s, i) => (
        <View key={i} style={{
          position: 'absolute', width: SIZE * s, height: SIZE * s, borderRadius: SIZE / 2,
          borderWidth: 1, borderColor: 'rgba(59,130,246,0.25)',
        }} />
      ))}
      <Animated.View
        {...responder.panHandlers}
        style={{
          width: KNOB, height: KNOB, borderRadius: KNOB / 2,
          backgroundColor: '#3b82f6',
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
          alignItems: 'center', justifyContent: 'center',
          shadowColor: '#3b82f6', shadowOpacity: 1, shadowRadius: 16,
          elevation: 10,
        }}
      >
        <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#1e40af' }} />
      </Animated.View>
    </View>
  );
}
