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
  F: 'Rg==',
  B: 'Qg==',
  L: 'TA==',
  R: 'Ug==',
  FL: 'Rkw=',
  FR: 'RlI=',
  BL: 'Qkw=',
  BR: 'QlI=',
  S: 'Uw==',
  A: 'QQ==',
  P: 'UA==',
  T: 'VA==',
};
export default function HomeScreen() {
  const [device, setDevice] = useState<Device | null>(null);
  const [connected, setConnected] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [mode, setMode] = useState<'arrows' | 'joystick'>('arrows');
  const [autoEnabled, setAutoEnabled] = useState(false);
  const [parkEnabled, setParkEnabled] = useState(false);

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

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
    if (scanning || connected) return;
    setScanning(true);
    bleManager.startDeviceScan(null, null, async (error, scanned) => {
      if (error) { setScanning(false); return; }
      if (scanned && scanned.name && scanned.name.includes('ESP32')) {
        bleManager.stopDeviceScan();
        try {
          const d = await scanned.connect();
          await d.discoverAllServicesAndCharacteristics();
          setDevice(d);
          setConnected(true);
        } catch (e) { }
        setScanning(false);
      }
    });
  };

  const disconnect = async () => {
    try {
      if (device) {
        await device.cancelConnection();
      }
    } catch (e) { }
    setDevice(null);
    setConnected(false);
    setScanning(false);
  };

  const toggleConnection = () => {
    if (connected) disconnect();
    else scanAndConnect();
  };

  const sendCommand = async (cmd: string) => {
    if (!device) return;
    try {
      await device.writeCharacteristicWithResponseForService(
        SERVICE_UUID, CHARACTERISTIC_UUID, COMMANDS[cmd],
      );
    } catch (e) { }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#05080f', paddingHorizontal: 20, paddingVertical: 12 }}>
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
            backgroundColor: connected ? '#22c55e' : scanning ? '#f59e0b' : '#ef4444',
            shadowColor: connected ? '#22c55e' : scanning ? '#f59e0b' : '#ef4444', shadowOpacity: 1, shadowRadius: 6,
          }} />
          <Text style={{ color: '#e2e8f0', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 }}>
            {connected ? 'CONNECTED' : scanning ? 'SEARCHING' : 'OFFLINE'}
          </Text>
        </View>
      </View>

      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingLeft: 0, paddingRight: 40 }}>
          <View style={{ marginLeft: -30 }}>
            {mode === 'arrows' ? <Arrows onPress={sendCommand} /> : <Joystick onMove={sendCommand} />}
          </View>
        </View>

        <View style={{ width: 260, alignItems: 'stretch', gap: 12 }}>
          <View style={{
            backgroundColor: 'rgba(15,23,42,0.6)', borderRadius: 18,
            borderWidth: 1, borderColor: '#1e293b', padding: 14,
          }}>
            <Text style={{ color: '#94a3b8', fontSize: 11, letterSpacing: 4, textAlign: 'center', marginBottom: 10 }}>
              ACTIONS
            </Text>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Pressable
                onPress={() => {
                  sendCommand('A');
                  setAutoEnabled(!autoEnabled);
                }}
                style={({ pressed }) => ({
                  flex: 1,
                  backgroundColor: autoEnabled ? '#22c55e' : (pressed ? '#334155' : '#1e293b'),
                  paddingVertical: 14, borderRadius: 12, alignItems: 'center',
                  borderWidth: 1, borderColor: autoEnabled ? '#22c55e' : '#475569',
                  shadowColor: autoEnabled ? '#22c55e' : 'transparent',
                  shadowOpacity: 0.6, shadowRadius: 8, shadowOffset: { width: 0, height: 0 },
                })}
              >
                <Text style={{ color: autoEnabled ? '#ffffff' : '#94a3b8', fontSize: 13, fontWeight: '900', letterSpacing: 1 }}>AUTO</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  sendCommand('P');
                  setParkEnabled(!parkEnabled);
                }}
                style={({ pressed }) => ({
                  flex: 1,
                  backgroundColor: parkEnabled ? '#f97316' : (pressed ? '#334155' : '#1e293b'),
                  paddingVertical: 14, borderRadius: 12, alignItems: 'center',
                  borderWidth: 1, borderColor: parkEnabled ? '#f97316' : '#475569',
                  shadowColor: parkEnabled ? '#f97316' : 'transparent',
                  shadowOpacity: 0.6, shadowRadius: 8, shadowOffset: { width: 0, height: 0 },
                })}
              >
                <Text style={{ color: parkEnabled ? '#ffffff' : '#94a3b8', fontSize: 13, fontWeight: '900', letterSpacing: 1 }}>PARK</Text>
              </Pressable>
            </View>

            <Pressable
              onPress={toggleConnection}
              style={({ pressed }) => ({
                marginTop: 10,
                backgroundColor: connected
                  ? (pressed ? '#b91c1c' : '#ef4444')
                  : (pressed ? '#1d4ed8' : '#3b82f6'),
                paddingVertical: 14, borderRadius: 12, alignItems: 'center',
                shadowColor: connected ? '#ef4444' : '#3b82f6',
                shadowOpacity: 0.6, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
                elevation: 6,
              })}
            >
              <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '900', letterSpacing: 3 }}>
                {connected ? 'DISCONNECT' : scanning ? 'SEARCHING...' : 'CONNECT'}
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

function Joystick({ onMove }: { onMove: (c: string) => void }) {
  const SIZE = 200;
  const KNOB = 70;
  const MAX = (SIZE - KNOB) / 2;
  const pan = useRef(new Animated.ValueXY()).current;
  const lastCmd = useRef<string>('S');

  const dispatch = (dx: number, dy: number) => {
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 25) {
      if (lastCmd.current !== 'S') { onMove('S'); lastCmd.current = 'S'; }
      return;
    }

    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    let cmd: string;

    if (angle >= -22.5 && angle < 22.5) cmd = 'R';
    else if (angle >= 22.5 && angle < 67.5) cmd = 'BR';
    else if (angle >= 67.5 && angle < 112.5) cmd = 'B';
    else if (angle >= 112.5 && angle < 157.5) cmd = 'BL';
    else if (angle >= 157.5 || angle < -157.5) cmd = 'L';
    else if (angle >= -157.5 && angle < -112.5) cmd = 'FL';
    else if (angle >= -112.5 && angle < -67.5) cmd = 'F';
    else cmd = 'FR';

    if (cmd !== lastCmd.current) {
      onMove(cmd);
      lastCmd.current = cmd;
    }
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
