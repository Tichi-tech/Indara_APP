import { useEffect, useState } from 'react';
import type { Track } from '../types/music';

const DEMO: Track[] = [
  {
    id: '1',
    title: 'SoundHelix 1',
    artist: 'Helix',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: '2',
    title: 'SoundHelix 2',
    artist: 'Helix',
    audio_url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
];

export function useTracks() {
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    setTracks(DEMO);
  }, []);

  return { tracks };
}
