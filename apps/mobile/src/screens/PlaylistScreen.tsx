import { memo, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { BottomNav, type BottomNavProps } from '@/components/BottomNav';
import { usePlayer } from '@/hooks/usePlayer';
import { musicApi } from '@/services/musicApi';
import type { Track } from '@/types/music';
import { getSmartThumbnail } from '@/utils/thumbnailMatcher';

type PlaylistTrack = {
  id: string;
  title: string;
  description: string;
  duration: string;
  audio_url?: string;
  thumbnail_url?: string;
};

type PlaylistScreenProps = {
  playlistId: string;
  playlistName: string;
  playlistDescription?: string;
  onBack?: () => void;
  bottomNavProps?: BottomNavProps;
  onCreate?: () => void;
  onLibrary?: () => void;
  onInbox?: () => void;
  onAccount?: () => void;
  accountInitial?: string;
};

function PlaylistScreenComponent({
  playlistId,
  playlistName,
  playlistDescription,
  onBack,
  bottomNavProps,
  onCreate,
  onLibrary,
  onInbox,
  onAccount,
  accountInitial = 'S',
}: PlaylistScreenProps) {
  const { loadAndPlay, current, isPlaying, toggle } = usePlayer();
  const [tracks, setTracks] = useState<PlaylistTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mergedNav = useMemo<BottomNavProps | null>(() => {
    if (bottomNavProps) return bottomNavProps;
    return {
      active: 'home',
      onHome: onBack,
      onLibrary,
      onCreate,
      onInbox,
      onAccount,
      accountInitial,
    };
  }, [accountInitial, bottomNavProps, onAccount, onBack, onCreate, onInbox, onLibrary]);

  useEffect(() => {
    if (!playlistId) return;

    const load = async () => {
      try {
        setError(null);
        setLoading(true);
        const { data, error: fetchError } = await musicApi.getPlaylistTracks(playlistId);
        if (fetchError) throw fetchError;

        const transformed = (data ?? []).map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.prompt ?? item.admin_notes ?? '',
          duration: item.duration ?? '3:45',
          audio_url: item.audio_url,
          thumbnail_url:
            item.thumbnail_url ??
            getSmartThumbnail(item.title ?? '', item.prompt ?? item.admin_notes ?? '', item.style ?? ''),
        }));

        setTracks(transformed);
      } catch (err) {
        console.error('Failed to load playlist tracks', err);
        setError('We could not load this playlist. Pull to refresh to retry.');
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [playlistId]);

  const handlePlay = async (track: PlaylistTrack) => {
    if (!track.audio_url) return;

    if (current?.id === track.id) {
      await toggle();
      return;
    }

    const queue: Track[] = tracks
      .filter((item) => Boolean(item.audio_url))
      .map((item) => ({
        id: item.id,
        title: item.title,
        artist: 'Community Artist',
        audio_url: item.audio_url,
        image_url: item.thumbnail_url,
      }));

    const nowPlaying: Track = {
      id: track.id,
      title: track.title,
      artist: 'Community Artist',
      audio_url: track.audio_url,
      image_url: track.thumbnail_url,
    };

    await musicApi.recordPlay(null, track.id);
    await loadAndPlay(nowPlaying, queue);
  };

  const renderItem = ({ item }: { item: PlaylistTrack }) => {
    const isCurrent = current?.id === item.id;
    const playing = isCurrent && isPlaying;

    return (
      <Pressable
        onPress={() => handlePlay(item)}
        style={[styles.row, isCurrent && styles.rowActive]}
        accessibilityRole="button"
      >
        <Image source={{ uri: item.thumbnail_url }} style={styles.cover} />
        <View style={styles.rowBody}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.rowSubtitle} numberOfLines={2}>
            {item.description || 'Tap to start playback.'}
          </Text>
          <Text style={styles.rowMeta}>{item.duration}</Text>
        </View>
        <Feather
          name={playing ? 'pause-circle' : 'play-circle'}
          size={24}
          color={playing ? '#0f766e' : '#94a3b8'}
        />
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
          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle}>{playlistName}</Text>
            {playlistDescription ? (
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {playlistDescription}
              </Text>
            ) : null}
          </View>
          <View style={styles.headerButton} />
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color="#0f172a" />
          </View>
        ) : error ? (
          <View style={styles.errorBanner}>
            <Feather name="alert-triangle" size={16} color="#b91c1c" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !loading && !error ? (
              <View style={styles.emptyState}>
                <Feather name="music" size={28} color="#94a3b8" />
                <Text style={styles.emptyTitle}>No tracks yet</Text>
                <Text style={styles.emptySubtitle}>This playlist does not have any tracks right now.</Text>
              </View>
            ) : null
          }
        />

        {mergedNav ? <BottomNav {...mergedNav} /> : null}
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
    backgroundColor: '#f3f4f6',
  },
  headerTitles: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748b',
  },
  loadingWrap: {
    paddingVertical: 24,
  },
  errorBanner: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: '#fee2e2',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#b91c1c',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 220,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  rowActive: {
    borderWidth: 1,
    borderColor: '#0f766e',
    backgroundColor: '#ecfdf5',
  },
  cover: {
    width: 64,
    height: 64,
    borderRadius: 18,
  },
  rowBody: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#475569',
  },
  rowMeta: {
    fontSize: 12,
    color: '#94a3b8',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});

export const PlaylistScreen = memo(PlaylistScreenComponent);

export default PlaylistScreen;
