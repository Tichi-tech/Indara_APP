import { Platform } from 'react-native';
import TrackPlayer, {
  State,
  RepeatMode,
  Track as RNTPTrack,
  Capability,
  AppKilledPlaybackBehavior,
  AndroidAudioContentType
} from 'react-native-track-player';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Infer MIME type from URL extension
export const inferMime = (urlOrPath: string): string => {
  const u = urlOrPath.split('?')[0].toLowerCase();
  if (u.endsWith('.mp3')) return 'audio/mpeg';
  if (u.endsWith('.m4a') || u.endsWith('.aac')) return 'audio/aac';
  if (u.endsWith('.wav')) return 'audio/wav';
  if (u.endsWith('.ogg')) return 'audio/ogg';
  if (u.endsWith('.opus')) return 'audio/ogg';
  return 'audio/mpeg';
};

// Singleton setup (prevents race conditions and re-initialization)
let initialized = false;

async function ensureReady() {
  if (initialized) return;

  if (Platform.OS === 'web') {
    throw new Error('RNTP not supported on web');
  }

  await TrackPlayer.setupPlayer({
    androidAudioContentType: AndroidAudioContentType.Music,
    waitForBuffer: true,
    autoUpdateMetadata: true,
    autoHandleInterruptions: true,
    playBuffer: 2,      // Reduced from 5s to 2s - start playback faster
    minBuffer: 15,      // Reduced from 45s to 15s - less initial buffering
    maxBuffer: 60,      // Reduced from 120s to 60s - adequate for most tracks
    backBuffer: 5,      // Reduced from 10s to 5s
  });

  await TrackPlayer.updateOptions({
    stopWithApp: false,
    alwaysPauseOnInterruption: true,
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SeekTo,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
    ],
    compactCapabilities: [
      Capability.Play,
      Capability.Pause,
    ],
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.PausePlayback,
      alwaysPauseOnInterruption: true,
    },
  });

  initialized = true;
}

// Request Android 13+ notification permission
export async function ensureNotificationPermission() {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const { PermissionsAndroid } = require('react-native');
    await PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS' as any);
  }
}

// Track type for your app
export type Track = {
  id: string;
  url: string;
  title?: string;
  artist?: string;
  artwork?: string;
  headers?: Record<string, string>;
};

// Load single track
export async function load(track: Track, shouldPlay = false) {
  await ensureReady();
  await TrackPlayer.reset();

  // Validate URL
  if (!track.url || track.url.trim() === '') {
    throw new Error(`Cannot load track: URL is empty for track "${track.title || track.id}"`);
  }

  const item: RNTPTrack = {
    id: track.id,
    url: track.url,
    title: track.title ?? 'Indara',
    artist: track.artist ?? 'Indara',
    artwork: track.artwork,
    type: 'default',
    contentType: inferMime(track.url),
    headers: track.headers,
  };

  await TrackPlayer.add([item]);
  if (shouldPlay) await TrackPlayer.play();
}

// Set queue with smooth transition
export async function setQueue(tracks: Track[], startIndex = 0) {
  await ensureReady();

  // Smooth audio session transition (prevents crackling on Android)
  if (Platform.OS === 'android') {
    try {
      const currentVol = await TrackPlayer.getVolume();
      if (currentVol > 0) {
        await TrackPlayer.setVolume(0);
        await new Promise(r => setTimeout(r, 50));
      }
    } catch {
      // Ignore if nothing playing
    }
  }

  await TrackPlayer.reset();

  // Verify clean reset
  const existingQueue = await TrackPlayer.getQueue();
  if (existingQueue.length > 0) {
    await TrackPlayer.reset();
  }

  const items: RNTPTrack[] = tracks.map((t) => ({
    id: t.id,
    url: t.url,
    title: t.title ?? 'Indara',
    artist: t.artist ?? 'Indara',
    artwork: t.artwork,
    type: 'default',
    contentType: inferMime(t.url),
    headers: t.headers,
  }));

  await TrackPlayer.add(items);

  if (startIndex > 0) {
    await TrackPlayer.skip(startIndex);
  }

  // Restore volume and set playback rate
  if (Platform.OS === 'android') {
    await TrackPlayer.setVolume(1.0);
    await TrackPlayer.setRate(0.99); // Workaround for some Android hardware decoder issues
  }
}

// Playback controls with optimized pre-buffer guard
export const play = async () => {
  const timeoutMs = 3000; // Reduced from 10s to 3s
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const pos = await TrackPlayer.getPosition();
    const buf = await TrackPlayer.getBufferedPosition();
    const headroom = buf - pos;

    // Reduced buffer requirement from 5s to 2s for faster start
    if (headroom >= 2) {
      return TrackPlayer.play();
    }

    await new Promise(r => setTimeout(r, 200)); // Check every 200ms instead of 500ms
  }

  // Timeout - play anyway (user experience > perfect buffering)
  return TrackPlayer.play();
};

export const pause = () => TrackPlayer.pause();
export const stop = () => TrackPlayer.stop();
export const seekTo = (seconds: number) => {
  if (seconds < 0 || !Number.isFinite(seconds)) {
    return Promise.resolve();
  }
  return TrackPlayer.seekTo(seconds);
};
export const skipToNext = () => TrackPlayer.skipToNext();
export const skipToPrevious = () => TrackPlayer.skipToPrevious();
export const getState = () => TrackPlayer.getPlaybackState();

// Advanced features
export const setRepeatAll = () => TrackPlayer.setRepeatMode(RepeatMode.Queue);
export const setRepeatOff = () => TrackPlayer.setRepeatMode(RepeatMode.Off);
export const setRepeatOne = () => TrackPlayer.setRepeatMode(RepeatMode.Track);
export const setRate = (rate: number) => TrackPlayer.setRate(rate);
export const setVolume = (volume: number) => TrackPlayer.setVolume(volume);

// Persist position every 5 seconds
let _lastSaveTime = 0;

export async function saveProgress(position: number, trackId: string) {
  const now = Date.now();
  if (now - _lastSaveTime < 5000) return;
  _lastSaveTime = now;

  await AsyncStorage.multiSet([
    ['lastTrackId', trackId],
    ['lastPosition', String(position)],
  ]);
}

// Restore last position on app start
export async function restoreLastSession() {
  try {
    const [lastTrackId, lastPosition] = await AsyncStorage.multiGet([
      'lastTrackId',
      'lastPosition',
    ]);

    if (lastTrackId[1] && lastPosition[1]) {
      return {
        trackId: lastTrackId[1],
        position: Number(lastPosition[1]),
      };
    }
  } catch (err) {
    console.error('Failed to restore session:', err);
  }
  return null;
}
