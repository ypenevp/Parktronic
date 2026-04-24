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
  View,
  Text,
  Pressable,
  PermissionsAndroid,
  Platform,
  PanResponder,
  Animated,
} from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
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
  Y: 'WQ==',
};

function ArrowButton({
  label,
  cmd,
  onPressIn,
  onPressOut,
  size = 86,
}: {
  label: string;
  cmd: string;
  onPressIn: (cmd: string) => void;
  onPressOut: () => void;
  size?: number;
}) {
  return (
    <Pressable
      onPressIn={() => onPressIn(cmd)}
      onPressOut={() => onPressOut()}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: pressed ? '#0D47A1' : '#1E88E5',
        borderWidth: 1,
        borderColor: pressed ? '#1565C0' : '#42A5F5',
        shadowColor: '#1E88E5',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.55,
        shadowRadius: 12,
        elevation: 10,
        transform: [{ scale: pressed ? 0.94 : 1 }],
      })}
    >
      <Text
        style={{
          color: '#FFFFFF',
          fontSize: 30,
          fontWeight: '900',
          textShadowColor: 'rgba(0,0,0,0.4)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 4,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Joystick({
  onMove,
  onRelease,
}: {
  onMove: (cmd: string) => void;
  onRelease: () => void;
}) {
  const BASE_SIZE = 220;
  const KNOB_SIZE = 90;
  const RADIUS = (BASE_SIZE - KNOB_SIZE) / 2;

  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const lastCmd = useRef<string>('S');

  const computeCommand = (dx: number, dy: number): string => {
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 25) return 'S';
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI; // -180..180
    if (angle >= -45 && angle < 45) return 'R';
    if (angle >= 45 && angle < 135) return 'B';
    if (angle >= -135 && angle < -45) return 'F';
    return 'L';
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        let { dx, dy } = gesture;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > RADIUS) {
          dx = (dx / dist) * RADIUS;
          dy = (dy / dist) * RADIUS;
        }
        pan.setValue({ x: dx, y: dy });

        const cmd = computeCommand(dx, dy);
        if (cmd !== lastCmd.current) {
          lastCmd.current = cmd;
          if (cmd === 'S') onRelease();
          else onMove(cmd);
        }
      },
      onPanResponderRelease: () => {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          friction: 6,
        }).start();
        lastCmd.current = 'S';
        onRelease();
      },
      onPanResponderTerminate: () => {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          friction: 6,
        }).start();
        lastCmd.current = 'S';
        onRelease();
      },
    })
  ).current;

  return (
    <View
      style={{
        width: BASE_SIZE,
        height: BASE_SIZE,
        borderRadius: BASE_SIZE / 2,
        backgroundColor: '#111827',
        borderWidth: 2,
        borderColor: '#1F2937',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#1E88E5',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 12,
      }}
    >
      <View
        style={{
          position: 'absolute',
          width: BASE_SIZE - 30,
          height: BASE_SIZE - 30,
          borderRadius: (BASE_SIZE - 30) / 2,
          borderWidth: 1,
          borderColor: 'rgba(30,136,229,0.25)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: BASE_SIZE - 70,
          height: BASE_SIZE - 70,
          borderRadius: (BASE_SIZE - 70) / 2,
          borderWidth: 1,
          borderColor: 'rgba(30,136,229,0.15)',
        }}
      />

      <Animated.View
        {...panResponder.panHandlers}
        style={{
          width: KNOB_SIZE,
          height: KNOB_SIZE,
          borderRadius: KNOB_SIZE / 2,
          backgroundColor: '#1E88E5',
          borderWidth: 3,
          borderColor: '#42A5F5',
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
          shadowColor: '#1E88E5',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.8,
          shadowRadius: 10,
          elevation: 14,
        }}
      >
        <View
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: '#0D47A1',
          }}
        />
      </Animated.View>
    </View>
  );
}

