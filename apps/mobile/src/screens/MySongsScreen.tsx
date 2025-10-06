import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { useAuth } from '@/hooks/useAuth';
import { usePlayer } from '@/hooks/usePlayer';
import { musicApi } from '@/services/musicApi';
import { getSmartThumbnail } from '@/utils/thumbnailMatcher';
import type { Track } from '@/types/music';

const resolveImage = (uri?: string | null) => {
  if (!uri) return undefined;
  if (uri.startsWith('http')) return uri;
  return `https://app.indara.live${uri}`;
};

type LibraryTrack = {
  id: string;
  title: string;
  description: string;
  durationLabel: string;
  audioUrl?: string;
  imageUrl: string;
  plays: number;
  likes: number;
  isLiked: boolean;
  isPublished: boolean;
  createdAt?: string;
};

type UserPlaylist = {
  id: string;
  name: string;
  trackCount: number;
  image: string;
};

type MySongsScreenProps = {
  onCreate?: () => void;
};

function MySongsScreenComponent({
  onCreate,
}: MySongsScreenProps) {
  const { user } = useAuth();
  const { loadAndPlay, current, isPlaying, toggle } = usePlayer();

  const [tracks, setTracks] = useState<LibraryTrack[]>([]);
  const [playlists, setPlaylists] = useState<UserPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [likingId, setLikingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTracks = useCallback(async () => {
    if (!user?.id) {
      setTracks([]);
      setPlaylists([]);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const [tracksResult, playlistsResult] = await Promise.all([
        musicApi.getUserTracks(user.id),
        musicApi.getUserPlaylists(user.id),
      ]);

      if (tracksResult.error) throw tracksResult.error;
      if (playlistsResult.error) throw playlistsResult.error;

      const baseTracks = (tracksResult.data ?? []).map((item: any) => {
        const fallbackImage = getSmartThumbnail(
          item.title ?? 'Untitled',
          item.prompt ?? item.admin_notes ?? '',
          item.style ?? ''
        );

        const imageUrl = resolveImage(item.thumbnail_url) ?? fallbackImage;
        const duration = item.duration ?? '3:00';

        return {
          id: item.id,
          title: item.title ?? 'Untitled',
          description: item.prompt ?? item.admin_notes ?? '',
          durationLabel: duration,
          audioUrl: item.audio_url ?? undefined,
          imageUrl,
          plays: item.play_count ?? 0,
          likes: item.like_count ?? 0,
          isLiked: Boolean(item.is_liked),
          isPublished: Boolean(item.is_published),
          createdAt: item.created_at,
        } as LibraryTrack;
      });

      const withStats = await Promise.all(
        baseTracks.map(async (track) => {
          const { data: stats } = await musicApi.getTrackStats(track.id, user.id);
          if (stats) {
            return {
              ...track,
              plays: stats.plays,
              likes: stats.likes,
              isLiked: Boolean(stats.isLiked),
            };
          }
          return track;
        })
      );

      setTracks(withStats);
      setPlaylists([...(playlistsResult.data ?? [])]);
    } catch (err) {
      console.error('Failed to load user tracks', err);
      setError('We could not load your library. Pull to refresh to try again.');
      setTracks([]);
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadTracks();
  }, [loadTracks]);

  useEffect(() => {
    if (!tracks.length) return;
    const ids = tracks.map((track) => track.id);
    const unsubscribe = musicApi.subscribeToTrackStats(ids, (trackId, stats) => {
      setTracks((prev) =>
        prev.map((track) =>
          track.id === trackId
            ? {
                ...track,
                plays: stats.plays,
                likes: stats.likes,
              }
            : track
        )
      );
    });

    return unsubscribe;
  }, [tracks.map((track) => track.id).join(',')]);

  const filteredTracks = useMemo(() => {
    if (!search.trim()) return tracks;
    const term = search.trim().toLowerCase();
    return tracks.filter((track) =>
      [track.title, track.description].some((value) => value?.toLowerCase().includes(term))
    );
  }, [tracks, search]);

  const likedTracks = useMemo(() => tracks.filter((track) => track.isLiked), [tracks]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTracks();
    setRefreshing(false);
  }, [loadTracks]);

  const formatDuration = (label: string) => label || '—';

  const handlePlay = useCallback(
    async (track: LibraryTrack) => {
      if (!track.audioUrl) return;

      const nowPlaying: Track = {
        id: track.id,
        title: track.title,
        artist: 'You',
        audio_url: track.audioUrl,
        image_url: track.imageUrl,
      };

      if (current?.id === track.id) {
        await toggle();
      } else {
        await musicApi.recordPlay(user?.id ?? null, track.id);
        await loadAndPlay(nowPlaying, [nowPlaying]);
      }
    },
    [current?.id, loadAndPlay, toggle, user?.id]
  );

  const handleLike = useCallback(
    async (track: LibraryTrack) => {
      if (!user?.id || likingId) return;
      setLikingId(track.id);
      try {
        const { data, error } = await musicApi.likeTrack(user.id, track.id);
        if (error) throw error;
        if (!data) return;

        setTracks((prev) =>
          prev.map((item) =>
            item.id === track.id
              ? {
                  ...item,
                  isLiked: data.liked,
                  likes: Math.max(0, item.likes + (data.liked ? 1 : -1)),
                }
              : item
          )
        );
      } catch (err) {
        console.error('Failed to toggle like', err);
      } finally {
        setLikingId(null);
      }
    },
    [likingId, user?.id]
  );

  const handlePublishToggle = useCallback(
    async (track: LibraryTrack) => {
      if (!user?.id || publishingId) return;
      setPublishingId(track.id);
      try {
        if (track.isPublished) {
          const { error } = await musicApi.unpublishTrack(track.id, user.id);
          if (error) throw error;
        } else {
          const { error } = await musicApi.publishTrackToCommunity(track.id, user.id);
          if (error) throw error;
        }

        setTracks((prev) =>
          prev.map((item) =>
            item.id === track.id
              ? { ...item, isPublished: !track.isPublished }
              : item
          )
        );
      } catch (err) {
        console.error('Failed to toggle publish state', err);
      } finally {
        setPublishingId(null);
      }
    },
    [publishingId, user?.id]
  );

  const renderItem = ({ item }: { item: LibraryTrack }) => {
    const isCurrent = current?.id === item.id;
    const playing = isCurrent && isPlaying;
    const likeDisabled = likingId === item.id || !user;
    const publishDisabled = publishingId === item.id || !user;

    return (
      <View style={[styles.trackCard, isCurrent && styles.trackCardActive]}>
        <Pressable
          onPress={() => handlePlay(item)}
          accessibilityRole="button"
          style={styles.coverWrap}
        >
          <Image source={{ uri: item.imageUrl }} style={styles.cover} />
          <View style={styles.coverOverlay}>
            <Feather
              name={playing ? 'pause' : 'play'}
              size={16}
              color="#ffffff"
              style={!playing ? styles.playIconOffset : undefined}
            />
          </View>
        </Pressable>

        <View style={styles.trackBody}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.trackSubtitle} numberOfLines={2}>
            {item.description || 'Tap play to listen back.'}
          </Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Feather name="clock" size={12} color="#64748b" />
              <Text style={styles.metaText}>{formatDuration(item.durationLabel)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="headphones" size={12} color="#64748b" />
              <Text style={styles.metaText}>{item.plays}</Text>
            </View>
            <View style={styles.metaItem}>
              <Feather name="heart" size={12} color={item.isLiked ? '#ec4899' : '#64748b'} />
              <Text style={styles.metaText}>{item.likes}</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <Pressable
              onPress={() => handlePublishToggle(item)}
              style={styles.actionButton}
              accessibilityRole="button"
              disabled={publishDisabled}
            >
              <Feather
                name={item.isPublished ? 'globe' : 'lock'}
                size={16}
                color={item.isPublished ? '#0f766e' : '#64748b'}
              />
              <Text style={[styles.actionLabel, item.isPublished && styles.actionLabelActive]}>
                {item.isPublished ? 'Public' : 'Private'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleLike(item)}
              style={styles.actionButton}
              accessibilityRole="button"
              disabled={likeDisabled}
            >
              <Feather
                name={item.isLiked ? 'heart' : 'heart'}
                size={16}
                color={item.isLiked ? '#ec4899' : '#64748b'}
              />
              <Text style={[styles.actionLabel, item.isLiked && styles.heartLabelActive]}>
                {item.isLiked ? 'Liked' : 'Like'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  };

  const listContent = useMemo(() => (
    <View style={styles.listHeader}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Playlists</Text>
        <Pressable accessibilityRole="button">
          <Feather name="search" size={18} color="#94a3b8" />
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.playlistsRow}>
        <Pressable accessibilityRole="button" onPress={onCreate} style={styles.newPlaylistCard}>
          <Feather name="plus" size={22} color="#9ca3af" />
          <Text style={styles.playlistLabel}>New Playlist</Text>
        </Pressable>
        {playlists.map((playlist) => (
          <View key={playlist.id} style={styles.playlistCard}>
            <Image source={{ uri: playlist.image }} style={styles.playlistCover} />
            <Text style={styles.playlistName} numberOfLines={1}>{playlist.name}</Text>
            <Text style={styles.playlistMeta}>{playlist.trackCount} {playlist.trackCount === 1 ? 'song' : 'songs'}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Liked</Text>
      {likedTracks.length ? (
        likedTracks.slice(0, 3).map((track) => (
          <View key={track.id} style={styles.likedCard}>
            <Image source={{ uri: track.imageUrl }} style={styles.likedCover} />
            <View style={styles.likedBody}>
              <Text style={styles.likedTitle} numberOfLines={1}>{track.title}</Text>
              <Text style={styles.likedMeta}>{track.durationLabel}</Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.likedEmpty}>
          <Feather name="heart" size={20} color="#cbd5f5" />
          <Text style={styles.likedEmptyText}>No likes yet</Text>
        </View>
      )}

      <View style={styles.divider} />

      <View style={styles.songsHeader}>
        <Text style={styles.sectionTitle}>My songs</Text>
        <Text style={styles.songsMeta}>{tracks.length} {tracks.length === 1 ? 'song' : 'songs'}</Text>
      </View>

      <View style={styles.searchWrap}>
        <Feather name="search" size={16} color="#64748b" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by title or vibe"
          style={styles.searchInput}
          placeholderTextColor="#94a3b8"
        />
      </View>
    </View>
  ), [likedTracks, onCreate, playlists, search, tracks.length]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          data={filteredTracks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={listContent}
          ListEmptyComponent={
            loading ? null : (
              <View style={styles.emptyState}>
                <Feather name="music" size={28} color="#94a3b8" />
                <Text style={styles.emptyTitle}>No tracks yet</Text>
                <Text style={styles.emptySubtitle}>
                  Generate your first healing track to see it appear here.
                </Text>
                <Pressable accessibilityRole="button" onPress={onCreate} style={styles.emptyButton}>
                  <Text style={styles.emptyButtonLabel}>Create something new</Text>
                </Pressable>
              </View>
            )
          }
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#0f766e" />
          }
        />

        {loading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#0f766e" />
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorBanner}>
            <Feather name="alert-triangle" size={16} color="#b91c1c" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 220,
  },
  listHeader: {
    paddingTop: 16,
    paddingBottom: 20,
    gap: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  playlistsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
  },
  newPlaylistCard: {
    width: 96,
    height: 120,
    borderRadius: 24,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#cbd5f5',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#f8fafc',
  },
  playlistLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  playlistCard: {
    width: 96,
    alignItems: 'center',
    gap: 8,
  },
  playlistCover: {
    width: 96,
    height: 96,
    borderRadius: 24,
  },
  playlistName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  playlistMeta: {
    fontSize: 12,
    color: '#94a3b8',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 4,
  },
  likedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 18,
  },
  likedCover: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  likedBody: {
    flex: 1,
    gap: 2,
  },
  likedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  likedMeta: {
    fontSize: 12,
    color: '#94a3b8',
  },
  likedEmpty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  likedEmptyText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  songsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  songsMeta: {
    fontSize: 13,
    color: '#94a3b8',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: '#e2e8f0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
  },
  trackCard: {
    flexDirection: 'row',
    borderRadius: 24,
    backgroundColor: '#ffffff',
    padding: 16,
    gap: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  trackCardActive: {
    borderWidth: 1,
    borderColor: '#0f766e',
  },
  coverWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cover: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(17,24,39,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconOffset: {
    marginLeft: 2,
  },
  trackBody: {
    flex: 1,
    gap: 8,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  trackSubtitle: {
    fontSize: 13,
    color: '#475569',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionLabel: {
    fontSize: 12,
    color: '#475569',
  },
  actionLabelActive: {
    color: '#0f766e',
    fontWeight: '600',
  },
  heartLabelActive: {
    color: '#ec4899',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  emptyButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#0f766e',
    borderRadius: 20,
  },
  emptyButtonLabel: {
    color: '#ffffff',
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 16,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  errorBanner: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 220,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#fee2e2',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#b91c1c',
  },
});

export const MySongsScreen = memo(MySongsScreenComponent);

export default MySongsScreen;
