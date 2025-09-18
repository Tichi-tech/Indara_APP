import { useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface RealtimeUpdateHandlers {
  onJobUpdate?: (job: any) => void;
  onNewFeaturedTrack?: (track: any) => void;
  onTrackUpdate?: (track: any) => void;
}

export const useRealtimeUpdates = (handlers: RealtimeUpdateHandlers) => {
  const { user } = useAuth();

  const setupSubscriptions = useCallback(() => {
    if (!user?.id) return () => {};

    console.log('🔔 Setting up real-time subscriptions for user:', user.id);

    // Subscribe to job status updates for current user
    const jobChannel = supabase
      .channel('job_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'jobs',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔄 Job updated:', payload.new);
          handlers.onJobUpdate?.(payload.new);
        }
      )
      .subscribe();

    // Subscribe to new featured community tracks
    const communityChannel = supabase
      .channel('community_tracks')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'generated_tracks',
          filter: 'is_featured=eq.true'
        },
        (payload) => {
          console.log('🎵 New featured track:', payload.new);
          handlers.onNewFeaturedTrack?.(payload.new);
        }
      )
      .subscribe();

    // Subscribe to updates on user's own tracks
    const userTracksChannel = supabase
      .channel('user_tracks')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'generated_tracks',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🎶 User track updated:', payload);
          handlers.onTrackUpdate?.(payload.new || payload.old);
        }
      )
      .subscribe();

    // Cleanup function
    return () => {
      console.log('🔕 Cleaning up real-time subscriptions');
      supabase.removeChannel(jobChannel);
      supabase.removeChannel(communityChannel);
      supabase.removeChannel(userTracksChannel);
    };
  }, [user?.id, handlers]);

  useEffect(() => {
    const cleanup = setupSubscriptions();
    return cleanup;
  }, [setupSubscriptions]);

  // Return manual subscription control if needed
  return {
    resubscribe: setupSubscriptions
  };
};