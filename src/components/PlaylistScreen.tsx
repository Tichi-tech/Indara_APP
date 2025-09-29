import React, { useState, useEffect } from 'react';
import { ArrowLeft, X, Play, Pause, ChevronRight } from 'lucide-react';
import BottomNav from './BottomNav';
import { musicApi } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { getSmartThumbnail } from '../utils/thumbnailMatcher';

interface Track {
  id: string;
  title: string;
  admin_notes?: string;
  prompt?: string;
  style?: string;
  duration?: string;
  audio_url?: string;
  thumbnail_url?: string;
  created_at: string;
  admin_rating?: number;
  reviewed_by?: string;
  reviewed_at?: string;
  profiles?: {
    display_name?: string;
    avatar_url?: string;
  };
}

interface PlaylistScreenProps {
  playlistName: string;
  playlistDescription?: string;
  onBack: () => void;
  onCreateMusic?: () => void;
  onMySongs?: () => void;
  onAccountSettings?: () => void;
  onInbox?: () => void;
}

const PlaylistScreen: React.FC<PlaylistScreenProps> = ({
  playlistName,
  playlistDescription,
  onBack,
  onCreateMusic,
  onMySongs,
  onAccountSettings,
  onInbox
}) => {
  const { user } = useAuth();
  const { currentTrack, isPlaying, playTrack, togglePlayPause } = useMusicPlayer();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likingTracks, setLikingTracks] = useState<Set<string>>(new Set());

  // Fetch featured tracks
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true);
        const { data, error } = await musicApi.getFeaturedTracks();

        if (error) {
          console.error('Error fetching featured tracks:', error);
          // Don't set error for empty data - just show empty state
          setTracks([]);
        } else {
          setTracks(data || []);
        }
      } catch (err) {
        console.error('Error fetching tracks:', err);
        // Don't set error for fetch issues - just show empty state
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, []);

  const handlePlayTrack = async (track: Track) => {
    if (!track.audio_url) {
      console.warn('No audio URL for track:', track.title);
      return;
    }

    try {
      // If this track is currently playing, toggle pause/play
      if (currentTrack?.id === track.id) {
        await togglePlayPause();
      } else {
        // Play new track
        await playTrack({
          id: track.id,
          title: track.title,
          artist: track.profiles?.display_name || 'Unknown Artist',
          duration: track.duration ? parseInt(track.duration.split(':')[0]) * 60 + parseInt(track.duration.split(':')[1]) : undefined,
          audio_url: track.audio_url,
          thumbnail_url: track.thumbnail_url
        });
      }
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };

  const handleLikeTrack = async (track: Track) => {
    if (!user?.id || likingTracks.has(track.id)) return;

    setLikingTracks(prev => new Set([...prev, track.id]));

    try {
      const { data, error } = await musicApi.likeTrack(user.id, track.id);
      if (error) {
        console.error('Failed to toggle like:', error);
      } else {
        console.log(`Track ${data.liked ? 'liked' : 'unliked'}`);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLikingTracks(prev => {
        const newSet = new Set(prev);
        newSet.delete(track.id);
        return newSet;
      });
    }
  };

  const formatDuration = (duration?: string) => {
    return duration || '3:45';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-dvh bg-white">
      <div className="mx-auto max-w-[420px] h-dvh flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-8 h-8 flex items-center justify-center">
              <ArrowLeft className="w-6 h-6 text-black" />
            </button>
            <h1 className="text-xl font-bold text-black">{playlistName}</h1>
          </div>
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center">
            <X className="w-6 h-6 text-black" />
          </button>
        </div>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto pb-[180px] [padding-bottom:calc(env(safe-area-inset-bottom)+180px)] bg-white">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          )}


          {/* Tracks List */}
          {!loading && tracks.length > 0 && (
            <div className="px-6 py-4">
              <div className="space-y-4">
                {tracks.map((track) => (
                  <div key={track.id} className="flex items-center gap-4 py-2">
                    {/* Track Image */}
                    <div className="relative">
                      <img
                        src={track.thumbnail_url || getSmartThumbnail(
                          track.title || 'Untitled',
                          track.prompt || track.admin_notes || '',
                          track.style || '',
                          track.id
                        )}
                        alt={track.title}
                        className="w-16 h-16 rounded-2xl object-cover"
                      />
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium text-lg mb-1 ${
                        currentTrack?.id === track.id ? 'text-purple-500' : 'text-black'
                      }`}>
                        {track.title}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600">
                        {currentTrack?.id === track.id && isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        <span className="text-sm">{formatDuration(track.duration)}</span>
                        {track.admin_rating && (
                          <>
                            <span>•</span>
                            <span className="text-sm">⭐ {track.admin_rating}/5</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Play Button */}
                    <button
                      className="w-8 h-8 flex items-center justify-center"
                      onClick={() => handlePlayTrack(track)}
                    >
                      <ChevronRight className="w-6 h-6 text-black" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && tracks.length === 0 && (
            <div className="p-6 text-center py-12">
              <div className="w-20 h-20 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-gray-400 text-2xl">♪</span>
              </div>
              <p className="text-black text-lg font-medium mb-2">No tracks available yet</p>
              <p className="text-gray-600">Admin will add featured tracks soon!</p>
            </div>
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          active="home"
          onHome={onBack}
          onLibrary={onMySongs || (() => {})}
          onCreate={onCreateMusic || (() => {})}
          onInbox={onInbox || (() => {})}
          onAccount={onAccountSettings || (() => {})}
          badgeCount={1}
          accountInitial="S"
        />
      </div>
    </div>
  );
};

export default PlaylistScreen;