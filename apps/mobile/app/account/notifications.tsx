import { useMemo } from 'react';
import { useRouter } from 'expo-router';

import { NotificationsScreen } from '@/screens/NotificationsScreen';
import { useAuth } from '@/hooks/useAuth';

export default function AccountNotificationsRoute() {
  const router = useRouter();
  const { user } = useAuth();

  const accountInitial = useMemo(() => {
    const source = user?.user_metadata?.name ?? user?.email ?? 'S';
    return source.slice(0, 1).toUpperCase();
  }, [user?.email, user?.user_metadata?.name]);

  return (
    <NotificationsScreen
      onHome={() => router.push('/(tabs)/index')}
      onLibrary={() => router.push('/(tabs)/library')}
      onCreate={() => router.push('/create')}
      onInbox={() => router.back()}
      onAccount={() => router.push('/(tabs)/profile')}
      accountInitial={accountInitial}
    />
  );
}
