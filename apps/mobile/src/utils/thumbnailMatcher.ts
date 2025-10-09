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
  // Baby/Lullaby (highest priority for specific use case)
  {
    genre: 'baby',
    images: withBase([
      '/thumbnails/babysetting/babysetting-sleep-lullaby.png',
      '/thumbnails/babysetting/babysetting-sage-sleep-soft.png',
      '/thumbnails/babysetting/baby-storytime-teepee.png',
      '/thumbnails/babysetting/babyseeting-safe-nap-park.png',
      '/thumbnails/babysetting/babysetting-play-safe.png',
      '/thumbnails/babysetting/babysetting.png',
    ]),
    keywords: ['baby', 'lullaby', 'infant', 'nursery', 'bedtime'],
    priority: 30,
  },

  // Sleep (very high priority)
  {
    genre: 'sleep',
    images: withBase([
      '/thumbnails/sleep/sleep-soothing.png',
      '/thumbnails/sleep/sleep-moonlight-bedroom-relax.png',
      '/thumbnails/sleep/sleep-stars-relax.png',
      '/thumbnails/sleep/sleep-rain-relax.png',
      '/thumbnails/sleep/sleep-night-lght-ocean-peace.png',
      '/thumbnails/sleep/cozy-winter-sleep-bedroom-relax-cabin.png',
      '/thumbnails/sleep/piano-relax-night-sleep-beach-moonlight.png',
      '/thumbnails/sleep/shoji-sleep.png',
    ]),
    keywords: ['sleep', 'soothing', 'rest', 'night', 'dream', 'bedtime', 'slumber'],
    priority: 28,
  },

  // Meditation (high priority)
  {
    genre: 'meditation',
    images: withBase([
      '/thumbnails/meditation/Meditation-clam.png',
      '/thumbnails/meditation/Meditation-in-ocean-breeze.png',
      '/thumbnails/meditation/meditation-waterfall-forest-green-breeze-inner-peace.png',
      '/thumbnails/meditation/Meditation-ocean-clam.png',
      '/thumbnails/meditation/Meditation-Ocean-sunrise.png',
      '/thumbnails/meditation/Meditation-lake-relection.png',
      '/thumbnails/meditation/Meditation-forest-shrine-Seiza.png',
      '/thumbnails/meditation/Meditation-rain-garden-nature.png',
      '/thumbnails/meditation/Meditation-rooftop-clam-night.png',
      '/thumbnails/meditation/rain-meditation-tea.png',
    ]),
    keywords: ['meditation', 'mindful', 'mindfulness', 'zen', 'tranquil', 'inner peace', 'breathe'],
    priority: 26,
  },

  // Relax/Anxiety (high priority)
  {
    genre: 'relax',
    images: withBase([
      '/thumbnails/relax/relax-calm.png',
      '/thumbnails/relax/relax-anxiety.png',
      '/thumbnails/relax/Calm-home.png',
      '/thumbnails/relax/Ocean-dawn-sunset-peace-slience.png',
      '/thumbnails/relax/forest-lake-mountains-sunrise-ambient-relax.png',
      '/thumbnails/relax/cozy-piano-relax-forest-snow-ambient.png',
      '/thumbnails/relax/meditation-waterfall-forest-green-breeze-inner-peace.png',
      '/thumbnails/relax/piano-relax-night-sleep-beach-moonlight.png',
    ]),
    keywords: ['relax', 'relaxing', 'calm', 'chill', 'stress', 'anxiety', 'soothe', 'unwind', 'peace'],
    priority: 24,
  },

  // Focus/Study (high priority)
  {
    genre: 'focus',
    images: withBase([
      '/thumbnails/study/study-focus.png',
      '/thumbnails/study/study-library-focus-quiet.png',
      '/thumbnails/study/study-laptop-lofi.png',
      '/thumbnails/study/study-dark-lamp.png',
    ]),
    keywords: ['focus', 'study', 'concentration', 'work', 'productivity', 'lofi', 'homework'],
    priority: 22,
  },

  // Classical Music
  {
    genre: 'classical',
    images: withBase([
      '/thumbnails/classical/classical.png',
      '/thumbnails/classical/classical-music-piano.png',
      '/thumbnails/classical/classical-music-night-piano.png',
      '/thumbnails/classical/calssical-music-piano-calm.png',
      '/thumbnails/classical/calssical-music-violin-cello-string.png',
      '/thumbnails/classical/calssical-music-orchestra.png',
      '/thumbnails/classical/piano-relax-night-sleep-beach-moonlight-classical.png',
    ]),
    keywords: ['classical', 'orchestra', 'symphony', 'violin', 'cello', 'string', 'baroque', 'mozart'],
    priority: 20,
  },

  // Yoga
  {
    genre: 'yoga',
    images: withBase([
      '/thumbnails/yoga/Yoga-relax.png',
      '/thumbnails/yoga/yoga-tree-pose.png',
      '/thumbnails/yoga/yoga-ocean.png',
      '/thumbnails/yoga/yoga-forest-nature.png',
      '/thumbnails/yoga/yoga-garden-bamboo-nature.png',
      '/thumbnails/yoga/yoga-coean-sunrizse-relax.png',
    ]),
    keywords: ['yoga', 'stretch', 'pose', 'asana', 'vinyasa', 'hatha'],
    priority: 20,
  },

  // Piano
  {
    genre: 'piano',
    images: withBase([
      '/thumbnails/piano/piano.png',
      '/thumbnails/piano/piano-forest-sun-slience.png',
      '/thumbnails/piano/piano-garden-bamboo-ambient-relax-nature.png',
      '/thumbnails/piano/piano-dawn-sunset-peaceful-ambient-ocean.png',
      '/thumbnails/piano/cozy-piano-relax-forest-snow-ambient.png',
      '/thumbnails/piano/piano-relax-night-sleep-beach-moonlight.png',
    ]),
    keywords: ['piano', 'keys', 'ivory', 'melody'],
    priority: 18,
  },

  // Rain
  {
    genre: 'rain',
    images: withBase([
      '/thumbnails/rain/ambient-rainy.png',
      '/thumbnails/rain/rain-meditation-tea.png',
      '/thumbnails/rain/rain-tea-wind-relax.png',
      '/thumbnails/rain/rain-ocean-relax-ambient-night.png',
    ]),
    keywords: ['rain', 'rainy', 'rainfall', 'drizzle', 'downpour', 'storm'],
    priority: 18,
  },

  // Ocean/Water
  {
    genre: 'ocean',
    images: withBase([
      '/thumbnails/ocean/ocean.png',
      '/thumbnails/ocean/ocean-nature.png',
      '/thumbnails/ocean/ocean-sunraise.png',
      '/thumbnails/ocean/ocean-fog-calm.png',
      '/thumbnails/ocean/Ocean-night-chill-relax.png',
      '/thumbnails/ocean/Ocean-seacave-spray.png',
      '/thumbnails/ocean/OCean-sunrise-relection.png',
      '/thumbnails/ocean/ambient-sunset.png',
    ]),
    keywords: ['ocean', 'sea', 'water', 'waves', 'beach', 'shore', 'coast', 'tide'],
    priority: 16,
  },

  // Energy/Upbeat
  {
    genre: 'energy',
    images: withBase([
      '/thumbnails/energy/energy.png',
      '/thumbnails/energy/energy_waterfall_spring.png',
      '/thumbnails/energy/energy_oceanspray_waves.png',
      '/thumbnails/energy/energy_desert_sunny.png',
      '/thumbnails/energy/energy_spin_mountain.png',
      '/thumbnails/energy/meditation-waterfall-forest-green-breeze-inner-peace.png',
      '/thumbnails/energy/Ocean-dawn-sunset-peace-slience.png',
    ]),
    keywords: ['energy', 'upbeat', 'energetic', 'active', 'motivate', 'inspire', 'workout'],
    priority: 16,
  },

  // Forest/Nature
  {
    genre: 'forest',
    images: withBase([
      '/thumbnails/forest/nature-healing.png',
      '/thumbnails/forest/Ambient-forest.png',
      '/thumbnails/forest/forest-lake-mountains-sunrise-ambient-relax.png',
      '/thumbnails/forest/meditation-waterfall-forest-green-breeze-inner-peace.png',
      '/thumbnails/forest/piano-forest-sun-slience.png',
    ]),
    keywords: ['forest', 'trees', 'woods', 'woodland', 'grove'],
    priority: 16,
  },

  // Nature (broader than forest)
  {
    genre: 'nature',
    images: withBase([
      '/thumbnails/nature/nature-healing.png',
      '/thumbnails/nature/Ambient-forest.png',
      '/thumbnails/nature/ocean-sunraise.png',
      '/thumbnails/nature/relax-forest-nature-walking-trail.png',
    ]),
    keywords: ['nature', 'outdoor', 'natural', 'wilderness', 'earth'],
    priority: 14,
  },

  // Ambient
  {
    genre: 'ambient',
    images: withBase([
      '/thumbnails/ambient/ambient-sunset.png',
      '/thumbnails/ambient/ambient-star.png',
      '/thumbnails/ambient/ambient-park.png',
      '/thumbnails/ambient/Ambient-forest.png',
      '/thumbnails/ambient/ambient-rainy.png',
      '/thumbnails/ambient/cozy-piano-relax-forest-snow-ambient.png',
      '/thumbnails/ambient/forest-lake-mountains-sunrise-ambient-relax.png',
      '/thumbnails/ambient/piano-dawn-sunset-peaceful-ambient-ocean.png',
      '/thumbnails/ambient/piano-garden-bamboo-ambient-relax-nature.png',
      '/thumbnails/ambient/relax-forest-nature-walking-trail.png',
    ]),
    keywords: ['ambient', 'atmosphere', 'atmospheric', 'soundscape', 'background'],
    priority: 12,
  },

  // Default fallback
  {
    genre: 'default',
    images: withBase([
      '/thumbnails/ambient/ambient-sunset.png',
      '/thumbnails/meditation/Meditation-clam.png',
      '/thumbnails/relax/relax-calm.png',
    ]),
    keywords: ['music', 'sound', 'audio', 'track'],
    priority: 5,
  },
];

