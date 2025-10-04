import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { SignInScreen } from '@/screens/SignInScreen';
import { useAuth } from '@/hooks/useAuth';

export default function SignInRoute() {
  const router = useRouter();
  const { session } = useAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) return null;
  if (session) return <Redirect href="/(tabs)" />;

  return (
    <SignInScreen
      onBack={() => router.back()}
      onPhone={() => router.push('/(auth)/phone?mode=signin')}
    />
  );
}
