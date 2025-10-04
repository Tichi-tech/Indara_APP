import { supabase } from '@/lib/supabase';
import { getSmartThumbnail } from '@/utils/thumbnailMatcher';

type TrackStats = {
  plays: number;
  likes: number;
  isLiked?: boolean;
};

const resolveImage = (uri?: string | null) => {
  if (!uri) return undefined;
  if (uri.startsWith('http')) return uri;
  return `https://app.indara.live${uri}`;
};

export const musicApi = {
  async getCommunityTracks(limit = 50, offset = 0) {
    const { data, error } = await supabase
      .from('tracks_with_profiles')
      .select(`
        id,
        title,
        prompt,
        admin_notes,
        style,
        duration,
        audio_url,
        created_at,
        is_published,
        is_featured,
        admin_rating,
        user_id,
        display_name
      `)
      .or('is_published.eq.true,is_featured.eq.true')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Failed to fetch community tracks', error);
      return { data: [], error } as const;
    }

      const transformed = (data || []).map((track: any) => ({
        id: track.id,
        title: track.title || 'Untitled',
        description: track.prompt || track.admin_notes || '',
        tags: track.style || '',
        duration: track.duration || '3:45',
        audio_url: track.audio_url ?? undefined,
        createdAt: track.created_at,
        creator: track.display_name || 'Community Artist',
        image: getSmartThumbnail(track.title || '', track.prompt || '', track.style || ''),
        raw: track,
      }));

    return { data: transformed, error: null } as const;
  },

  async getHomeScreenPlaylists() {
    const { data, error } = await supabase
      .from('playlists')
      .select(`
        *,
        playlist_tracks(
          track_id,
          generated_tracks(*)
        )
      `)
      .eq('is_system', true);

    if (error) {
      console.error('Failed to fetch home playlists', error);
      return { data: [], error } as const;
    }

    const transformed = (data || []).map((playlist: any) => {
      const tracks = playlist.playlist_tracks || [];
      const totalDuration = tracks.reduce((sum: number, playlistTrack: any) => {
        const track = playlistTrack.generated_tracks;
        if (track?.duration) {
          const [minutes, seconds] = track.duration.split(':').map(Number);
          return sum + minutes * 60 + seconds;
        }
        return sum;
      }, 0);

      const totalMinutes = Math.floor(totalDuration / 60);
      const remainingSeconds = totalDuration % 60;
      const formattedDuration = `${totalMinutes}:${String(remainingSeconds).padStart(2, '0')}`;

      const getPlaylistImage = (name: string, thumbnailUrl?: string) => {
        if (thumbnailUrl) return resolveImage(thumbnailUrl);

        const lower = name.toLowerCase();
        if (lower.includes('sleep')) return resolveImage('/thumbnails/sleep/sleep-soothing.png');
        if (lower.includes('meditation')) return resolveImage('/thumbnails/meditation/Meditation-clam.png');
        if (lower.includes('anxiety') || lower.includes('calm')) return resolveImage('/thumbnails/relax/relax-calm.png');
        if (lower.includes('focus')) return resolveImage('/thumbnails/study/study-focus.png');
        if (lower.includes('nature') || lower.includes('forest')) return resolveImage('/thumbnails/forest/nature-healing.png');
        return resolveImage('/thumbnails/ambient/ambient-sunset.png');
      };

      return {
        id: playlist.id,
        title: playlist.name || playlist.title,
        description: playlist.description || '',
        image: getPlaylistImage(playlist.name || playlist.title || '', playlist.thumbnail_url),
        creator: playlist.creator || 'Indara',
        trackCount: tracks.length,
        duration: formattedDuration,
      };
    });

    return { data: transformed, error: null } as const;
  },

  async getUserStats(userId: string) {
    try {
      const { data, error } = await supabase.rpc('get_user_stats', {
        p_user_id: userId,
      });

      if (error) throw error;

      const stats = data ?? {};
      return {
        data: {
          total_tracks: stats.total_tracks ?? 0,
          total_plays: stats.total_plays ?? 0,
          total_likes: stats.total_likes ?? 0,
          credits_used: stats.credits_used ?? 0,
        },
        error: null,
      } as const;
    } catch (error) {
      console.error('Failed to fetch user stats', error);
      return {
        data: {
          total_tracks: 0,
          total_plays: 0,
          total_likes: 0,
          credits_used: 0,
        },
        error,
      } as const;
    }
  },

  async getUserPopularTracks(userId: string) {
    const { data, error } = await supabase
      .from('generated_tracks')
      .select(`
        id,
        title,
        prompt,
        admin_notes,
        style,
        created_at,
        thumbnail_url,
        track_plays(count),
        track_likes(count)
      `)
      .eq('user_id', userId)
      .order('track_plays', { ascending: false, foreignTable: 'track_plays' })
      .limit(5);

    if (error) {
      console.error('Failed to fetch user popular tracks', error);
      return { data: [], error } as const;
    }

    const transformed = (data || []).map((track: any) => ({
      id: track.id,
      title: track.title || 'Untitled',
      created_at: track.created_at,
      thumbnail_url:
        resolveImage(track.thumbnail_url) ??
        getSmartThumbnail(
          track.title || '',
          track.prompt || track.admin_notes || '',
          track.style || ''
        ),
      plays: track.track_plays?.[0]?.count ?? 0,
      likes: track.track_likes?.[0]?.count ?? 0,
    }));

    return { data: transformed, error: null } as const;
  },

  async getTrackStats(trackId: string, _userId?: string | null) {
    if (!trackId) return { data: null, error: null } as const;

    try {
      const { data, error } = await supabase
        .from('track_stats_view')
        .select('track_id, play_count, like_count')
        .eq('track_id', trackId)
        .maybeSingle();

      if (error) {
        if ((error as any)?.code !== '42P01') {
          console.warn('Failed to fetch track stats', error);
        }
        return { data: null, error } as const;
      }

      if (!data) {
        return { data: { plays: 0, likes: 0, isLiked: false }, error: null } as const;
      }

      return {
        data: { plays: data.play_count ?? 0, likes: data.like_count ?? 0, isLiked: false },
        error: null,
      } as const;
    } catch (e: any) {
      if (e?.code !== '42P01') {
        console.warn('Failed to fetch track stats', e);
      }
      return { data: { plays: 0, likes: 0, isLiked: false }, error: null } as const;
    }
  },

  async recordPlay(userId: string | null, trackId: string) {
    const { error } = await supabase.from('track_plays').insert({ track_id: trackId, user_id: userId });
    if (error) {
      console.error('Failed to record play', error);
    }
  },

  subscribeToTrackStats(trackIds: string[], callback: (trackId: string, stats: TrackStats) => void) {
    if (!trackIds.length) return () => {};

    const list = trackIds.map((id) => `"${id}"`).join(',');
    try {
      const channel = supabase
      .channel('track-stats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'track_stats_view',
          filter: `track_id=in.(${list})`,
        },
        (payload) => {
          const newRow: any = payload.new;
          if (!newRow?.track_id) return;
          callback(newRow.track_id, {
            plays: newRow.play_count ?? 0,
            likes: newRow.like_count ?? 0,
          });
        }
      )
      .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error) {
      return () => {};
    }
  },

  async generateMusic(params: {
    user_text: string;
    title?: string;
    style?: string;
    duration_sec?: number;
    engine?: string;
  }) {
    try {
      const { data, error } = await supabase.functions.invoke('compose-music', {
        body: {
          user_text: params.user_text,
          title: params.title,
          style: params.style ?? 'ambient',
          duration_sec: params.duration_sec ?? 180,
          engine: params.engine ?? 'suno',
        },
      });

      if (error) throw error;
      return { data, error: null } as const;
    } catch (error) {
      console.error('Failed to generate music', error);
      return { data: null, error } as const;
    }
  },

  async generateMeditationSession(params: {
    user_text: string;
    duration_sec?: number;
    use_therapist?: boolean;
  }) {
    try {
      const { data, error } = await supabase.functions.invoke('generate-meditation-session', {
        body: {
          user_text: params.user_text,
          duration_sec: params.duration_sec ?? 300,
          use_therapist: params.use_therapist ?? false,
        },
      });

      if (error) throw error;
      return { data, error: null } as const;
    } catch (error) {
      console.error('Failed to generate meditation session', error);
      return { data: null, error } as const;
    }
  },

  async checkJobStatus(jobId: string) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, generated_tracks(*)')
        .eq('id', jobId)
        .maybeSingle();

      if (error) throw error;
      return { data, error: null } as const;
    } catch (error) {
      console.error('Failed to check job status', error);
      return { data: null, error } as const;
    }
  },

  async getUserJobs(userId: string) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*, generated_tracks(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return { data: data || [], error: null } as const;
    } catch (error) {
      console.error('Failed to fetch user jobs', error);
      return { data: [], error } as const;
    }
  },

  async talkToDara(params: {
    userInput: string;
    sessionType?: string;
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  }) {
    try {
      const { data, error } = await supabase.functions.invoke('therapist-ai', {
        body: {
          userInput: params.userInput,
          sessionType: params.sessionType ?? 'music',
          conversationHistory: params.conversationHistory ?? [],
        },
      });

      if (error) throw error;
      return { data, error: null } as const;
    } catch (error) {
      console.error('Failed to talk to Dara', error);
      return { data: null, error } as const;
    }
  },

  async chatWithMeditationAssistant(params: {
    message: string;
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  }) {
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: params.message,
          conversationHistory: params.conversationHistory ?? [],
        },
      });

      if (error) throw error;
      return { data, error: null } as const;
    } catch (error) {
      console.error('Failed to chat with meditation assistant', error);
      return { data: null, error } as const;
    }
  },

  async likeTrack(userId: string, trackId: string) {
    try {
      const { data: existingLikes, error: lookupError } = await supabase
        .from('track_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('track_id', trackId)
        .maybeSingle();

      if (lookupError) throw lookupError;

      if (existingLikes) {
        const { error } = await supabase
          .from('track_likes')
          .delete()
          .eq('id', existingLikes.id);

        if (error) throw error;
        return { data: { liked: false }, error: null } as const;
      }

      const { error } = await supabase
        .from('track_likes')
        .insert({ user_id: userId, track_id: trackId });

      if (error) throw error;
      return { data: { liked: true }, error: null } as const;
    } catch (error) {
      console.error('Failed to toggle like', error);
      return { data: null, error } as const;
    }
  },

  async getUserTracks(userId: string) {
    try {
      const { data, error } = await supabase
        .from('generated_tracks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data ?? [], error: null } as const;
    } catch (error) {
      console.error('Failed to fetch user tracks', error);
      return { data: [], error } as const;
    }
  },

  async getUserPlaylists(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_save_playlists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformed = (data ?? []).map((item: any) => ({
        id: item.id,
        name: item.name ?? 'Untitled',
        trackCount: item.track_count ?? 0,
        image:
          resolveImage(item.thumbnail_url) ??
          getSmartThumbnail(item.name ?? 'Playlist', '', ''),
      }));

      return { data: transformed, error: null } as const;
    } catch (error) {
      console.error('Failed to fetch user playlists', error);
      return { data: [], error } as const;
    }
  },

  async getPlaylistTracks(playlistId: string) {
    try {
      const { data, error } = await supabase
        .from('playlist_tracks')
        .select('*, generated_tracks(*)')
        .eq('playlist_id', playlistId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformed = (data ?? []).map((item: any) => {
        const track = item.generated_tracks ?? {};
        return {
          id: track.id,
          title: track.title ?? 'Untitled',
          prompt: track.prompt ?? '',
          admin_notes: track.admin_notes ?? '',
          style: track.style ?? '',
          duration: track.duration ?? '3:45',
          audio_url: track.audio_url ?? undefined,
          thumbnail_url: resolveImage(track.thumbnail_url),
          created_at: track.created_at,
          admin_rating: track.admin_rating ?? null,
        };
      });

      return { data: transformed, error: null } as const;
    } catch (error) {
      console.error('Failed to fetch playlist tracks', error);
      return { data: [], error } as const;
    }
  },

  async publishTrackToCommunity(trackId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('generated_tracks')
        .update({ is_published: true })
        .eq('id', trackId)
        .eq('user_id', userId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return { data, error: null } as const;
    } catch (error) {
      console.error('Failed to publish track', error);
      return { data: null, error } as const;
    }
  },

  async unpublishTrack(trackId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('generated_tracks')
        .update({ is_published: false })
        .eq('id', trackId)
        .eq('user_id', userId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return { data, error: null } as const;
    } catch (error) {
      console.error('Failed to unpublish track', error);
      return { data: null, error } as const;
    }
  },
};
