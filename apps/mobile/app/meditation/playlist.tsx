import { useMemo } from 'react';
import { useRouter } from 'expo-router';

import { MeditationPlaylistScreen } from '@/screens/MeditationPlaylistScreen';
import { useAuth } from '@/hooks/useAuth';

export default function MeditationPlaylistRoute() {
  const router = useRouter();
  const { user } = useAuth();

  const accountInitial = useMemo(() => {
    const source = user?.user_metadata?.name ?? user?.email ?? 'S';
    return source.slice(0, 1).toUpperCase();
  }, [user?.email, user?.user_metadata?.name]);

  return (
    <MeditationPlaylistScreen
      onBack={() => router.back()}
      onCreateMusic={() => router.push('/create')}
      onLibrary={() => router.push('/(tabs)/now-playing')}
      onInbox={() => router.push('/(tabs)/inbox')}
      onAccount={() => router.push('/(tabs)/profile')}
      accountInitial={accountInitial}
    />
  );
}
