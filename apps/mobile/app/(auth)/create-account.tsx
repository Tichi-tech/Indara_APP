import { useRouter } from 'expo-router';

import { CreateAccountScreen } from '@/screens/CreateAccountScreen';
import { useAuth } from '@/hooks/useAuth';

export default function CreateAccountRoute() {
  const router = useRouter();
  const { signInWithGoogle } = useAuth();

  const handleGmailSignup = async () => {
    try {
      await signInWithGoogle?.();
      // After successful Gmail sign-in, navigate to display name screen
      router.push('/(auth)/display-name');
    } catch (error) {
      console.error('Gmail signup error:', error);
    }
  };

  return (
    <CreateAccountScreen
      onPhoneSignup={() => router.push('/(auth)/phone?mode=create')}
      onGmailSignup={handleGmailSignup}
      onTermsPress={() => {
        // TODO: Navigate to terms of service
        console.log('Navigate to terms');
      }}
      onPrivacyPress={() => {
        // TODO: Navigate to privacy policy
        console.log('Navigate to privacy');
      }}
    />
  );
}
