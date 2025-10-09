import TrackPlayer, { Event } from 'react-native-track-player';

// NOTE: Player setup & updateOptions are handled in audioService.ts (singleton).
// This file ONLY wires remote/lock-screen controls.

const PlaybackService = async () => {
  TrackPlayer.addEventListener(Event.RemotePlay, async () => {
    await TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, async () => {
    await TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, async (e) => {
    // RNTP v4: e.position is in seconds
    await TrackPlayer.seekTo(e.position);
  });

  TrackPlayer.addEventListener(Event.RemoteNext, async () => {
    try { await TrackPlayer.skipToNext(); } catch {}
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
    try { await TrackPlayer.skipToPrevious(); } catch {}
  });

  TrackPlayer.addEventListener(Event.RemoteStop, async () => {
    await TrackPlayer.stop();
  });

  TrackPlayer.addEventListener(Event.PlaybackError, ({ error }) => {
    console.error('🎵 Playback error:', error);
  });

  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, ({ track, position }) => {
    console.log('🎵 Queue ended at track:', track, 'position:', position);
  });
};

export default PlaybackService;
