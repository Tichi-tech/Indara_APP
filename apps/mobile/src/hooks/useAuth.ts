import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

WebBrowser.maybeCompleteAuthSession();

// Detect if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Different redirect URI based on platform
const REDIRECT_URI = Platform.OS === 'web'
  ? `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8081'}/auth/callback`
  : isExpoGo
  ? 'http://localhost:8082'
  : makeRedirectUri({ scheme: 'indara', path: 'auth/callback' });

console.log('🔍 DEBUG: isExpoGo =', isExpoGo);
console.log('🔍 DEBUG: Constants.appOwnership =', Constants.appOwnership);
console.log('🔍 DEBUG: REDIRECT_URI =', REDIRECT_URI);

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle deep link for OAuth callback (mobile only)
  useEffect(() => {
    // Skip deep link handling on web - handled by callback route instead
    if (Platform.OS === 'web') return;

    const handleDeepLink = async ({ url }: { url: string }) => {
      console.log('🔗 Deep link received:', url);
      if (url.includes('code=') || url.includes('access_token=')) {
        console.log('🔄 Exchanging code from deep link...');
        const { error } = await supabase.auth.exchangeCodeForSession(url);
        if (error) console.warn('❌ exchangeCodeForSession error:', error.message);
        else console.log('✅ Auth successful via deep link');
      }
    };

    const sub = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then((url) => {
      console.log('🔗 Initial URL:', url);
      if (url) handleDeepLink({ url });
    });
    return () => sub.remove();
  }, []);

  // Watch for auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });
    return () => sub.subscription?.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    console.log('🔐 Starting OAuth with redirectTo:', REDIRECT_URI);

    // On web, use standard OAuth flow (no skipBrowserRedirect)
    if (Platform.OS === 'web') {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: REDIRECT_URI,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (error) throw error;
      return; // Browser will handle the redirect
    }

    // On mobile, use skipBrowserRedirect and WebBrowser
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: REDIRECT_URI,
        skipBrowserRedirect: true,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    });
    if (error) throw error;

    if (data?.url) {
      console.log('🌐 Opening browser...');
      const res = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URI);
      console.log('📱 WebBrowser result:', res);

      if (res.type === 'success' && res.url) {
        console.log('✅ Success! URL:', res.url);
        console.log('🔄 Exchanging code for session...');
        const { error: exErr } = await supabase.auth.exchangeCodeForSession(res.url);
        if (exErr) {
          console.error('❌ Exchange error:', exErr);
          throw exErr;
        }
        console.log('✅ Auth successful!');
      } else {
        console.log('❌ Auth failed:', res.type, res.error);
      }
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    console.log('👋 Signed out');
  };

  return { session, user, loading, signInWithGoogle, signOut };
}
