import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Heart, Share2, MoreHorizontal, Volume2, Repeat, Shuffle, Globe, Lock } from 'lucide-react';

interface Song {
  id: string;
  title: string;
  description: string;
  tags: string;
  plays: number;
  likes: number;
  image: string;
  version: string;
  isPublic: boolean;
  createdAt: string;
  creator?: string;
  isLiked?: boolean;
  duration?: string;
}

interface SongPlayerScreenProps {
  onBack: () => void;
  song: Song;
  onShareToHealing?: (song: Song) => void;
}

const SongPlayerScreen: React.FC<SongPlayerScreenProps> = ({ onBack, song, onShareToHealing: _onShareToHealing }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, _setDuration] = useState(225); // 3:45 in seconds
  const [isLiked, setIsLiked] = useState(song.isLiked || false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [volume, setVolume] = useState(0.8);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // Simulate playback progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTime < duration) {
      interval = setInterval(() => {
        setCurrentTime(prev => Math.min(prev + 1, duration));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTime, duration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseInt(e.target.value);
    setCurrentTime(newTime);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: song.title,
        text: `Check out this healing music: ${song.title}`,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleRepeat = () => {
    const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  const progress = (currentTime / duration) * 100;

  return (
    <div className="h-full bg-gradient-to-b from-purple-900 via-purple-800 to-black text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 relative z-10">
        <button onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <div className="text-center">
          <p className="text-sm text-purple-200">Playing from</p>
          <p className="text-white font-medium">Your Library</p>
        </div>
        <button className="p-2 -mr-2">
          <MoreHorizontal className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Album Art */}
      <div className="flex-1 flex items-center justify-center px-8 py-8">
        <div className="relative">
          <img
            src={song.image}
            alt={song.title}
            className="w-80 h-80 rounded-2xl shadow-2xl object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
        </div>
      </div>

      {/* Song Info */}
      <div className="px-8 mb-6">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white truncate">{song.title}</h1>
            <p className="text-purple-200 text-lg">{song.creator || 'You'}</p>
          </div>
          <button onClick={handleLike} className="p-2 -mr-2">
            <Heart 
              className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} 
            />
          </button>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-purple-200">
          <span>{song.plays} plays</span>
          <span>{song.likes} likes</span>
          <div className="flex items-center gap-1">
            {song.isPublic ? (
              <>
                <Globe className="w-3 h-3" />
                <span>Public</span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3" />
                <span>Private</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-8 mb-6">
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-purple-700 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #ffffff 0%, #ffffff ${progress}%, #7c3aed ${progress}%, #7c3aed 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-purple-200 mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-8 pb-8">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => setIsShuffled(!isShuffled)}
            className={`p-2 ${isShuffled ? 'text-white' : 'text-purple-300'}`}
          >
            <Shuffle className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-6">
            <button className="p-2">
              <SkipBack className="w-6 h-6 text-white" />
            </button>
            
            <button
              onClick={handlePlayPause}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-black" />
              ) : (
                <Play className="w-8 h-8 text-black ml-1" />
              )}
            </button>
            
            <button className="p-2">
              <SkipForward className="w-6 h-6 text-white" />
            </button>
          </div>
          
          <button 
            onClick={handleRepeat}
            className={`p-2 relative ${repeatMode !== 'off' ? 'text-white' : 'text-purple-300'}`}
          >
            <Repeat className="w-5 h-5" />
            {repeatMode === 'one' && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-white text-black rounded-full text-xs flex items-center justify-center font-bold">
                1
              </span>
            )}
          </button>
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center justify-between">
          <div className="relative">
            <button 
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
              className="p-2 text-purple-200"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            {showVolumeSlider && (
              <div className="absolute bottom-12 left-0 bg-purple-800 rounded-lg p-3">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 h-1 bg-purple-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>
          
          <button 
            onClick={handleShare}
            className="p-2 text-purple-200"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SongPlayerScreen;