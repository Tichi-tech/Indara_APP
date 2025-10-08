# React Native Track Player - Testing Guide

## Pre-Testing Setup

### 1. Install Dependencies
```bash
cd indara_app/apps/mobile
npm install
```

### 2. Verify Installation
```bash
npm list react-native-track-player
```
Should show: `react-native-track-player@4.1.1`

### 3. Prebuild Native Projects
```bash
npx expo prebuild --clean
```

Expected output:
- ✅ Generates `android/` directory
- ✅ Generates `ios/` directory
- ✅ Applies `react-native-track-player` plugin

### 4. Build Development Client
```bash
# For Android
eas build --profile development --platform android

# For iOS (requires Mac)
eas build --profile development --platform ios
```

Wait for build to complete (~10-20 minutes)

### 5. Install & Run
- Install the dev client `.apk` / `.ipa` on your device
- Start Metro bundler: `npm start`
- Scan QR code with device

---

## Testing Checklist

### Phase 1: Basic Playback ✓

#### Test 1.1: Play Track from Home
**Steps:**
1. Open app
2. Navigate to home screen
3. Tap on any track in "Healing Community" section

**Expected:**
- ✅ Track starts playing immediately
- ✅ Mini player appears at bottom
- ✅ Track info shows (title, artist)
- ✅ Play button changes to pause button

**Console Check:**
```
🎵 TrackPlayer setup complete
🎵 Loading audio...
🎵 Audio ready
🎵 Playback started
```

#### Test 1.2: Pause/Resume
**Steps:**
1. While track is playing, tap pause button
2. Wait 2 seconds
3. Tap play button

**Expected:**
- ✅ Audio pauses immediately
- ✅ Pause icon changes to play icon
- ✅ Resume continues from same position
- ✅ No audio glitches

#### Test 1.3: Seek Slider
**Steps:**
1. Play a track
2. Drag seek slider to middle
3. Release
4. Drag to beginning
5. Drag to end

**Expected:**
- ✅ Slider moves smoothly
- ✅ Position updates in real-time (no 100ms delay)
- ✅ Audio jumps to new position instantly
- ✅ Time displays update (e.g., "1:23 / 3:45")

#### Test 1.4: Next/Previous Track
**Steps:**
1. Play a track from playlist (multiple tracks)
2. Tap "Next" button
3. Tap "Previous" button
4. Let track finish naturally

**Expected:**
- ✅ Next track loads and plays
- ✅ Previous goes back to previous track
- ✅ Auto-advances to next track when current finishes
- ✅ Queue position updates (e.g., "2 of 5")

---

### Phase 2: Lock Screen Controls ✓

