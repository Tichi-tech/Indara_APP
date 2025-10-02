import { useEffect, useMemo, useRef, useState } from 'react';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';

type Source = number | string; // require('...mp3') -> number, or remote URL string

export type UseIndaraAudioOptions = {
  loop?: boolean;
  playsInSilentModeIOS?: boolean;
  onEnd?: () => void;
};

/**
 * Indara's audio player hook powered by expo-audio.
 * Provides play/pause/stop/seekTo controls for meditation and healing music.
 *
 * @param source - Audio file (require('./audio.mp3')) or remote URL
 * @param opts - Playback options (loop, silent mode, onEnd callback)
 */
export function useIndaraAudio(source: Source | null, opts: UseIndaraAudioOptions = {}) {
  const { loop = false, playsInSilentModeIOS = true, onEnd } = opts;

  const [isReady, setReady] = useState(false);
  const [isPlaying, setPlaying] = useState(false);
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastEndCallbackRef = useRef<number>(0);

  // Initialize audio player
  const player = useAudioPlayer(
    source ? (typeof source === 'number' ? source : { uri: source }) : { uri: '' },
    (p) => {
      if (p) p.loop = loop;
    }
  );

  // Set global audio mode for Indara (plays in silent mode, mixes with others)
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: playsInSilentModeIOS,
      staysActiveInBackground: false,
      interruptionMode: 'mixWithOthers',
      shouldDuckAndroid: true,
    }).catch((err) => console.warn('🎵 Audio mode setup failed:', err));
  }, [playsInSilentModeIOS]);

  // Monitor playback status
  useEffect(() => {
    if (!source || !player) {
      setReady(false);
      return;
    }

    setReady(true);

    // Poll for playback status (250ms intervals)
    timerRef.current = setInterval(() => {
      try {
        const currentPos = player.currentTime ?? 0;
        const duration = player.duration ?? 0;
        const playing = player.playing ?? false;

        setPositionMs(currentPos * 1000);
        setDurationMs(duration * 1000);
        setPlaying(playing);

        // Detect end of playback
        if (duration > 0 && currentPos >= duration - 0.1 && !loop) {
          const now = Date.now();
          if (now - lastEndCallbackRef.current > 1000) {
            lastEndCallbackRef.current = now;
            onEnd?.();
          }
        }
      } catch (err) {
        // Ignore polling errors
      }
    }, 250);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [source, player, loop, onEnd]);

  const api = useMemo(() => {
    return {
      isReady,
      isPlaying,
      positionMs,
      durationMs,

      async play() {
        if (!player) return;
        try {
          player.play();
          setPlaying(true);
        } catch (err) {
          console.warn('🎵 Play failed:', err);
        }
      },

      async pause() {
        if (!player) return;
        try {
          player.pause();
          setPlaying(false);
        } catch (err) {
          console.warn('🎵 Pause failed:', err);
        }
      },

      async stop() {
        if (!player) return;
        try {
          player.pause();
          player.currentTime = 0;
          setPlaying(false);
          setPositionMs(0);
        } catch (err) {
          console.warn('🎵 Stop failed:', err);
        }
      },

      async seekTo(ms: number) {
        if (!player) return;
        try {
          player.currentTime = ms / 1000;
          setPositionMs(ms);
        } catch (err) {
          console.warn('🎵 Seek failed:', err);
        }
      },

      setLoop(enabled: boolean) {
        if (player) player.loop = enabled;
      },
    };
  }, [isReady, isPlaying, positionMs, durationMs, player]);

  return api;
}
