import { memo, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

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
};

function SongPlayerScreenComponent({
  song,
  onBack,
}: SongPlayerScreenProps) {
  const {
    current,
    isPlaying,
    loadAndPlay,
    toggle,
    seekSec,
    position,
    duration,
  } = usePlayer();
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [dislikeCount, setDislikeCount] = useState(42);
  const [commentCount, setCommentCount] = useState(156);

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

      // If user likes, remove dislike
      if (data.liked && isDisliked) {
        setIsDisliked(false);
        setDislikeCount((prev) => prev - 1);
      }
    } finally {
      setLoadingLike(false);
    }
  };

  const handleDislike = () => {
    setIsDisliked((prev) => !prev);
    setDislikeCount((prev) => (isDisliked ? prev - 1 : prev + 1));

    // If user dislikes, remove like
    if (!isDisliked && isLiked) {
      setIsLiked(false);
      setLikeCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleComment = () => {
    console.log('Opening comments...');
    // TODO: Implement comment functionality
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Convert to seconds for slider
  const durationSec = (duration || 1) / 1000;
  const positionSec = position / 1000;

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
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: coverImage }}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Gradient Overlay */}
        <View style={styles.gradientOverlay} />

        {/* Content */}
        <SafeAreaView style={styles.contentContainer}>
          {/* Top Header */}
          <View style={styles.header}>
            <Pressable onPress={onBack} style={styles.headerButton} accessibilityRole="button">
              <Feather name="arrow-left" size={24} color="#ffffff" />
            </Pressable>

            <Pressable style={styles.headerButton} accessibilityRole="button">
              <Feather name="chevron-down" size={24} color="#ffffff" />
            </Pressable>
          </View>

          {/* Artist Info */}
          <View style={styles.artistSection}>
            <View style={styles.artistAvatar}>
              <Text style={styles.artistAvatarText}>
                {(song.creator || 'You').charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.artistName}>{song.creator || 'You'}</Text>
          </View>

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Right Side Action Buttons */}
          <View style={styles.actionButtons}>
            {/* Like Button */}
            <Pressable
              onPress={handleLikeToggle}
              disabled={!user || loadingLike}
              style={styles.actionButton}
              accessibilityRole="button"
            >
              {loadingLike ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Feather
                    name="thumbs-up"
                    size={24}
                    color="#ffffff"
                    style={isLiked ? styles.iconFilled : undefined}
                  />
                  <Text style={styles.actionButtonText}>
                    {likeCount >= 1000 ? `${(likeCount / 1000).toFixed(1)}k` : likeCount}
                  </Text>
                </>
              )}
            </Pressable>

            {/* Dislike Button */}
            <Pressable
              onPress={handleDislike}
              style={styles.actionButton}
              accessibilityRole="button"
            >
              <Feather
                name="thumbs-down"
                size={24}
                color="#ffffff"
                style={isDisliked ? styles.iconFilled : undefined}
              />
              <Text style={styles.actionButtonText}>{dislikeCount}</Text>
            </Pressable>

            {/* Comment Button */}
            <Pressable
              onPress={handleComment}
              style={styles.actionButton}
              accessibilityRole="button"
            >
              <Feather name="message-circle" size={24} color="#ffffff" />
              <Text style={styles.actionButtonText}>{commentCount}</Text>
            </Pressable>

            {/* Share Button */}
            <Pressable
              onPress={() => setShowShare(true)}
              style={styles.actionButton}
              accessibilityRole="button"
            >
              <Feather name="share-2" size={24} color="#ffffff" />
            </Pressable>
          </View>

          {/* Bottom Content */}
          <View style={styles.bottomContent}>
            {/* Song Info */}
            <View style={styles.songInfo}>
              <Text style={styles.songTitle}>{song.title || 'Generated music content'}</Text>
              <Text style={styles.songDescription}>
                {song.description || 'user prompt summary'}
              </Text>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              <Pressable onPress={handleRestart} style={styles.controlButton}>
                <Feather name="rotate-ccw" size={24} color="#ffffff" />
              </Pressable>

              <Pressable onPress={handleTogglePlay} style={styles.controlButton}>
                {isPlaying ? (
                  <View style={styles.pauseIcon}>
                    <View style={styles.pauseBar} />
                    <View style={styles.pauseBar} />
                  </View>
                ) : (
                  <Feather name="play" size={24} color="#ffffff" />
                )}
              </Pressable>

              <View style={styles.progressContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={durationSec}
                  value={positionSec}
                  onSlidingComplete={(sec) => seekSec(sec)}
                  minimumTrackTintColor="#ffffff"
                  maximumTrackTintColor="rgba(255,255,255,0.3)"
                  thumbTintColor="#ffffff"
                  step={0.1}
                />
              </View>

              <Text style={styles.timeText}>{formatTime(position)}</Text>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  artistSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  artistAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ec4899',
    alignItems: 'center',
    justifyContent: 'center',
  },
  artistAvatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  artistName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
  spacer: {
    flex: 1,
  },
  actionButtons: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -120 }],
    gap: 24,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  iconFilled: {
    opacity: 1,
  },
  bottomContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  songInfo: {
    marginBottom: 32,
  },
  songTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    lineHeight: 36,
  },
  songDescription: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 24,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  controlButton: {
    padding: 8,
  },
  pauseIcon: {
    flexDirection: 'row',
    gap: 4,
  },
  pauseBar: {
    width: 6,
    height: 24,
    backgroundColor: '#ffffff',
    borderRadius: 3,
  },
  progressContainer: {
    flex: 1,
  },
  slider: {
    width: '100%',
    height: 4,
  },
  timeText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
    minWidth: 50,
    textAlign: 'right',
  },
});

export const SongPlayerScreen = memo(SongPlayerScreenComponent);

export default SongPlayerScreen;
