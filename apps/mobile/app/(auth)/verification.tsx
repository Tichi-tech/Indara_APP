import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';

import { VerificationScreen } from '@/screens/VerificationScreen';

export default function VerificationRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string; mode?: string }>();
  const phone = params.phone ?? '';

  if (!phone) {
    return <Redirect href="/(auth)/phone" />;
  }

  return (
    <VerificationScreen
      phoneNumber={phone}
      onBack={() => router.back()}
      onVerified={() => router.replace('/(auth)/complete')}
    />
  );
}
