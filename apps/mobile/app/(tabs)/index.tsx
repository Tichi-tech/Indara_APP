import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { H1, PlaylistCard, TrackRow } from '@/ui';
import { mockPlaylists, mockTracks } from '@/mock/data';

export default function Home() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-white dark:bg-black">
      <View className="p-4 gap-4">
        <H1>Playlists</H1>
        {mockPlaylists.map(item => (
          <PlaylistCard
            key={item.id}
            {...item}
            onPress={(id) => router.push(`/playlist/${id}`)}
          />
        ))}

        <H1 className="mt-4">Tracks</H1>
        {mockTracks.map(item => (
          <TrackRow
            key={item.id}
            {...item}
            onPress={() => router.push('/(tabs)/now-playing')}
          />
        ))}
      </View>
    </ScrollView>
  );
}
