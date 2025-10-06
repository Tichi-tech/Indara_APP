import { useRouter, useLocalSearchParams } from 'expo-router';

import { AgeSelectionScreen } from '@/screens/AgeSelectionScreen';

export default function AgeSelectionRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string }>();
  const userName = params.name || 'User';

  return (
    <AgeSelectionScreen
      userName={userName}
      onAgeSelected={(ageGroup) => {
        // TODO: Save age group to user profile
        console.log('Selected age group:', ageGroup);
        // Navigate to home screen (tabs)
        router.replace('/(tabs)');
      }}
    />
  );
}
