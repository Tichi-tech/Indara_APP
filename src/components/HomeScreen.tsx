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
  onPlaylist: (playlistName: string, playlistDescription?: string) => void;
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
  const [activeCategory, setActiveCategory] = useState<'music' | 'meditation'>('music');
  const [featuredTracks, setFeaturedTracks] = useState<Song[]>([]);
  const [likingTracks, setLikingTracks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Sample data with smart thumbnails
  const musicTracks: Song[] = [
    {
      id: 'h1',
      title: 'Peaceful Morning',
      description: 'Gentle piano with nature sounds',
      tags: 'piano, nature, morning',
      plays: 1200,
      likes: 89,
      image: getSmartThumbnail('Peaceful Morning', 'Gentle piano with nature sounds', 'piano, nature, morning', 'h1'),
      version: '1.0',
      isPublic: true,
      createdAt: '2024-01-15',
      creator: 'Sarah.K',
      duration: '4:32',
    },
    {
      id: 'h2',
      title: 'Deep Meditation',
      description: 'Lo-fi sounds with ambient',
      tags: 'ambient, meditation, lofi',
      plays: 2800,
      likes: 156,
      image: getSmartThumbnail('Deep Meditation', 'Lo-fi sounds with ambient', 'ambient, meditation, lofi', 'h2'),
      version: '1.0',
      isPublic: true,
      createdAt: '2024-01-14',
      creator: 'Sarah.K',
      duration: '6:15',
    },
    {
      id: 'h3',
      title: 'Ocean Waves',
      description: 'Natural ocean sounds for relaxation',
      tags: 'nature, ocean, relaxation',
      plays: 3200,
      likes: 201,
      image: getSmartThumbnail('Ocean Waves', 'Natural ocean sounds for relaxation', 'nature, ocean, relaxation', 'h3'),
      version: '1.0',
      isPublic: true,
      createdAt: '2024-01-13',
      creator: 'Nature.Sounds',
      duration: '8:45',
    },
    {
      id: 'h4',
      title: 'Forest Whispers',
      description: 'Gentle forest ambience',
      tags: 'forest, nature, ambient',
      plays: 1800,
      likes: 134,
      image: getSmartThumbnail('Forest Whispers', 'Gentle forest ambience', 'forest, nature, ambient', 'h4'),
      version: '1.0',
      isPublic: true,
      createdAt: '2024-01-12',
      creator: 'Forest.Therapy',
      duration: '5:20',
    },
  ];

  const meditationTracks: Song[] = [
    {
      id: 'm1',
      title: 'Mindful Breathing',
      description: 'Guided breathing meditation for beginners',
      tags: 'breathing, mindfulness, guided',
      plays: 4200,
      likes: 312,
      image: getSmartThumbnail('Mindful Breathing', 'Guided breathing meditation for beginners', 'breathing, mindfulness, guided', 'm1'),
      version: '1.0',
      isPublic: true,
      createdAt: '2024-01-16',
      creator: 'Zen.Master',
      duration: '10:00',
    },
    {
      id: 'm2',
      title: 'Body Scan Relaxation',
      description: 'Progressive muscle relaxation technique',
      tags: 'body scan, relaxation, progressive',
      plays: 3600,
      likes: 278,
      image: getSmartThumbnail('Body Scan Relaxation', 'Progressive muscle relaxation technique', 'body scan, relaxation, progressive', 'm2'),
      version: '1.0',
      isPublic: true,
      createdAt: '2024-01-15',
      creator: 'Calm.Guide',
      duration: '15:30',
    },
    {
      id: 'm3',
      title: 'Chakra Alignment',
      description: 'Healing frequencies for chakra balancing',
      tags: 'chakra, healing, frequencies',
      plays: 2900,
      likes: 189,
      image: getSmartThumbnail('Chakra Alignment', 'Healing frequencies for chakra balancing', 'chakra, healing, frequencies', 'm3'),
      version: '1.0',
      isPublic: true,
      createdAt: '2024-01-14',
      creator: 'Energy.Healer',
      duration: '20:15',
    },
    {
      id: 'm4',
      title: 'Sleep Meditation',
      description: 'Gentle meditation to help you fall asleep',
      tags: 'sleep, bedtime, gentle',
      plays: 5100,
      likes: 423,
      image: getSmartThumbnail('Sleep Meditation', 'Gentle meditation to help you fall asleep', 'sleep, bedtime, gentle', 'm4'),
      version: '1.0',
      isPublic: true,
      createdAt: '2024-01-13',
      creator: 'Dream.Guide',
      duration: '25:00',
    },
  ];

  // Fetch featured tracks on component mount
  useEffect(() => {
    const fetchFeaturedTracks = async () => {
      try {
        setLoading(true);
        const { data, error } = await musicApi.getFeaturedTracks();

        if (!error && data) {
          // Transform backend data to Song format
          const transformedTracks = data.map(track => ({
            id: track.id,
            title: track.title || 'Untitled',
            description: track.prompt || track.admin_notes || '',
            tags: track.style || '',
            plays: Math.floor(Math.random() * 1000), // Random until we have real play counts
            likes: Math.floor(Math.random() * 100),  // Random until we have real like counts
            image: track.thumbnail_url || getSmartThumbnail(
              track.title || 'Untitled',
              track.prompt || '',
              track.style || '',
              track.id
            ),
            version: '1.0',
            isPublic: true,
            createdAt: track.created_at,
            creator: track.profiles?.display_name || 'Community',
            duration: track.duration || '3:45',
            audio_url: track.audio_url
          }));
          setFeaturedTracks(transformedTracks);
        } else {
          setFeaturedTracks([]);
        }
      } catch (err) {
        console.error('Error fetching featured tracks:', err);
        setFeaturedTracks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedTracks();
  }, []);

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

  // Handle like track
  const handleLikeTrack = async (track: Song) => {
    if (!user?.id || likingTracks.has(track.id)) return;

    setLikingTracks(prev => new Set([...prev, track.id]));

    try {
      const { data, error } = await musicApi.likeTrack(user.id, track.id);
      if (error) {
        console.error('Failed to toggle like:', error);
      } else {
        console.log(`Track ${data.liked ? 'liked' : 'unliked'}`);

        // Send notification if track was liked (and not owned by current user)
        if (data.liked && track.creator !== user.email) {
          // Find track owner and send notification
          // Note: You'll need to implement a way to get track owner's user_id
          // For now, we'll use a placeholder
          console.log('Would send like notification for track:', track.title);
          // await musicApi.notifyTrackLiked(trackOwnerId, user.id, track.id, track.title);
        }
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
      image: track.thumbnail_url || getSmartThumbnail(
        track.title || 'Untitled',
        track.prompt || '',
        track.style || '',
        track.id
      ),
      version: '1.0',
      isPublic: true,
      createdAt: track.created_at,
      creator: track.profiles?.display_name || 'Community',
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

  // Get current tracks based on active category - use real data if available, fallback to sample
  const currentTracks = featuredTracks.length > 0 ? featuredTracks : (activeCategory === 'music' ? musicTracks : meditationTracks);

  const featuredPlaylists: Playlist[] = [
    {
      id: '1',
      title: 'Decreasing Anxiety',
      description: 'Calming sounds to reduce stress and anxiety',
      image: '/thumbnails/relax/relax-calm.png',
      creator: 'Healing Sounds',
      plays: 23400,
      likes: 23400,
      trackCount: 12,
    },
    {
      id: '2',
      title: 'Sleep Soothing',
      description: 'Gentle melodies for peaceful sleep',
      image: '/thumbnails/sleep/sleep-soothing.png',
      creator: 'Dream Therapy',
      plays: 18500,
      likes: 15200,
      trackCount: 18,
    },
    {
      id: '3',
      title: 'Yoga',
      description: 'Mindful movements and relaxing soundscapes',
      image: '/thumbnails/yoga/Yoga-relax.png',
      creator: 'Zen Flow',
      plays: 12800,
      likes: 9400,
      trackCount: 15,
    },
    {
      id: '4',
      title: 'Baby Setting',
      description: 'Gentle lullabies for babies and toddlers',
      image: '/thumbnails/babysetting/babysetting.png',
      creator: 'Baby Dreams',
      plays: 31200,
      likes: 28600,
      trackCount: 25,
    },
    {
      id: '5',
      title: 'Meditation',
      description: 'Deep meditation sessions for inner peace',
      image: '/thumbnails/meditation/Meditation-clam.png',
      creator: 'Mindful Space',
      plays: 16700,
      likes: 13900,
      trackCount: 20,
    },
    {
      id: '6',
      title: 'Focusing',
      description: 'Enhanced concentration and productivity sounds',
      image: '/thumbnails/study/study-focus.png',
      creator: 'Focus Flow',
      plays: 21300,
      likes: 17800,
      trackCount: 22,
    },
  ];

  return (
    <div className="min-h-dvh bg-white">
      <div className="mx-auto max-w-[420px] h-dvh flex flex-col">

        {/* Category Tabs */}
        <div className="px-6 py-4 flex justify-center sticky top-0 bg-white/90 backdrop-blur z-10">
          <div className="flex items-center gap-3 bg-gray-100 p-1 rounded-full">
            <button
              onClick={() => setActiveCategory('music')}
              className={`px-8 py-3 rounded-full font-medium transition-colors min-w-[120px] ${
                activeCategory === 'music'
                  ? 'bg-black text-white'
                  : 'bg-transparent text-gray-600 hover:bg-gray-200'
              }`}
              aria-pressed={activeCategory === 'music'}
            >
              Music
            </button>
            <button
              onClick={() => setActiveCategory('meditation')}
              className={`px-8 py-3 rounded-full font-medium transition-colors min-w-[120px] ${
                activeCategory === 'meditation'
                  ? 'bg-black text-white'
                  : 'bg-transparent text-gray-600 hover:bg-gray-200'
              }`}
              aria-pressed={activeCategory === 'meditation'}
            >
              Meditation
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto pb-[180px] [padding-bottom:calc(env(safe-area-inset-bottom)+180px)]">
          {/* Healing Community */}
          <section className="mb-8">
            <div className="flex items-center justify-between px-6 mb-4">
              <h2 className="text-2xl font-bold text-black">Healing Community</h2>
              <button 
                onClick={activeCategory === 'music' ? onHealingMusicPlaylist : onMeditationPlaylist}
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
                              <button
                                onClick={() => handlePlayTrack(track)}
                                className="flex items-center gap-0.5 hover:text-purple-500 transition-colors"
                              >
                                <Play className="w-2.5 h-2.5" aria-hidden="true" />
                                <span className="text-[10px]">{track.plays}</span>
                              </button>
                              <button
                                onClick={() => handleLikeTrack(track)}
                                disabled={likingTracks.has(track.id)}
                                className={`flex items-center gap-0.5 transition-colors ${
                                  likingTracks.has(track.id)
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:text-red-500'
                                }`}
                              >
                                <Heart className="w-2.5 h-2.5" aria-hidden="true" />
                                <span className="text-[10px]">{track.likes}</span>
                              </button>
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
            <h2 className="text-2xl font-bold text-black mb-6">Featured Playlists</h2>

            <div className="space-y-4">
              {featuredPlaylists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => onPlaylist(playlist.title, playlist.description)}
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
