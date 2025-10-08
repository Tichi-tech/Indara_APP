import { useEffect, useState, useCallback, useMemo, createContext, useContext } from 'react';
import { Platform } from 'react-native';
import TrackPlayer, {
  Event,
  State,
  usePlaybackState,
  useProgress,
  useActiveTrack,
} from 'react-native-track-player';
import * as audioService from '../services/audioService';
import type { Track } from '../types/music';

type PlayerCtx = {
  current?: Track;
  queue: Track[];
  isPlaying: boolean;
  position: number; // milliseconds (for compatibility)
  duration: number; // milliseconds
  loadAndPlay: (t: Track, q?: Track[]) => Promise<void>;
  toggle: () => Promise<void>;
  seekSec: (sec: number) => Promise<void>;
  next: () => Promise<void>;
  prev: () => Promise<void>;
  setRate: (rate: number) => Promise<void>;
  isMiniPlayerVisible: boolean;
  setMiniPlayerVisible: (visible: boolean) => void;
};

const Ctx = createContext<PlayerCtx | null>(null);

export const usePlayer = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
};

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  // ✅ Use RNTP's built-in hooks (zero polling!)
  const playbackState = usePlaybackState();
  const progress = useProgress(); // { position, duration, buffered } in SECONDS
  const activeTrack = useActiveTrack();

  const [queue, setQueue] = useState<Track[]>([]);
  const [isMiniPlayerVisible, setMiniPlayerVisible] = useState(true);

  // Initialize player + restore session
  useEffect(() => {
    const init = async () => {
      await audioService.ensureNotificationPermission();

      const lastSession = await audioService.restoreLastSession();
      if (lastSession) {
        // TODO: Load track from database by lastSession.trackId
        // Then seek to lastSession.position
        console.log('📍 Last session:', lastSession);
      }
    };

    init();
  }, []);

  // ✅ Convert RNTP track to your Track type
  const current = useMemo((): Track | undefined => {
    if (!activeTrack) return undefined;
    return {
      id: activeTrack.id as string,
      title: activeTrack.title || 'Untitled',
      artist: activeTrack.artist || 'Unknown',
      audio_url: activeTrack.url,
      image_url: activeTrack.artwork as string | undefined,
    };
  }, [activeTrack]);

  // ✅ Determine playing state
  const isPlaying = useMemo(
    () =>
      playbackState.state === State.Playing ||
      playbackState.state === State.Buffering,
    [playbackState.state]
  );

  // ✅ Convert position/duration to milliseconds (for existing UI compatibility)
  const position = Math.floor(progress.position * 1000);
  const duration = Math.floor(progress.duration * 1000);

  // ✅ Save position every 5 seconds
  useEffect(() => {
    if (current && progress.position > 0) {
      audioService.saveProgress(progress.position, current.id);
    }
  }, [progress.position, current]);

  // ✅ Load and play track with queue
  const loadAndPlay = useCallback(async (track: Track, q?: Track[]) => {
    const tracks = q || [track];
    setQueue(tracks);

    const index = tracks.findIndex((t) => t.id === track.id);
    await audioService.setQueue(
      tracks.map((t) => ({
        id: t.id,
        url: t.audio_url || '',
        title: t.title,
        artist: t.artist || 'Indara',
        artwork: t.image_url ?? undefined, // Convert null to undefined for RNTP
      })),
      index
    );

    await TrackPlayer.play();
    setMiniPlayerVisible(true);
  }, []);

  // ✅ Toggle play/pause
  const toggle = useCallback(async () => {
    if (isPlaying) {
      await audioService.pause();
    } else {
      await audioService.play();
    }
  }, [isPlaying]);

  // ✅ Seek (convert seconds to match RNTP API)
  const seekSec = useCallback(async (sec: number) => {
    await audioService.seekTo(sec);
  }, []);

  // ✅ Next/previous
  const next = useCallback(async () => {
    await audioService.skipToNext();
  }, []);

  const prev = useCallback(async () => {
    await audioService.skipToPrevious();
  }, []);

  // ✅ Playback rate
  const setRate = useCallback(async (rate: number) => {
    await audioService.setRate(rate);
  }, []);

  // ✅ Handle queue ended
  useEffect(() => {
    const subscription = TrackPlayer.addEventListener(
      Event.PlaybackQueueEnded,
      () => {
        console.log('🎵 Queue ended');
        // Optional: Loop queue, navigate home, etc.
      }
    );

    return () => subscription.remove();
  }, []);

  // ✅ Memoized context value
  const value = useMemo(
    () => ({
      current,
      queue,
      isPlaying,
      position,
      duration,
      loadAndPlay,
      toggle,
      seekSec,
      next,
      prev,
      setRate,
      isMiniPlayerVisible,
      setMiniPlayerVisible,
    }),
    [
      current,
      queue,
      isPlaying,
      position,
      duration,
      loadAndPlay,
      toggle,
      seekSec,
      next,
      prev,
      setRate,
      isMiniPlayerVisible,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
