import { setAudioModeAsync, AudioPlayer } from 'expo-audio';

type PlaybackStatus = {
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
};

type Listener = (status: PlaybackStatus) => void;

/**
 * Indara's singleton audio service using expo-audio.
 * Manages global audio playback for meditation and healing music.
 */
class AudioService {
  private player: AudioPlayer | null = null;
  private listeners = new Set<Listener>();
  private statusInterval: NodeJS.Timeout | null = null;
  private currentUrl: string | null = null;

  async init() {
    await setAudioModeAsync({
      playsInSilentMode: true,
      staysActiveInBackground: false,
      interruptionMode: 'mixWithOthers',
      shouldDuckAndroid: true,
    }).catch((err) => console.warn('🎵 Audio mode init failed:', err));
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
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
    }, 500);
  }

  private stopStatusPolling() {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
      this.statusInterval = null;
    }
  }

  async load(url: string, shouldPlay = false) {
    await this.unload();

    try {
      const { AudioPlayer: PlayerClass } = await import('expo-audio');
      this.player = new PlayerClass({ uri: url });
      this.currentUrl = url;

      this.startStatusPolling();

      if (shouldPlay) {
        await this.play();
      }
    } catch (err) {
      console.warn('🎵 Load failed:', err);
      throw err;
    }
  }

  async play() {
    if (!this.player) return;
    try {
      this.player.play();
      this.notifyListeners();
    } catch (err) {
      console.warn('🎵 Play failed:', err);
    }
  }

  async pause() {
    if (!this.player) return;
    try {
      this.player.pause();
      this.notifyListeners();
    } catch (err) {
      console.warn('🎵 Pause failed:', err);
    }
  }

  async seek(ms: number) {
    if (!this.player) return;
    try {
      this.player.currentTime = ms / 1000;
      this.notifyListeners();
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
}

export const audioService = new AudioService();
