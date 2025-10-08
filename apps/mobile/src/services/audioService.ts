import { Platform } from 'react-native';
import TrackPlayer, { State, RepeatMode, Track as RNTPTrack } from 'react-native-track-player';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setupPlayer } from '../player/service';

// ✅ Singleton setup promise (prevents race conditions)
let _setupPromise: Promise<void> | null = null;

async function ensureReady() {
  if (_setupPromise) return _setupPromise;

  _setupPromise = (async () => {
    if (Platform.OS === 'web') {
      throw new Error('RNTP not supported on web');
    }
    await setupPlayer();
  })().catch((err) => {
    _setupPromise = null; // Allow retry on failure
    throw err;
  });

  return _setupPromise;
}

// ✅ Request Android 13+ notification permission
export async function ensureNotificationPermission() {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const { PermissionsAndroid } = require('react-native');
    const result = await PermissionsAndroid.request(
      'android.permission.POST_NOTIFICATIONS' as any
    );
    console.log('🔔 Notification permission:', result);
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

// ✅ Load single track
export async function load(track: Track, shouldPlay = false) {
  await ensureReady();
  await TrackPlayer.reset();

  const item: RNTPTrack = {
    id: track.id,
    url: track.url,
    title: track.title ?? 'Indara',
    artist: track.artist ?? 'Indara',
    artwork: track.artwork,
    headers: track.headers,
  };

  await TrackPlayer.add([item]);
  if (shouldPlay) await TrackPlayer.play();
}

// ✅ Set queue
export async function setQueue(tracks: Track[], startIndex = 0) {
  await ensureReady();
  await TrackPlayer.reset();

  const items: RNTPTrack[] = tracks.map((t) => ({
    id: t.id,
    url: t.url,
    title: t.title ?? 'Indara',
    artist: t.artist ?? 'Indara',
    artwork: t.artwork,
    headers: t.headers,
  }));

  await TrackPlayer.add(items);
  if (startIndex > 0) {
    await TrackPlayer.skip(startIndex);
  }
}

// ✅ Playback controls
export const play = () => TrackPlayer.play();
export const pause = () => TrackPlayer.pause();
export const stop = () => TrackPlayer.stop();
export const seekTo = (seconds: number) => TrackPlayer.seekTo(seconds);
export const skipToNext = () => TrackPlayer.skipToNext();
export const skipToPrevious = () => TrackPlayer.skipToPrevious();
export const getState = () => TrackPlayer.getPlaybackState();

// ✅ Advanced features
export const setRepeatAll = () => TrackPlayer.setRepeatMode(RepeatMode.Queue);
export const setRepeatOff = () => TrackPlayer.setRepeatMode(RepeatMode.Off);
export const setRepeatOne = () => TrackPlayer.setRepeatMode(RepeatMode.Track);
export const setRate = (rate: number) => TrackPlayer.setRate(rate); // 0.5–2.0
export const setVolume = (volume: number) => TrackPlayer.setVolume(volume); // 0.0–1.0

// ✅ Persist position every 5 seconds
let _lastSaveTime = 0;

export async function saveProgress(position: number, trackId: string) {
  const now = Date.now();
  if (now - _lastSaveTime < 5000) return; // Throttle to every 5s
  _lastSaveTime = now;

  await AsyncStorage.multiSet([
    ['lastTrackId', trackId],
    ['lastPosition', String(position)],
  ]);
}

// ✅ Restore last position on app start
export async function restoreLastSession() {
  try {
    const [lastTrackId, lastPosition] = await AsyncStorage.multiGet([
      'lastTrackId',
      'lastPosition',
    ]);

    if (lastTrackId[1] && lastPosition[1]) {
      const position = Number(lastPosition[1]);
      console.log('🔄 Restoring session:', lastTrackId[1], '@', position, 's');

      // Return the data for the app to load the track
      return {
        trackId: lastTrackId[1],
        position,
      };
    }
  } catch (err) {
    console.error('Failed to restore session:', err);
  }
  return null;
}
