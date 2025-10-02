// apps/mobile/app/(tabs)/profile.tsx
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { H1, P, Button } from '@/ui';
import { supabase } from '@/lib/supabase';

export default function Profile() {
  const router = useRouter();

  const onSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/(auth)/signin');
    } catch (e) {
      console.error('Sign out error:', e);
    }
  };

  return (
    <View className="flex-1 p-4 bg-white dark:bg-black">
      <H1>Profile</H1>
      <P className="my-3">User settings</P>
      <Button title="Sign out" onPress={onSignOut} />
    </View>
  );
}
