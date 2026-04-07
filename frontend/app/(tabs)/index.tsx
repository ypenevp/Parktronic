import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, Text, Pressable,
  PermissionsAndroid, Platform, Animated, Easing
} from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';

const bleManager = new BleManager();
const SERVICE_UUID = '12345678-1234-1234-1234-123456789abc';
const CHARACTERISTIC_UUID = 'abcd1234-5678-90ab-cdef-1234567890ab';

const COMMANDS: Record<string, string> = {
  F: 'Rg==', B: 'Qg==', L: 'TA==', R: 'Ug==', S: 'Uw==',
};

function CarButton({
  label, cmd, color = '#1E88E5', size = 'normal', onPressIn, onPressOut
}: {
  label: string; cmd: string; color?: string;
  size?: 'normal' | 'large';
  onPressIn: (cmd: string) => void;
  onPressOut: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.88, useNativeDriver: true, speed: 50 }),
      Animated.timing(glow, { toValue: 1, duration: 100, useNativeDriver: false }),
    ]).start();
    onPressIn(cmd);
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }),
      Animated.timing(glow, { toValue: 0, duration: 200, useNativeDriver: false }),
    ]).start();
    onPressOut();
  };

  const bgColor = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [color, '#FFFFFF'],
  });

  const w = size === 'large' ? 110 : 90;
  const h = size === 'large' ? 90 : 75;

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[
        styles.button,
        { width: w, height: h, backgroundColor: bgColor, transform: [{ scale }] }
      ]}>
        <Text style={styles.buttonText}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

function PulsingDot({ connected }: { connected: boolean }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (connected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.4, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulse.setValue(1);
    }
  }, [connected]);

  return (
    <Animated.View style={[
      styles.dot,
      {
        backgroundColor: connected ? '#4CAF50' : '#F44336',
        transform: [{ scale: pulse }]
      }
    ]} />
  );
}

export default function HomeScreen() {
  const [device, setDevice] = useState<Device | null>(null);
  const [status, setStatus] = useState('Searching...');
  const [connected, setConnected] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
      await device.writeCharacteristicWithResponseForService(
        SERVICE_UUID, CHARACTERISTIC_UUID, b64
      );
    } catch (e) {
      console.log('Error sending command', e);
    }
  };

  const startCommand = (cmd: string) => {
    sendCommand(COMMANDS[cmd]);
    intervalRef.current = setInterval(() => sendCommand(COMMANDS[cmd]), 120);
  };

  const stopCommand = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    sendCommand(COMMANDS.S);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ESP32 Car</Text>
        <View style={styles.statusRow}>
          <PulsingDot connected={connected} />
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <CarButton label="▲" cmd="F" color="#1565C0"
          onPressIn={startCommand} onPressOut={stopCommand} size="large" />

        <View style={styles.row}>
          <CarButton label="◄" cmd="L" color="#1565C0"
            onPressIn={startCommand} onPressOut={stopCommand} size="large" />

          <Pressable style={styles.stopButton} onPress={stopCommand}>
            <Text style={styles.stopText}>■</Text>
          </Pressable>

          <CarButton label="►" cmd="R" color="#1565C0"
            onPressIn={startCommand} onPressOut={stopCommand} size="large" />
        </View>

        <CarButton label="▼" cmd="B" color="#1565C0"
          onPressIn={startCommand} onPressOut={stopCommand} size="large" />
      </View>

      <Text style={styles.hint}>Hold the button to move</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 40,
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
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  controls: {
    alignItems: 'center',
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    backgroundColor: '#C62828',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  stopText: {
    color: '#fff',
    fontSize: 24,
  },
  hint: {
    color: '#444',
    fontSize: 12,
    letterSpacing: 1,
  },
});
