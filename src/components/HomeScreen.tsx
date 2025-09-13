import React from 'react';
import { Plus, Search } from 'lucide-react';

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
  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-black">Good evening</h1>
          <p className="text-gray-600">{userName}</p>
        </div>
        <button 
          onClick={onAccountSettings}
          className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-400 rounded-full flex items-center justify-center"
        >
          <span className="text-white text-sm font-bold">
            {userName.charAt(0).toUpperCase()}
          </span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for healing music..."
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onCreateMusic}
            className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 text-white p-4 rounded-xl flex items-center gap-3 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <Plus className="w-6 h-6" />
            <span className="font-medium">Create Music</span>
          </button>
          <button
            onClick={onMySongs}
            className="bg-gray-100 text-gray-800 p-4 rounded-xl flex items-center gap-3 transition-all duration-200 hover:bg-gray-200 active:scale-95"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
            </svg>
            <span className="font-medium">My Library</span>
          </button>
        </div>
      </div>

      {/* Featured Content */}
      <div className="flex-1 px-6 pb-20">
        <h2 className="text-xl font-semibold text-black mb-4">Featured Healing Music</h2>
        
        {songs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-gray-400">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <p className="text-gray-600 mb-4">No featured music yet</p>
            <button
              onClick={onCreateMusic}
              className="text-black font-medium underline"
            >
              Create your first healing track
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {songs.map((song) => (
              <div
                key={song.id}
                onClick={() => onPlaySong(song)}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl cursor-pointer transition-all duration-200 hover:bg-gray-100 active:scale-95"
              >
                <img
                  src={song.image}
                  alt={song.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-black truncate">{song.title}</h3>
                  <p className="text-gray-600 text-sm truncate">{song.creator || 'Community'}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-gray-500">{song.plays} plays</span>
                    <span className="text-xs text-gray-500">{song.likes} likes</span>
                    <span className="text-xs text-gray-500">{song.duration || '3:45'}</span>
                  </div>
                </div>
                <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5 ml-0.5">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;