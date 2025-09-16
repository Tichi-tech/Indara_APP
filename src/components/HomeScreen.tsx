import React, { useState } from 'react';
import { Play, Heart } from 'lucide-react';
import BottomNav from './BottomNav';

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
}) => {
  const [activeCategory, setActiveCategory] = useState<'music' | 'meditation'>('music');

  // Sample data
  const healingTracks: Song[] = [
    {
      id: 'h1',
      title: 'Peaceful Morning',
      description: 'Gentle piano with nature sounds',
      tags: 'piano, nature, morning',
      plays: 1200,
      likes: 89,
      image:
        'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400',
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
      image:
        'https://images.pexels.com/photos/167491/pexels-photo-167491.jpeg?auto=compress&cs=tinysrgb&w=400',
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
      image:
        'https://images.pexels.com/photos/1496373/pexels-photo-1496373.jpeg?auto=compress&cs=tinysrgb&w=400',
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
      image:
        'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400',
      version: '1.0',
      isPublic: true,
      createdAt: '2024-01-12',
      creator: 'Forest.Therapy',
      duration: '5:20',
    },
  ];

  const featuredPlaylists: Playlist[] = [
    {
      id: '1',
      title: 'Decreasing Anxiety',
      description: 'Calming sounds to reduce stress and anxiety',
      image:
        'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400',
      creator: 'Healing Sounds',
      plays: 23400,
      likes: 23400,
      trackCount: 12,
    },
    {
      id: '2',
      title: 'Sleep Soothing',
      description: 'Gentle melodies for peaceful sleep',
      image:
        'https://images.pexels.com/photos/1496373/pexels-photo-1496373.jpeg?auto=compress&cs=tinysrgb&w=400',
      creator: 'Dream Therapy',
      plays: 23400,
      likes: 23400,
      trackCount: 18,
    },
    {
      id: '3',
      title: 'Shifting Your Mood',
      description: 'Calming sounds to reduce stress and anxiety',
      image:
        'https://images.pexels.com/photos/167491/pexels-photo-167491.jpeg?auto=compress&cs=tinysrgb&w=400',
      creator: 'Mood Lifters',
      plays: 23400,
      likes: 23400,
      trackCount: 15,
    },
    {
      id: '4',
      title: 'Focusing',
      description: 'Calming sounds to reduce stress and anxiety',
      image:
        'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400',
      creator: 'Focus Flow',
      plays: 23400,
      likes: 23400,
      trackCount: 20,
    },
    {
      id: '5',
      title: 'Baby Sleep',
      description: 'Gentle lullabies for babies and toddlers',
      image:
        'https://images.pexels.com/photos/1496373/pexels-photo-1496373.jpeg?auto=compress&cs=tinysrgb&w=400',
      creator: 'Baby Dreams',
      plays: 23400,
      likes: 23400,
      trackCount: 25,
    },
    {
      id: '6',
      title: 'Ambient',
      description: 'Atmospheric sounds for deep relaxation',
      image:
        'https://images.pexels.com/photos/167491/pexels-photo-167491.jpeg?auto=compress&cs=tinysrgb&w=400',
      creator: 'Ambient Space',
      plays: 23400,
      likes: 23400,
      trackCount: 30,
    },
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
        <main className="flex-1 overflow-y-auto pb-[120px] [padding-bottom:calc(env(safe-area-inset-bottom)+120px)]">
          {/* Healing Community */}
          <section className="mb-8">
            <div className="flex items-center justify-between px-6 mb-4">
              <h2 className="text-2xl font-bold text-black">Healing Community</h2>
              <button className="text-gray-600 font-medium flex items-center gap-1">
                More
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="overflow-x-auto no-scrollbar px-6">
              <div className="flex gap-4 w-max">
                {healingTracks.map((track) => (
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
                          aria-label={`Play ${track.title}`}
                          className="absolute bottom-3 left-3 w-10 h-10 bg-gray-700/80 rounded-full flex items-center justify-center backdrop-blur-sm"
                        >
                          <Play className="w-5 h-5 text-white fill-white ml-0.5" aria-hidden="true" />
                        </button>
                      </div>

                      {/* Info */}
                      <div className="bg-white p-1.5 grid grid-rows-[auto_auto_auto] min-h-[118px]">
                        <h3 className="font-semibold text-black text-sm line-clamp-1">{track.title}</h3>
                        <p className="text-gray-600 text-xs leading-snug line-clamp-2">
                          {track.description}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-6 h-6 bg-gray-300 rounded-full shrink-0" aria-hidden="true" />
                            <span className="text-gray-500 text-xs truncate">@{track.creator}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
                            <span className="flex items-center gap-1">
                              <Play className="w-3 h-3" aria-hidden="true" />
                              {track.plays}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" aria-hidden="true" />
                              {track.likes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Featured Playlists — correct layout */}
          <section className="px-6">
            <h2 className="text-2xl font-bold text-black mb-6">Featured Playlists</h2>

            <div className="space-y-4">
              {featuredPlaylists.map((playlist) => (
                <article key={playlist.id} className="bg-white p-4 rounded-2xl shadow-sm w-full">
                  {/* Layout: [thumb | text (expand/shrink) | stats (no shrink)] */}
                  <div className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-4">
                    {/* Thumb */}
                    <img
                      src={playlist.image}
                      alt={playlist.title}
                      loading="lazy"
                      className="w-16 h-16 rounded-xl object-cover"
                    />

                    {/* Text */}
                    <div className="min-w-0 w-full">
                      <h3 className="font-bold text-black text-lg mb-1 line-clamp-1">
                        {playlist.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-snug line-clamp-2">
                        {playlist.description}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 justify-self-end whitespace-nowrap text-sm text-gray-700 shrink-0">
                      <span className="inline-flex items-center gap-1" aria-label={`${playlist.plays} plays`}>
                        <Play className="w-4 h-4" aria-hidden="true" />
                        {playlist.plays.toLocaleString()}
                      </span>
                      <span className="inline-flex items-center gap-1" aria-label={`${playlist.likes} likes`}>
                        <Heart className="w-4 h-4" aria-hidden="true" />
                        {playlist.likes.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </article>
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
          onInbox={() => {}}
          onAccount={onAccountSettings}
          badgeCount={1}
          accountInitial="S"
        />
      </div>
    </div>
  );
};

export default HomeScreen;
