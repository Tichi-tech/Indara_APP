import { useRouter } from 'expo-router';

import { OnboardingCompleteScreen } from '@/screens/OnboardingCompleteScreen';
import { useMyProfile } from '@/hooks/useMyProfile';

export default function CompleteRoute() {
  const router = useRouter();
  const { getDisplayName } = useMyProfile();

  return (
    <OnboardingCompleteScreen
      name={getDisplayName()}
      onNext={() => router.replace('/(tabs)')}
    />
  );
}
