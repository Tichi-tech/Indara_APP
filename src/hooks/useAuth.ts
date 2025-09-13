import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { auth } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        console.log('🔄 AUTH INIT: Checking for existing session...')
        const { data: { user } = { user: null }, error } = await auth.getCurrentUser()
        if (error) {
          console.warn('⚠️ AUTH INIT: No auth session found:', error.message)
          setUser(null)
        } else {
          console.log('👤 AUTH INIT: Current user:', user ? `Authenticated (${user.email})` : 'Not authenticated')
          setUser(user)
        }
      } catch (error) {
        console.warn('❌ AUTH INIT: Auth initialization failed:', error)
        setUser(null)
      } finally {
        console.log('🏁 AUTH INIT: Loading complete')
        setLoading(false)
      }
    }
    
    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      console.log('🔄 AUTH STATE CHANGE DETECTED:')
      console.log('🔄 Event:', event)
      console.log('🔄 Session exists:', session ? 'YES' : 'NO')
      if (session) {
        console.log('🔄 Session data:', {
          access_token: session.access_token ? 'Present' : 'Missing',
          user_id: session.user?.id,
          user_email: session.user?.email,
          provider: session.user?.app_metadata?.provider
        })
        console.log('🔄 User data:', session.user)
      }
      console.log('🔄 Timestamp:', new Date().toISOString())
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ LOGIN SUCCESS: OAuth login successful')
        console.log('✅ User ID:', session?.user?.id)
        console.log('✅ User email:', session?.user?.email)
        console.log('✅ Provider:', session?.user?.app_metadata?.provider)
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 LOGOUT: User signed out')
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 TOKEN: Token refreshed')
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { data, error } = await auth.signUp(email, password, metadata)
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await auth.signIn(email, password)
    return { data, error }
  }

  const signInWithPhone = async (phone: string) => {
    const { data, error } = await auth.signInWithPhone(phone)
    return { data, error }
  }

  const verifyOtp = async (phone: string, token: string) => {
    const { data, error } = await auth.verifyOtp(phone, token)
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await auth.signOut()
    if (!error) {
      setUser(null)
      setSession(null)
    }
    return { error }
  }

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithPhone,
    verifyOtp,
    signOut
  }
}