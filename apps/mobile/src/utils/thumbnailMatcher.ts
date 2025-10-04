const REMOTE_BASE = 'https://app.indara.live';

type ThumbnailSet = {
  genre: string;
  images: string[];
  keywords: string[];
  priority: number;
};

const withBase = (paths: string[]) =>
  paths.map((path) => (path.startsWith('http') ? path : `${REMOTE_BASE}${path}`));

const THUMBNAIL_SETS: ThumbnailSet[] = [
  {
    genre: 'ambient',
    images: withBase([
      '/thumbnails/ambient/Ambient-forest.png',
      '/thumbnails/ambient/ambient-park.png',
      '/thumbnails/ambient/ambient-rainy.png',
      '/thumbnails/ambient/ambient-star.png',
      '/thumbnails/ambient/ambient-sunset.png',
    ]),
    keywords: ['ambient', 'nature', 'calm', 'peaceful', 'atmospheric'],
    priority: 10,
  },
  {
    genre: 'sleep',
    images: withBase(['/thumbnails/sleep/sleep-soothing.png']),
    keywords: ['sleep', 'soothing', 'rest', 'night', 'dream'],
    priority: 25,
  },
  {
    genre: 'meditation',
    images: withBase(['/thumbnails/meditation/Meditation-clam.png']),
    keywords: ['meditation', 'mindful', 'mindfulness', 'zen', 'calm'],
    priority: 20,
  },
  {
    genre: 'relax',
    images: withBase(['/thumbnails/relax/relax-calm.png', '/thumbnails/relax/Calm-home.png']),
    keywords: ['relax', 'relaxing', 'calm', 'stress', 'anxiety', 'soothe'],
    priority: 18,
  },
  {
    genre: 'focus',
    images: withBase(['/thumbnails/study/study-focus.png']),
    keywords: ['focus', 'study', 'concentration', 'work'],
    priority: 18,
  },
  {
    genre: 'nature',
    images: withBase(['/thumbnails/forest/nature-healing.png']),
    keywords: ['nature', 'forest', 'trees', 'outdoor'],
    priority: 15,
  },
  {
    genre: 'default',
    images: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
    ],
    keywords: ['music', 'sound', 'audio'],
    priority: 5,
  },
];

export const getSmartThumbnail = (title: string, prompt: string, style: string) => {
  const content = `${title} ${prompt} ${style}`.toLowerCase();
  const matches = THUMBNAIL_SETS
    .map((set) => ({
      set,
      score: scoreForContent(content, set),
    }))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score);

  const best = matches[0]?.set ?? THUMBNAIL_SETS.find((s) => s.genre === 'default')!;
  return best.images[Math.floor(Math.random() * best.images.length)];
};

const scoreForContent = (content: string, set: ThumbnailSet) => {
  let score = 0;
  set.keywords.forEach((kw) => {
    if (content.includes(kw)) {
      score += set.priority;
    }
  });
  return score;
};
