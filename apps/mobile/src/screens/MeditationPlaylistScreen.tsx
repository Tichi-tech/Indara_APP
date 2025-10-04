import { memo, useMemo } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { BottomNav, type BottomNavProps } from '@/components/BottomNav';
import { usePlayer } from '@/hooks/usePlayer';
import { getSmartThumbnail } from '@/utils/thumbnailMatcher';
import type { Track } from '@/types/music';

type MeditationPlaylistScreenProps = {
  onBack?: () => void;
  onCreateMusic?: () => void;
  onLibrary?: () => void;
  onInbox?: () => void;
  onAccount?: () => void;
  bottomNavProps?: BottomNavProps;
  accountInitial?: string;
};

type MeditationTrack = {
  id: string;
  title: string;
  description: string;
  durationLabel: string;
  audioUrl: string;
  imageUrl: string;
};

const BASE_TRACKS: Array<Omit<MeditationTrack, 'imageUrl'>> = [
  {
    id: 'morning-rise',
    title: 'Morning Rise',
    description: 'Gentle awakening mindfulness',
    durationLabel: '5 min',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 'breath-anchor',
    title: 'Breath Anchor',
    description: 'Guided breathing for focus',
    durationLabel: '4 min',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 'body-scan',
    title: 'Body Scan Restore',
    description: 'Progressive relaxation journey',
    durationLabel: '7 min',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: 'calm-current',
    title: 'Calm Current',
    description: 'Stress release visualisation',
    durationLabel: '6 min',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
  {
    id: 'inner-light',
    title: 'Inner Light',
    description: 'Loving kindness meditation',
    durationLabel: '8 min',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  },
  {
    id: 'deep-rest',
    title: 'Deep Rest',
    description: 'Sleep preparation ritual',
    durationLabel: '10 min',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  },
];

function MeditationPlaylistScreenComponent({
  onBack,
  onCreateMusic,
  onLibrary,
  onInbox,
  onAccount,
  bottomNavProps,
  accountInitial = 'S',
}: MeditationPlaylistScreenProps) {
  const { loadAndPlay, current, isPlaying, toggle } = usePlayer();

  const mergedBottomNav = useMemo<BottomNavProps | null>(() => {
    if (bottomNavProps) return bottomNavProps;
    return {
      active: 'home',
      onHome: onBack,
      onCreate: onCreateMusic,
      onLibrary,
      onInbox,
      onAccount,
      accountInitial,
    };
  }, [accountInitial, bottomNavProps, onAccount, onBack, onCreateMusic, onInbox, onLibrary]);

  const tracks: MeditationTrack[] = useMemo(
    () =>
      BASE_TRACKS.map((track) => ({
        ...track,
        imageUrl: getSmartThumbnail(track.title, track.description, 'meditation calm'),
      })),
    []
  );

  const queue: Track[] = useMemo(
    () =>
      tracks.map((item) => ({
        id: item.id,
        title: item.title,
        artist: 'Meditation Guide',
        audio_url: item.audioUrl,
        image_url: item.imageUrl,
      })),
    [tracks]
  );

  const handlePlay = async (track: MeditationTrack) => {
    const isCurrent = current?.id === track.id;
    if (isCurrent) {
      await toggle();
      return;
    }

    const playable = queue.find((item) => item.id === track.id);
    if (!playable) return;
    await loadAndPlay(playable, queue);
  };

  const renderItem = ({ item }: { item: MeditationTrack }) => {
    const isActive = current?.id === item.id;
    const playing = isActive && isPlaying;
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => handlePlay(item)}
        style={[styles.row, isActive && styles.rowActive]}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.cover} />
        <View style={styles.rowCopy}>
          <Text style={styles.rowTitle}>{item.title}</Text>
          <Text style={styles.rowSubtitle}>{item.description}</Text>
          <View style={styles.rowMeta}>
            <Feather name="clock" size={14} color="#64748b" />
            <Text style={styles.rowMetaLabel}>{item.durationLabel}</Text>
          </View>
        </View>
        <Feather name={playing ? 'pause-circle' : 'play-circle'} size={24} color={playing ? '#0f766e' : '#94a3b8'} />
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.headerButton}>
            <Feather name="arrow-left" size={20} color="#0f172a" />
          </Pressable>
          <Text style={styles.headerTitle}>Meditation</Text>
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.headerButton}>
            <Feather name="x" size={20} color="#0f172a" />
          </Pressable>
        </View>

        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />

        {mergedBottomNav ? <BottomNav {...mergedBottomNav} /> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 220,
  },
  separator: {
    height: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: '#f8fafc',
    padding: 16,
    gap: 16,
  },
  rowActive: {
    backgroundColor: '#ecfdf5',
  },
  cover: {
    width: 56,
    height: 56,
    borderRadius: 18,
  },
  rowCopy: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  rowSubtitle: {
    fontSize: 12,
    color: '#475569',
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  rowMetaLabel: {
    fontSize: 12,
    color: '#475569',
  },
});

export const MeditationPlaylistScreen = memo(MeditationPlaylistScreenComponent);

export default MeditationPlaylistScreen;
