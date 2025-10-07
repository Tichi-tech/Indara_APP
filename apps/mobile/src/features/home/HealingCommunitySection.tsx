import { memo, useEffect, useState, useCallback, useMemo } from 'react';
import { ActivityIndicator, ImageBackground, Pressable, ScrollView, View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Caption, Card, H2, P } from '@/ui';
import { useAuth } from '@/hooks/useAuth';
import { usePlayer } from '@/hooks/usePlayer';
import type { Track } from '@/types/music';
import type { CommunityTrack, TrackStats } from '@/types/home';
import { musicApi } from '@/services/musicApi';
import { getSmartThumbnail } from '@/utils/thumbnailMatcher';

type HealingCommunitySectionProps = {
  tracks?: CommunityTrack[];
  stats?: Record<string, TrackStats>;
};

const fallbackImage = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=640&q=80';

function HealingCommunitySectionComponent({ tracks: propTracks, stats: propStats }: HealingCommunitySectionProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { current, isPlaying, loadAndPlay, toggle } = usePlayer();

  // Use props if provided, otherwise fetch data (fallback for standalone usage)
  const [tracks, setTracks] = useState<CommunityTrack[]>(propTracks || []);
  const [stats, setStats] = useState<Record<string, TrackStats>>(propStats || {});
  const [loading, setLoading] = useState(!propTracks);

  useEffect(() => {
    // If props are provided, update state and skip fetching
    if (propTracks && propStats) {
      setTracks(propTracks);
      setStats(propStats);
      setLoading(false);
      return;
    }

    // Otherwise, fetch data (for standalone usage)
    let isMounted = true;

    const run = async () => {
      setLoading(true);
      const { data: community } = await musicApi.getCommunityTracks(20, 0);

      if (!isMounted) return;

      // ✅ Batch fetch all stats in ONE query instead of N queries
      const trackIds = community.map((track) => track.id);
      const { data: statsMap } = await musicApi.getBatchTrackStats(trackIds, user?.id);

      if (!isMounted) return;

      const enriched = community.map((track) => ({
        ...track,
        image: track.image || getSmartThumbnail(track.title, track.description, track.tags) || fallbackImage,
      }));

      if (isMounted) {
        setTracks(enriched);
        setStats(statsMap);
      }

      setLoading(false);
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [propTracks, propStats, user?.id]);

  const handlePlay = useCallback(
    async (track: CommunityTrack) => {
      if (!track.audio_url) return;

      const playerTrack: Track = {
        id: track.id,
        title: track.title,
        artist: track.creator ?? 'Community Artist',
        audio_url: track.audio_url,
        image_url: track.image || getSmartThumbnail(track.title, track.description, track.tags) || fallbackImage,
      };

      if (current?.id === track.id) {
        await toggle();
        return;
      }

      // Convert all tracks to player queue
      const queue: Track[] = tracks.map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.creator ?? 'Community Artist',
        audio_url: t.audio_url || '',
        image_url: t.image || getSmartThumbnail(t.title, t.description, t.tags) || fallbackImage,
      }));

      await musicApi.recordPlay(user?.id ?? null, track.id);
      await loadAndPlay(playerTrack, queue);
    },
    [current?.id, loadAndPlay, toggle, user?.id, tracks]
  );

  // Memoize track IDs to prevent unnecessary subscription re-initialization
  const trackIds = useMemo(() => tracks.map((track) => track.id), [tracks]);

  useEffect(() => {
    if (!trackIds.length) return;

    const unsubscribe = musicApi.subscribeToTrackStats(trackIds, (trackId, payload) => {
      setStats((prev) => ({
        ...prev,
        [trackId]: {
          plays: payload.plays,
          likes: payload.likes,
        },
      }));
    });

    return unsubscribe;
  }, [trackIds]);

  const currentTrackId = current?.id;

  return (
    <View style={styles.section}>
      <View style={styles.headerRow}>
        <H2 style={styles.headerTitle}>Healing Community</H2>
        <Pressable
          hitSlop={8}
          style={styles.moreButton}
          onPress={() => router.push('/meditation/playlist')}
        >
          <Caption style={styles.moreLabel}>More</Caption>
          <Feather name="chevron-right" size={16} color="#6b7280" />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size="small" color="#6366f1" />
        </View>
      ) : !tracks.length ? (
        <Card style={styles.emptyState}>
          <P style={styles.emptyTitle}>No featured tracks yet</P>
          <Caption style={styles.emptySubtitle}>
            Create and publish music to build the healing community.
          </Caption>
        </Card>
      ) : (
        <ScrollRow
          data={tracks}
          currentTrackId={currentTrackId}
          stats={stats}
          onPlay={handlePlay}
        />
      )}
    </View>
  );
}

