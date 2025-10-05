// apps/mobile/app/(tabs)/index.tsx
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import {
  HealingCommunitySection,
  PlaylistRail,
  HealingCommunitySkeleton,
  PlaylistRailSkeleton,
} from '@/features/home';
import { useAuth } from '@/hooks/useAuth';
import { musicApi } from '@/services/musicApi';
import { usePlayer } from '@/hooks/usePlayer';
import type { PlaylistItem, CommunityTrack, TrackStats } from '@/types/home';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const { loadAndPlay } = usePlayer();

  const [playlistItems, setPlaylistItems] = useState<PlaylistItem[]>([]);
  const [communityTracks, setCommunityTracks] = useState<CommunityTrack[]>([]);
  const [communityStats, setCommunityStats] = useState<Record<string, TrackStats>>({});
  const [listsLoading, setListsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      setListsLoading(true);

      // Fetch playlists and community tracks
      const [{ data: playlists }, { data: allCommunityTracks }] = await Promise.all([
        musicApi.getHomeScreenPlaylists(),
        musicApi.getCommunityTracks(20, 0),
      ]);

      if (!isMounted) return;

      // Batch fetch all stats in ONE query instead of N queries
      const trackIds = allCommunityTracks.map((track) => track.id);
      const { data: statsMap } = await musicApi.getBatchTrackStats(trackIds, user?.id);

      if (!isMounted) return;

      // Store data for rendering
      setCommunityTracks(allCommunityTracks);
      setCommunityStats(statsMap);
      setPlaylistItems([...playlists]);
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

  return (
    <ScrollView
      style={styles.screen}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.contentContainer}
    >
      {listsLoading ? (
        <>
          <HealingCommunitySkeleton />
          <PlaylistRailSkeleton />
        </>
      ) : (
        <>
          <HealingCommunitySection tracks={communityTracks} stats={communityStats} />

          <PlaylistRail
            title="Curated for you"
            description="Fresh rotations for the mood you're in."
            playlists={playlistItems}
            onPlaylistPress={handlePlaylistPress}
          />
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
});
