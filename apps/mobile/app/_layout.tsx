import '../global.css';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PlayerProvider } from '../src/hooks/usePlayer';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PlayerProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </PlayerProvider>
    </SafeAreaProvider>
  );
}
