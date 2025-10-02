import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import { makeRedirectUri } from 'expo-auth-session';
import * as Linking from 'expo-linking';
import { supabase } from './lib/supabase';

export function redirectUri() {
  return Platform.OS === 'web'
    ? `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8081'}/auth/callback`
    : makeRedirectUri({ scheme: 'indara', path: 'auth/callback' });
}

export async function signInWithGoogle() {
  const redirectTo = redirectUri();

  if (Platform.OS === 'web') {
    return supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo }, // web: PKCE handled on getSession()
    });
  }

  // native: open system browser and deep-link back
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (data?.url) {
    await AuthSession.startAsync({ authUrl: data.url, returnUrl: redirectTo });
  }
}

// Deep link handler for native only
export async function handleDeepLinkAuth(
  url: string,
  router: { replace: (path: string) => void }
) {
  if (Platform.OS === 'web') return; // NO-OP on web

  const { error } = await supabase.auth.exchangeCodeForSession(url);
  if (error) {
    console.error('❌ Exchange error:', error);
    router.replace('/(auth)/signin');
  } else {
    console.log('✅ Auth successful!');
    router.replace('/(tabs)');
  }
}
