import React, { useState } from 'react';
import { Search, Play, MoreHorizontal, Star, TrendingUp, Share } from 'lucide-react';

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

interface TrendingTrack {
  id: string;
  rank: number;
  title: string;
  description: string;
  plays: number;
  likes: number;
  comments: number;
  creator: string;
  isTrending: boolean;
  tags: string[];
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
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  onCreateMusic,
  onMySongs,
  onAccountSettings,
  userName: _userName,
  userHandle: _userHandle,
  songs: _songs,
  onPlaySong: _onPlaySong,
  onNameEntry: _onNameEntry
}) => {
  const [activeTab, setActiveTab] = useState('Discover');

  // Sample playlists data
  const playlists: Playlist[] = [
    {
      id: '1',
      title: 'Decreasing Anxiety',
      description: 'Calming sounds to reduce stress and anxiety',
      image: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400',
      creator: 'Healing Sounds',
      plays: 15200,
      likes: 892,
      trackCount: 12
    },
    {
      id: '2',
      title: 'Sleep Soothing',
      description: 'Gentle melodies for peaceful sleep',
      image: 'https://images.pexels.com/photos/1496373/pexels-photo-1496373.jpeg?auto=compress&cs=tinysrgb&w=400',
      creator: 'Dream Therapy',
      plays: 23400,
      likes: 1205,
      trackCount: 18
    },
    {
      id: '3',
      title: 'Shifting Your Mood',
      description: 'Uplifting tracks to boost your energy',
      image: 'https://images.pexels.com/photos/167491/pexels-photo-167491.jpeg?auto=compress&cs=tinysrgb&w=400',
      creator: 'Mood Lifters',
      plays: 18700,
      likes: 967,
      trackCount: 15
    }
  ];

  // Sample community tracks
  const communityTracks: Song[] = [
    {
      id: 'c1',
      title: 'Peaceful Morning',
      description: 'Gentle piano with nature sounds',
      tags: 'piano, nature, morning',
      plays: 1200,
      likes: 89,
      image: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400',
      version: '1.0',
      isPublic: true,
      createdAt: '2024-01-15',
      creator: 'Sarah M.',
      duration: '4:32'
    },
    {
      id: 'c2',
      title: 'Deep Focus Flow',
      description: 'Ambient sounds for concentration',
      tags: 'ambient, focus, concentration',
      plays: 2800,
      likes: 156,
      image: 'https://images.pexels.com/photos/167491/pexels-photo-167491.jpeg?auto=compress&cs=tinysrgb&w=400',
      version: '1.0',
      isPublic: true,
      createdAt: '2024-01-14',
      creator: 'Alex K.',
      duration: '6:15'
    }
  ];

  // Sample trending tracks
  const trendingTracks: TrendingTrack[] = [
    {
      id: 't1',
      rank: 1,
      title: 'Fall apart',
      description: 'Female vocalist, London accent, +16',
      plays: 45200,
      likes: 3600,
      comments: 892,
      creator: 'S+T (Admin)',
      isTrending: true,
      tags: ['vocal', 'london', 'emotional']
    },
    {
      id: 't2',
      rank: 2,
      title: '29 Days',
      description: 'Skater Rock, Pop, E-Guitar, Fast +2',
      plays: 38900,
      likes: 2900,
      comments: 567,
      creator: 'Dray (Admin)',
      isTrending: true,
      tags: ['rock', 'pop', 'guitar', 'fast']
    },
    {
      id: 't3',
      rank: 3,
      title: 'Fashionably Late ft NYX Week',
      description: 'EDM, pop violin, and progressive rock',
      plays: 32100,
      likes: 2400,
      comments: 445,
      creator: 'NYX Collective',
      isTrending: true,
      tags: ['edm', 'violin', 'progressive']
    }
  ];

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header with Tabs */}
      <div className="bg-white px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('Discover')}
              className={`px-6 py-3 rounded-full font-medium transition-colors ${
                activeTab === 'Discover'
                  ? 'bg-black text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              Discover
            </button>
            <button
              onClick={() => setActiveTab('Library')}
              className={`px-6 py-3 rounded-full font-medium transition-colors ${
                activeTab === 'Library'
                  ? 'bg-black text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              Library
            </button>
          </div>
          <button className="w-10 h-10 flex items-center justify-center">
            <Search className="w-6 h-6 text-gray-800" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-16">
        {activeTab === 'Discover' ? (
          <>
            {/* Healing Music Community Section */}
            <div className="px-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Healing Music Community</h2>
                <button className="text-gray-500 font-medium">More</button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {communityTracks.map((track) => (
                  <div key={track.id} className="relative">
                    <div className="relative rounded-2xl overflow-hidden">
                      <img
                        src={track.image}
                        alt={track.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Community Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded">
                          COMMUNITY
                        </span>
                      </div>
                      
                      {/* Play Button */}
                      <button className="absolute bottom-3 left-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                      </button>
                      
                      {/* Stats */}
                      <div className="absolute bottom-3 right-3 flex items-center gap-3 text-white text-sm">
                        <div className="flex items-center gap-1">
                          <Play className="w-3 h-3" />
                          <span>{track.plays}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>♡</span>
                          <span>{track.likes}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Track Info */}
                    <div className="mt-3">
                      <h3 className="font-semibold text-gray-900 text-sm">{track.title}</h3>
                      <p className="text-gray-600 text-xs mb-1">{track.description}</p>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                        <span className="text-gray-500 text-xs">{track.creator}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Playlists Section */}
            <div className="px-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Featured Playlists</h2>
                <button className="text-gray-500 font-medium">More</button>
              </div>
              
              <div className="space-y-4">
                {playlists.map((playlist) => (
                  <div key={playlist.id} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm">
                    <div className="relative">
                      <img
                        src={playlist.image}
                        alt={playlist.title}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <button className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl opacity-0 hover:opacity-100 transition-opacity">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </button>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">{playlist.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{playlist.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{playlist.trackCount} tracks</span>
                        <div className="flex items-center gap-1">
                          <Play className="w-3 h-3" />
                          <span>{playlist.plays.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>♡</span>
                          <span>{playlist.likes}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button className="w-8 h-8 flex items-center justify-center">
                      <MoreHorizontal className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Global Trending Section */}
            <div className="px-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Global Trending</h2>
                <button className="text-gray-500 font-medium">More</button>
              </div>
              
              <div className="space-y-4">
                {trendingTracks.map((track) => (
                  <div key={track.id} className="bg-white p-4 rounded-2xl shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                          <Star className="w-4 h-4 text-black fill-black" />
                        </div>
                        <div className="text-2xl font-bold text-gray-400">#{track.rank}</div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-gray-900 text-lg">{track.title}</h3>
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                            TRENDING
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{track.description}</p>
                        <div className="flex items-center gap-6 text-sm text-gray-500 mb-2">
                          <div className="flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            <span>{track.plays.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>♡</span>
                            <span>{track.likes.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>💬</span>
                            <span>{track.comments}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                            <span>{track.creator}</span>
                          </div>
                        </div>
                      </div>
                      
                      <button className="w-8 h-8 flex items-center justify-center">
                        <Share className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Library Tab Content */
          <div className="px-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-gray-400">
                  <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your Library</h3>
              <p className="text-gray-600 mb-4">Your saved music and playlists will appear here</p>
              <button
                onClick={onMySongs}
                className="text-blue-600 font-medium"
              >
                Go to My Songs
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex items-center justify-around">
            {/* Home */}
            <button className="flex flex-col items-center gap-1 py-1 min-w-0">
              <div className="w-5 h-5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-black">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
              </div>
              <span className="text-xs font-medium text-black leading-none">Home</span>
            </button>

            {/* Library */}
            <button 
              onClick={onMySongs}
              className="flex flex-col items-center gap-1 py-1 min-w-0"
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-400">
                  <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-400 leading-none">Library</span>
            </button>

            {/* Center Music Button */}
            <button 
              onClick={onCreateMusic}
              className="w-12 h-12 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-200 -mt-1"
            >
              <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </button>

            {/* Inbox */}
            <button className="flex flex-col items-center gap-1 py-1 relative min-w-0">
              <div className="w-5 h-5 flex items-center justify-center relative">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-400">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                </svg>
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
              <span className="text-xs font-medium text-gray-400 leading-none">Inbox</span>
            </button>

            {/* Account */}
            <button 
              onClick={onAccountSettings}
              className="flex flex-col items-center gap-1 py-1 min-w-0"
            >
              <div className="w-5 h-5 bg-gradient-to-br from-pink-500 to-orange-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <span className="text-xs font-medium text-gray-400 leading-none">Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
