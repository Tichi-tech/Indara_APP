import { memo, useMemo, useState, useEffect } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { BottomNav, type BottomNavProps } from '@/components/BottomNav';
import { usePlayer } from '@/hooks/usePlayer';
import { useAuth } from '@/hooks/useAuth';
import { getSmartThumbnail } from '@/utils/thumbnailMatcher';
import { musicApi } from '@/services/musicApi';
import type { Track } from '@/types/music';

type MeditationPlaylistScreenProps = {
  onBack?: () => void;
  onCreateMusic?: () => void;
  onLibrary?: () => void;
  onInbox?: () => void;
  onAccount?: () => void;
  bottomNavProps?: BottomNavProps;
  accountInitial?: string;
};

type MeditationTrack = {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  imageUrl: string;
};

function MeditationPlaylistScreenComponent({
  onBack,
  onCreateMusic,
  onLibrary,
  onInbox,
  onAccount,
  bottomNavProps,
  accountInitial = 'S',
}: MeditationPlaylistScreenProps) {
  const { loadAndPlay, current, isPlaying, toggle } = usePlayer();
  const { user } = useAuth();
  const [tracks, setTracks] = useState<MeditationTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true);
      const { data } = await musicApi.getCommunityTracks(100, 0);

      const formattedTracks: MeditationTrack[] = data.map((track) => ({
        id: track.id,
        title: track.title,
        description: track.description,
        audioUrl: track.audio_url || '',
        imageUrl: track.image || getSmartThumbnail(track.title, track.description, track.tags),
      }));

      setTracks(formattedTracks);
      setLoading(false);
    };

    fetchTracks();
  }, []);

  const mergedBottomNav = useMemo<BottomNavProps | null>(() => {
    if (bottomNavProps) return bottomNavProps;
    return {
      active: 'home',
      onHome: onBack,
      onCreate: onCreateMusic,
      onLibrary,
      onInbox,
      onAccount,
      accountInitial,
    };
  }, [accountInitial, bottomNavProps, onAccount, onBack, onCreateMusic, onInbox, onLibrary]);

  const queue: Track[] = useMemo(
    () =>
      tracks.map((item) => ({
        id: item.id,
        title: item.title,
        artist: 'Community',
        audio_url: item.audioUrl,
        image_url: item.imageUrl,
      })),
    [tracks]
  );

  const handlePlay = async (track: MeditationTrack) => {
    const isCurrent = current?.id === track.id;
    if (isCurrent) {
      await toggle();
      return;
    }

    const playable = queue.find((item) => item.id === track.id);
    if (!playable) return;
    await loadAndPlay(playable, queue);
  };

  const renderItem = ({ item }: { item: MeditationTrack }) => {
    const isActive = current?.id === item.id;
    const playing = isActive && isPlaying;
    return (
      <Pressable
        onPress={() => handlePlay(item)}
        accessibilityRole="button"
        style={[styles.trackCard, isActive && styles.trackCardActive]}
      >
        <View style={styles.coverWrap}>
          <Image source={{ uri: item.imageUrl }} style={styles.cover} />
          <View style={styles.coverOverlay}>
            <Feather
              name={playing ? 'pause' : 'play'}
              size={16}
              color="#ffffff"
              style={!playing ? styles.playIconOffset : undefined}
            />
          </View>
        </View>
        <View style={styles.trackBody}>
          <Text style={styles.trackTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.trackSubtitle} numberOfLines={1}>{item.description}</Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.headerButton}>
            <Feather name="arrow-left" size={20} color="#0f172a" />
          </Pressable>
          <Text style={styles.headerTitle}>Healing Community</Text>
          <View style={styles.headerButton} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0f766e" />
          </View>
        ) : (
          <FlatList
            data={tracks}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
        )}

        {mergedBottomNav ? <BottomNav {...mergedBottomNav} /> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 220,
  },
  trackCard: {
    flexDirection: 'row',
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 12,
    gap: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  trackCardActive: {
    borderWidth: 1,
    borderColor: '#0f766e',
  },
  coverWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    overflow: 'hidden',
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(17,24,39,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconOffset: {
    marginLeft: 2,
  },
  trackBody: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  trackTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  trackSubtitle: {
    fontSize: 12,
    color: '#475569',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const MeditationPlaylistScreen = memo(MeditationPlaylistScreenComponent);

export default MeditationPlaylistScreen;
