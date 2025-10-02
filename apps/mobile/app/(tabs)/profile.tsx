import { View } from 'react-native';
import { H1, P, Button } from '@/ui';
import { supabase } from '../../src/lib/supabase';

export default function Profile() {
  return (
    <View className="flex-1 p-4 bg-white dark:bg-black">
      <H1>Profile</H1>
      <P className="my-3">User settings</P>
      <Button title="Sign out" onPress={() => supabase.auth.signOut()} />
    </View>
  );
}