export default function HomeScreen() {
  const [device, setDevice] = useState<Device | null>(null);
  const [status, setStatus] = useState('Searching...');
  const [connected, setConnected] = useState(false);
  const [mode, setMode] = useState<'arrows' | 'joystick'>('arrows');

  useEffect(() => {
    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    ).catch(() => { });

    requestPermissions().then((granted) => {
      if (granted) scanForCar();
    });

    return () => {
      ScreenOrientation.unlockAsync().catch(() => { });
      bleManager.destroy();
    };
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
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
          PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
          PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        const g = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return g === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return true;
  };

  const scanForCar = () => {
    setStatus('Scanning...');
    bleManager.startDeviceScan(null, null, (error, scannedDevice) => {
      if (error) {
        console.warn(error);
        return;
      }
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
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        b64
      );
    } catch (e) {
      console.log('Sending error:', String(e));
    }
  };

  const startCommand = (cmd: string) => sendCommand(COMMANDS[cmd]);
  const stopCommand = () => sendCommand(COMMANDS.S);

  const toggleMode = () =>
    setMode((m) => (m === 'arrows' ? 'joystick' : 'arrows'));

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#05060A',
        paddingHorizontal: 30,
        paddingVertical: 18,
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: -80,
          left: -80,
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: '#1E88E5',
          opacity: 0.08,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: -100,
          right: -100,
          width: 360,
          height: 360,
          borderRadius: 180,
          backgroundColor: '#D32F2F',
          opacity: 0.07,
        }}
      />

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 6,
          marginBottom: 6,
        }}
      >
        <View>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 34,
              fontWeight: '900',
              letterSpacing: 6,
              textTransform: 'uppercase',
              textShadowColor: 'rgba(30,136,229,0.55)',
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 14,
            }}
          >
            PARKTRONIC 3000
          </Text>
          <View
            style={{
              height: 2,
              marginTop: 4,
              width: 160,
              backgroundColor: '#1E88E5',
              opacity: 0.8,
              borderRadius: 2,
            }}
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingHorizontal: 14,
            paddingVertical: 8,
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: 999,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <View
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: connected ? '#4CAF50' : '#F44336',
              shadowColor: connected ? '#4CAF50' : '#F44336',
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 1,
              shadowRadius: 8,
            }}
          />
          <Text
            style={{
              color: '#DDDDDD',
              fontSize: 14,
              fontWeight: '600',
              letterSpacing: 1,
            }}
          >
            {status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
        }}
      >
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {mode === 'arrows' ? (
            <View style={{ alignItems: 'center', gap: 14 }}>
              <ArrowButton
                label="▲"
                cmd="F"
                onPressIn={startCommand}
                onPressOut={stopCommand}
              />
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                }}
              >
                <ArrowButton
                  label="◄"
                  cmd="L"
                  onPressIn={startCommand}
                  onPressOut={stopCommand}
                />
                <Pressable
                  onPress={stopCommand}
                  style={({ pressed }) => ({
                    width: 86,
                    height: 86,
                    borderRadius: 43,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: pressed ? '#b71c1c' : '#D32F2F',
                    borderWidth: 2,
                    borderColor: '#EF5350',
                    shadowColor: '#D32F2F',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.7,
                    shadowRadius: 12,
                    elevation: 12,
                  })}
                >
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 28,
                      fontWeight: '900',
                    }}
                  >
                    ■
                  </Text>
                </Pressable>
                <ArrowButton
                  label="►"
                  cmd="R"
                  onPressIn={startCommand}
                  onPressOut={stopCommand}
                />
              </View>
              <ArrowButton
                label="▼"
                cmd="B"
                onPressIn={startCommand}
                onPressOut={stopCommand}
              />
            </View>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Text
                style={{
                  color: '#888',
                  fontSize: 12,
                  letterSpacing: 3,
                  marginBottom: 12,
                }}
              >
                JOYSTICK MODE
              </Text>
              <Joystick onMove={startCommand} onRelease={stopCommand} />
            </View>
          )}
        </View>

        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 22,
          }}
        >
          <View
            style={{
              padding: 18,
              borderRadius: 24,
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.06)',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <Text
              style={{
                color: '#9CA3AF',
                fontSize: 12,
                letterSpacing: 4,
                fontWeight: '700',
              }}
            >
              ACTIONS
            </Text>
            <Pressable
              onPressIn={() => startCommand('X')}
              onPressOut={() => sendCommand(COMMANDS.Y)}
              style={({ pressed }) => ({
                width: 240,
                height: 70,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: pressed ? '#2E7D32' : '#4CAF50',
                borderWidth: 2,
                borderColor: '#66BB6A',
                shadowColor: '#4CAF50',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.6,
                shadowRadius: 14,
                elevation: 12,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              })}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: 20,
                  fontWeight: '900',
                  letterSpacing: 4,
                }}
              >
                TEST LED
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Pressable
        onPress={toggleMode}
        style={({ pressed }) => ({
          position: 'absolute',
          bottom: 18,
          right: 22,
          paddingHorizontal: 18,
          paddingVertical: 12,
          borderRadius: 14,
          backgroundColor: pressed ? '#1F2937' : '#111827',
          borderWidth: 1,
          borderColor: '#1E88E5',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          shadowColor: '#1E88E5',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 10,
          elevation: 10,
        })}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: '#1E88E5',
          }}
        />
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 13,
            fontWeight: '800',
            letterSpacing: 2,
          }}
        >
          MODE: {mode === 'arrows' ? 'ARROWS' : 'JOYSTICK'}
        </Text>
        <Text
          style={{
            color: '#9CA3AF',
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 1,
          }}
        >
          ⇄
        </Text>
      </Pressable>
    </View>
  );
}
