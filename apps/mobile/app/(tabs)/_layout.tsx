import { Tabs, Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../../src/lib/supabase';

export default function TabsLayout() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription?.unsubscribe();
  }, []);

  if (signedIn === null) return null; // Loading state
  if (!signedIn) return <Redirect href="/(auth)" />;

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="player" options={{ title: 'Player' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
