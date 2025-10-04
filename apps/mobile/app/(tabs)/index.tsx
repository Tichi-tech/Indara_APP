// apps/mobile/app/(tabs)/index.tsx
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import {
  HomeHero,
  HealingCommunitySection,
  PlaylistRail,
  TrackListSection,
} from '@/features/home';
import { useAuth } from '@/hooks/useAuth';
import { musicApi } from '@/services/musicApi';
import { usePlayer } from '@/hooks/usePlayer';
import type { Track } from '@/types/music';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const { loadAndPlay } = usePlayer();

  const [playlistItems, setPlaylistItems] = useState<
    Array<{
      id: string;
      title: string;
      description: string;
      image?: string;
      trackCount?: number;
      duration?: string;
    }>
  >([]);
  const [trending, setTrending] = useState<
    Array<
      {
        id: string;
        title: string;
        artist?: string;
        durationSec?: number;
        audio_url?: string;
        image?: string;
        stats?: { plays: number; likes: number };
      }
    >
  >([]);
  const [listsLoading, setListsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const parseDuration = (duration?: string | null) => {
      if (!duration) return undefined;
      const [mins, secs] = duration.split(':').map(Number);
      if (Number.isNaN(mins) || Number.isNaN(secs)) return undefined;
      return mins * 60 + secs;
    };

    const run = async () => {
      setListsLoading(true);
      const [{ data: playlists }, { data: tracks }] = await Promise.all([
        musicApi.getHomeScreenPlaylists(),
        musicApi.getCommunityTracks(8, 0),
      ]);

      if (!isMounted) return;

      const statsEntries = await Promise.all(
        tracks.map(async (track) => {
          const statsResult = await musicApi.getTrackStats(track.id, user?.id);
          return {
            id: track.id,
            stats: statsResult.data
              ? { plays: statsResult.data.plays, likes: statsResult.data.likes }
              : undefined,
          };
        })
      );

      if (!isMounted) return;

      const statsMap = Object.fromEntries(statsEntries.map(({ id, stats }) => [id, stats])) as Record<
        string,
        { plays: number; likes: number } | undefined
      >;

      setPlaylistItems([...playlists]);
      setTrending(
        tracks.map((track) => ({
          id: track.id,
          title: track.title,
          artist: track.creator,
          durationSec: parseDuration(track.duration),
          audio_url: track.audio_url,
          image: track.image,
          stats: statsMap[track.id],
        }))
      );
      setListsLoading(false);
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handlePlaylistPress = useCallback((playlistId: string) => {
    router.push(`/playlist/${playlistId}`);
  }, [router]);

  const handleTrackPress = useCallback(
    async (trackId: string) => {
      const track = trending.find((item) => item.id === trackId);
      if (!track?.audio_url) return;

      const playerTrack: Track = {
        id: track.id,
        title: track.title,
        artist: track.artist ?? 'Community Artist',
        audio_url: track.audio_url,
        image_url: track.image,
      };

      await musicApi.recordPlay(user?.id ?? null, track.id);
      await loadAndPlay(playerTrack, [playerTrack]);
      router.push({ pathname: '/(tabs)/now-playing', params: { trackId } });
    },
    [trending, router, loadAndPlay, user?.id]
  );

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.contentContainer}
    >
      <HomeHero name={user?.user_metadata?.name ?? user?.email ?? undefined} />

      <HealingCommunitySection />

      {listsLoading ? (
        <View style={styles.loadingBlock}>
          <ActivityIndicator color="#4f46e5" />
        </View>
      ) : (
        <>
          <PlaylistRail
            title="Curated for you"
            description="Fresh rotations for the mood you’re in."
            playlists={playlistItems}
            onPlaylistPress={handlePlaylistPress}
          />

          <TrackListSection tracks={trending} onTrackPress={handleTrackPress} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    paddingTop: 48,
    paddingBottom: 120,
  },
  loadingBlock: {
    marginTop: 40,
    alignItems: 'center',
  },
});
