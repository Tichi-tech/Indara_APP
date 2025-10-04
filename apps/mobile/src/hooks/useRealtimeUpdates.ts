import { useCallback, useEffect } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

type RealtimeHandlers = {
  onJobUpdate?: (job: any) => void;
  onNewFeaturedTrack?: (track: any) => void;
  onTrackUpdate?: (track: any) => void;
};

export function useRealtimeUpdates(handlers: RealtimeHandlers) {
  const { user } = useAuth();

  const setup = useCallback(() => {
    if (!user?.id) return () => {};

    const jobChannel = supabase
      .channel('job_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'jobs',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          handlers.onJobUpdate?.(payload.new);
        }
      )
      .subscribe();

    const communityChannel = supabase
      .channel('community_tracks')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'generated_tracks',
        },
        (payload) => {
          const track = payload.new;
          if (track.is_featured || track.is_published) {
            handlers.onNewFeaturedTrack?.(track);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'generated_tracks',
        },
        (payload) => {
          const track = payload.new;
          if (track.is_featured || track.is_published) {
            handlers.onNewFeaturedTrack?.(track);
          }
        }
      )
      .subscribe();

    const userTracksChannel = supabase
      .channel('user_tracks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'generated_tracks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          handlers.onTrackUpdate?.(payload.new ?? payload.old);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(jobChannel);
      supabase.removeChannel(communityChannel);
      supabase.removeChannel(userTracksChannel);
    };
  }, [user?.id, handlers]);

  useEffect(() => {
    const cleanup = setup();
    return cleanup;
  }, [setup]);

  return { resubscribe: setup };
}