/**
 * Smart thumbnail selection based on title, prompt, and style
 * Returns a random image from the best matching category
 */
export const getSmartThumbnail = (title: string, prompt: string, style: string) => {
  const content = `${title} ${prompt} ${style}`.toLowerCase();

  // Score each thumbnail set based on keyword matches
  const matches = THUMBNAIL_SETS
    .map((set) => ({
      set,
      score: scoreForContent(content, set),
    }))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score);

  // Get the best matching set (or default if no matches)
  const best = matches[0]?.set ?? THUMBNAIL_SETS.find((s) => s.genre === 'default')!;

  // Return random image from the best matching category
  return best.images[Math.floor(Math.random() * best.images.length)];
};

/**
 * Calculate match score for content against a thumbnail set
 */
const scoreForContent = (content: string, set: ThumbnailSet) => {
  let score = 0;
  set.keywords.forEach((kw) => {
    if (content.includes(kw)) {
      score += set.priority;
    }
  });
  return score;
};

/**
 * Resolves image URLs - converts relative paths to absolute URLs
 */
export const resolveImageUrl = (uri?: string | null): string | undefined => {
  if (!uri) return undefined;
  if (uri.startsWith('http')) return uri;
  return `${REMOTE_BASE}${uri}`;
};

/**
 * Gets a playlist image based on name/title with smart fallback
 */
