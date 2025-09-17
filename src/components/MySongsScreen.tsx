import React, { useState } from 'react';
import { ArrowLeft, Search, Music, Plus, Filter } from 'lucide-react';
import BottomNav from './BottomNav';
import CreateMusicScreen from './CreateMusicScreen';

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
  userName: string;
  userSongs: Song[];
  onPlaySong: (song: Song) => void;
}

const MySongsScreen: React.FC<MySongsScreenProps> = ({
  onBack,
  onCreateMusic,
  onAccountSettings,
  userName: _userName,
  userSongs,
  onPlaySong: _onPlaySong
}) => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [showCreateScreen, setShowCreateScreen] = useState(false);

  const filters = ['All', 'Music', 'Meditation'];

  const handleCreateMusic = () => {
    setShowCreateScreen(true);
  };

  const handleCloseCreateScreen = () => {
    setShowCreateScreen(false);
  };

  // Sample playlist data
  const playlists = [
    {
      id: '1',
      title: 'soothing sleep',
      image: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '2',
      title: 'soothing sleep',
      image: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '3',
      title: 'soothing sleep',
      image: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  // Sample liked songs data
  const likedSongs = [
    {
      id: '1',
      title: 'soothing sleep',
      image: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '2',
      title: 'soothing sleep',
      image: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400'
    },
    {
      id: '3',
      title: 'soothing sleep',
      image: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400'
    }
  ];

  return (
    <div className="min-h-dvh bg-white">
      <div className="mx-auto max-w-[420px] h-dvh flex flex-col">
        {/* Status bar sim */}
        <header className="flex items-center justify-between px-6 py-2 text-sm font-medium">
          <span aria-hidden="true">13:06</span>
          <div className="flex items-center gap-1" aria-hidden="true">
            <div className="flex gap-1">
              <div className="w-1 h-3 bg-black rounded-full" />
              <div className="w-1 h-3 bg-black rounded-full" />
              <div className="w-1 h-3 bg-black rounded-full" />
            </div>
            <div className="w-4 h-3 border border-black rounded-sm">
              <div className="w-3 h-2 bg-black rounded-sm m-0.5" />
            </div>
          </div>
        </header>

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
        <main className="flex-1 overflow-y-auto pb-[120px] [padding-bottom:calc(env(safe-area-inset-bottom)+120px)] bg-white">
          {/* Playlists Section */}
          <div className="px-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-4xl font-bold text-black">Playlists</h2>
              <button 
                onClick={handleCreateMusic}
                className="w-8 h-8 flex items-center justify-center"
              >
                <Plus className="w-8 h-8 text-black" />
              </button>
            </div>
            
            {/* Playlists Grid */}
            <div className="grid grid-cols-3 gap-4 mb-2">
              {playlists.map((playlist) => (
                <div key={playlist.id} className="flex flex-col items-center">
                  <img
                    src={playlist.image}
                    alt={playlist.title}
                    className="w-full aspect-square rounded-2xl object-cover mb-3"
                  />
                  <span className="text-sm text-black font-medium text-center">
                    {playlist.title}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Underline */}
            <div className="w-full h-0.5 bg-gray-200 mt-4"></div>
          </div>

          {/* Liked Section */}
          <div className="px-6 mb-8">
            <h2 className="text-4xl font-bold text-black mb-6">Liked</h2>
            
            {/* Liked Songs Grid */}
            <div className="grid grid-cols-3 gap-4 mb-2">
              {likedSongs.map((song) => (
                <div key={song.id} className="flex flex-col items-center">
                  <img
                    src={song.image}
                    alt={song.title}
                    className="w-full aspect-square rounded-2xl object-cover mb-3"
                  />
                  <span className="text-sm text-black font-medium text-center">
                    {song.title}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Underline */}
            <div className="w-full h-0.5 bg-gray-200 mt-4"></div>
          </div>

          {/* My Songs Section */}
          <div className="px-6">
            <h2 className="text-4xl font-bold text-black mb-6">My songs</h2>
            
            {/* Songs Count and Filter */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-black" />
                <span className="text-black font-medium">{userSongs.length} songs</span>
              </div>
              <button className="flex items-center gap-2 text-black">
                <span className="font-medium">Filter</span>
                <Filter className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-3 mb-8">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-6 py-3 rounded-full font-medium transition-colors ${
                    activeFilter === filter
                      ? 'bg-black text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Empty State */}
            {userSongs.length === 0 && (
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
          </div>
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          active="library"
          onHome={onBack}
          onLibrary={() => {}}
          onCreate={handleCreateMusic}
          onInbox={() => {}}
          onAccount={onAccountSettings}
          badgeCount={1}
          accountInitial="S"
        />

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
      </div>
    </div>
  );
};

export default MySongsScreen;
