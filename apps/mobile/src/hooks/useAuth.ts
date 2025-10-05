import { useEffect, useRef, useState } from 'react';
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

const hasAuthParams = (value: string) => value.includes('code=') || value.includes('access_token=');

console.log('dY"? DEBUG: isExpoGo =', isExpoGo);
console.log('dY"? DEBUG: Constants.appOwnership =', Constants.appOwnership);
console.log('dY"? DEBUG: REDIRECT_URI =', REDIRECT_URI);

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const lastHandledUrlRef = useRef<string | null>(null);

  const processAuthRedirect = async (url: string) => {
    if (!url || !hasAuthParams(url)) {
      console.log('dY"- Auth redirect missing code, ignoring');
      return;
    }
    if (lastHandledUrlRef.current === url) {
      console.log('dY"- Auth redirect already processed, skipping');
      return;
    }

    try {
      lastHandledUrlRef.current = url;

      // Extract the authorization code from the URL
      const code = new URL(url).searchParams.get('code');
      if (!code) {
        console.warn('??O No authorization code found in URL');
        lastHandledUrlRef.current = null;
        throw new Error('No authorization code');
      }

      // Exchange the code for a session (must pass string, not URL object)
      const authCode = `${code}`;
      console.log('🔐 Exchanging code for session:', typeof authCode);
      const { error } = await supabase.auth.exchangeCodeForSession(authCode);
      if (error) {
        lastHandledUrlRef.current = null;
        console.warn('??O exchangeCodeForSession error:', error.message);
        throw error;
      }
      console.log('?o. Auth successful!');
    } catch (err) {
      lastHandledUrlRef.current = null;
      throw err;
    }
  };

  // Handle deep link for OAuth callback (mobile only)
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const handleDeepLink = async ({ url }: { url: string }) => {
      console.log('dY"- Deep link received:', url);
      try {
        await processAuthRedirect(url);
      } catch (error) {
        console.warn('??O Deep link exchange threw', error);
      }
    };

    const sub = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then((url) => {
      console.log('dY"- Initial URL:', url);
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
    console.log('dY"? Starting OAuth with redirectTo:', REDIRECT_URI);
    lastHandledUrlRef.current = null;

    if (Platform.OS === 'web') {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: REDIRECT_URI,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (error) throw error;
      return;
    }

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
      console.log('dYO? Opening browser...');
      const res = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URI);
      console.log('dY"? WebBrowser result:', res);

      if (res.type === 'success' && res.url) {
        try {
          await processAuthRedirect(res.url);
        } catch (exErr) {
          console.error('??O Exchange error:', exErr);
          throw exErr;
        }
      } else if (res.type !== 'dismiss') {
        console.log('??O Auth ended without success:', res.type);
      }
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    console.log('dY`< Signed out');
  };

  const signInWithPhone = async (phone: string) => {
    return supabase.auth.signInWithOtp({ phone, options: { shouldCreateUser: true } });
  };

  const verifyOtp = async (phone: string, token: string) => {
    return supabase.auth.verifyOtp({ type: 'sms', phone, token });
  };

  return { session, user, loading, signInWithGoogle, signOut, signInWithPhone, verifyOtp };
}