#### Test 2.1: Lock Screen Display
**Steps:**
1. Play a track
2. Lock device (press power button)
3. Wake device (don't unlock)

**Expected:**
- ✅ Lock screen shows media controls
- ✅ Album artwork appears
- ✅ Track title displayed
- ✅ Artist name displayed
- ✅ Play/pause/next/previous buttons visible

**Android:** Notification should appear with controls
**iOS:** Lock screen media player should appear

#### Test 2.2: Lock Screen Play/Pause
**Steps:**
1. Lock device while playing
2. Tap pause on lock screen
3. Tap play on lock screen

**Expected:**
- ✅ Pause stops audio
- ✅ Lock screen updates (pause → play icon)
- ✅ Play resumes audio
- ✅ No delay (instant response)

#### Test 2.3: Lock Screen Next/Previous
**Steps:**
1. Lock device while playing track in queue
2. Tap "Next" on lock screen
3. Tap "Previous" on lock screen

**Expected:**
- ✅ Next track loads and plays
- ✅ Lock screen updates with new track info
- ✅ Previous goes back
- ✅ Artwork updates

#### Test 2.4: Lock Screen Seek
**Steps:**
1. Lock device
2. Drag seek slider on lock screen

**Expected:**
- ✅ Slider moves (iOS only - Android notification doesn't have slider)
- ✅ Position updates
- ✅ Audio jumps to new position

---

### Phase 3: Background Playback ✓

#### Test 3.1: App Backgrounded
**Steps:**
1. Play a track
2. Press home button (background app)
3. Wait 10 seconds
4. Check audio is still playing
5. Reopen app

**Expected:**
- ✅ Audio continues playing in background
- ✅ No interruption when backgrounded
- ✅ When reopened, UI shows correct state
- ✅ Position continues to update

**Android:** Notification remains visible
**iOS:** Lock screen controls available

#### Test 3.2: Notification Controls
**Steps (Android):**
1. Play track
2. Background app
3. Pull down notification shade
4. Tap pause in notification
5. Tap play in notification
6. Tap next in notification

**Expected:**
- ✅ Notification shows track info + artwork
- ✅ Controls work from notification
- ✅ Notification updates when track changes
- ✅ Closing notification stops playback

#### Test 3.3: Task Switcher
**Steps:**
1. Play track
2. Open task switcher (recent apps)
3. Check audio
4. Swipe away app (kill it)

**Expected:**
- ✅ Audio continues in task switcher
- ✅ When app killed, audio stops (Android)
- ✅ Notification dismissed (Android)
- ✅ No memory leak

---

### Phase 4: Interruptions ✓

#### Test 4.1: Incoming Call
**Steps:**
1. Play track
2. Have someone call you (or use test call)
3. Answer call
4. Talk for 10 seconds
5. End call

**Expected:**
- ✅ Audio pauses when call rings
- ✅ Audio stays paused during call
- ✅ **Audio resumes after call ends** (key behavior!)
- ✅ No audio glitch/overlap

**Console Check:**
```
Duck event: paused=true, permanent=false
```

#### Test 4.2: Alarm/Timer
**Steps:**
1. Play track
2. Set timer for 10 seconds
3. Wait for alarm to sound
4. Dismiss alarm

**Expected:**
- ✅ Audio pauses when alarm rings
- ✅ Audio resumes after alarm dismissed
- ✅ No audio mixing (alarm + music)

#### Test 4.3: Another App Audio
**Steps:**
1. Play track
2. Open YouTube/Spotify/another music app
3. Play video/song in other app

**Expected:**
- ✅ Indara audio stops (Android: `doNotMix`)
- ✅ Other app audio plays
- ✅ Going back to Indara shows paused state
- ✅ Can manually resume

**Note:** Behavior configured in `service.ts`: `iosCategoryOptions: ['duckOthers']`

---

### Phase 5: Headset/Bluetooth ✓

#### Test 5.1: Wired Headphones
**Steps:**
1. Plug in wired headphones
2. Play track
3. Press play/pause button on headphones (if available)
4. Unplug headphones while playing

**Expected:**
- ✅ Audio plays through headphones
- ✅ Headphone button controls playback
- ✅ **Unplugging pauses audio** (key safety feature!)
- ✅ Replug and resume works

#### Test 5.2: Bluetooth Headphones (AirPods, etc.)
**Steps:**
1. Connect Bluetooth headphones
2. Play track
3. Single tap on headphone (play/pause)
4. Double tap (next track, if supported)
5. Disconnect Bluetooth

**Expected:**
- ✅ Audio plays through Bluetooth
- ✅ Headphone controls work
- ✅ Lock screen shows "Connected to [Device Name]"
- ✅ Disconnecting pauses audio

#### Test 5.3: Car Bluetooth
**Steps:**
1. Connect phone to car Bluetooth
2. Play track
3. Use car stereo controls (play/pause/next/prev)
4. Check car display

**Expected:**
- ✅ Audio plays through car speakers
- ✅ Car controls work
- ✅ Car display shows track info + artwork (if supported)
- ✅ Disconnecting from car pauses audio

---

### Phase 6: Session Persistence ✓

#### Test 6.1: App Restart - Position Restore
**Steps:**
1. Play track for 1 minute
2. Pause
3. Completely kill app (force stop)
4. Wait 5 seconds
5. Reopen app

**Expected:**
- ✅ Console shows: `📍 Last session: [trackId] @ 60s`
- ✅ Last track info remembered
- ✅ Position restored (but not auto-playing)
- ✅ Manual play resumes from saved position

**Check AsyncStorage:**
- Key `lastTrackId` should have track ID
- Key `lastPosition` should have seconds (e.g., "60")

#### Test 6.2: Auto-Save During Playback
**Steps:**
1. Play track
2. Watch console logs
3. Let play for 15 seconds

**Expected:**
- ✅ Console shows saves every ~5 seconds
- ✅ No performance impact
- ✅ No UI stutter

---

### Phase 7: Edge Cases ✓

#### Test 7.1: Network Error
**Steps:**
1. Enable airplane mode
2. Try to play a track with remote URL

**Expected:**
- ✅ Error alert appears
- ✅ Message: "Could not play this track. Check your internet connection."
- ✅ Retry button available
- ✅ No crash

**Console Check:**
```
🎵 Playback error: [error details]
```

#### Test 7.2: Invalid URL
**Steps:**
1. Manually trigger playback with invalid URL (if possible)

**Expected:**
- ✅ Error handled gracefully
- ✅ No crash
- ✅ User can go back and try another track

#### Test 7.3: Very Long Session
**Steps:**
1. Play multiple tracks for 30+ minutes
2. Background/foreground app multiple times
3. Lock/unlock device multiple times

**Expected:**
- ✅ No memory leaks
- ✅ Audio quality stays good
- ✅ No crashes
- ✅ Controls remain responsive

#### Test 7.4: Rapid Track Switching
**Steps:**
1. Play track
2. Immediately tap next
3. Immediately tap next again
4. Immediately tap previous
5. Repeat 10 times fast

**Expected:**
- ✅ No crashes
- ✅ No audio overlap
- ✅ Final track plays correctly
- ✅ Queue state correct

---

### Phase 8: Advanced Features ✓

#### Test 8.1: Playback Rate (New Feature!)
**Steps:**
1. Play track
2. Open full player screen
3. Find playback rate control (if implemented in UI)
4. Set to 0.5x
5. Set to 1.5x
6. Set to 2.0x

**Expected:**
- ✅ Audio plays at correct speed
- ✅ Pitch preserved (chipmunk effect)
- ✅ Setting persists across tracks
- ✅ Works on lock screen

**Manual Test (if UI not implemented):**
```javascript
// In React Native Debugger console:
import { setRate } from '@/services/audioService';
await setRate(0.5);  // Half speed
await setRate(1.5);  // 1.5x speed
await setRate(2.0);  // Double speed
```

#### Test 8.2: Queue Management
**Steps:**
1. Load playlist with 5+ tracks
2. Play track 1
3. Let auto-advance to track 2
4. Skip to track 4
5. Go back to track 3

**Expected:**
- ✅ Queue position accurate ("3 of 5")
- ✅ Auto-advance works
- ✅ Manual navigation works
- ✅ Circular queue (after last → first)

---

## Performance Monitoring

### CPU Usage
**Before (expo-audio):** ~5-10% constant (polling)
**After (RNTP):** ~1-2% during playback

**How to check:**
- Android: Settings → Developer Options → CPU usage
- iOS: Xcode → Instruments → CPU Profiler

### Battery Drain
**Test:**
1. Full charge device
2. Play music for 1 hour (screen off)
3. Check battery drop

**Expected:** ~5-8% battery drop (vs. ~10-15% with expo-audio)

### Memory Usage
**Test:**
1. Play 20 tracks consecutively
2. Check memory in dev tools

**Expected:** ~30-50MB stable (no leaks)

---

## Common Issues & Solutions

### Issue: Lock screen not showing
**Solution:**
- Check `UIBackgroundModes: ['audio']` in app.config.ts ✅
- Check notification permission granted (Android 13+)
- Rebuild dev client

### Issue: Audio doesn't resume after call
**Solution:**
- Check `RemoteDuck` event handler in `service.ts` ✅
- Check `alwaysPauseOnInterruption: true` ✅

### Issue: Position not restoring
**Solution:**
- Check AsyncStorage permissions
- Check console for "Restoring session" log
- Verify keys: `lastTrackId`, `lastPosition`

### Issue: Crash on track change
**Solution:**
- Check all URLs are valid
- Check network connection
- Check error handling in `PlaybackError` event ✅

---

## Success Criteria Summary

The migration is successful when:
- ✅ All Phase 1-8 tests pass
- ✅ Lock screen controls work
- ✅ Background playback works
- ✅ Interruptions handled correctly
- ✅ Headset/Bluetooth controls work
- ✅ Position restored on app restart
- ✅ No crashes or memory leaks
- ✅ CPU usage < 2% during playback
- ✅ Battery drain improved by 30%+

---

## Reporting Results

After testing, note:
1. Which tests passed ✅
2. Which tests failed ❌
3. Any unexpected behavior
4. Performance measurements (CPU, battery, memory)
5. Device info (model, OS version)

**Example Report:**
```
Device: Pixel 7, Android 13
Passed: 28/30 tests
Failed:
- Test 4.1 (audio didn't resume after call) - Need to debug RemoteDuck
- Test 8.1 (playback rate UI not implemented)

CPU: 1.5% avg
Battery: 6% drop over 1 hour
Memory: 42MB stable

Notes: Lock screen works perfectly, Bluetooth headphone controls excellent
```

Good luck testing! 🚀
