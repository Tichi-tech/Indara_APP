import { useState, useRef, useEffect, useCallback } from 'react';
import { musicApi } from '../lib/supabase';
import { useAuth } from './useAuth';

interface Track {
  id: string;
  title: string;
  artist?: string;
  duration?: number;
  audio_url?: string;
  thumbnail_url?: string;
  user_id?: string;
}

interface PlayState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  progress: number;
}

export const useMusicPlayer = () => {
  const { user } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playState, setPlayState] = useState<PlayState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    progress: 0
  });
  const [volume, setVolume] = useState(1);
  const [loading, setLoading] = useState(false);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
    }

    const audio = audioRef.current;

    const handleLoadedMetadata = () => {
      setPlayState(prev => ({
        ...prev,
        duration: audio.duration
      }));
    };

    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime;
      const duration = audio.duration || 0;
      const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

      setPlayState(prev => ({
        ...prev,
        currentTime,
        progress
      }));
    };

    const handleEnded = () => {
      setPlayState(prev => ({
        ...prev,
        isPlaying: false,
        currentTime: 0,
        progress: 0
      }));
    };

    const handleCanPlay = () => {
      setLoading(false);
    };

    const handleWaiting = () => {
      setLoading(true);
    };

    const handleError = (e: Event) => {
      console.error('❌ Audio playback error:', e);
      setLoading(false);
      setPlayState(prev => ({ ...prev, isPlaying: false }));
    };

    // Add event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('error', handleError);

    return () => {
      // Cleanup event listeners
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Load and play track
  const playTrack = useCallback(async (track: Track) => {
    if (!audioRef.current || !track.audio_url) {
      console.error('❌ No audio element or audio URL');
      return;
    }

    try {
      console.log('🎵 Loading track:', track.title);
      setLoading(true);
      setCurrentTrack(track);

      const audio = audioRef.current;

      // Stop current playback
      if (!audio.paused) {
        audio.pause();
      }

      // Load new track
      audio.src = track.audio_url;
      audio.load();

      // Wait for audio to be ready
      await new Promise((resolve, reject) => {
        const handleCanPlay = () => {
          audio.removeEventListener('canplay', handleCanPlay);
          audio.removeEventListener('error', handleError);
          resolve(void 0);
        };

        const handleError = () => {
          audio.removeEventListener('canplay', handleCanPlay);
          audio.removeEventListener('error', handleError);
          reject(new Error('Failed to load audio'));
        };

        audio.addEventListener('canplay', handleCanPlay);
        audio.addEventListener('error', handleError);
      });

      // Start playback
      await audio.play();
      setPlayState(prev => ({ ...prev, isPlaying: true }));

      // Record play in backend
      if (user?.id && track.id) {
        await musicApi.recordPlay(user.id, track.id);
      }

      console.log('✅ Track playing:', track.title);
    } catch (error) {
      console.error('❌ Failed to play track:', error);
      setLoading(false);
      setPlayState(prev => ({ ...prev, isPlaying: false }));
    }
  }, [user?.id]);

  // Play/pause current track
  const togglePlayPause = useCallback(async () => {
    if (!audioRef.current) return;

    const audio = audioRef.current;

    try {
      if (audio.paused) {
        await audio.play();
        setPlayState(prev => ({ ...prev, isPlaying: true }));
      } else {
        audio.pause();
        setPlayState(prev => ({ ...prev, isPlaying: false }));
      }
    } catch (error) {
      console.error('❌ Failed to toggle playback:', error);
    }
  }, []);

  // Seek to position
  const seekTo = useCallback((position: number) => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const duration = audio.duration || 0;
    const newTime = (position / 100) * duration;

    audio.currentTime = newTime;
    setPlayState(prev => ({
      ...prev,
      currentTime: newTime,
      progress: position
    }));
  }, []);

  // Set volume
  const setPlayerVolume = useCallback((vol: number) => {
    if (!audioRef.current) return;

    const clampedVolume = Math.max(0, Math.min(1, vol));
    audioRef.current.volume = clampedVolume;
    setVolume(clampedVolume);
  }, []);

  // Stop playback
  const stop = useCallback(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = 0;
    setPlayState({
      isPlaying: false,
      currentTime: 0,
      duration: audio.duration || 0,
      progress: 0
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Format time helper
  const formatTime = useCallback((seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    // State
    currentTrack,
    playState,
    volume,
    loading,

    // Actions
    playTrack,
    togglePlayPause,
    seekTo,
    setVolume: setPlayerVolume,
    stop,

    // Helpers
    formatTime,

    // Computed
    isPlaying: playState.isPlaying,
    currentTime: playState.currentTime,
    duration: playState.duration,
    progress: playState.progress
  };
};