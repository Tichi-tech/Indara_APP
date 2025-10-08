import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Alert } from 'react-native';

import { AgeSelectionScreen } from '@/screens/AgeSelectionScreen';
import { supabase } from '@/lib/supabase';

export default function AgeSelectionRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ name?: string }>();
  const userName = params.name || 'User';
  const [isLoading, setIsLoading] = useState(false);

  const handleAgeSelected = async (ageGroup: '21+' | '15-21') => {
    setIsLoading(true);

    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('Failed to get user session');
      }

      // Save age group to profile
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          age_group: ageGroup,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (updateError) {
        throw updateError;
      }

      console.log('✅ Age group saved:', ageGroup);

      // Navigate to home screen (tabs)
      router.replace('/(tabs)');
    } catch (error) {
      console.error('❌ Failed to save age group:', error);

      Alert.alert(
        'Something went wrong',
        'We couldn\'t save your age selection. Please try again.',
        [
          {
            text: 'Try Again',
            onPress: () => setIsLoading(false),
          },
        ]
      );
    }
  };

  return (
    <AgeSelectionScreen
      userName={userName}
      onAgeSelected={handleAgeSelected}
      isLoading={isLoading}
    />
  );
}
