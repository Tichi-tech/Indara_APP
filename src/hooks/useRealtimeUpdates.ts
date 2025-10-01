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

    // Subscribe to new community tracks (both featured and published)
    const communityChannel = supabase
      .channel('community_tracks')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'generated_tracks'
        },
        (payload) => {
          // Check if the track is either featured or published
          const track = payload.new;
          if (track.is_featured === true || track.is_published === true) {
            console.log('🎵 New community track (featured or published):', track);
            handlers.onNewFeaturedTrack?.(track);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'generated_tracks'
        },
        (payload) => {
          // Check if the track became featured or published
          const track = payload.new;
          if (track.is_featured === true || track.is_published === true) {
            console.log('🎵 Track updated to community (featured or published):', track);
            handlers.onNewFeaturedTrack?.(track);
          }
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