import { useState, useEffect } from 'react';
import { musicApi } from '../lib/supabase';
import { useAuth } from './useAuth';

interface UserStats {
  total_tracks: number;
  total_plays: number;
  total_likes: number;
  credits_used: number;
}

interface PopularTrack {
  id: string;
  title: string;
  thumbnail_url?: string;
  created_at: string;
  track_plays: { count: number }[];
  track_likes: { count: number }[];
}

export const useUserAnalytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    total_tracks: 0,
    total_plays: 0,
    total_likes: 0,
    credits_used: 0
  });
  const [popularTracks, setPopularTracks] = useState<PopularTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserAnalytics = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch user stats and popular tracks in parallel
      const [statsResult, tracksResult] = await Promise.all([
        musicApi.getUserStats(user.id),
        musicApi.getUserPopularTracks(user.id)
      ]);

      // Handle stats
      if (statsResult.data) {
        setStats(statsResult.data);
      }

      // Handle popular tracks
      if (tracksResult.data) {
        setPopularTracks(tracksResult.data);
      }

    } catch (err) {
      console.error('Error fetching user analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  // Fetch analytics when user changes
  useEffect(() => {
    fetchUserAnalytics();
  }, [user?.id]);

  // Calculate derived stats
  const averagePlaysPerTrack = stats.total_tracks > 0
    ? Math.round(stats.total_plays / stats.total_tracks)
    : 0;

  const averageLikesPerTrack = stats.total_tracks > 0
    ? Math.round(stats.total_likes / stats.total_tracks)
    : 0;

  const engagementRate = stats.total_plays > 0
    ? Math.round((stats.total_likes / stats.total_plays) * 100)
    : 0;

  return {
    // Raw data
    stats,
    popularTracks,
    loading,
    error,

    // Calculated metrics
    averagePlaysPerTrack,
    averageLikesPerTrack,
    engagementRate,

    // Actions
    refresh: fetchUserAnalytics
  };
};