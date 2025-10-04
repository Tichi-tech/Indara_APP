import { memo } from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { getSmartThumbnail } from '@/utils/thumbnailMatcher';

type ShareSong = {
  id: string;
  title: string;
  description: string;
  tags: string;
  plays: number;
  likes: number;
  image?: string;
  version: string;
  isPublic: boolean;
  createdAt: string;
  creator?: string;
  isLiked?: boolean;
};

type ShareSongScreenProps = {
  song: ShareSong;
  visible?: boolean;
  onClose: () => void;
  onPublish: () => void;
  onCopy: () => void;
  onShare: () => void;
};

function ShareSongScreenComponent({ song, visible = true, onClose, onPublish, onCopy, onShare }: ShareSongScreenProps) {
  const imageUrl = song.image ?? getSmartThumbnail(song.title, song.description, song.tags);
  const creatorInitial = (song.creator ?? 'You').slice(0, 1).toUpperCase();

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Pressable onPress={onClose} style={styles.closeButton} accessibilityRole="button">
            <Feather name="x" size={20} color="#111827" />
          </Pressable>

          <Image source={{ uri: imageUrl }} style={styles.artwork} />

          <View style={styles.infoBlock}>
            <Text style={styles.title}>{song.title}</Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              {song.description}
            </Text>
            <View style={styles.creatorWrap}>
              <View style={styles.creatorBadge}>
                <Text style={styles.creatorInitial}>{creatorInitial}</Text>
              </View>
              <Text style={styles.creatorLabel}>{song.creator ?? 'You'}</Text>
            </View>
          </View>

          <View style={styles.buttonStack}>
            <Pressable onPress={onPublish} style={styles.primaryButton} accessibilityRole="button">
              <Text style={styles.primaryLabel}>Publish to community</Text>
            </Pressable>
            <Pressable onPress={onCopy} style={styles.secondaryButton} accessibilityRole="button">
              <Feather name="link" size={16} color="#111827" />
              <Text style={styles.secondaryLabel}>Copy link</Text>
            </Pressable>
            <Pressable onPress={onShare} style={styles.secondaryButton} accessibilityRole="button">
              <Feather name="share-2" size={16} color="#111827" />
              <Text style={styles.secondaryLabel}>Share to Instagram</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    padding: 20,
    gap: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  artwork: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 24,
  },
  infoBlock: {
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#475569',
  },
  creatorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  creatorBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorInitial: {
    color: '#ffffff',
    fontWeight: '700',
  },
  creatorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  buttonStack: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#111827',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryLabel: {
    color: '#ffffff',
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  secondaryLabel: {
    fontWeight: '600',
    color: '#111827',
  },
});

export const ShareSongScreen = memo(ShareSongScreenComponent);

export default ShareSongScreen;