export const getPlaylistImage = (name: string, thumbnailUrl?: string | null): string => {
  if (thumbnailUrl) return resolveImageUrl(thumbnailUrl) || getDefaultPlaylistImage(name);
  return getDefaultPlaylistImage(name);
};

/**
 * Gets default playlist image based on name keywords
 */
const getDefaultPlaylistImage = (name: string): string => {
  const lower = name.toLowerCase();

  // Check for specific genres with priority order
  if (lower.includes('baby') || lower.includes('lullaby'))
    return resolveImageUrl('/thumbnails/babysetting/babysetting-sleep-lullaby.png')!;
  if (lower.includes('sleep'))
    return resolveImageUrl('/thumbnails/sleep/sleep-soothing.png')!;
  if (lower.includes('meditation') || lower.includes('mindful'))
    return resolveImageUrl('/thumbnails/meditation/Meditation-clam.png')!;
  if (lower.includes('yoga'))
    return resolveImageUrl('/thumbnails/yoga/Yoga-relax.png')!;
  if (lower.includes('anxiety') || lower.includes('calm') || lower.includes('relax'))
    return resolveImageUrl('/thumbnails/relax/relax-calm.png')!;
  if (lower.includes('focus') || lower.includes('study') || lower.includes('work'))
    return resolveImageUrl('/thumbnails/study/study-focus.png')!;
  if (lower.includes('classical') || lower.includes('orchestra'))
    return resolveImageUrl('/thumbnails/classical/classical.png')!;
  if (lower.includes('piano'))
    return resolveImageUrl('/thumbnails/piano/piano.png')!;
  if (lower.includes('rain'))
    return resolveImageUrl('/thumbnails/rain/ambient-rainy.png')!;
  if (lower.includes('ocean') || lower.includes('water') || lower.includes('sea') || lower.includes('beach'))
    return resolveImageUrl('/thumbnails/ocean/ocean.png')!;
  if (lower.includes('energy') || lower.includes('active') || lower.includes('workout'))
    return resolveImageUrl('/thumbnails/energy/energy.png')!;
  if (lower.includes('nature') || lower.includes('forest'))
    return resolveImageUrl('/thumbnails/forest/nature-healing.png')!;

  // Default fallback
  return resolveImageUrl('/thumbnails/ambient/ambient-sunset.png')!;
};
