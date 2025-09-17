import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Share2, ThumbsUp, ChevronDown, RotateCcw } from 'lucide-react';
import ShareSongScreen from './ShareSongScreen';

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
  const [duration, _setDuration] = useState(179); // 2:59 in seconds
  const [isLiked, setIsLiked] = useState(song.isLiked || false);
  const [likes, setLikes] = useState(2100);
  const [showShareScreen, setShowShareScreen] = useState(false);

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
    if (isLiked) {
      setIsLiked(false);
      setLikes(prev => prev - 1);
    } else {
      setIsLiked(true);
      setLikes(prev => prev + 1);
    }
  };

  const handleShare = () => {
    setShowShareScreen(true);
  };

  const handleCloseShare = () => {
    setShowShareScreen(false);
  };

  const handlePublicToCommmunity = () => {
    // TODO: Implement public to community functionality
    console.log('Publishing to community...');
    setShowShareScreen(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
    setShowShareScreen(false);
  };

  const handleShareToInstagram = () => {
    // TODO: Implement Instagram sharing
    console.log('Sharing to Instagram...');
    setShowShareScreen(false);
  };

  const progress = (currentTime / duration) * 100;

  if (showShareScreen) {
    return (
      <ShareSongScreen
        onClose={handleCloseShare}
        song={song}
        onPublicToCommmunity={handlePublicToCommmunity}
        onCopyLink={handleCopyLink}
        onShareToInstagram={handleShareToInstagram}
      />
    );
  }

  return (
    <div className="h-full relative overflow-hidden">
      {/* Full Screen Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=800)`,
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70"></div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col text-white">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 pt-12">
          <button 
            onClick={onBack}
            className="w-12 h-12 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          
          <button className="w-12 h-12 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
            <ChevronDown className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Artist Info - Positioned in upper left */}
        <div className="px-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-bold">
                {(song.creator || 'You').charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-white text-lg font-medium">{song.creator || 'You'}</span>
          </div>
        </div>

        {/* Spacer to push content to bottom */}
        <div className="flex-1"></div>

        {/* Right Side Action Buttons */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 space-y-6">
          {/* Like Button */}
          <button 
            onClick={handleLike}
            className="w-14 h-14 bg-black/40 backdrop-blur-sm rounded-full flex flex-col items-center justify-center"
          >
            <ThumbsUp className={`w-6 h-6 ${isLiked ? 'text-white fill-white' : 'text-white'}`} />
            <span className="text-xs text-white mt-1 font-medium">2.1k</span>
          </button>

          {/* Share Button */}
          <button 
            onClick={handleShare}
            className="w-14 h-14 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <Share2 className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Bottom Content */}
        <div className="p-4 pb-8">
          {/* Song Title and Description */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
              Generated music content
            </h2>
            <p className="text-white/80 text-lg">
              user prompt summary
            </p>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Progress Bar and Controls */}
            <div className="flex items-center gap-4">
              {/* Repeat Button */}
              <button className="p-2">
                <RotateCcw className="w-6 h-6 text-white" />
              </button>
              
              {/* Play/Pause Button */}
              <button
                onClick={handlePlayPause}
                className="p-2"
              >
                {isPlaying ? (
                  <div className="flex gap-1">
                    <div className="w-1.5 h-6 bg-white rounded-full"></div>
                    <div className="w-1.5 h-6 bg-white rounded-full"></div>
                  </div>
                ) : (
                  <Play className="w-6 h-6 text-white fill-white" />
                )}
              </button>

              {/* Progress Bar */}
              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #ffffff 0%, #ffffff ${progress}%, rgba(255,255,255,0.3) ${progress}%, rgba(255,255,255,0.3) 100%)`
                  }}
                />
              </div>

              {/* Time Display */}
              <span className="text-white text-lg font-medium min-w-[50px]">
                {formatTime(currentTime)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ffffff;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default SongPlayerScreen;
