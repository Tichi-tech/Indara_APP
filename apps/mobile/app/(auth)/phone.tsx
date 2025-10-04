import { useLocalSearchParams, useRouter } from 'expo-router';

import { PhoneAuthScreen } from '@/screens/PhoneAuthScreen';

export default function PhoneAuthRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode = params.mode === 'signin' ? 'signin' : 'create';

  return (
    <PhoneAuthScreen
      mode={mode}
      onBack={() => router.back()}
      onCodeSent={(phone) => router.push({ pathname: '/(auth)/verification', params: { phone, mode } })}
    />
  );
}
