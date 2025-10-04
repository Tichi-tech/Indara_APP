import { createClient } from '@supabase/supabase-js'
import { resolveThumbnailUri } from './utils/thumbnailMatcher.js'


const SUPABASE_URL_KEYS = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'VITE_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_URL',
];

const SUPABASE_ANON_KEY_KEYS = [
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_ANON_KEY',
];

const SUPABASE_REDIRECT_KEYS = [
  'EXPO_PUBLIC_SUPABASE_REDIRECT_URL',
  'VITE_SUPABASE_REDIRECT_URL',
  'NEXT_PUBLIC_SUPABASE_REDIRECT_URL',
  'SUPABASE_REDIRECT_URL',
];

type EnvRecord = Record<string, string | undefined>;

const importMetaEnv: EnvRecord | undefined =
  typeof import.meta !== 'undefined' && import.meta && typeof import.meta === 'object'
    ? ((import.meta as any).env as EnvRecord | undefined)
    : undefined;

const processEnv: EnvRecord | undefined =
  typeof process !== 'undefined' && process?.env
    ? (process.env as EnvRecord)
    : undefined;

const envSources: EnvRecord[] = [processEnv, importMetaEnv].filter(Boolean) as EnvRecord[];

const readEnv = (keys: string[], fallback?: string) => {
  for (const source of envSources) {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'string' && value.length > 0) {
        return value;
      }
    }
  }
  return fallback;
};

const supabaseUrl = readEnv(SUPABASE_URL_KEYS, 'https://mtypyrdsboxrgzsxwsk.supabase.co')!;
const supabaseAnonKey = readEnv(SUPABASE_ANON_KEY_KEYS, 'placeholder-anon-key')!;
const explicitRedirect = readEnv(SUPABASE_REDIRECT_KEYS);
const isPlaceholder = supabaseAnonKey.includes('placeholder') || supabaseAnonKey === 'placeholder-anon-key';

// Note: You should set these in your environment for security
console.log('[supabase] Connecting to:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const resolveRedirectUrl = () => {
  if (typeof window !== 'undefined' && window?.location?.origin) {
    return window.location.origin;
  }
  return explicitRedirect ?? null;
};

const getRedirectOrThrow = () => {
  const redirect = resolveRedirectUrl();
  if (!redirect) {
    throw new Error('Supabase OAuth redirect URL is not configured. Provide SUPABASE_REDIRECT_URL for non-browser environments.');
  }
  return redirect;
};

