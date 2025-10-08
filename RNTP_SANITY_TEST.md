# RNTP 3.2.0 Sanity Test

## Pre-Test Setup Complete ✅

- **RNTP Version:** 3.2.0
- **Reanimated Version:** 3.19.2
- **Worklets:** Not installed ✅
- **New Architecture:** Disabled (false)
- **Kotlin Version:** 2.0.21
- **Prebuild:** Successful ✅
- **Config Verified:** newArchEnabled=false, UIBackgroundModes=['audio'], Android permissions ✅

## Quick Sanity Test (After Build Success)

Once the EAS build completes and you install the dev client:

### Test 1: Basic Playback
```typescript
// In your app or React Native Debugger:
import TrackPlayer from 'react-native-track-player';

// Reset and add test track
await TrackPlayer.reset();
await TrackPlayer.add({
  url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  title: 'Test Track',
  artist: 'RNTP 3.2.0',
  artwork: 'https://picsum.photos/200'
});

// Play
await TrackPlayer.play();
```

**Expected:**
- ✅ Audio plays
- ✅ No errors in console
- ✅ Message: `🎵 TrackPlayer setup complete`

### Test 2: Lock Screen
1. Play test track
2. Lock device
3. Check lock screen shows:
   - ✅ Track title: "Test Track"
   - ✅ Artist: "RNTP 3.2.0"
   - ✅ Play/pause controls
   - ✅ Artwork

### Test 3: Background Playback
1. Play test track
2. Press home button (background app)
3. Wait 10 seconds
4. Check audio continues ✅
5. Android: Notification visible with controls ✅

### Test 4: Pause/Resume
```typescript
await TrackPlayer.pause();
await TrackPlayer.play();
```

**Expected:**
- ✅ Pause stops audio instantly
- ✅ Play resumes from same position
- ✅ Lock screen updates

## Full Testing Guide

For comprehensive testing, see: `TESTING_GUIDE.md`

---

## Next Steps After This Sanity Test

If all 4 tests pass:
1. Test with real Indara tracks
2. Test session persistence (restart app)
3. Run full test suite from TESTING_GUIDE.md
4. Submit production build

If any test fails:
1. Check console logs for errors
2. Verify versions: `npm list react-native-track-player react-native-reanimated`
3. Check service registration in `index.ts`
4. Report error details
