import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import SongPlayerScreen, { type PlayerSong } from '@/screens/SongPlayerScreen';
import { usePlayer } from '@/hooks/usePlayer';
import { useAuth } from '@/hooks/useAuth';
import type { BottomNavProps } from '@/components/BottomNav';

export default function NowPlaying() {
  const router = useRouter();
  const { trackId } = useLocalSearchParams<{ trackId?: string }>();
  const { current, queue } = usePlayer();
  const { user } = useAuth();

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

  const accountInitial = (user?.email ?? user?.user_metadata?.name ?? 'S').slice(0, 1).toUpperCase();

  const bottomNavProps: BottomNavProps = {
    active: 'home',
    onHome: () => router.replace('/(tabs)/index'),
    onLibrary: () => router.replace('/(tabs)/library'),
    onCreate: () => router.push('/create'),
    onInbox: () => router.replace('/(tabs)/inbox'),
    onAccount: () => router.replace('/(tabs)/profile'),
    accountInitial,
  };

  return (
    <SongPlayerScreen
      song={song}
      onBack={() => router.back()}
      bottomNavProps={bottomNavProps}
      onCreate={() => router.push('/create')}
      onLibrary={() => router.replace('/(tabs)/library')}
      onInbox={() => router.replace('/(tabs)/inbox')}
      onAccount={() => router.replace('/(tabs)/profile')}
      accountInitial={accountInitial}
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
