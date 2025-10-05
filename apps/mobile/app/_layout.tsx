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
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isSongPlayerRoute = pathname?.includes('/now-playing');

  // Check session on app start
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      console.log('📱 Session check:', data.session ? 'LOGGED IN' : 'NOT LOGGED IN');
      setSession(data.session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, updatedSession) => {
      console.log('📱 Auth state change:', event, updatedSession ? 'LOGGED IN' : 'NOT LOGGED IN');
      setSession(updatedSession);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);


  // Show loading or handle auth state
  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <SafeAreaProvider>
      <PlayerProvider>
        <View style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            {session ? (
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
          {session && !isSongPlayerRoute ? (
            <GlobalAudioPlayer onPress={() => router.push('/(tabs)/now-playing')} />
          ) : null}
        </View>
      </PlayerProvider>
    </SafeAreaProvider>
  );
}
