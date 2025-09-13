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
  // User profiles
  getUserProfile: async (userId: string) => {
    return await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
  },

  updateUserProfile: async (userId: string, updates: any) => {
    return await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
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
  }
}

// AI Music Generation (you'll need to implement this based on your AI service)
export const aiMusic = {
  generateMusic: async (prompt: string, options: any = {}) => {
    // This should call your AI music generation endpoint
    // Replace with your actual AI service integration
    const response = await supabase.functions.invoke('generate-music', {
      body: { prompt, options }
    })
    return response
  },

  getGenerationStatus: async (jobId: string) => {
    const response = await supabase.functions.invoke('get-generation-status', {
      body: { jobId }
    })
    return response
  }
}