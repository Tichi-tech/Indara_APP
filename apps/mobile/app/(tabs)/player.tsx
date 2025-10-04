import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View, Button, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { usePlayer } from '../../src/hooks/usePlayer';

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m.toString().padStart(2, '0')}:${r.toString().padStart(2, '0')}`;
}

export default function Player() {
  const p = usePlayer();
  const durS = (p.duration || 1) / 1000;
  const posS = p.position / 1000;

  return (
    <SafeAreaView style={styles.wrap}>
      <Text style={styles.now}>Now Playing</Text>
      <Text style={styles.title}>{p.current?.title ?? '—'}</Text>
      <Text style={styles.artist}>{p.current?.artist ?? ''}</Text>

      <Slider
        style={{ width: '100%', height: 40 }}
        minimumValue={0}
        maximumValue={durS}
        value={posS}
        onSlidingComplete={(sec) => p.seekSec(sec)}
        minimumTrackTintColor="#4f46e5"
        maximumTrackTintColor="#ddd"
      />

      <View style={styles.row}>
        <Text>{fmt(p.position)}</Text>
        <Text>{fmt(p.duration)}</Text>
      </View>

      <View style={styles.controlsRow}>
        <Button title="Prev" onPress={p.prev} />
        <Button title={p.isPlaying ? 'Pause' : 'Play'} onPress={p.toggle} />
        <Button title="Next" onPress={p.next} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: 20,
  },
  now: {
    textAlign: 'center',
    color: '#666',
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
  },
  artist: {
    textAlign: 'center',
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
});
