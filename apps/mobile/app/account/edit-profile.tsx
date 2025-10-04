import { useRouter } from 'expo-router';

import { ProfileScreen } from '@/screens/ProfileScreen';

export default function EditProfileRoute() {
  const router = useRouter();

  return (
    <ProfileScreen
      onBack={() => router.back()}
      onSave={() => {}}
    />
  );
}
