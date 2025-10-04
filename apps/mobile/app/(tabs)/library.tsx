import { useRouter } from 'expo-router';

import { MySongsScreen } from '@/screens/MySongsScreen';

export default function LibraryRoute() {
  const router = useRouter();

  return (
    <MySongsScreen onCreate={() => router.push('/create')} />
  );
}
