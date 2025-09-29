import React from 'react';
import { ArrowLeft, X, Play, ChevronRight } from 'lucide-react';
import BottomNav from './BottomNav';
import { getSmartThumbnail } from '../utils/thumbnailMatcher';

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

const HealingMusicPlaylist: React.FC<HealingMusicPlaylistProps> = ({
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
      image: getSmartThumbnail('Calm music', 'peaceful healing meditation', 'healing calm', '1'),
    },
    {
      id: '2',
      title: 'Relax music',
      duration: '4 min',
      image: getSmartThumbnail('Relax music', 'relaxing ambient meditation', 'healing relax', '2'),
    },
    {
      id: '3',
      title: 'Soothing music',
      duration: '4 min',
      image: getSmartThumbnail('Soothing music', 'gentle healing sounds', 'healing soothing', '3'),
    },
    {
      id: '4',
      title: 'Relax music',
      duration: '4 min',
      image: getSmartThumbnail('Relax music', 'relaxing ambient meditation', 'healing relax', '4'),
    },
    {
      id: '5',
      title: 'Relax music',
      duration: '4 min',
      image: getSmartThumbnail('Relax music', 'relaxing ambient meditation', 'healing relax', '5'),
    },
    {
      id: '6',
      title: 'Soothing music',
      duration: '4 min',
      image: getSmartThumbnail('Soothing music', 'gentle healing sounds', 'healing soothing', '6'),
    },
    {
      id: '7',
      title: 'Relax music',
      duration: '4 min',
      image: getSmartThumbnail('Relax music', 'relaxing ambient meditation', 'healing relax', '7'),
    },
    {
      id: '8',
      title: 'Relax music',
      duration: '4 min',
      image: getSmartThumbnail('Relax music', 'relaxing ambient meditation', 'healing relax', '8'),
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

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto pb-[180px] [padding-bottom:calc(env(safe-area-inset-bottom)+180px)] bg-white">
          <div className="px-6 py-4">
            <div className="space-y-4">
              {healingMusicTracks.map((track) => (
                <div key={track.id} className="flex items-center gap-4 py-2">
                  {/* Track Image */}
                  <div className="relative">
                    <img
                      src={track.image}
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
                      <Play className="w-4 h-4" />
                      <span className="text-sm">{track.duration}</span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <button className="w-8 h-8 flex items-center justify-center">
                    <ChevronRight className="w-6 h-6 text-black" />
                  </button>
                </div>
              ))}
            </div>
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
