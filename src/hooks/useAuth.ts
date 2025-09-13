import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { auth } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    auth.getCurrentUser().then(({ data: { user } = { user: null }, error }) => {
      if (error) {
        console.warn('⚠️ No auth session found:', error.message)
        setUser(null)
      } else {
        console.log('👤 Current user:', user ? 'Authenticated' : 'Not authenticated')
        setUser(user)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state change:', event, session ? 'Session exists' : 'No session')
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