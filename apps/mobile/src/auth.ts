import * as Linking from 'expo-linking';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';

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
  : AuthSession.makeRedirectUri({ path: redirectPath });

const nativeRedirect = AuthSession.makeRedirectUri({
  scheme: 'indara',
  path: redirectPath,
});

const hasAuthParams = (value: string) => value.includes('code=') || value.includes('access_token=');

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
let isProcessing = false;
let lastHandledUrl: string | null = null;

const processAuthRedirect = async (url: string) => {
    if (!url || !hasAuthParams(url)) {
      console.log('[Auth] Redirect missing auth params, ignoring');
      return;
    }
    if (lastHandledUrl === url) {
      console.log('[Auth] Redirect already processed, skipping');
      return;
    }
    if (isProcessing) {
      console.log('[Auth] Redirect exchange already in progress, skipping');
      return;
    }

    try {
      isProcessing = true;
      lastHandledUrl = url;
      console.log('[Auth] Exchanging code for session with URL:', url);
      const { data, error } = await supabase.auth.exchangeCodeForSession(url);
      if (error) {
        lastHandledUrl = null;
        console.error('[Auth] exchangeCodeForSession error:', error);
        throw error;
      }
      console.log('[Auth] Session established for:', data.session?.user?.email);
    } catch (error) {
      throw error;
    } finally {
      isProcessing = false;
    }
};

/** Start once at app boot */
export function startAuthLinkListener() {
  if (deepLinkSub) return;
  console.log('[Auth] Link listener on. redirectTo =', redirectTo);

  deepLinkSub = Linking.addEventListener('url', async ({ url }) => {
    console.log('[Auth] deep link url:', url);
    try {
      await processAuthRedirect(url);
    } catch (error) {
      console.warn('[Auth] Exchange (link) failed', error);
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
  if (isProcessing) {
    console.log('[Auth] Sign-in already in progress; skipping.');
    return;
  }
  lastHandledUrl = null;

  try {
    console.log('[Auth] redirectTo =', redirectTo);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) throw error;
    if (!data?.url) throw new Error('No auth URL from Supabase');

    console.log('[Auth] authUrl =', data.url);

    await WebBrowser.warmUpAsync();
    const result = await WebBrowser.openAuthSessionAsync(data.url, authSessionReturnUrl);
    await WebBrowser.coolDownAsync();
    console.log('[Auth] Browser result:', result.type);

    if (result.type === 'success' && result.url) {
      try {
        await processAuthRedirect(result.url);
      } catch (error) {
        console.error('[Auth] Sign-in exchange error:', error);
        throw error;
      }
    } else if (result.type !== 'dismiss') {
      console.log('[Auth] OAuth ended without success:', result.type);
    }

  } catch (err) {
    console.error('[Auth] Sign-in error:', err);
    throw err;
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
