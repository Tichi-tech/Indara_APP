import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Music, Plus, Heart, Play, Pause } from 'lucide-react';
import BottomNav from './BottomNav';
import CreateMusicScreen from './CreateMusicScreen';
import { musicApi } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useMusicPlayer } from '../hooks/useMusicPlayer';

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

interface MySongsScreenProps {
  onBack: () => void;
  onCreateMusic: () => void;
  onAccountSettings: () => void;
  onInbox: () => void;
  userSongs: Song[];
}

const MySongsScreen: React.FC<MySongsScreenProps> = ({
  onBack,
  onCreateMusic,
  onAccountSettings,
  onInbox,
  userSongs
}) => {
  const { user } = useAuth();
  const { currentTrack, isPlaying, playTrack, togglePlayPause } = useMusicPlayer();
  const [showCreateScreen, setShowCreateScreen] = useState(false);
  const [likingTracks, setLikingTracks] = useState<Set<string>>(new Set());
  const [featuredTracks, setFeaturedTracks] = useState<Song[]>([]);
  const [publishingTracks, setPublishingTracks] = useState<Set<string>>(new Set());
  const [userPlaylists, setUserPlaylists] = useState<Array<{id: string, name: string, trackCount: number, image: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');


  // Load playlists from database
  const loadUserPlaylists = async () => {
    if (!user) return;

    try {
      const { data, error } = await musicApi.getUserPlaylists(user.id);
      if (!error && data) {
        const transformedPlaylists = data.map(playlist => ({
          id: playlist.id,
          name: playlist.name,
          trackCount: playlist.track_count || 0,
          image: '/thumbnails/playlist-default.svg' // Default playlist image
        }));
        setUserPlaylists(transformedPlaylists);
      }
    } catch (error) {
      console.error('Error loading playlists:', error);
    }
  };

  // Load playlists when user changes
  useEffect(() => {
    loadUserPlaylists();
  }, [user]);

  // Use userSongs prop directly instead of fetching again
  useEffect(() => {
    setLoading(true);

    // Filter userSongs to only show tracks with audio URLs
    const playableTracks = userSongs.filter(track => track.audio_url);
    setFeaturedTracks(playableTracks);

    setLoading(false);
  }, [userSongs]);

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

  // Helper function to get first two words from title
  const getTwoWords = (title: string) => {
    const words = title.trim().split(' ');
    return words.slice(0, 2).join(' ');
  };

  const handleCreateMusic = () => {
    setShowCreateScreen(true);
  };

  const handlePlaySong = async (song: Song) => {
    try {
      // If this song is currently playing, toggle pause/play
      if (currentTrack?.id === song.id) {
        await togglePlayPause();
      } else {
        // Record play in database
        await musicApi.recordPlay(user?.id || null, song.id);

        // Play new song
        await playTrack({
          id: song.id,
          title: song.title,
          artist: song.creator,
          duration: song.duration ? parseInt(song.duration.split(':')[0]) * 60 + parseInt(song.duration.split(':')[1]) : undefined,
          audio_url: song.audio_url,
          thumbnail_url: song.image
        });
      }
    } catch (error) {
      console.error('Error playing song:', error);
    }
  };

  const handleCloseCreateScreen = () => {
    setShowCreateScreen(false);
  };

  // Handle like song
  const handleLikeSong = async (song: Song) => {
    if (!user?.id || likingTracks.has(song.id)) return;

    setLikingTracks(prev => new Set([...prev, song.id]));

    try {
      const { data, error } = await musicApi.likeTrack(user.id, song.id);
      if (error) {
        console.error('Failed to toggle like:', error);
      } else {
        console.log(`Song ${data.liked ? 'liked' : 'unliked'}`);

        // Update local song state immediately for responsive UI
        setFeaturedTracks(prev => prev.map(s =>
          s.id === song.id
            ? { ...s, likes: s.likes + (data.liked ? 1 : -1), isLiked: data.liked }
            : s
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLikingTracks(prev => {
        const newSet = new Set(prev);
        newSet.delete(song.id);
        return newSet;
      });
    }
  };

  // Handle publish/unpublish track
  const handleTogglePublish = async (trackId: string, isCurrentlyPublic: boolean) => {
    if (!user) return;

    setPublishingTracks(prev => new Set([...prev, trackId]));

    try {
      if (isCurrentlyPublic) {
        await musicApi.unpublishTrack(trackId, user.id);
      } else {
        await musicApi.publishTrackToCommunity(trackId, user.id);
      }

      // Refresh user tracks to show updated status
      const { data: tracks } = await musicApi.getUserTracks(user.id);
      if (tracks) {
        const transformedTracks = tracks.map(track => ({
          id: track.id,
          title: track.title || 'Untitled',
          description: track.prompt || track.admin_notes || '',
          tags: track.style || '',
          plays: track.play_count || 0,
          likes: track.like_count || 0,
          image: track.thumbnail_url || getSmartThumbnail(
            track.title || 'Untitled',
            track.prompt || track.admin_notes || '',
            track.style || '',
            track.id
          ),
          version: '1.0',
          isPublic: track.is_published || false,
          createdAt: track.created_at,
          creator: 'You',
          duration: track.duration || '3:45',
          audio_url: track.audio_url
        }));
        setFeaturedTracks(transformedTracks);
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
    } finally {
      setPublishingTracks(prev => {
        const newSet = new Set(prev);
        newSet.delete(trackId);
        return newSet;
      });
    }
  };

  // Handle create playlist
  const handleCreatePlaylist = () => {
    setShowCreatePlaylist(true);
  };

  // Handle save new playlist
  const handleSavePlaylist = async () => {
    if (!newPlaylistName.trim() || !user) return;

    try {
      const { data, error } = await musicApi.createPlaylist(user.id, newPlaylistName.trim());

      if (!error && data) {
        // Refresh playlists from database
        await loadUserPlaylists();
        setNewPlaylistName('');
        setShowCreatePlaylist(false);
      } else {
        console.error('Failed to create playlist:', error);
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
    }
  };

  // Handle playlist click
  const handlePlaylistClick = (playlist: any) => {
    // Navigate to playlist details or open playlist editor
    console.log('Open playlist:', playlist.name);
    // This could navigate to a playlist editing screen in the future
  };

  // Show user's own tracks instead of fake playlist data
  const playlistTracks = featuredTracks.slice(0, 3); // User's first 3 tracks
  const likedTracks: Song[] = []; // Empty for now - will implement liked tracks later

  return (
    <div className="min-h-dvh bg-white">
      <div className="mx-auto max-w-[420px] h-dvh flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center">
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center">
            <Search className="w-6 h-6 text-gray-800" />
          </button>
        </div>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto pb-[180px] [padding-bottom:calc(env(safe-area-inset-bottom)+180px)] bg-white">
          {/* Playlists Section */}
          <div className="px-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black">Playlists</h2>
              {userPlaylists.length > 5 && (
                <button
                  onClick={() => {
                    // TODO: Navigate to full playlists view
                    console.log('Show all playlists');
                  }}
                  className="text-gray-600 font-medium flex items-center gap-1"
                >
                  More
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Playlists Grid */}
            <div className="grid grid-cols-4 gap-3 mb-2">
              {/* Create New Playlist Card */}
              <button
                onClick={handleCreatePlaylist}
                className="flex flex-col items-center"
              >
                <div className="w-full aspect-square rounded-xl bg-gray-100 mb-2 flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                  <Plus className="w-6 h-6 text-gray-400" />
                </div>
                <span className="text-xs text-gray-600 font-medium text-center">
                  New Playlist
                </span>
              </button>

              {/* User Playlists - Show max 5 */}
              {userPlaylists.slice(0, 5).map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handlePlaylistClick(playlist)}
                  className="flex flex-col items-center"
                >
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2">
                    <img
                      src={playlist.image}
                      alt={playlist.name}
                      className="w-full h-full object-cover bg-gradient-to-br from-purple-400 to-blue-500"
                      onError={(e) => {
                        // Fallback to gradient background if image fails
                        e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                        e.currentTarget.src = '';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <div className="text-white text-center">
                        <Music className="w-4 h-4 mx-auto mb-1" />
                        <span className="text-xs">{playlist.trackCount}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-black font-medium text-center line-clamp-2">
                    {playlist.name}
                  </span>
                </button>
              ))}

              {/* Empty state if no playlists */}
              {userPlaylists.length === 0 && (
                <>
                  <div className="flex flex-col items-center">
                    <div className="w-full aspect-square rounded-xl bg-gray-100 mb-2 flex items-center justify-center">
                      <Music className="w-6 h-6 text-gray-400" />
                    </div>
                    <span className="text-xs text-gray-400 font-medium text-center">
                      Empty
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-full aspect-square rounded-xl bg-gray-100 mb-2 flex items-center justify-center">
                      <Music className="w-6 h-6 text-gray-400" />
                    </div>
                    <span className="text-xs text-gray-400 font-medium text-center">
                      Empty
                    </span>
                  </div>
                </>
              )}
            </div>
            
            {/* Underline */}
            <div className="w-full h-0.5 bg-gray-200 mt-4"></div>
          </div>

          {/* Liked Section */}
          <div className="px-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black">Liked</h2>
              {likedTracks.length > 6 && (
                <button
                  onClick={() => {
                    // TODO: Navigate to full liked songs view
                    console.log('Show all liked songs');
                  }}
                  className="text-gray-600 font-medium flex items-center gap-1"
                >
                  More
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Liked Songs Grid */}
            <div className="grid grid-cols-4 gap-3 mb-2">
              {loading ? (
                // Loading state - show 1 loading card
                <div className="flex flex-col items-center">
                  <div className="w-full aspect-square rounded-xl bg-gray-200 mb-2 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-12 animate-pulse" />
                </div>
              ) : likedTracks.length > 0 ? (
                // Show actual liked tracks (up to 6)
                likedTracks.slice(0, 6).map((track) => (
                  <div key={track.id} className="flex flex-col items-center">
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2">
                      <img
                        src={track.image}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handlePlaySong(track)}
                        className="absolute inset-0 bg-black/20 flex items-center justify-center hover:bg-black/40 transition-colors"
                      >
                        {currentTrack?.id === track.id && isPlaying ? (
                          <Pause className="w-4 h-4 text-white fill-white" />
                        ) : (
                          <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                        )}
                      </button>
                    </div>
                    <span className="text-xs text-black font-medium text-center">
                      {getTwoWords(track.title)}
                    </span>
                  </div>
                ))
              ) : (
                // Empty state - show only 1 empty card
                <div className="flex flex-col items-center">
                  <div className="w-full aspect-square rounded-xl bg-gray-100 mb-2 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-gray-400" />
                  </div>
                  <span className="text-xs text-gray-400 font-medium text-center">
                    No likes yet
                  </span>
                </div>
              )}
            </div>
            
            {/* Underline */}
            <div className="w-full h-0.5 bg-gray-200 mt-4"></div>
          </div>

          {/* My Songs Section */}
          <div className="px-6">
            <h2 className="text-xl font-bold text-black mb-6">My songs</h2>
            
            {/* Songs Count */}
            <div className="flex items-center gap-2 mb-6">
              <Music className="w-5 h-5 text-black" />
              <span className="text-black font-medium">{featuredTracks.length} songs</span>
            </div>

            {/* Empty State */}
            {featuredTracks.length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Music className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-black text-lg font-medium mb-4">No songs yet</p>
                <button
                  onClick={handleCreateMusic}
                  className="text-blue-500 font-medium text-lg"
                >
                  Create your first song
                </button>
              </div>
            )}

            {/* Songs List */}
            {featuredTracks.length > 0 && (
              <div className="space-y-4">
                {featuredTracks.map((song) => (
                  <div key={song.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    {/* Song Image */}
                    <div className="relative">
                      <img
                        src={song.image}
                        alt={song.title}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      {/* Play/Pause Button Overlay */}
                      <button
                        onClick={() => handlePlaySong(song)}
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-xl opacity-0 hover:opacity-100 transition-opacity"
                      >
                        {currentTrack?.id === song.id && isPlaying ? (
                          <Pause className="w-6 h-6 text-white" />
                        ) : (
                          <Play className="w-6 h-6 text-white ml-1" />
                        )}
                      </button>
                    </div>

                    {/* Song Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-black truncate">{song.title}</h3>
                      <p className="text-gray-600 text-sm truncate">{song.description}</p>
                      <div className="flex items-center gap-4 text-gray-500 text-xs mt-1">
                        <span>{song.duration || '3:45'}</span>
                        <span>{song.plays} plays</span>
                        <span>{song.likes} likes</span>
                        {song.tags && <span>#{song.tags}</span>}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Like Button */}
                      <button
                        onClick={() => handleLikeSong(song)}
                        disabled={likingTracks.has(song.id)}
                        className={`p-2 rounded-full transition-colors ${
                          song.isLiked
                            ? 'text-red-500 bg-red-50'
                            : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                        } ${likingTracks.has(song.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Heart
                          className={`w-5 h-5 ${song.isLiked ? 'fill-current' : ''}`}
                        />
                      </button>

                      {/* Play Button */}
                      <button
                        onClick={() => handlePlaySong(song)}
                        className="p-2 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                      >
                        {currentTrack?.id === song.id && isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5 ml-0.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Bottom Navigation - Hide when CreateMusicScreen is shown */}
        {!showCreateScreen && (
          <BottomNav
            active="library"
            onHome={onBack}
            onLibrary={() => {}}
            onCreate={handleCreateMusic}
            onInbox={onInbox}
            onAccount={onAccountSettings}
            badgeCount={1}
            accountInitial="S"
          />
        )}

        {/* Create Music Screen Overlay */}
        {showCreateScreen && (
          <div className="absolute inset-0 z-50">
            <CreateMusicScreen
              onClose={handleCloseCreateScreen}
              onPlaySong={(song) => {
                handleCloseCreateScreen();
                // You can handle the created song here if needed
              }}
            />
          </div>
        )}

        {/* Create Playlist Modal */}
        {showCreatePlaylist && (
          <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-xl font-bold text-black mb-4">Create New Playlist</h3>

              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Enter playlist name"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:border-black mb-6"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSavePlaylist();
                  }
                }}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCreatePlaylist(false);
                    setNewPlaylistName('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePlaylist}
                  disabled={!newPlaylistName.trim()}
                  className="flex-1 px-4 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MySongsScreen;
