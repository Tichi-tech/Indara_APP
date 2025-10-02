import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) return router.replace('/(auth)/signin');
      if (!session) {
        await new Promise(r => setTimeout(r, 400));
        const { data } = await supabase.auth.getSession();
        if (!data.session) return router.replace('/(auth)/signin');
      }
      router.replace('/(tabs)');
    })();
  }, [router]);

  return null;
}
