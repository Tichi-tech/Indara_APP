import 'dotenv/config';
import type { ConfigContext, ExpoConfig } from 'expo/config';

const APP_NAME = 'Indara';
const APP_SLUG = 'mobile';
const APP_OWNER = 'chrisindara';
const DEFAULT_VERSION = '1.0.0';
const EAS_PROJECT_ID = '2e12b434-114c-4e93-8f80-64f9cdaf1239';

const readEnv = (keys: string[], fallback?: string) => {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }
  return fallback;
};

export default ({ config }: ConfigContext): ExpoConfig => {
  const version = readEnv(['EXPO_APP_VERSION', 'APP_VERSION'], DEFAULT_VERSION);
  const supabaseUrl = readEnv(['EXPO_PUBLIC_SUPABASE_URL', 'SUPABASE_URL']);
  const supabaseAnonKey = readEnv(['EXPO_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY']);

  return {
    ...config,
    name: APP_NAME,
    slug: APP_SLUG,
    owner: APP_OWNER,
    version,
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    scheme: 'indara',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'live.indara.app',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        UIBackgroundModes: ['audio'],
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'live.indara.app',
      permissions: ['RECORD_AUDIO'],
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      softwareKeyboardLayoutMode: 'pan',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: ['expo-router', 'expo-web-browser', 'expo-dev-client', 'expo-audio'],
    extra: {
      ...config.extra,
      router: config.extra?.router ?? {},
      eas: {
        projectId: EAS_PROJECT_ID,
      },
      supabaseUrl,
      supabaseAnonKey,
      forceProxy: process.env.EXPO_PUBLIC_FORCE_PROXY,
    },
  };
};
