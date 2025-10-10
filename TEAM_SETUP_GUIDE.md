# Indara Mobile App - Team Setup Guide

Complete guide for team members to clone and run the Indara mobile app in Android Studio.

---

## 📋 Prerequisites

Before starting, ensure you have:

### Required Software
1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **Git**
   - Download: https://git-scm.com/
   - Verify: `git --version`

3. **Android Studio** (Latest version)
   - Download: https://developer.android.com/studio
   - Include Android SDK, Android SDK Platform-Tools, Android Emulator

4. **Java Development Kit (JDK 17)**
   - Download: https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
   - Verify: `java --version`

### Environment Setup
- **ANDROID_HOME** environment variable configured
- **Java JAVA_HOME** environment variable configured

---

## 🚀 Step-by-Step Setup

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/Tichi-tech/Indara_APP.git
cd Indara_APP
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install mobile app dependencies
cd apps/mobile
npm install
```

**Note**: This is a monorepo project, so you need to install dependencies at both root and mobile app level.

### 3. Create Environment File

Create a file named `.env` in `apps/mobile/` directory:

**File**: `apps/mobile/.env`

```env
EXPO_PUBLIC_SUPABASE_URL=https://mtypyrsdbsoxrgzsxwsk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10eXB5cnNkYnNveHJnenN4d3NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5OTY5NzQsImV4cCI6MjA2NzU3Mjk3NH0.rIRFbCR4fFDftKrSu0EykIHrl91cKHN3hP8BRE-XOdU
EXPO_PUBLIC_FORCE_PROXY=1
```

**⚠️ IMPORTANT**: This file is in `.gitignore` - you must create it manually or request it from the team lead.

### 4. Android Studio Configuration

#### Open Project in Android Studio

1. Open Android Studio
2. Click **"Open"**
3. Navigate to: `Indara_APP/apps/mobile/android/`
4. Click **"OK"**
5. Wait for Gradle sync to complete

#### Verify Android SDK

1. Go to: **File → Settings → Appearance & Behavior → System Settings → Android SDK**
2. Ensure installed:
   - ✅ Android 13 (API 33) or higher
   - ✅ Android SDK Platform-Tools
   - ✅ Android SDK Build-Tools

#### Set Up Emulator

1. Go to: **Tools → Device Manager**
2. Click **"Create Device"**
3. Choose:
   - Device: **Pixel 5** or newer
   - System Image: **Android 13 (API 33)** or higher
   - Name: **Indara_Emulator**
4. Click **"Finish"**

### 5. Start Development Server

**Option A: Using Expo (Recommended)**

```bash
# From apps/mobile directory
cd apps/mobile
npx expo start

# Or clear cache if needed
npx expo start -c
```

**Option B: Using npm scripts**

```bash
# From root directory
npm run mobile

# Or from apps/mobile
npm start
```

### 6. Run on Android

#### Method 1: Using Expo CLI (Easiest)

```bash
# Start Expo dev server
npx expo start

# In the terminal, press:
# 'a' - to open Android emulator
# Or scan QR code with Expo Go app on physical device
```

#### Method 2: Using Android Studio

1. Start the emulator in Android Studio (**Device Manager → Play button**)
2. In terminal:
   ```bash
   npx expo run:android
   ```

#### Method 3: Build APK for Physical Device

```bash
# Development build
npx expo run:android --variant debug

# Production build (requires EAS)
eas build --platform android --profile production
```

---

## 🗂️ Project Structure

```
Indara_APP/
├── apps/
│   ├── mobile/              # React Native mobile app (THIS IS WHAT YOU'LL WORK ON)
│   │   ├── android/         # Android native code
│   │   ├── app/             # Expo Router screens
│   │   ├── src/             # Source code
│   │   │   ├── components/  # Reusable components
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── screens/     # Screen components
│   │   │   ├── services/    # API services (audioService, musicApi)
│   │   │   └── utils/       # Utility functions (thumbnailMatcher)
│   │   ├── .env             # ⚠️ Environment variables (NOT in Git)
│   │   ├── app.config.ts    # Expo configuration
│   │   └── package.json     # Mobile dependencies
│   │
│   └── web/                 # Web app (Vercel deployment)
│
├── packages/                # Shared packages (if any)
├── public/                  # Public assets (thumbnails)
├── supabase/                # Database migrations
├── package.json             # Root dependencies
└── README.md
```

---

## 📱 Testing the App

### First Run Checklist

1. **App Launches**: Check emulator/device shows Indara splash screen
2. **Login Works**: Test login with test account
3. **Music Plays**: Navigate to Library → Click a track → Should play
4. **No Errors**: Check terminal for errors or warnings

### Common Test Scenarios

```bash
# 1. Test home screen
# - Open app → Should see community tracks and playlists

# 2. Test music playback
# - Library → Click track → Should play immediately (0.5-1.5s)

# 3. Test music generation
# - Create tab → Chat with Dara → Generate → Should create track

# 4. Test session persistence
# - Login → Minimize app → Reopen → Should stay logged in
```

---

## 🔧 Common Issues & Solutions

### Issue 1: "Cannot find module 'expo'"

**Solution**:
```bash
cd apps/mobile
npm install
npx expo install
```

### Issue 2: Metro bundler errors

**Solution**:
```bash
# Clear all caches
npx expo start -c

