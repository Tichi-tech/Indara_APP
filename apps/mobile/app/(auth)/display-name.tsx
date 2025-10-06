import { useRouter } from 'expo-router';

import { DisplayNameScreen } from '@/screens/DisplayNameScreen';

export default function DisplayNameRoute() {
  const router = useRouter();

  return (
    <DisplayNameScreen
      onBack={() => router.back()}
      onContinue={(name) => {
        // TODO: Save display name to user profile
        console.log('Display name:', name);
        // Navigate to age selection with name parameter
        router.push({
          pathname: '/(auth)/age-selection',
          params: { name },
        });
      }}
    />
  );
}
