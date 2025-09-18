import { useState, useEffect, useCallback } from 'react';
import { Pause, Play, SkipForward } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useSongs } from './hooks/useSongs';

import WelcomeScreen from './components/WelcomeScreen';
import SignInScreen from './components/SignInScreen';
import CreateAccountScreen from './components/CreateAccountScreen';
import PhoneAuthScreen from './components/PhoneAuthScreen';
import VerificationScreen from './components/VerificationScreen';
import NameEntryScreen from './components/NameEntryScreen';
import OnboardingCompleteScreen from './components/OnboardingCompleteScreen';
import HomeScreen from './components/HomeScreen';
import CreateMusicScreen from './components/CreateMusicScreen';
import MySongsScreen from './components/MySongsScreen';
import SongPlayerScreen from './components/SongPlayerScreen';
import AccountSettingsScreen from './components/AccountSettingsScreen';
import ProfileScreen from './components/ProfileScreen';
import NotificationsScreen from './components/NotificationsScreen';
import UserProfileScreen from './components/UserProfileScreen';
import HealingMusicPlaylist from './components/HealingMusicPlaylist';
import MeditationPlaylist from './components/Meditationplaylist';
import PlaylistScreen from './components/PlaylistScreen';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import TalkToDaraScreen from './components/TalkToDaraScreen';
import MeditationAssistantScreen from './components/MeditationAssistantScreen';
import MeditationCreationScreen from './components/MeditationCreationScreen';
import StatusBar from './components/StatusBar';

type Screen =
  | 'welcome'
  | 'signin'
  | 'createAccount'
  | 'phoneNumber'
  | 'verification'
  | 'nameEntry'
  | 'onboardingComplete'
  | 'home'
  | 'createMusic'
  | 'mySongs'
  | 'songPlayer'
  | 'accountSettings'
  | 'profile'
  | 'notifications'
  | 'userProfile'
  | 'healingMusicPlaylist'
  | 'meditationPlaylist'
  | 'playlist'
  | 'analytics'
  | 'talkToDara'
  | 'meditationAssistant'
  | 'meditationCreation';

export interface Song {
  id: string;
  title: string;
  description: string;
  tags: string;
  plays: number;
  likes: number;
  image: string;
  version: string;
  isPublic: boolean;
  createdAt: string;
  creator?: string;
  isLiked?: boolean;
  duration?: string;
}

const AUTH_SCREENS = new Set<Screen>([
  'welcome',
  'signin',
  'createAccount',
  'phoneNumber',
  'verification',
  'nameEntry',
  'onboardingComplete',
]);

