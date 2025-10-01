import React, { useState, useEffect } from 'react';
import { Play, Heart, Pause } from 'lucide-react';
import BottomNav from './BottomNav';
import { musicApi } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';
import { useNotifications } from '../hooks/useNotifications';
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
  duration?: string;
}

interface Playlist {
  id: string;
  title: string;
  description: string;
  image: string;
  creator: string;
  plays: number;
  likes: number;
  trackCount: number;
}

interface HomeScreenProps {
  onCreateMusic: () => void;
  onMySongs: () => void;
  onAccountSettings: () => void;
  userName: string;
  userHandle: string;
  songs: Song[];
  onPlaySong: (song: Song) => void;
  onNameEntry: () => void;
  onHealingMusicPlaylist: () => void;
  onMeditationPlaylist: () => void;
  onPlaylist: (playlistId: string, playlistName: string, playlistDescription?: string) => void;
  onInbox: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  onCreateMusic,
  onMySongs,
  onAccountSettings,
  userName: _userName,
  userHandle: _userHandle,
  songs: _songs,
  onPlaySong: _onPlaySong,
  onNameEntry: _onNameEntry,
  onHealingMusicPlaylist,
  onMeditationPlaylist,
  onPlaylist,
  onInbox,
}) => {
  const { user } = useAuth();
  const { currentTrack, isPlaying, playTrack, togglePlayPause } = useMusicPlayer();
  const { unreadCount } = useNotifications(); // Get real-time unread count
  const [featuredTracks, setFeaturedTracks] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);


  // Fetch featured tracks on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch both tracks and playlists in parallel
        const [tracksResult, playlistsResult] = await Promise.all([
          musicApi.getCommunityTracks(),
          musicApi.getHomeScreenPlaylists()
        ]);

        // Handle tracks - display all published and featured tracks from database
        if (!tracksResult.error && tracksResult.data) {

          // Transform backend data to Song format with real stats
          const transformedTracksPromises = tracksResult.data.map(async track => {
            // Get real play/like counts for each track
            const { data: stats } = await musicApi.getTrackStats(track.id, user?.id || null);

            return {
              id: track.id,
              title: track.title || 'Untitled',
              description: track.prompt || track.admin_notes || '',
              tags: track.style || '',
              plays: stats?.plays || 0, // Real play counts from database
              likes: stats?.likes || 0, // Real like counts from database
              isLiked: stats?.isLiked || false, // Real like status for current user
              image: getSmartThumbnail(
                track.title || 'Untitled',
                track.prompt || '',
                track.style || '',
                track.id
              ),
              version: '1.0',
              isPublic: true,
              createdAt: track.created_at,
              creator: track.display_name || 'Community Artist', // Use display_name from tracks_with_profiles
              duration: track.duration || '3:45',
              audio_url: track.audio_url
            };
          });

          const transformedTracks = await Promise.all(transformedTracksPromises);
          setFeaturedTracks(transformedTracks);
        } else {
          console.warn('⚠️ No tracks returned from database or error occurred:', tracksResult.error);
          setFeaturedTracks([]);
        }

        // Handle playlists
        if (!playlistsResult.error && playlistsResult.data) {
          setPlaylists(playlistsResult.data);
        } else {
          setPlaylists([]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setFeaturedTracks([]);
        setPlaylists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Set up real-time subscriptions for track stats
  useEffect(() => {
    if (featuredTracks.length === 0) return;

    const trackIds = featuredTracks.map(track => track.id);

    // Subscribe to real-time updates for track plays and likes
    const unsubscribe = musicApi.subscribeToTrackStats(
      trackIds,
      (trackId: string, stats: { plays: number; likes: number }) => {
        // Update the specific track with new stats
        setFeaturedTracks(prev => prev.map(track =>
          track.id === trackId
            ? { ...track, plays: stats.plays, likes: stats.likes }
            : track
        ));
      }
    );

    // Cleanup subscription on unmount or when tracks change
    return unsubscribe;
  }, [featuredTracks.map(t => t.id).join(',')]); // Only re-subscribe when track IDs change

  // Handle play track
  const handlePlayTrack = async (track: Song) => {
    if (!track.audio_url) {
      console.warn('No audio URL for track:', track.title);
      return;
    }

    try {
      if (currentTrack?.id === track.id) {
        await togglePlayPause();
      } else {
        // Record play in database
        await musicApi.recordPlay(user?.id || null, track.id);

        // Start playing the track
        await playTrack({
          id: track.id,
          title: track.title,
          artist: track.creator,
          duration: track.duration ? parseInt(track.duration.split(':')[0]) * 60 + parseInt(track.duration.split(':')[1]) : undefined,
          audio_url: track.audio_url,
          thumbnail_url: track.image
        });
      }
    } catch (error) {
      console.error('Error playing track:', error);
    }
  };


  // Helper function to truncate username
  const truncateUsername = (username: string, maxLength: number = 8) => {
    if (username.length <= maxLength) return username;
    return username.substring(0, maxLength);
  };

  // Handle real-time updates for new featured tracks
  const handleNewFeaturedTrack = (track: any) => {
    console.log('🎵 New featured track received in HomeScreen:', track);

    // Transform the new track to match our Song interface
    const transformedTrack = {
      id: track.id,
      title: track.title || 'Untitled',
      description: track.prompt || track.admin_notes || '',
      tags: track.style || '',
      plays: 0, // New track starts with 0 plays
      likes: 0, // New track starts with 0 likes
      image: getSmartThumbnail(
        track.title || 'Untitled',
        track.prompt || '',
        track.style || '',
        track.id
      ),
      version: '1.0',
      isPublic: true,
      createdAt: track.created_at,
      creator: track.display_name || 'Community Artist',
      duration: track.duration || '3:45',
      audio_url: track.audio_url
    };

    // Add the new track to the beginning of featuredTracks
    setFeaturedTracks(prev => [transformedTrack, ...prev]);
  };

  // Setup real-time subscriptions for HomeScreen
  useRealtimeUpdates({
    onNewFeaturedTrack: handleNewFeaturedTrack
  });

  // Get current tracks - only show real community tracks, no fake fallback
  const currentTracks = featuredTracks;


  return (
    <div className="min-h-dvh bg-white">
      <div className="mx-auto max-w-[420px] h-dvh flex flex-col">


        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto pb-[180px] pt-6 [padding-bottom:calc(env(safe-area-inset-bottom)+180px)]">
          {/* Healing Community */}
          <section className="mb-8">
            <div className="flex items-center justify-between px-6 mb-4">
              <h2 className="text-xl font-bold text-black">Healing Community</h2>
              <button
                onClick={onHealingMusicPlaylist}
                className="text-gray-600 font-medium flex items-center gap-1"
              >
                More
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
              </div>
            ) : currentTracks.length === 0 ? (
              <div className="px-6 text-center py-12">
                <div className="w-20 h-20 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-gray-400 text-2xl">♪</span>
                </div>
                <p className="text-black text-lg font-medium mb-2">No featured tracks yet</p>
                <p className="text-gray-600">Create and publish music to build the community!</p>
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar px-6">
                <div className="flex gap-4 w-max">
                  {currentTracks.map((track) => (
                    <article key={track.id} className="flex-shrink-0 w-48">
                      <div className="grid grid-rows-[128px_auto] rounded-2xl overflow-hidden">
                        {/* Image */}
                        <div className="relative h-32">
                          <img
                            src={track.image}
                            alt={track.title}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                          <button
                            onClick={() => handlePlayTrack(track)}
                            aria-label={`Play ${track.title}`}
                            className="absolute bottom-3 left-3 w-10 h-10 bg-gray-700/80 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-gray-600/80 transition-colors"
                          >
                            {currentTrack?.id === track.id && isPlaying ? (
                              <Pause className="w-5 h-5 text-white fill-white" aria-hidden="true" />
                            ) : (
                              <Play className="w-5 h-5 text-white fill-white ml-0.5" aria-hidden="true" />
                            )}
                          </button>
                        </div>

                        {/* Info */}
                        <div className="bg-white p-3 flex flex-col h-[118px]">
                          <h3 className={`font-semibold text-black text-sm line-clamp-1 mb-1 ${
                            currentTrack?.id === track.id ? 'text-purple-500' : 'text-black'
                          }`}>
                            {track.title}
                          </h3>
                          <p className="text-gray-600 text-xs leading-snug line-clamp-2 mb-2 flex-1">
                            {track.description}
                          </p>

                          {/* Creator and Stats in one line - Always at bottom */}
                          <div className="flex items-center justify-between mt-auto">
                            <div className="flex items-center gap-1 min-w-0">
                              <div className="w-4 h-4 bg-gray-300 rounded-full shrink-0" aria-hidden="true" />
                              <span className="text-gray-500 text-xs truncate">@{truncateUsername(track.creator || '')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
                              <div className="flex items-center gap-0.5">
                                <Play className="w-2.5 h-2.5" aria-hidden="true" />
                                <span className="text-[10px]">{track.plays}</span>
                              </div>
                              <div className="flex items-center gap-0.5">
                                <Heart className="w-2.5 h-2.5" aria-hidden="true" />
                                <span className="text-[10px]">{track.likes}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Featured Playlists (fixed layout) */}
          <section className="px-6">
            <h2 className="text-xl font-bold text-black mb-6">Playlists</h2>

            <div className="space-y-4">
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => onPlaylist(playlist.id, playlist.title, playlist.description)}
                  className="bg-white p-4 rounded-2xl shadow-sm w-full hover:shadow-md transition-shadow cursor-pointer text-left"
                >
                  <div className="flex items-center gap-4">
                    {/* Small Image */}
                    <img
                      src={playlist.image}
                      alt={playlist.title}
                      loading="lazy"
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />

                    {/* Content - takes most of the space */}
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="font-bold text-black text-lg mb-1 line-clamp-1">
                        {playlist.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {playlist.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          active="home"
          onHome={() => {}}
          onLibrary={onMySongs}
          onCreate={onCreateMusic}
          onInbox={onInbox}
          onAccount={onAccountSettings}
          badgeCount={unreadCount}
          accountInitial="S"
        />
      </div>
    </div>
  );
};

export default HomeScreen;
