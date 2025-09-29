import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mtypyrdsboxrgzsxwsk.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'
const isPlaceholder = supabaseAnonKey.includes('placeholder') || supabaseAnonKey === 'placeholder-anon-key'

// Note: You should set these in your .env file for security
console.log('🔗 Connecting to Supabase:', supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
    console.log('🔍 STEP 4.5: Current window origin:', window.location.origin)
    console.log('🔍 STEP 4.6: Current full URL:', window.location.href)
    
    if (isPlaceholder) {
      console.warn('⚠️ Using placeholder Supabase credentials - OAuth will not work')
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
      const redirectTo = window.location.origin
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
      console.warn('⚠️ Using placeholder Supabase credentials - OAuth will not work')
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
        redirectTo: `${window.location.origin}`
      }
    })
  },

  signInWithFacebook: async () => {
    if (isPlaceholder) {
      console.warn('⚠️ Using placeholder Supabase credentials - OAuth will not work')
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
        redirectTo: `${window.location.origin}`
      }
    })
  },

  signInWithDiscord: async () => {
    if (isPlaceholder) {
      console.warn('⚠️ Using placeholder Supabase credentials - OAuth will not work')
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
        redirectTo: `${window.location.origin}`
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
    console.log('🎧 AUTH LISTENER: Setting up auth state change listener')
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

  // Get all user jobs for debugging
  getUserJobs: async (userId: string) => {
    try {
      console.log('🔍 Fetching all jobs for user:', userId);
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      console.log('📊 User jobs found:', data);
      return { data, error: null };
    } catch (error) {
      console.error('❌ Failed to fetch user jobs:', error);
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
  getUserTracks: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('generated_tracks')
        .select(`
          *,
          track_likes(count),
          track_plays(count)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (error) {
      console.error('❌ Failed to fetch user tracks:', error);
      return { data: [], error };
    }
  },

  getFeaturedTracks: async () => {
    try {
      const { data, error } = await supabase
        .from('generated_tracks')
        .select(`
          *,
          owner:profiles!generated_tracks_user_fk(display_name, avatar_url)
        `)
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
      const { data: existingLike, error: checkError } = await supabase
        .from('track_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('track_id', trackId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('track_likes')
          .delete()
          .eq('id', existingLike.id);

        if (error) throw error;
        return { data: { liked: false }, error: null };
      } else {
        // Like
        const { data, error } = await supabase
          .from('track_likes')
          .insert({ user_id: userId, track_id: trackId })
          .select()
          .single();

        if (error) throw error;
        return { data: { liked: true }, error: null };
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

  getTrackStats: async (trackId: string) => {
    try {
      const [playsResult, likesResult] = await Promise.all([
        supabase
          .from('track_plays')
          .select('id, created_at')
          .eq('track_id', trackId),
        supabase
          .from('track_likes')
          .select('id')
          .eq('track_id', trackId)
      ]);

      if (playsResult.error) throw playsResult.error;
      if (likesResult.error) throw likesResult.error;

      return {
        data: {
          plays: playsResult.data?.length || 0,
          likes: likesResult.data?.length || 0
        },
        error: null
      };
    } catch (error) {
      console.error('❌ Failed to get track stats:', error);
      return { data: { plays: 0, likes: 0 }, error };
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
  }
}