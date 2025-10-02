import '../global.css';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PlayerProvider } from '../src/hooks/usePlayer';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { handleDeepLinkAuth } from '../src/auth';

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS === 'web') return;

    const sub = Linking.addEventListener('url', ({ url }) => handleDeepLinkAuth(url, router));
    Linking.getInitialURL().then(url => url && handleDeepLinkAuth(url, router));
    return () => sub.remove();
  }, [router]);

  return (
    <SafeAreaProvider>
      <PlayerProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="playlist/[id]" options={{ headerShown: true, title: 'Playlist' }} />
        </Stack>
      </PlayerProvider>
    </SafeAreaProvider>
  );
}
