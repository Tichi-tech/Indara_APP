import { useEffect, useMemo, useRef, useState, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Track } from '../types/music';
import { audioService } from '../services/audioService';

type PlayerCtx = {
  current?: Track;
  queue: Track[];
  isPlaying: boolean;
  position: number;
  duration: number;
  loadAndPlay: (t: Track, q?: Track[]) => Promise<void>;
  toggle: () => Promise<void>;
  seekSec: (sec: number) => Promise<void>;
  next: () => Promise<void>;
  prev: () => Promise<void>;
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
  const [current, setCurrent] = useState<Track | undefined>();
  const [queue, setQueue] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const idxRef = useRef(0);
  const [isMiniPlayerVisible, setMiniPlayerVisible] = useState(true);

  useEffect(() => {
    audioService.init();
  }, []);

  useEffect(() => {
    const off = audioService.subscribe((s) => {
      setIsPlaying(s.isPlaying);
      setPosition(s.positionMs);
      setDuration(s.durationMs);

      // Auto-advance to next track when current finishes
      if (s.durationMs > 0 && s.positionMs >= s.durationMs - 100) {
        next();
      }
    });
    return off;
  }, [queue]);

  const loadAndPlay = async (t: Track, q?: Track[]) => {
    if (q) {
      setQueue(q);
      idxRef.current = q.findIndex((x) => x.id === t.id) ?? 0;
    }
    setCurrent(t);
    setMiniPlayerVisible(true); // Ensure mini player is visible
    if (t.audio_url) {
      await audioService.load(t.audio_url, true);
      await AsyncStorage.setItem('lastTrack', JSON.stringify({ id: t.id }));
    }
  };

  const toggle = async () => {
    if (isPlaying) {
      await audioService.pause();
    } else {
      await audioService.play();
    }
  };

  const seekSec = async (sec: number) => {
    await audioService.seek(Math.max(0, Math.floor(sec * 1000)));
  };

  const next = async () => {
    if (!queue.length) return;
    idxRef.current = (idxRef.current + 1) % queue.length;
    const t = queue[idxRef.current];
    setCurrent(t);
    if (t.audio_url) {
      await audioService.load(t.audio_url, true);
    }
  };

  const prev = async () => {
    if (!queue.length) return;
    idxRef.current = (idxRef.current - 1 + queue.length) % queue.length;
    const t = queue[idxRef.current];
    setCurrent(t);
    if (t.audio_url) {
      await audioService.load(t.audio_url, true);
    }
  };

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
      isMiniPlayerVisible,
      setMiniPlayerVisible,
    }),
    [current, queue, isPlaying, position, duration, isMiniPlayerVisible]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
