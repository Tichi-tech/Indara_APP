import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { BottomNav, type BottomNavProps } from '@/components/BottomNav';
import { usePlayer } from '@/hooks/usePlayer';
import { musicApi } from '@/services/musicApi';
import type { Track as PlaybackTrack } from '@/types/music';
import { getSmartThumbnail } from '@/utils/thumbnailMatcher';

type PlaylistItem = {
  id: string;
  title: string;
  description?: string;
  creator: string;
  duration?: string;
  audio_url?: string;
  image?: string;
};

export type HealingMusicPlaylistProps = {
  onBack?: () => void;
  onCreateMusic?: () => void;
  onLibrary?: () => void;
  onInbox?: () => void;
  onAccount?: () => void;
  onTrackPress?: (trackId: string) => void;
  bottomNavProps?: BottomNavProps;
  accountInitial?: string;
};

function HealingMusicPlaylistComponent({
  onBack,
  onCreateMusic,
  onLibrary,
  onInbox,
  onAccount,
  onTrackPress,
  bottomNavProps,
  accountInitial = 'S',
}: HealingMusicPlaylistProps) {
  const [tracks, setTracks] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    current,
    isPlaying,
    loadAndPlay,
    toggle,
  } = usePlayer();

  const fetchTracks = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setError(null);
      const { data, error: fetchError } = await musicApi.getCommunityTracks(100, 0);
      if (fetchError) throw fetchError;

      const normalized: PlaylistItem[] = (data ?? []).map((item: any) => ({
        id: String(item.id),
        title: item.title ?? 'Untitled',
        description: item.description ?? '',
        creator: item.creator ?? 'Community Artist',
        duration: item.duration ?? '3:00',
        audio_url: item.audio_url ?? undefined,
        image:
          item.image ??
          getSmartThumbnail(item.title ?? '', item.description ?? '', item.tags ?? ''),
      }));

      setTracks(normalized);
    } catch (err) {
      console.error('Failed to load healing playlist tracks', err);
      setError('We had trouble loading the playlist. Please try again shortly.');
      setTracks([]);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchTracks();
  }, [fetchTracks]);

  const playableQueue: PlaybackTrack[] = useMemo(
    () =>
      tracks
        .filter((item) => Boolean(item.audio_url))
        .map((item) => ({
          id: item.id,
          title: item.title,
          artist: item.creator,
          image_url: item.image,
          audio_url: item.audio_url,
          duration_ms: parseDurationToMs(item.duration),
        })),
    [tracks]
  );

  const handleTrackPress = useCallback(
    async (item: PlaylistItem) => {
      setError(null);
      onTrackPress?.(item.id);

      const existing = playableQueue.find((track) => track.id === item.id);
      if (!existing) {
        setError('Playback is unavailable for this track right now.');
        return;
      }

      if (current?.id === item.id) {
        await toggle();
        return;
      }

      await loadAndPlay(existing, playableQueue);
    },
    [current?.id, loadAndPlay, onTrackPress, playableQueue, toggle]
  );

  const mergedBottomNavProps: BottomNavProps | null = useMemo(() => {
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

  const renderItem = ({ item }: { item: PlaylistItem }) => {
    const isCurrent = current?.id === item.id;
    const hasAudio = Boolean(item.audio_url);

    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => (hasAudio ? handleTrackPress(item) : undefined)}
        style={[styles.trackCard, isCurrent && styles.trackCardActive]}
      >
        <View style={styles.thumbnailWrap}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.thumbnail} />
          ) : (
            <View style={styles.thumbnailPlaceholder}>
              <Feather name="music" size={20} color="#ffffff" />
            </View>
          )}
        </View>

        <View style={styles.trackCopy}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.trackSubtitle} numberOfLines={1}>
            {item.creator}
          </Text>
          <View style={styles.trackMeta}>
            <Text style={styles.trackMetaText}>{item.duration ?? '3:00'}</Text>
          </View>
        </View>

        <View style={styles.trackControls}>
          {hasAudio ? (
            <View style={styles.playButton}>
              <Feather
                name={isCurrent && isPlaying ? 'pause' : 'play'}
                size={18}
                color="#111827"
                style={!isCurrent || !isPlaying ? styles.playIconOffset : undefined}
              />
            </View>
          ) : (
            <Feather name="slash" size={18} color="#9ca3af" />
          )}
          <Feather name="chevron-right" size={20} color="#d1d5db" />
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            onPress={onBack}
            style={styles.headerButton}
          >
            <Feather name="arrow-left" size={20} color="#111827" />
          </Pressable>
          <Text style={styles.headerTitle}>Healing music</Text>
          <Pressable
            accessibilityRole="button"
            onPress={onBack}
            style={styles.headerButton}
          >
            <Feather name="x" size={20} color="#111827" />
          </Pressable>
        </View>

        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.introBlock}>
              <Text style={styles.introTitle}>Community healing playlist</Text>
              <Text style={styles.introSubtitle}>
                Soothing tracks curated by the Indara community. Tap any song to start instant playback.
              </Text>

              {error && tracks.length ? (
                <View style={styles.errorBanner}>
                  <Feather name="alert-circle" size={18} color="#b45309" />
                  <Text style={styles.errorText}>{error}</Text>
                  <Pressable onPress={() => fetchTracks(true)}>
                    <Text style={styles.errorRetry}>Retry</Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              {loading ? (
                <ActivityIndicator size="small" color="#6b7280" />
              ) : (
                <>
                  <Feather name="cloud-off" size={24} color="#9ca3af" />
                  <Text style={styles.emptyTitle}>No tracks available</Text>
                  <Text style={styles.emptySubtitle}>
                    {error ?? 'Check back soon for new healing music.'}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => fetchTracks(true)}
                    style={styles.retryButton}
                  >
                    <Text style={styles.retryLabel}>Try again</Text>
                  </Pressable>
                </>
              )}
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchTracks(true)}
              tintColor="#111827"
            />
          }
        />

        {mergedBottomNavProps ? <BottomNav {...mergedBottomNavProps} /> : null}
      </View>
    </SafeAreaView>
  );
}

const parseDurationToMs = (value?: string) => {
  if (!value) return undefined;
  const parts = value.split(':').map((segment) => Number(segment.trim()));
  if (parts.some((num) => Number.isNaN(num))) return undefined;
  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return (minutes * 60 + seconds) * 1000;
  }
  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return ((hours * 60 + minutes) * 60 + seconds) * 1000;
  }
  return undefined;
};

export const HealingMusicPlaylist = memo(HealingMusicPlaylistComponent);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    paddingBottom: 220,
    gap: 16,
  },
  introBlock: {
    marginBottom: 16,
    gap: 8,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  introSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6b7280',
  },
  errorBanner: {
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#fef3c7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#92400e',
  },
  errorRetry: {
    fontSize: 13,
    fontWeight: '600',
    color: '#b45309',
  },
  trackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    backgroundColor: '#f9fafb',
    gap: 16,
  },
  trackCardActive: {
    backgroundColor: '#ede9fe',
  },
  thumbnailWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#c4b5fd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackCopy: {
    flex: 1,
    gap: 4,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  trackSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  trackMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trackMetaText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  trackControls: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
    marginBottom: 2,
  },
  playIconOffset: {
    marginLeft: 2,
  },
  emptyState: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#111827',
  },
  retryLabel: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default HealingMusicPlaylist;
