export interface ThumbnailSet {
  genre: string;
  images: string[];
  keywords: string[];
  priority: number;
}

const THUMBNAIL_BASE_URL_KEYS = [
  'EXPO_PUBLIC_THUMBNAIL_BASE_URL',
  'NEXT_PUBLIC_THUMBNAIL_BASE_URL',
  'VITE_THUMBNAIL_BASE_URL',
  'THUMBNAIL_CDN_BASE_URL',
];

type EnvRecord = Record<string, string | undefined>;

const importMetaEnv: EnvRecord | undefined =
  typeof import.meta !== 'undefined' && import.meta && typeof import.meta === 'object'
    ? ((import.meta as any).env as EnvRecord | undefined)
    : undefined;

const processEnv: EnvRecord | undefined =
  typeof process !== 'undefined' && process?.env
    ? (process.env as EnvRecord)
    : undefined;

const envSources: EnvRecord[] = [processEnv, importMetaEnv].filter(Boolean) as EnvRecord[];

const readEnv = (keys: string[]) => {
  for (const source of envSources) {
    for (const key of keys) {
      const value = source[key];
      if (typeof value === 'string' && value.length > 0) {
        return value;
      }
    }
  }
  return undefined;
};

const THUMBNAIL_BASE_URL = readEnv(THUMBNAIL_BASE_URL_KEYS);
const FALLBACK_THUMBNAIL =
  'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400';

export const resolveThumbnailUri = (uri: string | null | undefined) => {
  if (!uri) return FALLBACK_THUMBNAIL;
  if (/^https?:\/\//i.test(uri)) return uri;
  if (!THUMBNAIL_BASE_URL) return FALLBACK_THUMBNAIL;

  const base = THUMBNAIL_BASE_URL.replace(/\/$/, '');
  const normalisedPath = uri.startsWith('/') ? uri : `/${uri}`;
  return `${base}${normalisedPath}`;
};

export const THUMBNAIL_SETS: ThumbnailSet[] = [
  {
    genre: 'ambient',
    images: [
      '/thumbnails/ambient/Ambient-forest.png',
      '/thumbnails/ambient/ambient-park.png',
      '/thumbnails/ambient/ambient-rainy.png',
      '/thumbnails/ambient/ambient-star.png',
      '/thumbnails/ambient/ambient-sunset.png'
    ],
    keywords: ['ambient', 'nature', 'calm', 'peaceful', 'atmospheric'],
    priority: 10
  },
  {
    genre: 'forest',
    images: [
      '/thumbnails/forest/Ambient-forest.png',
      '/thumbnails/forest/nature-healing.png'
    ],
    keywords: ['forest', 'trees', 'woodland', 'green', 'leaves'],
    priority: 15
  },
  {
    genre: 'nature',
    images: [
      '/thumbnails/nature/Ambient-forest.png',
      '/thumbnails/nature/calm-mountain.png',
      '/thumbnails/nature/nature-healing.png',
      '/thumbnails/nature/ocean-sunraise.png'
    ],
    keywords: ['nature', 'natural', 'landscape', 'outdoor', 'wild'],
    priority: 12
  },
  {
    genre: 'ocean',
    images: [
      '/thumbnails/ocean/ambient-sunset.png',
      '/thumbnails/ocean/ocean-nature.png',
      '/thumbnails/ocean/ocean-sunraise.png',
      '/thumbnails/ocean/ocean.png'
    ],
    keywords: ['ocean', 'waves', 'sea', 'beach', 'water', 'coastal'],
    priority: 15
  },
  {
    genre: 'rain',
    images: ['/thumbnails/rain/ambient-rainy.png'],
    keywords: ['rain', 'storm', 'water', 'drops', 'weather'],
    priority: 20
  },
  {
    genre: 'meditation',
    images: ['/thumbnails/meditation/Meditation-clam.png'],
    keywords: ['meditation', 'zen', 'mindfulness', 'peace', 'healing', 'wellness'],
    priority: 20
  },
  {
    genre: 'yoga',
    images: ['/thumbnails/yoga/Yoga-relax.png'],
    keywords: ['yoga', 'stretch', 'balance', 'mindful', 'wellness'],
    priority: 20
  },
  {
    genre: 'relax',
    images: [
      '/thumbnails/relax/relax-anxiety.png',
      '/thumbnails/relax/Calm-home.png',
      '/thumbnails/relax/relax-calm.png'
    ],
    keywords: ['relax', 'relaxing', 'calm', 'stress', 'anxiety', 'chill'],
    priority: 18
  },
  {
    genre: 'sleep',
    images: ['/thumbnails/sleep/sleep-soothing.png'],
    keywords: ['sleep', 'bedtime', 'night', 'soothing', 'rest', 'insomnia'],
    priority: 25
  },
  {
    genre: 'study',
    images: ['/thumbnails/study/study-focus.png'],
    keywords: ['study', 'focus', 'concentration', 'work', 'productivity', 'learning'],
    priority: 22
  },
  {
    genre: 'energy',
    images: ['/thumbnails/energy/energy.png'],
    keywords: ['energy', 'energetic', 'upbeat', 'motivation', 'active', 'power'],
    priority: 18
  },
  {
    genre: 'babysetting',
    images: ['/thumbnails/babysetting/babysetting.png'],
    keywords: ['baby', 'babies', 'infant', 'lullaby', 'child', 'children', 'nursery'],
    priority: 22
  },
  {
    genre: 'piano',
    images: ['/thumbnails/piano/piano.png'],
    keywords: ['piano', 'keys', 'classical', 'acoustic'],
    priority: 25
  },
  {
    genre: 'classical',
    images: ['/thumbnails/classical/classical.png'],
    keywords: ['classical', 'orchestra', 'symphony', 'violin', 'baroque'],
    priority: 25
  },
  {
    genre: 'default',
    images: ['https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400'],
    keywords: ['music', 'sound', 'audio'],
    priority: 1
  }
];

export const getSmartThumbnail = (
  title: string,
  prompt: string,
  style: string,
  trackId?: string
): string => {
  const content = `${title} ${prompt} ${style}`.toLowerCase();

  const matches = THUMBNAIL_SETS
    .map(set => ({
      set,
      score: calculateMatchScore(content, set)
    }))
    .filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score);

  const bestMatch = matches[0]?.set || THUMBNAIL_SETS.find(s => s.genre === 'default')!;

  const imageIndex = trackId
    ? hashString(trackId) % bestMatch.images.length
    : Math.floor(Math.random() * bestMatch.images.length);

  return bestMatch.images[imageIndex];
};

const calculateMatchScore = (content: string, thumbnailSet: ThumbnailSet): number => {
  let score = 0;

  thumbnailSet.keywords.forEach(keyword => {
    if (content.includes(keyword)) {
      score += thumbnailSet.priority;

      const words = content.split(/\s+/);
      if (words.includes(keyword)) {
        score += thumbnailSet.priority * 0.5;
      }
    }
  });

  return score;
};

const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};
