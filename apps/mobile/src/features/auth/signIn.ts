import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { supabase } from '../../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle() {
  const redirectTo = AuthSession.makeRedirectUri({
    scheme: 'indara',
    path: 'auth/callback',
  });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error || !data?.url) throw error ?? new Error('No auth URL');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success' || !result.url) throw new Error('Auth cancelled');

  // ✅ must be a STRING
  const code = new URL(result.url).searchParams.get('code');
  if (!code) throw new Error('No authorization code');
  const authCode = `${code}`;
  console.log('🔐 exchangeCodeForSession payload (features/auth):', authCode, typeof authCode);

  // ✅ pass only the string
  const { error: exErr } = await supabase.auth.exchangeCodeForSession(authCode);
  if (exErr) throw exErr;
}