// Auth helpers
export const auth = {
  signUp: async (email: string, password: string, metadata?: any) => {
    if (isPlaceholder) {
      // Demo mode - simulate successful signup
      return {
        data: {
          user: {
            id: 'demo-user-signup',
            email: email,
            user_metadata: { name: metadata?.name || 'Demo User' }
          },
          session: { access_token: 'demo-token' }
        },
        error: null
      }
    }
    
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
  },

  signIn: async (email: string, password: string) => {
    if (isPlaceholder) {
      // Demo mode - simulate successful signin
      return {
        data: {
          user: {
            id: 'demo-user-signin',
            email: email,
            user_metadata: { name: 'Demo User' }
          },
          session: { access_token: 'demo-token' }
        },
        error: null
      }
    }
    
    return await supabase.auth.signInWithPassword({
      email,
      password
    })
  },

  signInWithGoogle: async () => {
    console.log('🔍 STEP 1: Starting Google sign-in process...')
    console.log('🔍 STEP 2: Supabase URL:', supabaseUrl)
    console.log('🔍 STEP 3: Supabase Key:', supabaseAnonKey.substring(0, 20) + '...')
    console.log('🔍 STEP 4: Is placeholder?', isPlaceholder)
    console.log('[supabase] STEP 4.5: Current redirect origin:', resolveRedirectUrl())
    if (typeof window !== 'undefined') {
      console.log('[supabase] STEP 4.6: Current full URL:', window.location.href);
    }
    
    if (isPlaceholder) {
      console.warn('[supabase] Placeholder Supabase credentials detected - OAuth will not work')
      return { 
        data: { 
          user: {
            id: 'demo-user-google',
            email: 'google@example.com',
            user_metadata: { name: 'Google User' }
          },
          session: { access_token: 'demo-token' }
        }, 
        error: null 
      }
    }
    
    try {
      console.log('🚀 STEP 5: Calling supabase.auth.signInWithOAuth...')
      
      // Use the current origin for redirect
      const redirectTo = getRedirectOrThrow()
      console.log('🔍 STEP 5.5: Redirect URL will be:', redirectTo)
      
      const oauthOptions = {
        provider: 'google' as const,
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false
        }
      }
      
      console.log('🚀 STEP 6: OAuth options:', oauthOptions)
      
      const result = await supabase.auth.signInWithOAuth(oauthOptions)
      
      console.log('✅ STEP 8: OAuth call completed')
      console.log('✅ STEP 9: Result data:', result.data)
      console.log('✅ STEP 10: Result error:', result.error)
      
      return result
    } catch (error) {
      console.error('❌ STEP ERROR: Google OAuth catch block:', error)
      console.error('❌ Error type:', typeof error)
      console.error('❌ Error message:', error instanceof Error ? error.message : 'Unknown error')
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack')
      return { 
        data: null, 
        error: { 
          message: `Google sign-in failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
        } 
      }
    }
  },

  signInWithApple: async () => {
    if (isPlaceholder) {
      console.warn('[supabase] Placeholder Supabase credentials detected - OAuth will not work')
      return { 
        data: { 
          user: {
            id: 'demo-user-apple',
            email: 'apple@example.com',
            user_metadata: { name: 'Apple User' }
          },
          session: { access_token: 'demo-token' }
        }, 
        error: null 
      }
    }
    
    return await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: getRedirectOrThrow()
      }
    })
  },

  signInWithFacebook: async () => {
    if (isPlaceholder) {
      console.warn('[supabase] Placeholder Supabase credentials detected - OAuth will not work')
      return { 
        data: { 
          user: {
            id: 'demo-user-facebook',
            email: 'facebook@example.com',
            user_metadata: { name: 'Facebook User' }
          },
          session: { access_token: 'demo-token' }
        }, 
        error: null 
      }
    }
    
    return await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: getRedirectOrThrow()
      }
    })
  },

  signInWithDiscord: async () => {
    if (isPlaceholder) {
      console.warn('[supabase] Placeholder Supabase credentials detected - OAuth will not work')
      return { 
        data: { 
          user: {
            id: 'demo-user-discord',
            email: 'discord@example.com',
            user_metadata: { name: 'Discord User' }
          },
          session: { access_token: 'demo-token' }
        }, 
        error: null 
      }
    }
    
    return await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: getRedirectOrThrow()
      }
    })
  },

  signInWithPhone: async (phone: string) => {
    // Check if we're using placeholder credentials
    if (isPlaceholder) {
      throw new Error('phone_provider_disabled: Phone authentication requires valid Supabase credentials')
    }
    
    // For now, always throw this error since phone provider needs to be configured
    throw new Error('phone_provider_disabled: Phone authentication is not configured. Please use email sign-in instead.')
    
    return await supabase.auth.signInWithOtp({
      phone
    })
  },

  verifyOtp: async (phone: string, token: string) => {
    // Check if we're using placeholder credentials
    if (isPlaceholder) {
      throw new Error('phone_provider_disabled: Phone verification requires valid Supabase credentials')
    }
    
    // For now, always throw this error since phone provider needs to be configured
    throw new Error('phone_provider_disabled: Phone verification is not configured. Please use email sign-in instead.')
    
    return await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    })
  },

  signOut: async () => {
    return await supabase.auth.signOut()
  },

  getCurrentUser: () => {
    return supabase.auth.getUser()
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helpers
export const db = {
  // User profiles - Updated to match your backend schema
  getUserProfile: async (userId: string) => {
    try {
      return await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
    } catch (error) {
      console.warn('Failed to fetch user profile:', error)
      return { data: null, error }
    }
  },

  updateUserProfile: async (userId: string, updates: { display_name?: string, avatar_url?: string, bio?: string, username?: string, phone?: string }) => {
    try {
      return await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId)
    } catch (error) {
      console.warn('Failed to update user profile:', error)
      return { data: null, error }
    }
  },

  // Subscription Management
  getUserSubscription: async (userId: string) => {
    try {
      return await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()
    } catch (error) {
      console.warn('Failed to fetch user subscription:', error)
      return { data: null, error }
    }
  },

  getSubscriptionPlans: async () => {
    try {
      return await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
    } catch (error) {
      console.warn('Failed to fetch subscription plans:', error)
      return { data: [], error }
    }
  },

  // Songs/Music
  getUserSongs: async (userId: string) => {
    try {
      return await supabase
        .from('generated_tracks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
    } catch (error) {
      console.warn('Failed to fetch user songs from database:', error)
      return { data: [], error: null }
    }
  },

  getPublicSongs: async () => {
    try {
      return await supabase
        .from('generated_tracks')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
    } catch (error) {
      console.warn('Failed to fetch public songs from database:', error)
      return { data: [], error: null }
    }
  },

  createSong: async (songData: any) => {
    try {
      return await supabase
        .from('generated_tracks')
        .insert(songData)
        .select()
        .single()
    } catch (error) {
      console.warn('Failed to save song to database:', error)
      return { data: null, error }
    }
  },

  updateSong: async (songId: string, updates: any) => {
    return await supabase
      .from('generated_tracks')
      .update(updates)
      .eq('id', songId)
  },

  deleteSong: async (songId: string) => {
    return await supabase
      .from('generated_tracks')
      .delete()
      .eq('id', songId)
  },

  // Likes
  likeSong: async (userId: string, songId: string) => {
    return await supabase
      .from('likes')
      .insert({ user_id: userId, song_id: songId })
  },

  unlikeSong: async (userId: string, songId: string) => {
    return await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('song_id', songId)
  },

  getSongLikes: async (songId: string) => {
    return await supabase
      .from('likes')
      .select('count')
      .eq('song_id', songId)
  },

  // Follows
  followUser: async (followerId: string, followingId: string) => {
    try {
      return await supabase
        .from('follows')
        .insert({ follower_id: followerId, following_id: followingId })
    } catch (error) {
      console.warn('Failed to follow user (table may not exist):', error)
      return { data: null, error }
    }
  },

  unfollowUser: async (followerId: string, followingId: string) => {
    try {
      return await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
    } catch (error) {
      console.warn('Failed to unfollow user (table may not exist):', error)
      return { data: null, error }
    }
  },

  getUserFollowers: async (userId: string) => {
    try {
      return await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', userId)
    } catch (error) {
      console.warn('Failed to fetch followers (table may not exist):', error)
      return { data: [], error: null }
    }
  },

  getUserFollowing: async (userId: string) => {
    try {
      return await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId)
    } catch (error) {
      console.warn('Failed to fetch following (table may not exist):', error)
      return { data: [], error: null }
    }
  }
}

// Music Generation & Playback
// Admin check function
export const isAdminUser = (user: any): boolean => {
  // Check if user has admin role or is part of admin emails
  const adminEmails = [
    'admin@indara.app',
    'chris.wang@wustl.com', // Primary admin email
    // Add more admin emails as needed
  ];

  return user && (
    user.user_metadata?.role === 'admin' ||
    user.app_metadata?.role === 'admin' ||
    adminEmails.includes(user.email)
  );
};


export const musicApi = {
  // Music Generation Functions
  generateMusic: async (params: {
    user_text: string;
    duration_sec?: number;
    engine?: string;
    style?: string;
  }) => {
    try {
      console.log('🎵 Generating music with params:', params);
      const { data, error } = await supabase.functions.invoke('compose-music', {
        body: {
          user_text: params.user_text,
          duration_sec: params.duration_sec || 30,
          engine: params.engine || 'suno',
          style: params.style || 'Ambient'
        }
      });

      if (error) throw error;
      console.log('✅ Music generation started:', data);
      return { data, error: null };
    } catch (error) {
      console.error('❌ Music generation failed:', error);
      return { data: null, error };
    }
  },


  // Job Status Checking - Debug Function
  checkJobStatus: async (jobId: string) => {
    try {
      console.log('🔍 Checking job status for ID:', jobId);
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;
      console.log('📊 Job status found:', data);
      return { data, error: null };
    } catch (error) {
      console.error('❌ Failed to check job status:', error);
      return { data: null, error };
    }
  },


  // Meditation Session Generation
  generateMeditationSession: async (params: {
    user_text: string;
    duration_sec?: number;
    use_therapist?: boolean;
  }) => {
    try {
      console.log('🧘 Generating meditation session with params:', params);
      const { data, error } = await supabase.functions.invoke('compose-session', {
        body: {
          user_text: params.user_text,
          duration_sec: params.duration_sec || 300, // Default 5 minutes
          use_therapist: params.use_therapist || false
        }
      });

      if (error) throw error;
      console.log('✅ Meditation session generation started:', data);
      return { data, error: null };
    } catch (error) {
      console.error('❌ Meditation session generation failed:', error);
      return { data: null, error };
    }
  },

  // Therapist AI - "Talk to Dara"
  talkToDara: async (params: {
    userInput: string;
    sessionType?: string;
    conversationHistory?: any[];
  }) => {
    try {
      console.log('🤖 Talking to Dara with input:', params.userInput);
      const { data, error } = await supabase.functions.invoke('therapist-ai', {
        body: {
          userInput: params.userInput,
          sessionType: params.sessionType || 'meditation',
          conversationHistory: params.conversationHistory || []
        }
      });

      if (error) throw error;
      console.log('✅ Dara response received:', data);
      return { data, error: null };
    } catch (error) {
      console.error('❌ Therapist AI failed:', error);
      return { data: null, error };
    }
  },

  // AI Chat - Meditation Assistant
  chatWithMeditationAssistant: async (params: {
    message: string;
    conversationHistory?: any[];
  }) => {
    try {
      console.log('💬 Chatting with meditation assistant:', params.message);
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: params.message,
          conversationHistory: params.conversationHistory || []
        }
      });

      if (error) throw error;
      console.log('✅ Assistant response received:', data);
      return { data, error: null };
    } catch (error) {
      console.error('❌ AI chat failed:', error);
      return { data: null, error };
    }
  },

  // Meditation Therapist AI
  meditationTherapistAI: async (params: {
    userInput: string;
    sessionType?: string;
    conversationHistory?: any[];
  }) => {
    try {
      console.log('🧘 Talking to meditation therapist with input:', params.userInput);
      const { data, error } = await supabase.functions.invoke('meditation-therapist-ai', {
        body: {
          userInput: params.userInput,
          sessionType: params.sessionType || 'meditation',
          conversationHistory: params.conversationHistory || []
        }
      });

      if (error) throw error;
      console.log('✅ Meditation therapist response received:', data);
      return { data, error: null };
    } catch (error) {
      console.error('❌ Meditation therapist AI failed:', error);
      return { data: null, error };
    }
  },

  // Track Management

  getFeaturedTracks: async () => {
    try {
      const { data, error } = await supabase
        .from('generated_tracks')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('❌ Failed to fetch featured tracks:', error);
      return { data: [], error };
    }
  },

  // Track Interactions
  likeTrack: async (userId: string, trackId: string) => {
    try {
      // Check if already liked
      const { data: existingLikes, error: checkError } = await supabase
        .from('track_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('track_id', trackId);

      if (checkError) throw checkError;

      if (existingLikes && existingLikes.length > 0) {
        // Unlike
        const { error } = await supabase
          .from('track_likes')
          .delete()
          .eq('id', existingLikes[0].id);

        if (error) throw error;
        return { data: { liked: false, trackId }, error: null };
      } else {
        // Like
        const { data, error } = await supabase
          .from('track_likes')
          .insert({ user_id: userId, track_id: trackId })
          .select()
          .single();

        if (error) throw error;
        return { data: { liked: true, trackId }, error: null };
      }
    } catch (error) {
      console.error('❌ Failed to toggle like:', error);
      return { data: null, error };
    }
  },

  recordPlay: async (userId: string | null, trackId: string) => {
    try {
      const { data, error } = await supabase
        .from('track_plays')
        .insert({
          user_id: userId, // Can be null for anonymous plays
          track_id: trackId
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('❌ Failed to record play:', error);
      return { data: null, error };
    }
  },

  getTrackStats: async (trackId: string, userId?: string) => {
    try {
      // Get total likes count
      const { count: likesCount, error: likesError } = await supabase
        .from('track_likes')
        .select('*', { count: 'exact', head: true })
        .eq('track_id', trackId);

      if (likesError) {
        console.error('❌ Failed to get likes count:', likesError);
      }

      // Get total plays count
      const { count: playsCount, error: playsError } = await supabase
        .from('track_plays')
        .select('*', { count: 'exact', head: true })
        .eq('track_id', trackId);

      if (playsError) {
        console.error('❌ Failed to get plays count:', playsError);
      }

      // Check if current user has liked this track
      let isLiked = false;
      if (userId) {
        const { data: userLike, error: userLikeError } = await supabase
          .from('track_likes')
          .select('id')
          .eq('track_id', trackId)
          .eq('user_id', userId)
          .maybeSingle();

        if (userLikeError) {
          console.error('❌ Failed to check user like status:', userLikeError);
        } else {
          isLiked = !!userLike;
        }
      }

      return {
        data: {
          plays: playsCount || 0,
          likes: likesCount || 0,
          isLiked: isLiked
        },
        error: null
      };
    } catch (error) {
      console.error('❌ Failed to get track stats:', error);
      return { data: { plays: 0, likes: 0, isLiked: false }, error };
    }
  },

  // Job Management
  getUserJobs: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          therapy_plans(*),
          audio_assets(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('❌ Failed to fetch user jobs:', error);
      return { data: [], error };
    }
  },

  // Retry failed jobs or tracks without audio
  retryTrackGeneration: async (trackId: string, userId: string) => {
    try {
      console.log('🔄 Retrying track generation for:', trackId);

      // Get the original track details
      const { data: track, error: trackError } = await supabase
        .from('generated_tracks')
        .select('*')
        .eq('id', trackId)
        .eq('user_id', userId)
        .single();

      if (trackError || !track) {
        throw new Error('Track not found or not owned by user');
      }

      // If track already has audio, no need to retry
      if (track.audio_url) {
        console.log('✅ Track already has audio, no retry needed');
        return { data: track, error: null };
      }

      // Create new job with same parameters as original
      const jobData = {
        user_text: track.prompt || track.title || 'Peaceful healing music',
        duration_sec: 180, // Default 3 minutes
        engine: 'suno',
        style: track.style || 'Ambient'
      };

      const { data: newJob, error: jobError } = await musicApi.generateMusic(jobData);

      if (jobError) {
        throw new Error(`Failed to create retry job: ${(jobError as any)?.message || 'Unknown error'}`);
      }

      console.log('✅ Retry job created:', newJob);
      return { data: newJob, error: null };

    } catch (error) {
      console.error('❌ Failed to retry track generation:', error);
      return { data: null, error };
    }
  },

  cancelJob: async (userId: string, jobId: string) => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update({ status: 'cancelled' })
        .eq('id', jobId)
        .eq('user_id', userId)
        .eq('status', 'pending')
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('❌ Failed to cancel job:', error);
      return { data: null, error };
    }
  },

  // Track Management
  updateTrack: async (userId: string, trackId: string, updates: {
    title?: string;
    admin_notes?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('generated_tracks')
        .update(updates)
        .eq('id', trackId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('❌ Failed to update track:', error);
      return { data: null, error };
    }
  },

  deleteTrack: async (userId: string, trackId: string) => {
    try {
      const { data, error } = await supabase
        .from('generated_tracks')
        .delete()
        .eq('id', trackId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('❌ Failed to delete track:', error);
      return { data: null, error };
    }
  },

  // User Analytics Functions
  getUserStats: async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_user_stats', {
        p_user_id: userId
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('❌ Failed to get user stats:', error);
      // Return fallback stats if RPC fails
      return {
        data: {
          total_tracks: 0,
          total_plays: 0,
          total_likes: 0,
          credits_used: 0
        },
        error
      };
    }
  },

  getUserPopularTracks: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('generated_tracks')
        .select(`
          *,
          track_plays(count),
          track_likes(count),
          profiles!inner(display_name, avatar_url)
        `)
        .eq('user_id', userId)
        .order('track_plays.count', { ascending: false })
        .limit(5);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('❌ Failed to get popular tracks:', error);
      return { data: [], error };
    }
  },

  // Notification System
  createNotification: async (params: {
    user_id: string;
    type: 'like' | 'comment' | 'dm' | 'system' | 'follow' | 'track_featured';
    title: string;
    message: string;
    data?: any;
    sender_id?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: params.user_id,
          type: params.type,
          title: params.title,
          message: params.message,
          data: params.data || {},
          sender_id: params.sender_id,
          is_read: false
        })
        .select()
        .single();

      if (error) throw error;
      console.log('✅ Notification created:', data);
      return { data, error: null };
    } catch (error) {
      console.error('❌ Failed to create notification:', error);
      return { data: null, error };
    }
  },

  // Notification helpers for common actions
  notifyTrackLiked: async (trackOwnerId: string, likerUserId: string, trackId: string, trackTitle: string) => {
    if (trackOwnerId === likerUserId) return; // Don't notify self-likes

    try {
      const { data: liker } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', likerUserId)
        .single();

      return await musicApi.createNotification({
        user_id: trackOwnerId,
        type: 'like',
        title: 'New Like',
        message: `${liker?.display_name || 'Someone'} liked your track "${trackTitle}"`,
        data: { track_id: trackId, liker_id: likerUserId },
        sender_id: likerUserId
      });
    } catch (error) {
      console.error('❌ Failed to send like notification:', error);
      return { data: null, error };
    }
  },

  notifyTrackFeatured: async (userId: string, trackId: string, trackTitle: string) => {
    try {
      return await musicApi.createNotification({
        user_id: userId,
        type: 'track_featured',
        title: 'Track Featured!',
        message: `Your track "${trackTitle}" has been featured in the community!`,
        data: { track_id: trackId }
      });
    } catch (error) {
      console.error('❌ Failed to send featured notification:', error);
      return { data: null, error };
    }
  },

  notifyNewFollower: async (userId: string, followerId: string) => {
    if (userId === followerId) return; // Don't notify self-follows

    try {
      const { data: follower } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', followerId)
        .single();

      return await musicApi.createNotification({
        user_id: userId,
        type: 'follow',
        title: 'New Follower',
        message: `${follower?.display_name || 'Someone'} started following you`,
        data: { follower_id: followerId },
        sender_id: followerId
      });
    } catch (error) {
      console.error('❌ Failed to send follow notification:', error);
      return { data: null, error };
    }
  },

  sendDirectMessage: async (params: {
    sender_id: string;
    recipient_id: string;
    message: string;
  }) => {
    try {
      // Insert the message
      const { data: messageData, error: messageError } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: params.sender_id,
          recipient_id: params.recipient_id,
          message: params.message,
          is_read: false
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Get sender info for notification
      const { data: sender } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', params.sender_id)
        .single();

      // Create notification
      await musicApi.createNotification({
        user_id: params.recipient_id,
        type: 'dm',
        title: 'New Message',
        message: `${sender?.display_name || 'Someone'} sent you a message`,
        data: { message_id: messageData.id, sender_id: params.sender_id },
        sender_id: params.sender_id
      });

      return { data: messageData, error: null };
    } catch (error) {
      console.error('❌ Failed to send direct message:', error);
      return { data: null, error };
    }
  },

  // User Publishing System
  publishTrackToCommunity: async (trackId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('generated_tracks')
        .update({ is_published: true })
        .eq('id', trackId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      // Notify user about successful publishing
      await musicApi.createNotification({
        user_id: userId,
        type: 'system',
        title: 'Music Published! 🎵',
        message: 'Your track is now available in the community',
        data: { track_id: trackId }
      });

      return { data, error: null };
    } catch (error) {
      console.error('❌ Failed to publish track:', error);
      return { data: null, error };
    }
  },

  unpublishTrack: async (trackId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('generated_tracks')
        .update({ is_published: false })
        .eq('id', trackId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('❌ Failed to unpublish track:', error);
      return { data: null, error };
    }
  },

  // Get community tracks (both user-published and admin-featured) with display names
  // Optimized for 10,000+ users with pagination and selective fields
  getCommunityTracks: async (limit = 50, offset = 0) => {
    try {
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

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Failed to fetch community tracks:', error);
      return { data: [], error };
    }
  },

  // Get user's own tracks (both private and published)
  getUserTracks: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('generated_tracks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('Failed to fetch user tracks:', error);
      return { data: [], error };
    }
  },

  // Playlist Management
  createPlaylist: async (userId: string, name: string) => {
    try {
      const { data, error } = await supabase
        .from('user_save_playlists')
        .insert({
          user_id: userId,
          name: name.trim(),
          description: '',
          is_public: false,
          track_count: 0
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('❌ Failed to create playlist:', error);
      return { data: null, error };
    }
  },

  getUserPlaylists: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_save_playlists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('❌ Failed to fetch user playlists:', error);
      return { data: [], error };
    }
  },

  deletePlaylist: async (userId: string, playlistId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_save_playlists')
        .delete()
        .eq('id', playlistId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('❌ Failed to delete playlist:', error);
      return { data: null, error };
    }
  },

  getDirectMessages: async (userId: string, otherUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .select(`
          *,
          sender:profiles!sender_id(display_name, avatar_url),
          recipient:profiles!recipient_id(display_name, avatar_url)
        `)
        .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('❌ Failed to fetch direct messages:', error);
      return { data: [], error };
    }
  },

  // Real-time subscriptions for track stats
  subscribeToTrackStats: (trackIds: string[], onStatsUpdate: (trackId: string, stats: { plays: number; likes: number }) => void) => {
    const channels: any[] = [];

    // Subscribe to track_plays changes
    const playsChannel = supabase
      .channel('track_plays_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'track_plays',
          filter: `track_id=in.(${trackIds.join(',')})`
        },
        async (payload) => {
          if ((payload.new as any)?.track_id) {
            // Fetch updated stats for this track
            const { data } = await musicApi.getTrackStats((payload.new as any).track_id);
            if (data) {
              onStatsUpdate((payload.new as any).track_id, data);
            }
          }
        }
      )
      .subscribe();

    // Subscribe to track_likes changes
    const likesChannel = supabase
      .channel('track_likes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'track_likes',
          filter: `track_id=in.(${trackIds.join(',')})`
        },
        async (payload) => {
          const trackId = (payload.new as any)?.track_id || (payload.old as any)?.track_id;
          if (trackId) {
            // Fetch updated stats for this track
            const { data } = await musicApi.getTrackStats(trackId);
            if (data) {
              onStatsUpdate(trackId, data);
            }
          }
        }
      )
      .subscribe();

    channels.push(playsChannel, likesChannel);

    // Return cleanup function
    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  },

  // Get tracks for a specific playlist
  getPlaylistTracks: async (playlistId: string) => {
    try {
      const { data, error } = await supabase
        .from('playlist_tracks')
        .select(`
          *,
          generated_tracks(*)
        `)
        .eq('playlist_id', playlistId);

      if (error) throw error;

      // Transform the data to match the expected Track format
      const transformedTracks = (data || []).map((playlistTrack: any) => {
        const track = playlistTrack.generated_tracks;
        return {
          id: track.id,
          title: track.title || 'Untitled',
          admin_notes: track.admin_notes || '',
          prompt: track.prompt || '',
          style: track.style || '',
          duration: track.duration || '3:45',
          audio_url: track.audio_url,
          thumbnail_url: track.thumbnail_url,
          created_at: track.created_at,
          admin_rating: track.admin_rating,
          reviewed_by: track.reviewed_by,
          reviewed_at: track.reviewed_at,
          profiles: {
            display_name: track.user_id ? 'Community' : 'Unknown',
            avatar_url: null
          }
        };
      });

      return { data: transformedTracks, error: null };
    } catch (error) {
      console.error('❌ Failed to fetch playlist tracks:', error);
      return { data: [], error };
    }
  },

  // Sync playlists from web storage/admin panel
  getHomeScreenPlaylists: async () => {
    try {
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

      if (error) throw error;

      // Transform the data to match the HomeScreen Playlist interface
      const transformedPlaylists = (data || []).map((playlist: any) => {
        const tracks = playlist.playlist_tracks || [];
        const totalDuration = tracks.reduce((sum: number, playlistTrack: any) => {
          const track = playlistTrack.generated_tracks;
          if (track?.duration) {
            // Convert duration string to seconds and add to sum
            const [minutes, seconds] = track.duration.split(':').map(Number);
            return sum + (minutes * 60) + seconds;
          }
          return sum;
        }, 0);

        // Convert total seconds back to MM:SS format
        const totalMinutes = Math.floor(totalDuration / 60);
        const remainingSeconds = totalDuration % 60;
        const formattedDuration = `${totalMinutes}:${remainingSeconds.toString().padStart(2, '0')}`;

        // Smart fallback image based on playlist name/title
        const getPlaylistImage = (name: string, thumbnailUrl?: string) => {
          if (thumbnailUrl) return resolveThumbnailUri(thumbnailUrl);

          const title = name.toLowerCase();
          if (title.includes('anxiety') || title.includes('stress') || title.includes('calm')) {
            return resolveThumbnailUri('/thumbnails/relax/relax-calm.png');
          } else if (title.includes('sleep') || title.includes('soothing')) {
            return resolveThumbnailUri('/thumbnails/sleep/sleep-soothing.png');
          } else if (title.includes('yoga')) {
            return resolveThumbnailUri('/thumbnails/yoga/Yoga-relax.png');
          } else if (title.includes('baby') || title.includes('lullaby')) {
            return resolveThumbnailUri('/thumbnails/babysetting/babysetting.png');
          } else if (title.includes('meditation') || title.includes('mindful')) {
            return resolveThumbnailUri('/thumbnails/meditation/Meditation-clam.png');
          } else if (title.includes('focus') || title.includes('study') || title.includes('concentration')) {
            return resolveThumbnailUri('/thumbnails/study/study-focus.png');
          } else if (title.includes('nature') || title.includes('forest')) {
            return resolveThumbnailUri('/thumbnails/forest/nature-healing.png');
          } else if (title.includes('ocean') || title.includes('water')) {
            return resolveThumbnailUri('/thumbnails/ocean/ocean.png');
          } else if (title.includes('rain')) {
            return resolveThumbnailUri('/thumbnails/rain/ambient-rainy.png');
          } else if (title.includes('piano')) {
            return resolveThumbnailUri('/thumbnails/piano/piano.png');
          } else {
            return resolveThumbnailUri('/thumbnails/ambient/ambient-sunset.png');
          }
        };

        return {
          id: playlist.id,
          title: playlist.name || playlist.title,
          description: playlist.description || '',
          image: getPlaylistImage(playlist.name || playlist.title || '', playlist.thumbnail_url),
          creator: playlist.creator || 'Healing Sounds',
          plays: playlist.plays || 0,
          likes: playlist.likes || 0,
          trackCount: tracks.length,
          duration: formattedDuration
        };
      });

      return { data: transformedPlaylists, error: null };
    } catch (error) {
      console.error('❌ Failed to fetch home screen playlists:', error);
      return { data: [], error };
    }
  }
}