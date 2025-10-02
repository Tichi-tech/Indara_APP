// apps/mobile/app/(tabs)/index.tsx
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { H1, PlaylistCard, TrackRow } from '@/ui';
import { mockPlaylists, mockTracks } from '@/mock';

export default function Home() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-white dark:bg-black">
      <View className="p-4 gap-4">
        {/* NativeWind Test */}
        <View className="p-8 bg-red-200 rounded-2xl mb-4">
          <H1>Style test</H1>
        </View>

        <H1>Playlists</H1>

        {/* grid of playlist cards */}
        <View className="flex-row flex-wrap gap-3">
          {mockPlaylists.map((item) => (
            <View key={item.id} className="w-[48%]">
              <PlaylistCard
                {...item}
                coverUri={`https://picsum.photos/seed/${item.id}/400`}
                onPress={(id) => router.push(`/playlist/${id}`)}
              />
            </View>
          ))}
        </View>

        <H1 className="mt-4">Tracks</H1>

        {/* carded track list */}
        <View className="bg-white dark:bg-neutral-900 rounded-2xl p-2 shadow">
          {mockTracks.map((item, idx) => (
            <View key={item.id} className="px-1">
              <TrackRow
                {...item}
                onPress={() => router.push('/(tabs)/now-playing')}
              />
              {idx < mockTracks.length - 1 && (
                <View className="h-px bg-slate-200 dark:bg-neutral-800 mx-1" />
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
