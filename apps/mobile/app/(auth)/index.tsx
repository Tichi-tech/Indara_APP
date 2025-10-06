import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';

import { SplashScreen } from '@/screens/SplashScreen';
import { WelcomeScreen } from '@/screens/WelcomeScreen';
import { useAuth } from '@/hooks/useAuth';

export default function WelcomeRoute() {
  const router = useRouter();
  const { session } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  // If user is already logged in, they shouldn't be here
  // The root layout will handle routing them to the right place
  useEffect(() => {
    if (session) {
      router.replace('/(tabs)');
    }
  }, [session, router]);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <WelcomeScreen
      onCreateAccount={() => router.push('/(auth)/create-account')}
      onSignIn={() => router.push('/(auth)/signin')}
    />
  );
}