type ScrollRowProps = {
  data: CommunityTrack[];
  currentTrackId?: string;
  stats: Record<string, { plays: number; likes: number }>;
  onPlay: (track: CommunityTrack) => void;
};

const ScrollRow = memo(({ data, currentTrackId, stats, onPlay }: ScrollRowProps) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.carouselContent}
  >
    <View style={styles.carouselRow}>
      {data.map((track, index) => (
        <TrackCard
          key={track.id}
          track={track}
          isActive={track.id === currentTrackId}
          stats={stats[track.id]}
          onPlay={() => onPlay(track)}
          isLast={index === data.length - 1}
        />
      ))}
    </View>
  </ScrollView>
));

type TrackCardProps = {
  track: CommunityTrack;
  isActive: boolean;
  stats?: { plays: number; likes: number };
  onPlay: () => void;
  isLast?: boolean;
};

const TrackCard = memo(({ track, isActive, stats, onPlay, isLast }: TrackCardProps) => {
  const imageUri = track.image || getSmartThumbnail(track.title, track.description, track.tags) || fallbackImage;
  const player = usePlayer();
  const playing = player.current?.id === track.id && player.isPlaying;

  return (
    <View style={[styles.trackCardWrap, isLast && styles.trackCardWrapLast]}>
      <Pressable onPress={onPlay} accessibilityRole="button">
        <Card style={styles.trackCard}>
          <ImageBackground
            source={{ uri: imageUri }}
            style={styles.trackImage}
            imageStyle={styles.trackImageInner}
          >
            <View style={styles.trackImageOverlay} />
            <View style={styles.trackImageHeader}>
              <View style={styles.spacer} />
              <View style={styles.playButton}>
                <Feather
                  name={playing ? 'pause' : 'play'}
                  size={18}
                  color="#ffffff"
                  style={!playing ? styles.playIconOffset : undefined}
                />
              </View>
            </View>
          </ImageBackground>

          <View style={styles.trackInfoCard}>
            <P style={[styles.trackTitle, isActive && styles.trackTitleActive]} numberOfLines={1}>
              {track.title}
            </P>
            <Caption style={styles.trackDescription} numberOfLines={2}>
              {track.description}
            </Caption>

            <View style={styles.trackFooter}>
              <Caption style={styles.trackCreator} numberOfLines={1}>
                @{track.creator || 'indara'}
              </Caption>
              <View style={styles.trackStats}>
                <View style={[styles.statItem, styles.statItemFirst]}>
                  <Feather name="headphones" size={11} color="#6b7280" />
                  <Caption>{stats?.plays ?? 0}</Caption>
                </View>
                <View style={styles.statItem}>
                  <Feather name="heart" size={11} color="#6b7280" />
                  <Caption>{stats?.likes ?? 0}</Caption>
                </View>
              </View>
            </View>
          </View>
        </Card>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  section: {
    marginTop: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreLabel: {
    color: '#6b7280',
    fontWeight: '600',
    marginRight: 6,
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    marginHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  emptySubtitle: {
    marginTop: 8,
    textAlign: 'center',
    color: '#6b7280',
  },
  carouselContent: {
    paddingLeft: 20,
    paddingRight: 32,
    paddingVertical: 4,
  },
  carouselRow: {
    flexDirection: 'row',
    height: 278,
  },
  trackCardWrap: {
    width: 192,
    height: 270,
    marginRight: 16,
  },
  trackCardWrapLast: {
    marginRight: 0,
  },
  trackCard: {
    padding: 0,
    borderRadius: 24,
    overflow: 'hidden',
    height: '100%',
  },
  trackImage: {
    height: 144,
    width: '100%',
  },
  trackImageInner: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  trackImageOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  trackImageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  spacer: {
    flex: 1,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(17,24,39,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconOffset: {
    marginLeft: 2,
  },
  trackInfoCard: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 16,
    height: 126,
    justifyContent: 'space-between',
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  trackTitleActive: {
    color: '#4338CA',
  },
  trackDescription: {
    marginTop: 6,
    color: '#6b7280',
  },
  trackFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  trackCreator: {
    flex: 1,
    marginRight: 12,
    color: '#6b7280',
  },
  trackStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  statItemFirst: {
    marginLeft: 0,
  },
});

export const HealingCommunitySection = memo(HealingCommunitySectionComponent);
