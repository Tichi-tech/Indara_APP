import React from 'react';
import { ArrowLeft, Settings, Play, MoreVertical } from 'lucide-react';

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
  onAccountSettings: () => void;
  userSongs: Song[];
  onPlaySong: (song: Song) => void;
  userName: string;
}

const MySongsScreen: React.FC<MySongsScreenProps> = ({
  onBack,
  onAccountSettings,
  userSongs,
  onPlaySong,
  userName
}) => {
  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <button onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
        <h1 className="text-lg font-semibold text-black">My Library</h1>
        <button onClick={onAccountSettings} className="p-2 -mr-2">
          <Settings className="w-6 h-6 text-black" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-20 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-black mb-2">
            Your healing music
          </h2>
          <p className="text-gray-600">
            {userSongs.length} {userSongs.length === 1 ? 'track' : 'tracks'} created
          </p>
        </div>

        {userSongs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-gray-400">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-black mb-2">No music yet</h3>
            <p className="text-gray-600 mb-4">Create your first healing track to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {userSongs.map((song) => (
              <div
                key={song.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-gray-100"
              >
                <img
                  src={song.image}
                  alt={song.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-black truncate">{song.title}</h3>
                  <p className="text-gray-600 text-sm truncate">{song.description}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-gray-500">{song.plays} plays</span>
                    <span className="text-xs text-gray-500">{song.likes} likes</span>
                    <span className="text-xs text-gray-500">{song.duration || '3:45'}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      song.isPublic 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {song.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => onPlaySong(song)}
                    className="w-10 h-10 bg-black rounded-full flex items-center justify-center"
                  >
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center">
                    <MoreVertical className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MySongsScreen;