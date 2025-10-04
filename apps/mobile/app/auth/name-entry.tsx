import { useRouter } from 'expo-router';

import { NameEntryScreen } from '@/screens/NameEntryScreen';
import { useMyProfile } from '@/hooks/useMyProfile';

export default function NameEntryRoute() {
  const router = useRouter();
  const { updateProfile, getDisplayName } = useMyProfile();

  return (
    <NameEntryScreen
      initialName={getDisplayName()}
      onBack={() => router.back()}
      onNameChange={(name) => {
        void updateProfile({ display_name: name });
      }}
      onNext={() => router.push('/(tabs)/index')}
    />
  );
}
