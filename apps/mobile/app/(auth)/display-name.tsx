import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { DisplayNameScreen } from '@/screens/DisplayNameScreen';
import { supabase } from '@/lib/supabase';

export default function DisplayNameRoute() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async (name: string) => {
    setIsLoading(true);

    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Failed to get user session');
      }

      // Save display name to profile
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: name.trim(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (updateError) {
        throw updateError;
      }

      console.log('✅ Display name saved:', name);

      // Navigate to age selection with name parameter
      router.push({
        pathname: '/(auth)/age-selection',
        params: { name: name.trim() },
      });
    } catch (error) {
      console.error('❌ Failed to save display name:', error);

      Alert.alert(
        'Something went wrong',
        'We couldn\'t save your name. Please try again.',
        [
          {
            text: 'Try Again',
            onPress: () => setIsLoading(false),
          },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DisplayNameScreen
      onBack={() => router.back()}
      onContinue={handleContinue}
    />
  );
}
