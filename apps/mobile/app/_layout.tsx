// apps/mobile/app/_layout.tsx
import '../global.css';

import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PlayerProvider } from '../src/hooks/usePlayer';
import { startAuthLinkListener, stopAuthLinkListener } from '../src/auth';

export default function RootLayout(): JSX.Element {
  // Start auth link listener on native only
  useEffect(() => {
    if (Platform.OS === 'web') return;

    startAuthLinkListener();
    return () => stopAuthLinkListener();
  }, []);

  return (
    <SafeAreaProvider>
      <PlayerProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="playlist/[id]"
            options={{ headerShown: true, title: 'Playlist' }}
          />
        </Stack>
      </PlayerProvider>
    </SafeAreaProvider>
  );
}