import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';

type PlaybackStatus = {
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
};

type Listener = (status: PlaybackStatus) => void;

/**
 * Indara's singleton audio service using expo-audio (modern API).
 * Downloads files to local cache for smooth, buffer-free playback.
 */
class AudioService {
  private player: ReturnType<typeof createAudioPlayer> | null = null;
  private listeners = new Set<Listener>();
  private statusInterval: NodeJS.Timeout | null = null;
  private currentUrl: string | null = null;
  private downloadedFiles = new Map<string, string>(); // url -> local file path

  async init() {
    try {
      // Configure audio mode for high-quality playback
      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: 'doNotMix',
        interruptionModeAndroid: 'doNotMix',
        allowsRecording: false,
        shouldPlayInBackground: true,
        shouldRouteThroughEarpiece: false,
      });
      console.log('🎵 Audio service initialized with expo-audio');
    } catch (err) {
      console.warn('🎵 Audio mode init failed:', err);
    }
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  private notifyListeners() {
    if (!this.player) return;

    const status: PlaybackStatus = {
      isPlaying: this.player.playing ?? false,
      positionMs: (this.player.currentTime ?? 0) * 1000,
      durationMs: (this.player.duration ?? 0) * 1000,
    };

    this.listeners.forEach((fn) => fn(status));
  }

  private startStatusPolling() {
    this.stopStatusPolling();
    this.statusInterval = setInterval(() => {
      this.notifyListeners();
    }, 100);
  }

  private stopStatusPolling() {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
      this.statusInterval = null;
    }
  }

  /**
   * Download audio file to local cache for smooth playback
   */
  private async downloadAudio(url: string): Promise<string> {
    // Check if already downloaded
    if (this.downloadedFiles.has(url)) {
      const localPath = this.downloadedFiles.get(url)!;
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      if (fileInfo.exists) {
        console.log('🎵 Using cached file');
        return localPath;
      }
    }

    // Extract filename from URL or generate one
    const filename = url.split('/').pop() || `audio_${Date.now()}.mp3`;
    const localPath = `${FileSystem.cacheDirectory}${filename}`;

    console.log('🎵 Downloading audio file...');
    try {
      const downloadResult = await FileSystem.downloadAsync(url, localPath);
      console.log('🎵 Download complete:', downloadResult.uri);

      this.downloadedFiles.set(url, downloadResult.uri);
      return downloadResult.uri;
    } catch (err) {
      console.warn('🎵 Download failed, falling back to streaming:', err);
      return url; // Fallback to streaming if download fails
    }
  }

  async load(url: string, shouldPlay = false) {
    await this.unload();

    try {
      // Stream directly like Spotify - much faster!
      // Note: expo-audio has decoder initialization noise regardless of streaming vs local
      console.log('🎵 Loading audio...');

      // Create player with streaming URL for instant playback
      this.player = createAudioPlayer(url);
      this.currentUrl = url;

      this.startStatusPolling();

      if (shouldPlay) {
        await this.play();
      }

      console.log('🎵 Audio ready');
    } catch (err) {
      console.warn('🎵 Load failed:', err);
      throw err;
    }
  }

  async play() {
    if (!this.player) {
      console.warn('🎵 Play called but no player loaded');
      return;
    }
    try {
      this.player.play();
      this.notifyListeners();
      console.log('🎵 Playback started');
    } catch (err) {
      console.warn('🎵 Play failed:', err);
    }
  }

  async pause() {
    if (!this.player) {
      console.warn('🎵 Pause called but no player loaded');
      return;
    }
    try {
      this.player.pause();
      this.notifyListeners();
      console.log('🎵 Playback paused');
    } catch (err) {
      console.warn('🎵 Pause failed:', err);
    }
  }

  async seek(ms: number) {
    if (!this.player) {
      console.warn('🎵 Seek called but no player loaded');
      return;
    }
    try {
      const seconds = ms / 1000;
      this.player.seekTo(seconds);
      this.notifyListeners();
      console.log(`🎵 Seeked to ${seconds.toFixed(1)}s`);
    } catch (err) {
      console.warn('🎵 Seek failed:', err);
    }
  }

  async unload() {
    this.stopStatusPolling();

    if (this.player) {
      try {
        this.player.pause();
        this.player.remove();
      } catch (err) {
        // Ignore cleanup errors
      } finally {
        this.player = null;
        this.currentUrl = null;
      }
    }
  }

  /**
   * Clear cached audio files to free up space
   */
  async clearCache() {
    console.log('🎵 Clearing audio cache...');
    let cleared = 0;

    for (const [url, localPath] of this.downloadedFiles.entries()) {
      try {
        await FileSystem.deleteAsync(localPath, { idempotent: true });
        this.downloadedFiles.delete(url);
        cleared++;
      } catch (err) {
        console.warn('Failed to delete cached file:', err);
      }
    }

    console.log(`🎵 Cleared ${cleared} cached audio files`);
  }
}

export const audioService = new AudioService();
