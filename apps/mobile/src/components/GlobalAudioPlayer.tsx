import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { usePlayer } from '@/hooks/usePlayer';

export type GlobalAudioPlayerProps = {
  onPress?: () => void;
};

function GlobalAudioPlayerComponent({ onPress }: GlobalAudioPlayerProps) {
  const {
    current,
    isPlaying,
    queue,
    toggle,
    next,
  } = usePlayer();

  if (!current) return null;

  const queueLength = queue.length;
  const trackIndex = queue.findIndex((item) => item.id === current.id);

  return (
    <View style={styles.container}>
      <Pressable style={styles.infoBlock} onPress={onPress} accessibilityRole="button">
        <View style={styles.artworkWrap}>
          {current.image_url ? (
            <Image source={{ uri: current.image_url }} style={styles.artwork} />
          ) : (
            <View style={styles.artworkFallback}>
              <Feather name="music" size={20} color="#ffffff" />
            </View>
          )}
        </View>
        <View style={styles.infoText}>
          <Text style={styles.title} numberOfLines={1}>
            {current.title ?? 'Now Playing'}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {queueLength > 1 ? `${trackIndex + 1} of ${queueLength}` : 'Just now'}
          </Text>
        </View>
      </Pressable>

      <View style={styles.controls}>
        <Pressable onPress={toggle} style={styles.playPauseButton} accessibilityRole="button">
          <Feather
            name={isPlaying ? 'pause' : 'play'}
            size={18}
            color="#ffffff"
            style={!isPlaying ? styles.playIconOffset : undefined}
          />
        </Pressable>

        <Pressable onPress={next} style={styles.controlButton} accessibilityRole="button">
          <Feather name="skip-forward" size={18} color="#4b5563" />
        </Pressable>
      </View>
    </View>
  );
}

export const GlobalAudioPlayer = memo(GlobalAudioPlayerComponent);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 110,
    marginHorizontal: 16,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1000,
    elevation: 5,
  },
  infoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  artworkWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  artworkFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
  },
  infoText: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#6b7280',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    marginHorizontal: 4,
  },
  playPauseButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  playIconOffset: {
    marginLeft: 2,
  },
});

export default GlobalAudioPlayer;
