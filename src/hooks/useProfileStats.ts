import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface ProfileStats {
  tracksCount: number;
  likesCount: number;
  followersCount: number;
  joinedDate: string;
}

export const useProfileStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ProfileStats>({
    tracksCount: 0,
    likesCount: 0,
    followersCount: 0,
    joinedDate: ''
  });
  const [loading, setLoading] = useState(true);

  // Fetch initial stats
  const fetchStats = async () => {
    if (!user?.id) return;

    try {
      console.log('📊 Fetching profile stats for user:', user.id);

      // Get tracks count
      const { count: tracksCount } = await supabase
        .from('generated_tracks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get total likes received on user's tracks
      const { count: likesCount } = await supabase
        .from('likes')
        .select('*, generated_tracks!inner(user_id)', { count: 'exact', head: true })
        .eq('generated_tracks.user_id', user.id);

      // Get followers count (assuming you have a follows table)
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user.id);

      // Get joined date from auth user or profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('user_id', user.id)
        .single();

      const joinedDate = profile?.created_at
        ? new Date(profile.created_at).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
          })
        : new Date(user.created_at).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric'
          });

      const newStats = {
        tracksCount: tracksCount || 0,
        likesCount: likesCount || 0,
        followersCount: followersCount || 0,
        joinedDate
      };

      console.log('📊 Profile stats loaded:', newStats);
      setStats(newStats);
    } catch (error) {
      console.error('❌ Error fetching profile stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user?.id) return;

    fetchStats();

    console.log('🔴 Setting up real-time subscriptions for profile stats...');

    // Subscribe to tracks changes
    const tracksSubscription = supabase
      .channel('user_tracks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'generated_tracks',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🎵 Tracks change detected:', payload);
          fetchStats(); // Refetch all stats when tracks change
        }
      )
      .subscribe();

    // Subscribe to likes changes on user's tracks
    const likesSubscription = supabase
      .channel('user_likes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'likes'
        },
        (payload) => {
          console.log('❤️ Likes change detected:', payload);
          fetchStats(); // Refetch all stats when likes change
        }
      )
      .subscribe();

    // Subscribe to followers changes
    const followsSubscription = supabase
      .channel('user_follows')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `following_id=eq.${user.id}`
        },
        (payload) => {
          console.log('👥 Followers change detected:', payload);
          fetchStats(); // Refetch all stats when followers change
        }
      )
      .subscribe();

    // Subscribe to profile changes
    const profileSubscription = supabase
      .channel('user_profile')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('👤 Profile change detected:', payload);
          fetchStats(); // Refetch all stats when profile changes
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      console.log('🔴 Cleaning up real-time subscriptions...');
      tracksSubscription.unsubscribe();
      likesSubscription.unsubscribe();
      followsSubscription.unsubscribe();
      profileSubscription.unsubscribe();
    };
  }, [user?.id]);

  return {
    stats,
    loading,
    refreshStats: fetchStats
  };
};