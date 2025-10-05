import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import SongPlayerScreen, { type PlayerSong } from '@/screens/SongPlayerScreen';
import { usePlayer } from '@/hooks/usePlayer';

export default function NowPlaying() {
  const router = useRouter();
  const { trackId } = useLocalSearchParams<{ trackId?: string }>();
  const { current, queue } = usePlayer();

  const activeTrack = useMemo(() => {
    if (trackId) {
      return queue.find((item) => item.id === trackId) ?? current;
    }
    return current;
  }, [trackId, queue, current]);

  if (!activeTrack) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Nothing is playing</Text>
        <Text style={styles.emptySubtitle}>Start a track from the Home or Library tab to see the player.</Text>
      </View>
    );
  }

  const song: PlayerSong = {
    id: activeTrack.id,
    title: activeTrack.title ?? 'Now Playing',
    description: activeTrack.artist ?? undefined,
    audio_url: activeTrack.audio_url,
    image_url: activeTrack.image_url ?? undefined,
    creator: activeTrack.artist,
  };

  return (
    <SongPlayerScreen
      song={song}
      onBack={() => router.back()}
    />
  );
}

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
