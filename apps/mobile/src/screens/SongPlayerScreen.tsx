import { memo, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  TouchableWithoutFeedback,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { usePlayer } from '@/hooks/usePlayer';
import { musicApi } from '@/services/musicApi';
import type { Track } from '@/types/music';
import { getSmartThumbnail } from '@/utils/thumbnailMatcher';
import { useAuth } from '@/hooks/useAuth';
import { ShareSongScreen } from '@/screens/ShareSongScreen';
import { CommentModal } from '@/components/CommentModal';

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
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);
  const seekBarRef = useRef<View>(null);
  const seekBarWidth = useRef(0);
  const finalSeekPosition = useRef(0);
  const rafId = useRef<number | null>(null);
  const durationRef = useRef(0);
  const seekSecRef = useRef(seekSec);

  const coverImage = useMemo(() => {
    if (song.image_url) return song.image_url;
    return getSmartThumbnail(song.title, song.description ?? '', song.tags ?? '');
  }, [song.description, song.image_url, song.tags, song.title]);

  // Throttled seek position update using requestAnimationFrame
  const updateSeekPosition = useCallback((newSec: number) => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
    }
    rafId.current = requestAnimationFrame(() => {
      setSeekPosition(newSec);
      rafId.current = null;
    });
  }, []);

  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  // Update refs when duration or seekSec changes
  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    seekSecRef.current = seekSec;
  }, [seekSec]);

  // Custom seekbar PanResponder - use refs to avoid stale closures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        const dur = durationRef.current;
        return Number.isFinite(dur) && dur > 0;
      },
      onMoveShouldSetPanResponder: () => {
        const dur = durationRef.current;
        return Number.isFinite(dur) && dur > 0;
      },
      onPanResponderGrant: (evt) => {
        const dur = durationRef.current;
        if (!Number.isFinite(dur) || dur <= 0) return;
        const durSec = dur / 1000;

        setIsSeeking(true);
        const touchX = evt.nativeEvent.locationX;
        const ratio = Math.max(0, Math.min(touchX / Math.max(seekBarWidth.current, 1), 1));
        const newSec = ratio * durSec;
        finalSeekPosition.current = newSec;
        updateSeekPosition(newSec);
      },
      onPanResponderMove: (evt) => {
        const dur = durationRef.current;
        if (!Number.isFinite(dur) || dur <= 0) return;
        const durSec = dur / 1000;

        const touchX = evt.nativeEvent.locationX;
        const ratio = Math.max(0, Math.min(touchX / Math.max(seekBarWidth.current, 1), 1));
        const newSec = ratio * durSec;
        finalSeekPosition.current = newSec;
        updateSeekPosition(newSec);
      },
      onPanResponderRelease: async () => {
        const dur = durationRef.current;
        if (!Number.isFinite(dur) || dur <= 0) return;
        const durSec = dur / 1000;

        const seekTo = Math.max(0, Math.min(finalSeekPosition.current, durSec));
        setIsSeeking(false);
        await seekSecRef.current(seekTo);
      },
    })
  ).current;

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

  // Fetch comment count only when modal is opened or after closing
  const updateCommentCount = useCallback(async () => {
    const { data: count } = await musicApi.getCommentCount(song.id);
    setCommentCount(count);
  }, [song.id]);

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

  const handleComment = async () => {
    setShowComments(true);
    // Load comment count in background when opening
    if (commentCount === 0) {
      await updateCommentCount();
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Convert to seconds for slider
  const hasDuration = Number.isFinite(duration) && duration > 0;
  const durationSec = hasDuration ? duration / 1000 : 0;
  const currentPositionSec = position / 1000;
  const displayPositionSec = isSeeking ? seekPosition : currentPositionSec;

  // Avoid NaN/Infinity in % width
  const pct = hasDuration ? (displayPositionSec / durationSec) * 100 : 0;

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
        pointerEvents="box-none"
      >
        {/* Gradient Overlay */}
        <View style={styles.gradientOverlay} pointerEvents="none" />

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
              <Feather name="share-2" size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>PUBLISH</Text>
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

            {/* Custom Seekbar */}
            <View style={styles.sliderRow}>
              <View
                ref={seekBarRef}
                style={styles.seekBarContainer}
                onLayout={(e) => {
                  seekBarWidth.current = e.nativeEvent.layout.width;
                }}
                pointerEvents={hasDuration ? 'auto' : 'none'}
                {...(hasDuration ? panResponder.panHandlers : {})}
              >
                {/* Track background */}
                <View style={styles.seekBarTrack} />
                {/* Progress */}
                <View
                  style={[
                    styles.seekBarProgress,
                    { width: `${pct}%` },
                  ]}
                />
                {/* Thumb */}
                <View
                  style={[
                    styles.seekBarThumb,
                    { left: `${pct}%` },
                  ]}
                />
              </View>
              <Text style={styles.timeText}>{formatTime(position)} / {formatTime(duration)}</Text>
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
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>

      {/* Comment Modal */}
      <CommentModal
        visible={showComments}
        trackId={song.id}
        onClose={() => {
          setShowComments(false);
          // Refresh comment count when closing
          void updateCommentCount();
        }}
      />
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
    fontSize: 10,
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
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  seekBarContainer: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  seekBarTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  seekBarProgress: {
    position: 'absolute',
    height: 4,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  seekBarThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginLeft: -8,
    top: '50%',
    marginTop: -8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
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
  timeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    minWidth: 100,
  },
});

export const SongPlayerScreen = memo(SongPlayerScreenComponent);

export default SongPlayerScreen;
