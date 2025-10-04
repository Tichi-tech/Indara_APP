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
  preferLocalhost: false,
});

const expoProxyRedirect = expoProjectPath
  ? `https://auth.expo.dev/${expoProjectPath}?redirect_uri=${encodeURIComponent(expoReturnRedirect)}`
  : AuthSession.makeRedirectUri({
      path: redirectPath,
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
    if (!url.includes('code=')) return;
    if (exchangedThisRound) {
      console.log('[Auth] Already exchanged this round, skipping');
      return;
    }

    try {
      exchangedThisRound = true;
      console.log('[Auth] Exchanging code for session (link)...');
      console.log('[Auth] Full callback URL:', url);
      const code = new URL(url).searchParams.get('code');
      if (!code) {
        console.error('[Auth] No code parameter found in callback URL.');
        throw new Error('Missing authorization code');
      }
      const authCode = `${code}`;
      console.log('[Auth] exchangeCodeForSession payload (link listener):', authCode, typeof authCode);
      const { data, error } = await supabase.auth.exchangeCodeForSession(authCode);
      if (error) {
        console.error('[Auth] Deep link exchange error:', error);
        console.error('[Auth] URL that failed:', url);
        throw error;
      }
      console.log('[Auth] Session via link:', data.session?.user?.email);
      console.log('[Auth] ✅ Successfully authenticated via deep link');
    } catch (e) {
      console.warn('[Auth] Exchange (link) failed', e);
      exchangedThisRound = false; // Reset so manual exchange can try
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

    // Open with WebBrowser so the proxy can return to the app
    await WebBrowser.warmUpAsync();
    const result = await WebBrowser.openAuthSessionAsync(data.url, authSessionReturnUrl);
    await WebBrowser.coolDownAsync();
    console.log('[Auth] Browser result:', result.type);

    // Just wait for the deep link to handle the session exchange
    if (result.type === 'success') {
      console.log('[Auth] Browser returned success, waiting for deep link...');
      // Give some time for the deep link to be processed
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('[Auth] OAuth flow finished.');
    }

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