# Or reset Metro bundler
rm -rf node_modules/.cache
npx react-native start --reset-cache
```

### Issue 3: Android build fails

**Solution**:
```bash
# Clean Gradle cache
cd apps/mobile/android
./gradlew clean

# Or from apps/mobile:
npx expo run:android --no-build-cache
```

### Issue 4: "ANDROID_HOME not set"

**Solution**:

**Windows**:
```bash
# Add to Environment Variables:
ANDROID_HOME=C:\Users\YourName\AppData\Local\Android\Sdk
Path=%Path%;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools
```

**macOS/Linux**:
```bash
# Add to ~/.bashrc or ~/.zshrc:
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
```

### Issue 5: ".env file not found"

**Solution**: Create the `.env` file manually (see Step 3 above) or ask team lead for credentials.

### Issue 6: Emulator is slow

**Solutions**:
- Enable **Hardware Acceleration** (Intel HAXM or AMD Hypervisor)
- Allocate more RAM to emulator (4GB minimum)
- Use a physical device instead (faster)

### Issue 7: "Execution failed for task ':app:installDebug'"

**Solution**:
```bash
# Uninstall existing app from emulator
adb uninstall live.indara.mobile

# Or reset emulator
# Android Studio → Device Manager → Wipe Data
```

---

## 🔑 Required Files (Not in Git)

These files are **NOT** in the GitHub repository and must be created/obtained:

### 1. `.env` File
**Location**: `apps/mobile/.env`
**Get from**: Team lead (contains Supabase credentials)
**Create**: See Step 3 above

### 2. Signing Keys (For Production Builds Only)
**Location**: `apps/mobile/android/app/my-release-key.keystore`
**Get from**: Team lead (for production APK signing)
**Not needed for development**

---

## 📚 Important Commands

### Development

```bash
# Start development server
npm run mobile              # From root
npx expo start             # From apps/mobile

# Clear cache and restart
npx expo start -c

# Run on Android
npx expo run:android

# View logs
npx react-native log-android
```

### Building

```bash
# Development APK (for testing)
npx expo run:android --variant debug

# Production APK (requires signing keys)
npx expo run:android --variant release

# Using EAS Build (cloud build)
eas build --platform android --profile production
```

### Troubleshooting

```bash
# Check React Native environment
npx react-native doctor

# Check Expo diagnostics
npx expo-doctor

# View connected devices
adb devices

# View Android logs
adb logcat | grep -i "react"
```

---

## 🎯 Quick Start (TL;DR)

For experienced developers who want the fastest setup:

```bash
# 1. Clone and install
git clone https://github.com/Tichi-tech/Indara_APP.git
cd Indara_APP
npm install
cd apps/mobile
npm install

# 2. Create .env file (ask team lead for content)
cat > .env << 'EOF'
EXPO_PUBLIC_SUPABASE_URL=https://mtypyrsdbsoxrgzsxwsk.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_FORCE_PROXY=1
EOF

# 3. Start development
npx expo start

# 4. Press 'a' to open Android emulator
```

---

## 🏗️ Tech Stack Overview

- **Framework**: React Native + Expo SDK 54
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based)
- **Audio Player**: React Native Track Player v4.1.2
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **State Management**: React Context (usePlayer, useAuth)
- **Build System**: Gradle + Metro Bundler

---

## 📞 Getting Help

### Resources
- **Expo Docs**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/
- **Supabase Docs**: https://supabase.com/docs
- **Project README**: `README.md`
- **Music Workflow**: `MUSIC_WORKFLOW.md`

### Team Communication
- Report issues in GitHub Issues
- Ask team lead for `.env` credentials
- Check existing PRs before creating new ones

---

## ✅ Verification Checklist

Before starting development, verify:

- [ ] Git repository cloned successfully
- [ ] Node.js and npm installed (`node --version`)
- [ ] Dependencies installed (root + apps/mobile)
- [ ] `.env` file created in `apps/mobile/`
- [ ] Android Studio installed and configured
- [ ] Android SDK installed (API 33+)
- [ ] Emulator created and running
- [ ] `npx expo start` runs without errors
- [ ] App opens in emulator
- [ ] Login screen appears
- [ ] Can log in with test account
- [ ] Music playback works

---

## 🚨 Important Notes

1. **Never commit `.env` file** - It's in `.gitignore` for security
2. **Always pull latest changes** before starting work: `git pull origin main`
3. **Test on emulator before physical device** to avoid hardware issues
4. **Check logs frequently** - Most issues show errors in terminal
5. **Clear cache if things break** - `npx expo start -c` fixes 80% of issues

---

## 📝 Development Workflow

```bash
# Daily workflow
git pull origin main           # Get latest changes
npm install                    # Update dependencies (if needed)
cd apps/mobile
npx expo start                 # Start development
# ... make changes ...
git add .
git commit -m "Description"
git push origin your-branch
# Create Pull Request on GitHub
```

---

**Questions?** Contact the team lead or check existing documentation in `MUSIC_WORKFLOW.md`.

**Happy Coding! 🎵**
