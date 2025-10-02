// apps/mobile/src/auth.ts
import * as Linking from 'expo-linking';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';

// iOS needs this so the Safari view can hand control back to your app
WebBrowser.maybeCompleteAuthSession();

const redirectPath = 'auth/callback';
const expoOwner = Constants.expoConfig?.owner ?? process.env.EXPO_PUBLIC_EXPO_OWNER ?? 'chrisindara';
const expoSlug = Constants.expoConfig?.slug ?? process.env.EXPO_PUBLIC_EXPO_SLUG ?? 'mobile';
const appOwnership = (Constants.appOwnership ?? '').toLowerCase();
const executionEnvironment = (Constants.executionEnvironment ?? '').toLowerCase();

const shouldUseProxy =
  appOwnership === 'expo' ||
  appOwnership === 'guest' ||
  executionEnvironment === 'storeclient' ||
  process.env.EXPO_PUBLIC_FORCE_PROXY === '1';

const expoProjectPath = expoOwner && expoSlug ? `@${expoOwner}/${expoSlug}` : undefined;

const expoReturnRedirect = AuthSession.makeRedirectUri({
  path: redirectPath,
  useProxy: false,
  preferLocalhost: false,
});

const expoProxyRedirect = expoProjectPath
  ? `https://auth.expo.dev/${expoProjectPath}?redirect_uri=${encodeURIComponent(expoReturnRedirect)}`
  : AuthSession.makeRedirectUri({
      path: redirectPath,
      useProxy: true,
    });

const nativeRedirect = AuthSession.makeRedirectUri({
  scheme: 'indara',
  path: redirectPath,
});

export const redirectTo =
  process.env.EXPO_PUBLIC_AUTH_REDIRECT ?? (shouldUseProxy ? expoProxyRedirect : nativeRedirect);

const authSessionReturnUrl = shouldUseProxy ? expoReturnRedirect : nativeRedirect;

console.log('[Auth] config', {
  appOwnership,
  executionEnvironment,
  shouldUseProxy,
  expoProjectPath,
  expoReturnRedirect,
  expoProxyRedirect,
  nativeRedirect,
  redirectTo,
  authSessionReturnUrl,
});

let deepLinkSub: { remove(): void } | undefined;
let inFlight = false;
let exchangedThisRound = false;

/** Start once at app boot */
export function startAuthLinkListener() {
  if (deepLinkSub) return;
  console.log('[Auth] Link listener on. redirectTo =', redirectTo);

  deepLinkSub = Linking.addEventListener('url', async ({ url }) => {
    console.log('[Auth] deep link url:', url);
    if (!url.includes('code=') || !url.includes('state=')) return;
    if (exchangedThisRound) return;

    try {
      exchangedThisRound = true;
      console.log('[Auth] Exchanging code for session (link)...');
      const { data, error } = await supabase.auth.exchangeCodeForSession(url);
      if (error) throw error;
      console.log('[Auth] Session via link:', data.session?.user?.email);
    } catch (e) {
      console.warn('[Auth] Exchange (link) failed', e);
    }
  });
}

export function stopAuthLinkListener() {
  deepLinkSub?.remove?.();
  deepLinkSub = undefined;
  console.log('[Auth] Link listener off.');
}

/** Google OAuth (Expo Go safe). Call on button press. */
export async function signInWithGoogle() {
  if (inFlight) {
    console.log('[Auth] Sign-in already in progress; skipping.');
    return;
  }
  inFlight = true;
  exchangedThisRound = false;

  try {
    console.log('[Auth] redirectTo =', redirectTo);

    // Ask Supabase for the provider URL, but do not auto-open a browser
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) throw error;
    if (!data?.url) throw new Error('No auth URL from Supabase');

    console.log('[Auth] authUrl =', data.url);

    // Open with WebBrowser/AuthSession so the proxy can return to the app
    await WebBrowser.warmUpAsync();
    const result = await WebBrowser.openAuthSessionAsync(data.url, authSessionReturnUrl);
    await WebBrowser.coolDownAsync();
    console.log('[Auth] Browser result:', result.type);

    // On iOS we often get the final callback URL directly here
    if (result.type === 'success' && result.url && !exchangedThisRound) {
      console.log('[Auth] Exchanging code for session (direct)...');
      await supabase.auth.exchangeCodeForSession(result.url);
      exchangedThisRound = true;
      console.log('[Auth] Session via direct exchange');
    }

    console.log('[Auth] OAuth flow finished.');
  } catch (err) {
    console.error('[Auth] Sign-in error:', err);
    throw err;
  } finally {
    inFlight = false;
  }
}

/** Optional helpers */
export async function signOut() {
  try {
    await supabase.auth.signOut();
    console.log('[Auth] Signed out.');
  } catch (e) {
    console.warn('[Auth] Sign-out error', e);
  }
}

export async function getSessionEmail(): Promise<string | undefined> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user?.email;
}
