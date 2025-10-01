import React, { createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode } from 'react';
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
  type?: 'music' | 'meditation' | 'session';
}

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  queue: Track[];
  currentIndex: number;
  isMuted: boolean;
  isLoading: boolean;
  play: (track: Track) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  setVolume: (volume: number) => void;
  seek: (time: number) => void;
  toggleMute: () => void;
  playNext: () => void;
  playPrevious: () => void;
  addToQueue: (track: Track) => void;
  formatTime: (seconds: number) => string;
  progress: number;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [savedVolume, setSavedVolume] = useState(0.7);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  const initAudio = (track: Track) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.removeEventListener('ended', handleEnded);
      audioRef.current.removeEventListener('error', handleError);
    }

    if (!track.audio_url) return;

    audioRef.current = new Audio(track.audio_url);
    audioRef.current.volume = volume;

    audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
    audioRef.current.addEventListener('ended', handleEnded);
    audioRef.current.addEventListener('error', handleError);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    // Auto play next track if available
    playNext();
  };

  const handleError = (e: Event) => {
    console.error('❌ Audio playback error:', e);
    setIsPlaying(false);
    setIsLoading(false);

    // Try to play next track if available and this isn't a network error
    const audio = e.target as HTMLAudioElement;
    if (audio && audio.error) {
      // Auto skip to next track on error if queue exists
      if (queue.length > 1 && currentIndex < queue.length - 1) {
        setTimeout(() => playNext(), 1000);
      }
    }
  };

  const play = useCallback(async (track: Track) => {
    console.log('🎶 GlobalAudio play called:', {
      trackId: track.id,
      trackTitle: track.title,
      trackUrl: track.audio_url?.substring(0, 50) + '...',
      currentTrackId: currentTrack?.id,
      hasAudioRef: !!audioRef.current
    });

    if (!track.audio_url) {
      console.error('❌ No audio URL for track:', track.title);
      return;
    }

    // If same track, just resume
    if (currentTrack?.id === track.id && audioRef.current) {
      console.log('🔄 Same track, resuming...');
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    // New track
    setIsLoading(true);
    setCurrentTrack(track);

    // Add to queue if not already there
    const trackInQueue = queue.findIndex(t => t.id === track.id);
    if (trackInQueue === -1) {
      setQueue(prev => [...prev, track]);
      setCurrentIndex(queue.length);
    } else {
      setCurrentIndex(trackInQueue);
    }

    initAudio(track);

    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setIsLoading(false);

        // Record play in backend
        if (user?.id && track.id) {
          await musicApi.recordPlay(user.id, track.id);
        }

        console.log('✅ Track playing:', track.title);
      } catch (err: any) {
        console.error('❌ Play error:', err);
        setIsLoading(false);

        // Handle specific play errors
        if (err.name === 'NotAllowedError') {
          console.warn('Playback was prevented by browser (user interaction required)');
        } else if (err.name === 'NotSupportedError') {
          console.error('Audio format not supported by browser');
        }
      }
    }
  }, [user?.id, currentTrack?.id, queue.length]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const resume = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error('Resume error:', err));
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentTrack(null);
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = savedVolume;
        setVolumeState(savedVolume);
        setIsMuted(false);
      } else {
        setSavedVolume(volume);
        audioRef.current.volume = 0;
        setVolumeState(0);
        setIsMuted(true);
      }
    }
  }, [isMuted, savedVolume, volume]);

  const playNext = useCallback(() => {
    if (queue.length > 0 && currentIndex < queue.length - 1) {
      const nextTrack = queue[currentIndex + 1];
      setCurrentIndex(currentIndex + 1);
      setCurrentTrack(nextTrack);
      initAudio(nextTrack);
      if (audioRef.current) {
        setIsLoading(true);
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(err => {
            console.error('Play next error:', err);
            setIsLoading(false);
            setIsPlaying(false);
          });
      }
    }
  }, [queue, currentIndex]);

  const playPrevious = useCallback(() => {
    if (queue.length > 0 && currentIndex > 0) {
      const prevTrack = queue[currentIndex - 1];
      setCurrentIndex(currentIndex - 1);
      setCurrentTrack(prevTrack);
      initAudio(prevTrack);
      if (audioRef.current) {
        setIsLoading(true);
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(err => {
            console.error('Play previous error:', err);
            setIsLoading(false);
            setIsPlaying(false);
          });
      }
    }
  }, [queue, currentIndex]);

  const addToQueue = useCallback((track: Track) => {
    const trackExists = queue.find(t => t.id === track.id);
    if (!trackExists) {
      setQueue(prev => [...prev, track]);
    }
  }, [queue]);

  const formatTime = useCallback((seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        volume,
        currentTime,
        duration,
        queue,
        currentIndex,
        isMuted,
        isLoading,
        play,
        pause,
        resume,
        stop,
        setVolume,
        seek,
        toggleMute,
        playNext,
        playPrevious,
        addToQueue,
        formatTime,
        progress,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

// Legacy compatibility layer for existing components
export const useMusicPlayer = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within an AudioProvider');
  }

  return {
    currentTrack: context.currentTrack,
    isPlaying: context.isPlaying,
    playTrack: context.play,
    togglePlayPause: async () => {
      if (context.isPlaying) {
        context.pause();
      } else {
        context.resume();
      }
    },
    volume: context.volume,
    currentTime: context.currentTime,
    duration: context.duration,
    progress: context.progress,
    loading: context.isLoading,
    formatTime: context.formatTime,
    seekTo: (position: number) => {
      const newTime = (position / 100) * context.duration;
      context.seek(newTime);
    },
    setVolume: context.setVolume,
    stop: context.stop
  };
};

// New hook for full global audio features
export const useGlobalAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useGlobalAudio must be used within an AudioProvider');
  }
  return context;
};