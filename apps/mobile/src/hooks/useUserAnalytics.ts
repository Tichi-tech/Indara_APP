import { useCallback, useEffect, useMemo, useState } from 'react';

import { musicApi } from '@/services/musicApi';
import { useAuth } from '@/hooks/useAuth';

type StatsResponse = {
  total_tracks: number;
  total_plays: number;
  total_likes: number;
  credits_used: number;
};

type PopularTrack = {
  id: string;
  title: string;
  thumbnail_url?: string;
  created_at: string;
  plays: number;
  likes: number;
};

export function useUserAnalytics() {
  const { user } = useAuth();

  const [stats, setStats] = useState<StatsResponse>({
    total_tracks: 0,
    total_plays: 0,
    total_likes: 0,
    credits_used: 0,
  });
  const [popularTracks, setPopularTracks] = useState<PopularTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [statsResult, popularResult] = await Promise.all([
        musicApi.getUserStats(user.id),
        musicApi.getUserPopularTracks(user.id),
      ]);

      if (statsResult.data) {
        setStats(statsResult.data);
      }

      if (Array.isArray(popularResult.data)) {
        setPopularTracks([...popularResult.data]);
      } else {
        setPopularTracks([]);
      }
    } catch (err) {
      console.error('Failed to load user analytics', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const mappedStats = useMemo(() => ({
    totalTracks: stats.total_tracks ?? 0,
    totalPlays: stats.total_plays ?? 0,
    totalLikes: stats.total_likes ?? 0,
    creditsUsed: stats.credits_used ?? 0,
  }), [stats.total_tracks, stats.total_plays, stats.total_likes, stats.credits_used]);

  const transformedTracks = useMemo(
    () => popularTracks.map((track) => ({
      id: track.id,
      title: track.title,
      createdAt: track.created_at,
      thumbnailUrl: track.thumbnail_url,
      plays: track.plays,
      likes: track.likes,
    })),
    [popularTracks]
  );

  const averagePlaysPerTrack = mappedStats.totalTracks > 0
    ? Math.round(mappedStats.totalPlays / mappedStats.totalTracks)
    : 0;

  const averageLikesPerTrack = mappedStats.totalTracks > 0
    ? Math.round(mappedStats.totalLikes / mappedStats.totalTracks)
    : 0;

  const engagementRate = mappedStats.totalPlays > 0
    ? Math.round((mappedStats.totalLikes / mappedStats.totalPlays) * 100)
    : 0;

  return {
    stats: mappedStats,
    popularTracks: transformedTracks,
    loading,
    error,
    averagePlaysPerTrack,
    averageLikesPerTrack,
    engagementRate,
    refresh: fetchAnalytics,
  };
}