const PROTECTED_SCREENS = new Set<Screen>([
  'home',
  'createMusic',
  'mySongs',
  'songPlayer',
  'accountSettings',
  'profile',
  'notifications',
  'userProfile',
  'healingMusicPlaylist',
  'meditationPlaylist',
  'playlist',
  'analytics',
  'talkToDara',
  'meditationAssistant',
  'meditationCreation',
]);

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { songs, publicSongs, setSongs } = useSongs();

  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [userName, setUserName] = useState('Sam lee');
  const [userHandle, setUserHandle] = useState('samleeee');
  const [phoneNumber, setPhoneNumber] = useState('+1 650-213-7379');
  const [isSignInFlow, setIsSignInFlow] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<Song | null>(null);
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<{name: string; description?: string} | null>(null);

  // App bootstrap + error boundary
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);

    const handleError = (error: ErrorEvent) => {
      console.error('App error:', error);
      setHasError(true);
    };
    window.addEventListener('error', handleError);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Handle authentication → route transitions (run only when a transition is needed)
  useEffect(() => {
    console.log(
      '🏠 APP: Auth state changed - loading:',
      authLoading,
      'user:',
      user ? user.email : 'none',
      'screen:',
      currentScreen
    );

    if (authLoading) return;

    if (user) {
      // If authenticated but on an auth screen, go home once
      if (AUTH_SCREENS.has(currentScreen)) {
        console.log('🏠 APP: User authenticated, navigating to home (once)');
        setCurrentScreen('home');
      }
    } else {
      // If not authenticated but on a protected screen, go to welcome once
      if (PROTECTED_SCREENS.has(currentScreen)) {
        console.log('🏠 APP: No user, redirecting to welcome (once)');
        setCurrentScreen('welcome');
      }
    }
  }, [authLoading, user, currentScreen]);

  // --- Player handlers ---
  const handlePlaySong = (song: Song) => {
    setCurrentlyPlaying(song);
    setCurrentSong(song);
    setIsPlaying(true);
    setIsPlayerMinimized(false);
    setCurrentScreen('songPlayer');
  };

  const handleMinimizePlayer = () => {
    setIsPlayerMinimized(true);
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    signOut();
    setCurrentScreen('welcome');
    setCurrentSong(null);
    setCurrentlyPlaying(null);
    setIsPlayerMinimized(false);
  };

  const handleRefreshProfile = useCallback(() => {
    // This will trigger useProfile hook to refresh when returning from edit
    console.log('🔄 Refreshing profile data after edit...');
  }, []);

  // --- Loading & Error ---
  if (isLoading || authLoading) {
    return (
      <div className="mobile-container">
        <div className="h-full flex items-center justify-center bg-white">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-medium text-black mb-2">Loading Indara</h2>
            <p className="text-gray-600">Preparing your healing journey...</p>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="mobile-container">
        <div className="h-full flex items-center justify-center bg-white p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-medium text-black mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">We're having trouble loading the app.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-black text-white px-6 py-2 rounded-full font-medium"
            >
              Reload App
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Screen renderer (NO setState calls here) ---
  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return (
          <WelcomeScreen
            onCreateAccount={() => setCurrentScreen('createAccount')}
            onSignIn={() => setCurrentScreen('signin')}
          />
        );
      case 'signin':
        return (
          <SignInScreen
            onBack={() => setCurrentScreen('welcome')}
            onNext={() => {
              setIsSignInFlow(true);
              setCurrentScreen('phoneNumber');
            }}
          />
        );
      case 'createAccount':
        return (
          <CreateAccountScreen
            onBack={() => setCurrentScreen('welcome')}
            onNext={() => {
              setIsSignInFlow(false);
              setCurrentScreen('phoneNumber');
            }}
          />
        );
      case 'phoneNumber':
        return (
          <PhoneAuthScreen
            onBack={() => setCurrentScreen(isSignInFlow ? 'signin' : 'createAccount')}
            mode={isSignInFlow ? 'signin' : 'create'}
          />
        );
      case 'verification':
        return (
          <VerificationScreen
            onBack={() => setCurrentScreen('phoneNumber')}
            onNext={() => {
              if (isSignInFlow) {
                setCurrentScreen('home');
              } else {
                setCurrentScreen('nameEntry');
              }
            }}
            phoneNumber={phoneNumber}
            isSignIn={isSignInFlow}
          />
        );
      case 'nameEntry':
        return (
          <NameEntryScreen
            onBack={() => setCurrentScreen('verification')}
            onNext={() => setCurrentScreen('onboardingComplete')}
            onNameChange={setUserName}
          />
        );
      case 'onboardingComplete':
        return (
          <OnboardingCompleteScreen
            onNext={() => setCurrentScreen('home')}
            name={userName}
          />
        );
      case 'home':
        return (
          <HomeScreen
            onCreateMusic={() => {
              console.log('🎵 Create Music clicked');
              setCurrentScreen('createMusic');
            }}
            onMySongs={() => {
              console.log('📚 Library clicked');
              setCurrentScreen('mySongs');
            }}
            onAccountSettings={() => {
              console.log('⚙️ Account Settings clicked');
              setCurrentScreen('accountSettings');
            }}
            userName={userName}
            userHandle={userHandle}
            songs={publicSongs}
            onPlaySong={handlePlaySong}
            onNameEntry={() => setCurrentScreen('nameEntry')}
            onHealingMusicPlaylist={() => {
              console.log('🎶 Healing Music Playlist clicked');
              setCurrentScreen('healingMusicPlaylist');
            }}
            onMeditationPlaylist={() => {
              console.log('🧘 Meditation Playlist clicked');
              setCurrentScreen('meditationPlaylist');
            }}
            onPlaylist={(playlistName: string, playlistDescription?: string) => {
              console.log('🎵 Featured Playlist clicked:', playlistName);
              setSelectedPlaylist({ name: playlistName, description: playlistDescription });
              setCurrentScreen('playlist');
            }}
            onInbox={() => {
              console.log('📥 Inbox clicked');
              setCurrentScreen('notifications');
            }}
          />
        );
      case 'createMusic':
        return (
          <CreateMusicScreen
            onClose={() => setCurrentScreen('home')}
            onPlaySong={handlePlaySong}
            onTalkToDara={() => setCurrentScreen('talkToDara')}
          />
        );
      case 'mySongs':
        return (
          <MySongsScreen
            onBack={() => setCurrentScreen('home')}
            onCreateMusic={() => setCurrentScreen('createMusic')}
            onAccountSettings={() => setCurrentScreen('accountSettings')}
            onInbox={() => setCurrentScreen('notifications')}
            userSongs={songs}
            onPlaySong={handlePlaySong}
            userName={userName}
          />
        );
      case 'songPlayer':
        return (
          <SongPlayerScreen
            onBack={handleMinimizePlayer}
            song={currentSong!}
            onShareToHealing={(sharedSong) => {
              setSongs((prev) => prev.map((s) => (s.id === sharedSong.id ? sharedSong : s)));
            }}
          />
        );
      case 'accountSettings':
        return (
          <AccountSettingsScreen
            onBack={() => setCurrentScreen('home')}
            userName={userName}
            userHandle={userHandle}
            onLogout={handleLogout}
            onViewProfile={() => setCurrentScreen('userProfile')}
            onEditProfile={() => setCurrentScreen('profile')}
            onNotifications={() => setCurrentScreen('notifications')}
            onAnalytics={() => setCurrentScreen('analytics')}
            refreshProfile={handleRefreshProfile}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            onBack={() => setCurrentScreen('accountSettings')}
            userName={userName}
            userHandle={userHandle}
            phoneNumber={phoneNumber}
            onSave={(name: string, handle: string, phone: string) => {
              setUserName(name);
              setUserHandle(handle);
              setPhoneNumber(phone);
            }}
          />
        );
      case 'notifications':
        return <NotificationsScreen onBack={() => setCurrentScreen('home')} />;
      case 'userProfile':
        return (
        <UserProfileScreen
          onBack={() => setCurrentScreen('accountSettings')}
          userName={userName}
          userHandle={userHandle}
        />
        );
      case 'healingMusicPlaylist':
        return (
          <HealingMusicPlaylist
            onBack={() => setCurrentScreen('home')}
            onCreateMusic={() => setCurrentScreen('createMusic')}
            onMySongs={() => setCurrentScreen('mySongs')}
            onAccountSettings={() => setCurrentScreen('accountSettings')}
          />
        );
      case 'meditationPlaylist':
        return (
          <MeditationPlaylist
            onBack={() => setCurrentScreen('home')}
            onCreateMusic={() => setCurrentScreen('createMusic')}
            onMySongs={() => setCurrentScreen('mySongs')}
            onAccountSettings={() => setCurrentScreen('accountSettings')}
          />
        );
      case 'playlist':
        return (
          <PlaylistScreen
            playlistName={selectedPlaylist?.name || 'Featured Playlist'}
            playlistDescription={selectedPlaylist?.description}
            onBack={() => setCurrentScreen('home')}
            onCreateMusic={() => setCurrentScreen('createMusic')}
            onMySongs={() => setCurrentScreen('mySongs')}
            onAccountSettings={() => setCurrentScreen('accountSettings')}
            onInbox={() => setCurrentScreen('notifications')}
          />
        );
      case 'analytics':
        return (
          <AnalyticsDashboard
            onBack={() => setCurrentScreen('accountSettings')}
            onCreateMusic={() => setCurrentScreen('createMusic')}
            onMySongs={() => setCurrentScreen('mySongs')}
            onAccountSettings={() => setCurrentScreen('accountSettings')}
            onInbox={() => setCurrentScreen('notifications')}
          />
        );
      case 'talkToDara':
        return (
          <TalkToDaraScreen
            onBack={() => setCurrentScreen('home')}
            onCreateMusic={() => setCurrentScreen('createMusic')}
            onMySongs={() => setCurrentScreen('mySongs')}
            onAccountSettings={() => setCurrentScreen('accountSettings')}
            onInbox={() => setCurrentScreen('notifications')}
          />
        );
      case 'meditationAssistant':
        return (
          <MeditationAssistantScreen
            onBack={() => setCurrentScreen('home')}
            onCreateMusic={() => setCurrentScreen('createMusic')}
            onMySongs={() => setCurrentScreen('mySongs')}
            onAccountSettings={() => setCurrentScreen('accountSettings')}
            onInbox={() => setCurrentScreen('notifications')}
            onStartSession={(sessionType, duration) => {
              console.log('Starting meditation session:', sessionType, duration);
              // Could navigate to a meditation session screen or start inline
            }}
          />
        );
      case 'meditationCreation':
        return (
          <MeditationCreationScreen
            onClose={() => setCurrentScreen('home')}
            onPlaySong={handlePlaySong}
            onTalkToDara={() => setCurrentScreen('talkToDara')}
          />
        );
      default:
        return (
          <WelcomeScreen
            onSignIn={() => setCurrentScreen('signin')}
            onCreateAccount={() => setCurrentScreen('createAccount')}
          />
        );
    }
  };

  return (
    <div className="mobile-container">
      {currentScreen !== 'createMusic' && <StatusBar />}
      <div className="h-full overflow-hidden">
        {renderScreen()}

        {/* Mini Player - Always on top when music is playing and minimized */}
        {currentlyPlaying && isPlayerMinimized && (
          <div className="fixed bottom-16 left-0 right-0 bg-white shadow-lg border-t z-40 mx-auto max-w-[375px]">
            <div className="flex items-center gap-3 p-3">
              <img
                src={currentlyPlaying.image}
                alt={currentlyPlaying.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-black text-sm truncate">
                  {currentlyPlaying.title}
                </h4>
                <p className="text-gray-600 text-xs truncate">{currentlyPlaying.creator}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 bg-black rounded-full flex items-center justify-center"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setCurrentSong(currentlyPlaying);
                    setIsPlayerMinimized(false);
                    setCurrentScreen('songPlayer');
                  }}
                  className="w-8 h-8 flex items-center justify-center"
                >
                  <SkipForward className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Mini Progress Bar */}
            <div className="px-3 pb-2">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div className="w-1/4 bg-black rounded-full h-1"></div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
