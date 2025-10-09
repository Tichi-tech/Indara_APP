import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Alert } from 'react-native';
import { supabase } from './src/lib/supabase';

export default function App() {
  const testSupabase = async () => {
    try {
      const { data: s } = await supabase.auth.getSession();
      const { data, error } = await supabase.from('profiles').select('*').limit(1);
      if (error) throw error;
      Alert.alert('Phase 2 ✅', `session: ${!!s?.session}\nrows: ${data?.length ?? 0}`);
    } catch (e: any) {
      Alert.alert('Supabase error', String(e?.message ?? e));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 22, fontWeight: '600', marginBottom: 12 }}>🎵 Indara Mobile</Text>
      <Button title="Test Supabase" onPress={testSupabase} />
    </SafeAreaView>
  );
}
