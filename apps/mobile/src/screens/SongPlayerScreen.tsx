import { memo, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { musicApi } from '@/services/musicApi';
import type { Track } from '@/types/music';
import { getSmartThumbnail } from '@/utils/thumbnailMatcher';
import { useAuth } from '@/hooks/useAuth';
import { ShareSongScreen } from '@/screens/ShareSongScreen';

export type PlayerSong = {
  id: string;
  title: string;
  description?: string;
  tags?: string;
  audio_url?: string;
  image_url?: string;
  creator?: string;
};

type SongPlayerScreenProps = {
  song: PlayerSong;
  onBack?: () => void;
  bottomNavProps?: BottomNavProps;
  onCreate?: () => void;
  onLibrary?: () => void;
  onInbox?: () => void;
  onAccount?: () => void;
  accountInitial?: string;
};

function SongPlayerScreenComponent({
  song,
  onBack,
  bottomNavProps,
  onCreate,
  onLibrary,
  onInbox,
  onAccount,
  accountInitial = 'S',
}: SongPlayerScreenProps) {
  const {
    current,
    isPlaying,
    loadAndPlay,
    toggle,
    seekSec,
    position,
    duration,
    setMiniPlayerVisible,
  } = usePlayer();
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const mergedNav = useMemo<BottomNavProps | null>(() => {
    if (bottomNavProps) return bottomNavProps;
    return {
      active: 'home',
      onHome: onBack,
      onLibrary,
      onCreate,
      onInbox,
      onAccount,
      accountInitial,
    };
  }, [accountInitial, bottomNavProps, onAccount, onBack, onCreate, onInbox, onLibrary]);

  const coverImage = useMemo(() => {
    if (song.image_url) return song.image_url;
    return getSmartThumbnail(song.title, song.description ?? '', song.tags ?? '');
  }, [song.description, song.image_url, song.tags, song.title]);

  useEffect(() => {
    const loadTrack = async () => {
      if (!song.audio_url) return;

      const queue: Track[] = [
        {
          id: song.id,
          title: song.title,
          artist: song.creator ?? 'You',
          audio_url: song.audio_url,
          image_url: coverImage,
        },
      ];

      await loadAndPlay(queue[0], queue);
    };

    if (!current || current.id !== song.id) {
      void loadTrack();
    }
  }, [coverImage, current, loadAndPlay, song.audio_url, song.creator, song.id, song.title]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await musicApi.getTrackStats(song.id, user?.id ?? undefined);
      if (data) {
        setLikeCount(data.likes);
        setIsLiked(Boolean(data.isLiked));
      }
    };

    void fetchStats();
  }, [song.id, user?.id]);

  useEffect(() => {
    setMiniPlayerVisible?.(false);
    return () => setMiniPlayerVisible?.(true);
  }, [setMiniPlayerVisible]);

  const handleTogglePlay = async () => {
    await toggle();
  };

  const handleRestart = async () => {
    await seekSec(0);
  };

  const handleLikeToggle = async () => {
    if (loadingLike || !user?.id) return;
    setLoadingLike(true);
    try {
      const { data, error } = await musicApi.likeTrack(user.id, song.id);
      if (error || !data) return;
      setIsLiked(data.liked);
      setLikeCount((prev) => Math.max(0, prev + (data.liked ? 1 : -1)));
    } finally {
      setLoadingLike(false);
    }
  };

  const progress = duration > 0 ? position / duration : 0;

  if (showShare) {
    return (
      <ShareSongScreen
        song={{
          id: song.id,
          title: song.title,
          description: song.description ?? '',
          tags: song.tags ?? '',
          plays: 0,
          likes: likeCount,
          image: coverImage,
          version: '1.0',
          isPublic: true,
          createdAt: new Date().toISOString(),
          creator: song.creator ?? 'You',
          isLiked,
        }}
        onClose={() => setShowShare(false)}
        onPublish={() => setShowShare(false)}
        onCopy={() => setShowShare(false)}
        onShare={() => setShowShare(false)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Pressable onPress={onBack} style={styles.backButton} accessibilityRole="button">
          <Feather name="arrow-left" size={20} color="#111827" />
        </Pressable>

        <View style={styles.artworkWrap}>
          <Image source={{ uri: coverImage }} style={styles.artwork} />
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.title}>{song.title}</Text>
          {song.description ? <Text style={styles.subtitle}>{song.description}</Text> : null}
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.likeButton, isLiked && styles.likeButtonActive]}
            onPress={handleLikeToggle}
            accessibilityRole="button"
            disabled={loadingLike}
          >
            {loadingLike ? (
              <ActivityIndicator size="small" color={isLiked ? '#ffffff' : '#111827'} />
            ) : (
              <Feather name="heart" size={18} color={isLiked ? '#ffffff' : '#111827'} />
            )}
            <Text style={[styles.likeLabel, isLiked && styles.likeLabelActive]}>{likeCount}</Text>
          </Pressable>
          <Pressable
            style={styles.shareButton}
            accessibilityRole="button"
            onPress={() => setShowShare(true)}
          >
            <Feather name="share-2" size={18} color="#111827" />
          </Pressable>
        </View>

        <View style={styles.controls}>
          <Pressable onPress={handleRestart} accessibilityRole="button">
            <Feather name="rotate-ccw" size={22} color="#111827" />
          </Pressable>
          <Pressable
            onPress={handleTogglePlay}
            accessibilityRole="button"
            style={styles.playButton}
          >
            <Feather name={isPlaying ? 'pause' : 'play'} size={24} color="#ffffff" />
          </Pressable>
          <View style={styles.progressWrap}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        {mergedNav ? <BottomNav {...mergedNav} /> : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    padding: 20,
    gap: 24,
    backgroundColor: '#f8fafc',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  artworkWrap: {
    marginTop: 12,
    alignItems: 'center',
  },
  artwork: {
    width: 280,
    height: 280,
    borderRadius: 32,
  },
  infoBlock: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: '#e2e8f0',
  },
  likeButtonActive: {
    backgroundColor: '#ef4444',
  },
  likeLabel: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  likeLabelActive: {
    color: '#ffffff',
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 16,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressWrap: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e2e8f0',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#111827',
  },
});

export const SongPlayerScreen = memo(SongPlayerScreenComponent);

export default SongPlayerScreen;
