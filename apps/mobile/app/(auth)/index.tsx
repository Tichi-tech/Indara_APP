import { useRouter } from 'expo-router';

import { WelcomeScreen } from '@/screens/WelcomeScreen';

export default function WelcomeRoute() {
  const router = useRouter();

  return (
    <WelcomeScreen
      onCreateAccount={() => router.push('/(auth)/phone?mode=create')}
      onSignIn={() => router.push('/(auth)/signin')}
    />
  );
}
