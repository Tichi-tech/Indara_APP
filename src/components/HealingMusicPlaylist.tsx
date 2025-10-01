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
  prompt?: string;
  admin_notes?: string;
  style?: string;
  duration?: string;
  audio_url?: string;
  created_at: string;
  is_published: boolean;
  is_featured: boolean;
  admin_rating?: number;
  user_id: string;
  display_name?: string;
}

interface HealingMusicPlaylistProps {
  onBack: () => void;
  onCreateMusic: () => void;
  onMySongs: () => void;
  onAccountSettings: () => void;
}

const HealingMusicPlaylist: React.FC<HealingMusicPlaylistProps> = ({
  onBack,
  onCreateMusic,
  onMySongs,
  onAccountSettings,
}) => {
  const { user } = useAuth();
  const { currentTrack, isPlaying, playTrack, pauseTrack } = useMusicPlayer();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTracks = async () => {
      try {
        setLoading(true);
        const response = await musicApi.getCommunityTracks(100, 0);
        // Extract data from the response object
        const tracksData = response?.data || [];
        const tracksArray = Array.isArray(tracksData) ? tracksData : [];
        setTracks(tracksArray);
      } catch (error) {
        console.error('Error loading tracks:', error);
        setTracks([]);
      } finally {
        setLoading(false);
      }
    };

    loadTracks();
  }, []);

  const handleTrackPlay = (track: Track) => {
    if (currentTrack?.id === track.id && isPlaying) {
      pauseTrack();
    } else {
      playTrack({
        id: track.id,
        title: track.title,
        creator: track.display_name || 'Community Artist',
        duration: track.duration || '0:00',
        thumbnail_url: getSmartThumbnail(track.title, track.prompt || '', track.style || '', track.id),
        audioUrl: track.audio_url || ''
      });
    }
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
            <h1 className="text-xl font-bold text-black">Healing music</h1>
          </div>
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center">
            <X className="w-6 h-6 text-black" />
          </button>
        </div>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto pb-[180px] [padding-bottom:calc(env(safe-area-inset-bottom)+180px)] bg-white">
          <div className="px-6 py-4">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500">Loading tracks...</div>
              </div>
            ) : !Array.isArray(tracks) || tracks.length === 0 ? (
              <div className="flex justify-center items-center py-8">
                <div className="text-gray-500">No published tracks found</div>
              </div>
            ) : (
              <div className="space-y-4">
                {tracks.map((track) => (
                  <div key={track.id} className="flex items-center gap-4 py-2">
                    {/* Track Image */}
                    <div className="relative">
                      <img
                        src={getSmartThumbnail(track.title, track.prompt || '', track.style || '', track.id)}
                        alt={track.title}
                        className="w-16 h-16 rounded-2xl object-cover"
                      />
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-black text-lg mb-1">
                        {track.title}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600">
                        <button
                          onClick={() => handleTrackPlay(track)}
                          className="flex items-center gap-2"
                        >
                          {currentTrack?.id === track.id && isPlaying ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                          <span className="text-sm">{track.duration || 'Unknown'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Arrow */}
                    <button
                      onClick={() => handleTrackPlay(track)}
                      className="w-8 h-8 flex items-center justify-center"
                    >
                      <ChevronRight className="w-6 h-6 text-black" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          active="home"
          onHome={onBack}
          onLibrary={onMySongs}
          onCreate={onCreateMusic}
          onInbox={() => {}}
          onAccount={onAccountSettings}
          badgeCount={1}
          accountInitial="S"
        />
      </div>
    </div>
  );
};

export default HealingMusicPlaylist;
