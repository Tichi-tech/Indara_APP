import TrackPlayer, {
  Event,
  Capability,
  AppKilledPlaybackBehavior,
} from 'react-native-track-player';

export async function setupPlayer() {
  try {
    await TrackPlayer.setupPlayer({
      waitForBuffer: true,
      autoUpdateMetadata: true,
      autoHandleInterruptions: true,
    });

    await TrackPlayer.updateOptions({
      stopWithApp: false,
      alwaysPauseOnInterruption: true,
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
        Capability.SetRating,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext],
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
      ],
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.PausePlayback,  // Keep notification visible
        alwaysPauseOnInterruption: true,
      },
      ios: {
        category: 'playback',
        categoryMode: 'default',
        categoryOptions: ['duckOthers'], // Pause other audio when playing
      },
    });

    console.log('🎵 TrackPlayer setup complete');
  } catch (error) {
    console.error('❌ TrackPlayer setup failed:', error);
    throw error;
  }
}

const PlaybackService = async () => {
  // Remote control handlers (lock screen, headset, car play)
  TrackPlayer.addEventListener(Event.RemotePlay, async () => {
    try {
      await TrackPlayer.play();
    } catch (err) {
      console.error('Remote play failed:', err);
    }
  });

  TrackPlayer.addEventListener(Event.RemotePause, async () => {
    try {
      await TrackPlayer.pause();
    } catch (err) {
      console.error('Remote pause failed:', err);
    }
  });

  TrackPlayer.addEventListener(Event.RemoteNext, async () => {
    try {
      await TrackPlayer.skipToNext();
    } catch (err) {
      console.error('Remote next failed:', err);
    }
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
    try {
      await TrackPlayer.skipToPrevious();
    } catch (err) {
      console.error('Remote previous failed:', err);
    }
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, async ({ position }: { position: number }) => {
    try {
      await TrackPlayer.seekTo(position);
    } catch (err) {
      console.error('Remote seek failed:', err);
    }
  });

  TrackPlayer.addEventListener(Event.RemoteDuck, async ({ paused, permanent }: { paused: boolean; permanent: boolean }) => {
    try {
      if (permanent) {
        await TrackPlayer.pause();
      } else if (paused) {
        await TrackPlayer.pause();
      } else {
        await TrackPlayer.play();
      }
    } catch (err) {
      console.error('Duck event failed:', err);
    }
  });

  // Error handling
  TrackPlayer.addEventListener(Event.PlaybackError, ({ error }: { error: string }) => {
    console.error('🎵 Playback error:', error);
  });

  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, ({ track, position }: { track: string; position: number }) => {
    console.log('🎵 Queue ended at track:', track, 'position:', position);
  });
};

export default PlaybackService;
