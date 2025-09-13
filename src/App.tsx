import { useState, useEffect } from 'react';
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
  | 'userProfile';

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

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { songs, publicSongs, createSong: createSongInDB } = useSongs();
  
  // All state declarations must come before useEffect hooks
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [initialScreen, setInitialScreen] = useState<Screen>('welcome');
  const [userName, setUserName] = useState('Sam lee');
  const [userHandle, setUserHandle] = useState('samleeee');
  const [phoneNumber, setPhoneNumber] = useState('+1 650-213-7379');
  const [isSignInFlow, setIsSignInFlow] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<Song | null>(null);
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Error boundary simulation
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

  // Handle authentication state changes
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        // User is authenticated, go to home
        setCurrentScreen('home');
      } else {
        // User is not authenticated, go to welcome
        if (['home', 'createMusic', 'mySongs', 'songPlayer', 'accountSettings', 'profile', 'notifications', 'userProfile'].includes(currentScreen)) {
          setCurrentScreen('welcome');
        }
      }
    }
  }, [user, authLoading, currentScreen]);

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

  const handleCreateComplete = (newSong: any) => {
    const song = {
      title: newSong.title,
      description: newSong.description,
      tags: newSong.tags,
      image: newSong.image,
      is_public: newSong.isPublic || false,
      duration: newSong.duration || '3:45'
    };
    
    createSongInDB(song).then(({ data, error }) => {
      if (!error && data) {
        setCurrentlyPlaying(data);
        setCurrentSong(data);
        setIsPlayerMinimized(false);
        setCurrentScreen('songPlayer');
      }
    });
  };

  const handleLogout = () => {
    signOut();
    setCurrentScreen('welcome');
    setCurrentSong(null);
    setCurrentlyPlaying(null);
    setIsPlayerMinimized(false);
  };

  // Loading state
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

  // Error state
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

  const renderScreen = () => {
    // If user is authenticated and still on auth screens, redirect to home
    if (user && ['welcome', 'signin', 'createAccount', 'phoneNumber', 'verification', 'nameEntry', 'onboardingComplete'].includes(currentScreen)) {
      setCurrentScreen('home');
      return null;
    }

    // If user is not authenticated and not on auth screens, show welcome
    if (!user && !['welcome', 'signin', 'createAccount', 'phoneNumber', 'verification', 'nameEntry', 'onboardingComplete'].includes(currentScreen)) {
      setCurrentScreen('welcome');
      return null;
    }

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
            onNext={() => setCurrentScreen('verification')}
            mode={isSignInFlow ? 'signin' : 'signup'}
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
            mode={isSignInFlow ? 'signin' : 'create'}
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
            onCreateMusic={() => setCurrentScreen('createMusic')}
            onMySongs={() => setCurrentScreen('mySongs')}
            onAccountSettings={() => setCurrentScreen('accountSettings')}
            userName={userName}
            userHandle={userHandle}
            songs={publicSongs}
            onPlaySong={handlePlaySong}
          />
        );
      case 'createMusic':
        return (
          <CreateMusicScreen 
            onBack={() => setCurrentScreen('home')}
            onCreateComplete={handleCreateComplete}
          />
        );
      case 'mySongs':
        return (
          <MySongsScreen 
            onBack={() => setCurrentScreen('home')}
            onAccountSettings={() => setCurrentScreen('accountSettings')}
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
              // Update the song in the songs array to mark it as public
              setSongs(prev => prev.map(s => s.id === sharedSong.id ? sharedSong : s));
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
        return (
          <NotificationsScreen 
            onBack={() => setCurrentScreen('accountSettings')}
          />
        );
      case 'userProfile':
        return (
          <UserProfileScreen 
            onBack={() => setCurrentScreen('accountSettings')}
            userName={userName}
            userHandle={userHandle}
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
      <StatusBar />
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
                <p className="text-gray-600 text-xs truncate">
                  {currentlyPlaying.creator}
                </p>
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
        
        {/* Bottom Navigation Bar */}
        {/* Bottom Navigation Bar - Only show after onboarding */}
        {['home', 'mySongs', 'createMusic', 'songPlayer', 'accountSettings', 'profile', 'notifications', 'userProfile'].includes(currentScreen) && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 mx-auto max-w-[375px]">
            <div className="flex items-center justify-around py-2">
              <button 
                onClick={() => setCurrentScreen('home')}
                className={`flex flex-col items-center gap-1 p-3 ${
                  currentScreen === 'home' ? 'text-black' : 'text-gray-400'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                  </svg>
                </div>
                <span className="text-xs font-medium">Home</span>
              </button>
              
              <button 
                onClick={() => setCurrentScreen('mySongs')}
                className={`flex flex-col items-center gap-1 p-3 ${
                  currentScreen === 'mySongs' ? 'text-black' : 'text-gray-400'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
                  </svg>
                </div>
                <span className="text-xs font-medium">Library</span>
              </button>
              
              <button 
                onClick={() => setCurrentScreen('createMusic')}
                className="relative"
              >
                <div className="w-14 h-14 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
              </button>
              
              <button 
                onClick={() => setCurrentScreen('notifications')}
                className={`flex flex-col items-center gap-1 p-3 ${
                  currentScreen === 'notifications' ? 'text-black' : 'text-gray-400'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center relative">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                  </svg>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
                <span className="text-xs font-medium">Inbox</span>
              </button>
              
              <button 
                onClick={() => setCurrentScreen('accountSettings')}
                className={`flex flex-col items-center gap-1 p-3 ${
                  currentScreen === 'accountSettings' ? 'text-black' : 'text-gray-400'
                }`}
              >
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs font-medium">Account</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;