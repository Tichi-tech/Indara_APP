import { useEffect, useRef } from 'react';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

type RealtimeHandlers = {
  onJobUpdate?: (job: any) => void;
  onNewFeaturedTrack?: (track: any) => void;
  onTrackUpdate?: (track: any) => void;
};

export function useRealtimeUpdates(handlers: RealtimeHandlers) {
  const { user } = useAuth();

  // Store handlers in a ref to avoid re-subscribing when they change
  const handlersRef = useRef(handlers);

  // Update ref when handlers change, but don't trigger re-subscription
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!user?.id) return;

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
          handlersRef.current.onJobUpdate?.(payload.new);
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
            handlersRef.current.onNewFeaturedTrack?.(track);
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
            handlersRef.current.onNewFeaturedTrack?.(track);
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
          handlersRef.current.onTrackUpdate?.(payload.new ?? payload.old);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(jobChannel);
      supabase.removeChannel(communityChannel);
      supabase.removeChannel(userTracksChannel);
    };
  }, [user?.id]);
}
