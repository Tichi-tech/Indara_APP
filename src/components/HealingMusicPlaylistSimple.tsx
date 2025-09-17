import React from 'react';
import { ArrowLeft, X, Play, ChevronRight } from 'lucide-react';

interface Song {
  id: string;
  title: string;
  duration: string;
  image: string;
}

interface HealingMusicPlaylistProps {
  onBack: () => void;
  onCreateMusic: () => void;
  onMySongs: () => void;
  onAccountSettings: () => void;
}

const HealingMusicPlaylistSimple: React.FC<HealingMusicPlaylistProps> = ({
  onBack,
  onCreateMusic,
  onMySongs,
  onAccountSettings,
}) => {
  const healingMusicTracks: Song[] = [
    {
      id: '1',
      title: 'Calm music',
      duration: '4 min',
      image: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      id: '2',
      title: 'Relax music',
      duration: '4 min',
      image: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
  ];

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

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-white">
          <div className="space-y-4">
            {healingMusicTracks.map((track) => (
              <div key={track.id} className="flex items-center gap-4 py-2">
                <img
                  src={track.image}
                  alt={track.title}
                  className="w-16 h-16 rounded-2xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-black text-lg mb-1">
                    {track.title}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Play className="w-4 h-4" />
                    <span className="text-sm">{track.duration}</span>
                  </div>
                </div>
                <button className="w-8 h-8 flex items-center justify-center">
                  <ChevronRight className="w-6 h-6 text-black" />
                </button>
              </div>
            ))}
          </div>
        </main>

        {/* Simple Bottom Nav */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex justify-around">
            <button onClick={onBack} className="text-black">Home</button>
            <button onClick={onMySongs} className="text-gray-400">Library</button>
            <button onClick={onCreateMusic} className="text-gray-400">Create</button>
            <button onClick={onAccountSettings} className="text-gray-400">Account</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealingMusicPlaylistSimple;