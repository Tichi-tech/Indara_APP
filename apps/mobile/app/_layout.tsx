// apps/mobile/app/_layout.tsx
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, usePathname, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Session } from '@supabase/supabase-js';

import { PlayerProvider } from '../src/hooks/usePlayer';
import { supabase } from '../src/lib/supabase';
import { GlobalAudioPlayer } from '../src/components';

export default function RootLayout() {
  const [session, setSession] = React.useState<Session | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isSongPlayerRoute = pathname?.includes('/now-playing');

  // Check if user has completed onboarding
  const checkOnboardingStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', userId)  // Fixed: profiles table uses 'id', not 'user_id'
        .maybeSingle();    // Fixed: use maybeSingle() to avoid error if no profile exists

      // User has completed onboarding if they have a display_name
      return !error && data?.display_name;
    } catch (err) {
      console.warn('Failed to check onboarding status:', err);
      return false;
    }
  };

  // Check session on app start and when app comes to foreground
  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(async ({ data }) => {
      console.log('📱 Session check:', data.session ? 'LOGGED IN' : 'NOT LOGGED IN');
      setSession(data.session);

      if (data.session?.user) {
        const completed = await checkOnboardingStatus(data.session.user.id);
        setHasCompletedOnboarding(completed);
      }

      setLoading(false);
    });

    // Listen for auth changes (handles token refresh, sign in/out)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, updatedSession) => {
      console.log('📱 Auth state change:', event, updatedSession ? 'LOGGED IN' : 'NOT LOGGED IN');

      // Update session state
      setSession(updatedSession);

      if (updatedSession?.user) {
        // Check onboarding status for logged in users
        const completed = await checkOnboardingStatus(updatedSession.user.id);
        setHasCompletedOnboarding(completed);

        // If token was refreshed, ensure user stays logged in
        if (event === 'TOKEN_REFRESHED') {
          console.log('✅ Token refreshed successfully - user remains logged in');
        }
      } else {
        // User logged out
        setHasCompletedOnboarding(false);
      }

      // Ensure loading is false after auth state changes
      setLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);


  // Show loading - returning null to prevent layout warning
  if (loading) {
    return null;
  }

  const showMainApp = session && hasCompletedOnboarding;
  const showOnboarding = !session || (session && !hasCompletedOnboarding);

  return (
    <SafeAreaProvider>
      <PlayerProvider>
        <Stack screenOptions={{ headerShown: false }}>
          {showMainApp ? (
            <>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="playlist/[id]" options={{ headerShown: true, title: 'Playlist' }} />
              <Stack.Screen name="analytics" options={{ headerShown: false }} />
              <Stack.Screen name="create" options={{ headerShown: false }} />
              <Stack.Screen name="account/edit-profile" options={{ headerShown: true, title: 'Edit Profile' }} />
              <Stack.Screen name="account/profile" options={{ headerShown: true, title: 'Profile Overview' }} />
              <Stack.Screen name="account/notifications" options={{ headerShown: true, title: 'Notifications' }} />
              <Stack.Screen name="account/privacy" options={{ headerShown: true, title: 'Privacy & Security' }} />
              <Stack.Screen name="account/support" options={{ headerShown: true, title: 'Help & Support' }} />
            </>
          ) : (
            <Stack.Screen name="(auth)" />
          )}
        </Stack>
        {showMainApp && !isSongPlayerRoute ? (
          <GlobalAudioPlayer onPress={() => router.push('/(tabs)/now-playing')} />
        ) : null}
      </PlayerProvider>
    </SafeAreaProvider>
  );
}
