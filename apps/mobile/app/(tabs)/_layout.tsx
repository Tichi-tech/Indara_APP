import { Tabs, useRouter } from 'expo-router';

import { BottomNav, BottomNavProps } from '@/components';
import { useAuth } from '@/hooks/useAuth';

type RouteName = 'index' | 'library' | 'now-playing' | 'inbox' | 'profile' | 'player';

type NavKey = BottomNavProps['active'];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false, tabBarShowLabel: false, tabBarStyle: { display: 'none' } }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="library" options={{ title: 'Library' }} />
      <Tabs.Screen name="now-playing" options={{ title: 'Now Playing', href: null }} />
      <Tabs.Screen name="inbox" options={{ title: 'Inbox' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="player" options={{ href: null }} />
    </Tabs>
  );
}

function CustomTabBar({ state, navigation }: any) {
  const router = useRouter();
  const { user } = useAuth();

  const currentRoute = state.routes[state.index]?.name as RouteName | undefined;

  const active: NavKey =
    currentRoute === 'index'
      ? 'home'
      : currentRoute === 'library' || currentRoute === 'now-playing'
      ? 'library'
      : currentRoute === 'inbox'
      ? 'inbox'
      : 'account';

  const accountInitial = (user?.email ?? user?.user_metadata?.name ?? 'S')
    .slice(0, 1)
    .toUpperCase();

  return (
    <BottomNav
      active={active}
      accountInitial={accountInitial}
      onHome={() => navigation.navigate('index')}
      onLibrary={() => navigation.navigate('library')}
      onCreate={() => router.push('/create')}
      onInbox={() => navigation.navigate('inbox')}
      onAccount={() => navigation.navigate('profile')}
      badgeCount={0}
    />
  );
}
