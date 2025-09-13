import React, { useState } from 'react';
import { ArrowLeft, Search, Music, Plus, Filter, Play, MoreHorizontal, Globe, Lock } from 'lucide-react';

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

interface HomeScreenProps {
  onCreateMusic: () => void;
  onMySongs: () => void;
  onAccountSettings: () => void;
  userName: string;
  userHandle: string;
  songs: Song[];
  onPlaySong: (song: Song) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  onCreateMusic,
  onMySongs,
  onAccountSettings,
  userName,
  userHandle: _userHandle,
  songs,
  onPlaySong
}) => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Music', 'Meditation'];

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white">
        <button className="w-10 h-10 flex items-center justify-center">
          <ArrowLeft className="w-6 h-6 text-gray-800" />
        </button>
        <button className="w-10 h-10 flex items-center justify-center">
          <Search className="w-6 h-6 text-gray-800" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {/* Gradient Cards */}
        <div className="px-6 mb-6">
          <div className="grid grid-cols-2 gap-4">
            {/* My Songs Card */}
            <button
              onClick={onMySongs}
              className="relative overflow-hidden bg-gradient-to-br from-blue-500 via-purple-600 to-orange-500 rounded-3xl p-6 h-32"
            >
              <div className="text-white text-left">
                <h3 className="text-lg font-semibold mb-3">My Songs</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="w-8 h-8 bg-white/20 rounded-lg overflow-hidden">
                    <img 
                      src="https://images.pexels.com/photos/167491/pexels-photo-167491.jpeg?auto=compress&cs=tinysrgb&w=100" 
                      alt="Song" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-8 h-8 bg-white/20 rounded-lg overflow-hidden">
                    <img 
                      src="https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=100" 
                      alt="Song" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-8 h-8 bg-white/20 rounded-lg overflow-hidden">
                    <img 
                      src="https://images.pexels.com/photos/1496373/pexels-photo-1496373.jpeg?auto=compress&cs=tinysrgb&w=100" 
                      alt="Song" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-8 h-8 bg-white/20 rounded-lg overflow-hidden">
                    <img 
                      src="https://images.pexels.com/photos/167491/pexels-photo-167491.jpeg?auto=compress&cs=tinysrgb&w=100" 
                      alt="Song" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </button>

            {/* Liked Card */}
            <button className="relative overflow-hidden bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-3xl p-6 h-32">
              <div className="text-white text-left">
                <h3 className="text-lg font-semibold">Liked</h3>
              </div>
            </button>
          </div>
        </div>

        {/* Playlists Section */}
        <div className="px-6 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Playlists</h2>
            <button 
              onClick={onCreateMusic}
              className="w-8 h-8 flex items-center justify-center"
            >
              <Plus className="w-6 h-6 text-gray-800" />
            </button>
          </div>
        </div>

        {/* My Songs Section */}
        <div className="px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">My Songs</h2>
          
          {/* Songs Count and Filter */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-gray-600" />
              <span className="text-gray-600 font-medium">{songs.length} Songs</span>
            </div>
            <button className="flex items-center gap-2 text-gray-600">
              <span className="font-medium">Filter</span>
              <Filter className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-3 mb-6">
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

          {/* Songs List */}
          <div className="space-y-4 pb-20">
            {songs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Music className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 mb-4">No songs yet</p>
                <button
                  onClick={onCreateMusic}
                  className="text-blue-600 font-medium"
                >
                  Create your first song
                </button>
              </div>
            ) : (
              songs.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center gap-4 py-2"
                >
                  {/* Song Image with Play Button */}
                  <div className="relative">
                    <img
                      src={song.image || "https://images.pexels.com/photos/167491/pexels-photo-167491.jpeg?auto=compress&cs=tinysrgb&w=100"}
                      alt={song.title}
                      className="w-16 h-16 rounded-2xl object-cover"
                    />
                    <button 
                      onClick={() => onPlaySong(song)}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-2xl opacity-0 hover:opacity-100 transition-opacity"
                    >
                      <Play className="w-6 h-6 text-white fill-white" />
                    </button>
                  </div>

                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate text-lg">
                      {song.title}
                    </h3>
                    <p className="text-gray-600 text-sm truncate mb-1">
                      {song.description || song.tags}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        <span>{song.plays}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>♡</span>
                        <span>{song.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {song.isPublic ? (
                          <>
                            <Globe className="w-3 h-3" />
                            <span>Public</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>Private</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* More Options */}
                  <button className="w-8 h-8 flex items-center justify-center">
                    <MoreHorizontal className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Home */}
            <button className="flex flex-col items-center gap-1 py-2">
              <div className="w-6 h-6 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-black">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
              </div>
              <span className="text-xs font-medium text-black">Home</span>
            </button>

            {/* Library */}
            <button className="flex flex-col items-center gap-1 py-2">
              <div className="w-6 h-6 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-400">
                  <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
                </svg>
              </div>
              <span className="text-xs font-medium text-gray-400">Library</span>
            </button>

            {/* Center Music Button */}
            <button 
              onClick={onCreateMusic}
              className="w-14 h-14 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-200"
            >
              <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </button>

            {/* Inbox */}
            <button className="flex flex-col items-center gap-1 py-2 relative">
              <div className="w-6 h-6 flex items-center justify-center relative">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-gray-400">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                </svg>
                {/* Notification dot */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <span className="text-xs font-medium text-gray-400">Inbox</span>
            </button>

            {/* Account */}
            <button 
              onClick={onAccountSettings}
              className="flex flex-col items-center gap-1 py-2"
            >
              <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-orange-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">S</span>
              </div>
              <span className="text-xs font-medium text-gray-400">Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
