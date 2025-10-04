import { useRouter } from 'expo-router';

import { MeditationCreationScreen } from '@/screens/MeditationCreationScreen';

export default function MeditationCreateRoute() {
  const router = useRouter();

  return (
    <MeditationCreationScreen
      onClose={() => router.back()}
      onTalkToGuide={() => router.push('/meditation/assistant')}
      onPlaySession={() => router.push('/(tabs)/now-playing')}
    />
  );
}
