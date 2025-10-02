import { useLocalSearchParams } from 'expo-router';
import { View, ScrollView } from 'react-native';
import { H1, TrackRow } from '@/ui';
import { mockTracks } from '@/mock/data';

export default function PlaylistDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScrollView className="flex-1 p-4 bg-white dark:bg-black">
      <H1>Playlist {id}</H1>
      <View className="mt-4">
        {mockTracks.map(item => (
          <TrackRow key={item.id} {...item} onPress={() => {}} />
        ))}
      </View>
    </ScrollView>
  );
}
