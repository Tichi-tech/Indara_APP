import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mtypyrdsboxrgzsxwsk.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'
const isPlaceholder = supabaseAnonKey.includes('placeholder') || supabaseUrl.includes('placeholder')

// Note: You should set these in your .env file for security
console.log('🔗 Connecting to Supabase:', supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const auth = {
  signUp: async (email: string, password: string, metadata?: any) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
  },

  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({
      email,
      password
    })
  },

  signInWithGoogle: async () => {
    console.log('🔍 Attempting Google sign-in...')
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
  },

  signInWithApple: async () => {
    return await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}`
      }
    })
  },

  signInWithFacebook: async () => {
    return await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}`
      }
    })
  },

  signInWithDiscord: async () => {
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
    return await supabase
      .from('generated_tracks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
  },

  getPublicSongs: async () => {
    return await supabase
      .from('generated_tracks')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
  },

  createSong: async (songData: any) => {
    return await supabase
      .from('generated_tracks')
      .insert(songData)
      .select()
      .single()
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