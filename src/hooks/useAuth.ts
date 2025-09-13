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
        const { data: { user } = { user: null }, error } = await auth.getCurrentUser()
        if (error) {
          console.warn('⚠️ No auth session found, continuing in offline mode')
          setUser(null)
        } else {
          console.log('👤 Current user:', user ? 'Authenticated' : 'Not authenticated')
          setUser(user)
        }
      } catch (error) {
        console.warn('❌ Auth initialization failed, continuing in offline mode:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    
    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      console.log('🔄 AUTH STATE CHANGE DETECTED:')
      console.log('🔄 Event:', event)
      console.log('🔄 Session exists:', session ? 'YES' : 'NO')
      console.log('🔄 Session data:', session)
      console.log('🔄 User data:', session?.user)
      console.log('🔄 Timestamp:', new Date().toISOString())
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // Handle demo login - check for demo users
      if (event === 'SIGNED_IN' && session?.user?.id?.startsWith('demo-user')) {
        console.log('✅ DEMO LOGIN: Demo login successful')
      } else if (event === 'SIGNED_IN') {
        console.log('✅ REAL LOGIN: Real OAuth login successful')
        console.log('✅ User ID:', session?.user?.id)
        console.log('✅ User email:', session?.user?.email)
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