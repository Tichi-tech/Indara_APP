import { useRouter } from 'expo-router';

import { CreateMusicScreen, GeneratedTrack } from '@/screens/CreateMusicScreen';
import { usePlayer } from '@/hooks/usePlayer';

export default function CreateRoute() {
  const router = useRouter();
  const { loadAndPlay } = usePlayer();

  const handlePlay = async (track: GeneratedTrack) => {
    await loadAndPlay({
      id: track.id,
      title: track.title,
      artist: 'Indara',
      audio_url: track.audio_url,
    });
    router.replace('/(tabs)/now-playing');
  };

  return (
    <CreateMusicScreen
      onClose={() => router.back()}
      onPlaySong={handlePlay}
    />
  );
}
