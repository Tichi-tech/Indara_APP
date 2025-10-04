import { useEffect, useState, memo } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

const formatTime = (date: Date) =>
  date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

function StatusBarComponent() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.time}>{formatTime(now)}</Text>
        <View style={styles.statusGroup}>
          <View style={styles.signal}>
            <View style={[styles.signalBar, styles.signalBarShort]} />
            <View style={[styles.signalBar, styles.signalBarMid]} />
            <View style={[styles.signalBar, styles.signalBarTall]} />
          </View>
          <View style={styles.battery}>
            <View style={styles.batteryFill} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 44,
  },
  time: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  signal: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  signalBar: {
    width: 3,
    backgroundColor: '#111827',
    borderRadius: 1.5,
  },
  signalBarShort: {
    height: 6,
  },
  signalBarMid: {
    height: 10,
  },
  signalBarTall: {
    height: 14,
  },
  battery: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 24,
    height: 12,
    borderWidth: 1,
    borderColor: '#111827',
    borderRadius: 3,
    padding: 1,
  },
  batteryFill: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 1,
  },
});

export const StatusBar = memo(StatusBarComponent);

export default StatusBar;
