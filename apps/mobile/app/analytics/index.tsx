import { useRouter } from 'expo-router';
import { useMemo } from 'react';

import { AnalyticsDashboard } from '@/screens';
import { useUserAnalytics } from '@/hooks/useUserAnalytics';
import { useAuth } from '@/hooks/useAuth';
import { isAdminUser } from '@/lib/supabase';

export default function AnalyticsScreen() {
  const router = useRouter();
  const {
    stats,
    popularTracks,
    loading,
    error,
    averagePlaysPerTrack,
    averageLikesPerTrack,
    engagementRate,
    refresh,
  } = useUserAnalytics();

  const transformedTracks = useMemo(
    () =>
      popularTracks.map((track) => ({
        id: track.id,
        title: track.title,
        createdAt: track.createdAt,
        thumbnailUrl: track.thumbnailUrl,
        plays: track.plays,
        likes: track.likes,
      })),
    [popularTracks]
  );

  const { user } = useAuth();
  const accountInitial = (user?.email ?? user?.user_metadata?.name ?? 'S').charAt(0).toUpperCase();
  const isAdmin = isAdminUser(user);

  return (
    <AnalyticsDashboard
      onBack={() => router.back()}
      onRefresh={refresh}
      stats={stats}
      popularTracks={transformedTracks}
      averagePlaysPerTrack={averagePlaysPerTrack}
      averageLikesPerTrack={averageLikesPerTrack}
      engagementRate={engagementRate}
      loading={loading}
      error={error}
      isAdmin={isAdmin}
      bottomNavProps={{
        active: 'account',
        onHome: () => router.replace('/(tabs)/index'),
        onLibrary: () => router.replace('/(tabs)/now-playing'),
        onCreate: () => router.replace('/(tabs)/player'),
        onInbox: () => router.replace('/(tabs)/inbox'),
        onAccount: () => router.replace('/(tabs)/profile'),
        accountInitial,
      }}
    />
  );
}
