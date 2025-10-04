import { useLocalSearchParams, useRouter } from 'expo-router';

import { PlaylistScreen } from '@/screens/PlaylistScreen';

export default function PlaylistRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; name?: string; description?: string }>();

  const playlistId = params.id;
  const title = params.name ? decodeURIComponent(params.name) : 'Playlist';
  const description = params.description ? decodeURIComponent(params.description) : undefined;

  return (
    <PlaylistScreen
      playlistId={playlistId}
      playlistName={title}
      playlistDescription={description}
      onBack={() => router.back()}
      onCreate={() => router.push('/create')}
      onLibrary={() => router.push('/(tabs)/library')}
      onInbox={() => router.push('/(tabs)/inbox')}
      onAccount={() => router.push('/(tabs)/profile')}
    />
  );
}
