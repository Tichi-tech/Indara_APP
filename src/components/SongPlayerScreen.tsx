import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Pause, Share2, MoreHorizontal, Repeat, ThumbsUp, ThumbsDown, ChevronDown } from 'lucide-react';

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
  const [isDisliked, setIsDisliked] = useState(false);
  const [likes, setLikes] = useState(2100);

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
      setIsDisliked(false);
      setLikes(prev => prev + 1);
    }
  };

  const handleDislike = () => {
    if (isDisliked) {
      setIsDisliked(false);
    } else {
      setIsDisliked(true);
      if (isLiked) {
        setIsLiked(false);
        setLikes(prev => prev - 1);
      }
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: song.title,
        text: `Check out this healing music: ${song.title}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const progress = (currentTime / duration) * 100;

  return (
    <div className="h-full relative overflow-hidden">
      {/* Full Screen Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${song.image})`,
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col text-white">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 pt-12">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">{song.title}</h1>
            <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
              v{song.version}
            </span>
          </div>
          <button className="w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Artist Info */}
        <div className="px-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-400 rounded-full overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {(song.creator || 'You').charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <span className="text-white font-medium">{song.creator || 'You'}</span>
          </div>
        </div>

        {/* Spacer to push content to bottom */}
        <div className="flex-1"></div>

        {/* Floating Action Buttons */}
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 space-y-4">
          {/* Like Button */}
          <button 
            onClick={handleLike}
            className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex flex-col items-center justify-center"
          >
            <ThumbsUp className={`w-5 h-5 ${isLiked ? 'text-blue-400 fill-blue-400' : 'text-white'}`} />
            <span className="text-xs text-white mt-1">{(likes / 1000).toFixed(1)}K</span>
          </button>

          {/* Dislike Button */}
          <button 
            onClick={handleDislike}
            className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <ThumbsDown className={`w-5 h-5 ${isDisliked ? 'text-red-400 fill-red-400' : 'text-white'}`} />
          </button>

          {/* Share Button */}
          <button 
            onClick={handleShare}
            className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <Share2 className="w-5 h-5 text-white" />
          </button>

          {/* More Options */}
          <button className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center">
            <MoreHorizontal className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Bottom Content */}
        <div className="p-4 pb-8">
          {/* Song Title and Description */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
              {song.description || "Mama always said I could sing the blues"}
            </h2>
            <p className="text-white/70 text-sm">
              {song.tags || "Hallelujah Better pray I don't lose"}
            </p>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="flex items-center gap-3">
              <button className="p-2">
                <Repeat className="w-5 h-5 text-white" />
              </button>
              
              <button
                onClick={handlePlayPause}
                className="p-2"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white" />
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
                  className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #ffffff 0%, #ffffff ${progress}%, rgba(255,255,255,0.3) ${progress}%, rgba(255,255,255,0.3) 100%)`
                  }}
                />
              </div>

              <span className="text-white text-sm font-medium min-w-[40px]">
                {formatTime(currentTime)}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom App Info */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">I</span>
              </div>
              <span className="text-white text-sm font-medium">Indara</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white/70 text-sm">curated by</span>
              <span className="text-white text-sm font-bold">Indara AI</span>
            </div>
          </div>
        </div>
      </div>

      {/* Back Button - Positioned absolutely */}
      <button 
        onClick={onBack}
        className="absolute top-12 left-4 z-20 w-10 h-10 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center"
      >
        <ArrowLeft className="w-5 h-5 text-white" />
      </button>
    </div>
  );
};

export default SongPlayerScreen;
