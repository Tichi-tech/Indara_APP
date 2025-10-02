import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { useTracks } from '../../src/hooks/useTracks';
import { usePlayer } from '../../src/hooks/usePlayer';

export default function Home() {
  const { tracks } = useTracks();
  const player = usePlayer();

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={tracks}
        keyExtractor={(t) => t.id}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#eee' }} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => player.loadAndPlay(item, tracks)}>
            <View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.artist}>{item.artist}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  row: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  artist: {
    color: '#666',
    marginTop: 4,
  },
});
