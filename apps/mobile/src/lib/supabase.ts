// Polyfills MUST come first so PKCE uses S256 and URL parsing works.
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import 'expo-standard-web-crypto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,   // Expo handles redirects
      storage: AsyncStorage,       // required on mobile
    },
  }
);

const ADMIN_EMAILS = [
  'admin@indara.app',
  'chris.wang@wustl.com',
];

export const isAdminUser = (user: any): boolean => {
  if (!user) return false;
  if (user.user_metadata?.role === 'admin') return true;
  if (user.app_metadata?.role === 'admin') return true;
  if (user.email && ADMIN_EMAILS.includes(user.email)) return true;
  return false;
};
