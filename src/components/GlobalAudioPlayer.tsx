import React from 'react';
import { Play, Pause, Music, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { useGlobalAudio } from '../hooks/useMusicPlayer';

export const GlobalAudioPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    queue,
    currentIndex,
    isMuted,
    isLoading,
    pause,
    resume,
    stop,
    setVolume,
    seek,
    toggleMute,
    playNext,
    playPrevious,
    formatTime,
    progress
  } = useGlobalAudio();

  // Don't show player if no track is loaded
  if (!currentTrack) {
    return null;
  }

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value) / 100);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    seek(newTime);
  };

  const handleRestart = () => {
    seek(0);
    if (!isPlaying) {
      resume();
    }
  };

  return (
    <div className="absolute bottom-16 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
      <div className="w-full px-4 py-3 safe-area-padding-bottom">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Track Info - Takes most space */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex-shrink-0 overflow-hidden">
                {currentTrack.thumbnail_url ? (
                  <img
                    src={currentTrack.thumbnail_url}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <Music className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-xs sm:text-sm text-black truncate">
                  {currentTrack.title}
                </h4>
                <div className="flex items-center gap-1 sm:gap-2">
                  <p className="text-[10px] sm:text-xs text-gray-500 capitalize">
                    {currentTrack.type || 'music'}
                  </p>
                  {queue.length > 1 && (
                    <span className="text-[10px] sm:text-xs text-gray-500">
                      • {currentIndex + 1}/{queue.length}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Controls - Compact layout */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Previous Track (only show if queue has multiple tracks) */}
              {queue.length > 1 && (
                <button
                  onClick={playPrevious}
                  disabled={currentIndex <= 0}
                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-600 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous"
                >
                  <SkipBack className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              )}

              {/* Play/Pause */}
              <button
                onClick={handlePlayPause}
                disabled={isLoading}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-black text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 disabled:opacity-50"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isLoading ? (
                  <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-3 h-3 sm:w-4 sm:h-4" />
                ) : (
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5" />
                )}
              </button>

              {/* Next Track (always visible) */}
              <button
                onClick={playNext}
                disabled={queue.length <= 1 || currentIndex >= queue.length - 1}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-gray-600 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next track"
              >
                <SkipForward className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

        {/* Progress Bar */}
        <div className="mt-2 sm:mt-3">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #000000 0%, #000000 ${progress}%, #d1d5db ${progress}%, #d1d5db 100%)`,
              }}
            />
            <div className="flex justify-between items-center text-[10px] sm:text-xs text-gray-500 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
      </div>
    </div>
  );
};

export default GlobalAudioPlayer;