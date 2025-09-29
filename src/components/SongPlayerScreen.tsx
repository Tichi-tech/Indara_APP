import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Share2, ThumbsUp, ChevronDown, RotateCcw } from 'lucide-react';
import ShareSongScreen from './ShareSongScreen';
import { useGlobalAudio } from '../hooks/useMusicPlayer';
import { getSmartThumbnail } from '../utils/thumbnailMatcher';

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
  duration?: string; // in "mm:ss" optionally
}

interface SongPlayerScreenProps {
  onBack: () => void;
  song: Song;
  onShareToHealing?: (song: Song) => void;
}

const SongPlayerScreen: React.FC<SongPlayerScreenProps> = ({ onBack, song, onShareToHealing: _onShareToHealing }) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    play,
    pause,
    resume,
    seek,
    formatTime
  } = useGlobalAudio();

  const [isLiked, setIsLiked] = useState<boolean>(song.isLiked || false);
  const [likes, setLikes] = useState<number>(2100);
  const [showShareScreen, setShowShareScreen] = useState(false);

  // Auto-play the song when component mounts if it's not already playing
  useEffect(() => {
    if (!currentTrack || currentTrack.id !== song.id) {
      const track = {
        id: song.id,
        title: song.title,
        artist: song.creator,
        audio_url: (song as any).audioUrl || (song as any).audio_url || 'https://cdn.pixabay.com/download/audio/2021/11/30/audio_4f3a9e4be3.mp3?filename=relaxing-ambient-110997.mp3',
        thumbnail_url: song.image,
        type: 'music' as const
      };
      play(track);
    }
  }, [song.id, currentTrack?.id, play]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseInt(e.target.value, 10);
    seek(newTime);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const handleLike = () => {
    setIsLiked(prev => !prev);
    setLikes(prev => (isLiked ? prev - 1 : prev + 1));
  };

  const handleShare = () => setShowShareScreen(true);
  const handleCloseShare = () => setShowShareScreen(false);

  const handlePublicToCommmunity = () => {
    console.log('Publishing to community...');
    setShowShareScreen(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
    setShowShareScreen(false);
  };

  const handleShareToInstagram = () => {
    console.log('Sharing to Instagram...');
    setShowShareScreen(false);
  };

  const handleRestart = () => {
    seek(0);
    if (!isPlaying) {
      resume();
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

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
          backgroundImage: `url(${song.image || getSmartThumbnail(
            song.title || 'Generated music',
            song.description || '',
            song.tags || '',
            song.id
          )})`,
        }}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
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

        {/* Artist Info */}
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
        <div className="flex-1" />

        {/* Right Side Action Buttons */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 space-y-6">
          {/* Like Button */}
          <button
            onClick={handleLike}
            className="w-14 h-14 bg-black/40 backdrop-blur-sm rounded-full flex flex-col items-center justify-center"
          >
            <ThumbsUp className={`w-6 h-6 ${isLiked ? 'text-white fill-white' : 'text-white'}`} />
            <span className="text-xs text-white mt-1 font-medium">{likes >= 1000 ? `${(likes/1000).toFixed(1)}k` : likes}</span>
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
              {song.title || 'Generated music content'}
            </h2>
            <p className="text-white/80 text-lg">
              {song.description || 'user prompt summary'}
            </p>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Progress Bar and Controls */}
            <div className="flex items-center gap-4">
              {/* Restart Button */}
              <button
                className="p-2"
                onClick={handleRestart}
                aria-label="Restart"
              >
                <RotateCcw className="w-6 h-6 text-white" />
              </button>

              {/* Play/Pause Button */}
              <button onClick={handlePlayPause} className="p-2" aria-label={isPlaying ? 'Pause' : 'Play'}>
                {isPlaying ? (
                  <div className="flex gap-1">
                    <div className="w-1.5 h-6 bg-white rounded-full" />
                    <div className="w-1.5 h-6 bg-white rounded-full" />
                  </div>
                ) : (
                  <Play className="w-6 h-6 text-white fill-white" />
                )}
              </button>

              {/* Progress Bar */}
              <div className="flex-1">
                <input
                  type="range"
                  min={0}
                  max={Math.max(1, Math.floor(duration))}
                  value={Math.floor(currentTime)}
                  onChange={handleSeek}
                  className="slider w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #ffffff 0%, #ffffff ${progress}%, rgba(255,255,255,0.3) ${progress}%, rgba(255,255,255,0.3) 100%)`,
                  }}
                  aria-label="Seek"
                />
              </div>

              {/* Time Display */}
              <span className="text-white text-lg font-medium min-w-[50px] text-right">
                {formatTime(currentTime)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongPlayerScreen;