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
        .eq('user_id', userId)
        .single();

      // User has completed onboarding if they have a display_name
      return !error && data?.display_name;
    } catch {
      return false;
    }
  };

  // Check session on app start
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      console.log('📱 Session check:', data.session ? 'LOGGED IN' : 'NOT LOGGED IN');
      setSession(data.session);

      if (data.session?.user) {
        const completed = await checkOnboardingStatus(data.session.user.id);
        setHasCompletedOnboarding(completed);
      }

      setLoading(false);
    });

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, updatedSession) => {
      console.log('📱 Auth state change:', event, updatedSession ? 'LOGGED IN' : 'NOT LOGGED IN');
      setSession(updatedSession);

      if (updatedSession?.user) {
        const completed = await checkOnboardingStatus(updatedSession.user.id);
        setHasCompletedOnboarding(completed);
      } else {
        setHasCompletedOnboarding(false);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);


  // Show loading or handle auth state
  if (loading) {
    return null; // Or a loading spinner
  }

  const showMainApp = session && hasCompletedOnboarding;
  const showOnboarding = !session || (session && !hasCompletedOnboarding);

  return (
    <SafeAreaProvider>
      <PlayerProvider>
        <View style={{ flex: 1 }}>
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
        </View>
      </PlayerProvider>
    </SafeAreaProvider>
  );
}
