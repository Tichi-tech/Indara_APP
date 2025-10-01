import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { auth, supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
          
        // Check if we're returning from OAuth
        const urlParams = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        
        if (hashParams.get('access_token') || urlParams.get('code')) {
          console.log('🔍 OAUTH CALLBACK: Detected OAuth callback, waiting for session...')
          // Wait a bit for Supabase to process the OAuth callback
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          // Force refresh the session
          console.log('🔄 OAUTH CALLBACK: Refreshing session...')
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          console.log('🔍 OAUTH CALLBACK: Session after refresh:', session ? 'Found' : 'Not found')
          console.log('🔍 OAUTH CALLBACK: Session error:', sessionError)
          
          if (session) {
            console.log('✅ OAUTH CALLBACK: Session established successfully!')
            setUser(session.user)
            setSession(session)
            setLoading(false)
            return
          }
        }
        
        const { data: { user } = { user: null }, error } = await auth.getCurrentUser()
        if (error) {
          console.warn('⚠️ AUTH INIT: No auth session found:', error.message)
          setUser(null)
        } else {
          setUser(user)
        }
      } catch (error) {
        console.warn('❌ AUTH INIT: Auth initialization failed:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    
    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      // Clear URL parameters after successful OAuth
      if (event === 'SIGNED_IN' && session && (window.location.hash || window.location.search.includes('code'))) {
        const cleanUrl = window.location.origin + window.location.pathname
        window.history.replaceState({}, document.title, cleanUrl)
      }
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
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