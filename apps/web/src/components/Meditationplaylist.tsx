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

interface MeditationPlaylistProps {
  onBack: () => void;
  onCreateMusic: () => void;
  onMySongs: () => void;
  onAccountSettings: () => void;
}

const MeditationPlaylist: React.FC<MeditationPlaylistProps> = ({
  onBack,
  onCreateMusic,
  onMySongs,
  onAccountSettings,
}) => {
  const meditationTracks: Song[] = [
    {
      id: '1',
      title: 'Morning Meditation',
      duration: '4 min',
      image: getSmartThumbnail('Morning Meditation', 'peaceful morning mindfulness', 'meditation morning', '1'),
    },
    {
      id: '2',
      title: 'Breathing Focus',
      duration: '4 min',
      image: getSmartThumbnail('Breathing Focus', 'deep breathing meditation', 'meditation breathing', '2'),
    },
    {
      id: '3',
      title: 'Body Scan',
      duration: '4 min',
      image: getSmartThumbnail('Body Scan', 'relaxing body awareness', 'meditation body', '3'),
    },
    {
      id: '4',
      title: 'Stress Relief',
      duration: '4 min',
      image: getSmartThumbnail('Stress Relief', 'calming stress meditation', 'meditation stress', '4'),
    },
    {
      id: '5',
      title: 'Inner Peace',
      duration: '4 min',
      image: getSmartThumbnail('Inner Peace', 'tranquil peace meditation', 'meditation peace', '5'),
    },
    {
      id: '6',
      title: 'Mindful Awareness',
      duration: '4 min',
      image: getSmartThumbnail('Mindful Awareness', 'present moment meditation', 'meditation mindful', '6'),
    },
    {
      id: '7',
      title: 'Sleep Meditation',
      duration: '4 min',
      image: getSmartThumbnail('Sleep Meditation', 'restful sleep preparation', 'meditation sleep', '7'),
    },
    {
      id: '8',
      title: 'Loving Kindness',
      duration: '4 min',
      image: getSmartThumbnail('Loving Kindness', 'compassion meditation practice', 'meditation love', '8'),
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
            <h1 className="text-xl font-bold text-black">Meditation</h1>
          </div>
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center">
            <X className="w-6 h-6 text-black" />
          </button>
        </div>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto pb-[180px] [padding-bottom:calc(env(safe-area-inset-bottom)+180px)] bg-white">
          <div className="px-6 py-4">
            <div className="space-y-4">
              {meditationTracks.map((track) => (
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

export default MeditationPlaylist;
