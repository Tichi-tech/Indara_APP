// apps/mobile/app/playlist/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { H1, Card, TrackRow } from '@/ui';
import { mockTracks } from '@/mock';

export default function PlaylistDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScrollView className="flex-1 bg-white dark:bg-black">
      <View className="p-4 gap-4">
        <H1>Playlist {id}</H1>

        <Card className="mt-2">
          {mockTracks.map((item, idx) => (
            <View key={item.id} className="px-1">
              <TrackRow {...item} onPress={() => {}} />
              {idx < mockTracks.length - 1 && (
                <View className="h-px bg-slate-200 dark:bg-neutral-800 mx-1" />
              )}
            </View>
          ))}
        </Card>
      </View>
    </ScrollView>
  );
}
