import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import SignInScreen from './components/SignInScreen';
import CreateAccountScreen from './components/CreateAccountScreen';
import PhoneAuthScreen from './components/PhoneAuthScreen';

function App() {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<'welcome' | 'signin' | 'create' | 'phone-signin' | 'phone-create'>('welcome');

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to Indara!</h1>
          <p className="text-gray-600 mb-4">You are signed in as: {user.email}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-black text-white px-6 py-2 rounded-lg"
          >
            Continue to App
          </button>
        </div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'signin':
        return (
          <SignInScreen
            onBack={() => setCurrentScreen('welcome')}
            onNext={() => setCurrentScreen('phone-signin')}
          />
        );
      case 'create':
        return (
          <CreateAccountScreen
            onBack={() => setCurrentScreen('welcome')}
            onNext={() => setCurrentScreen('phone-create')}
          />
        );
      case 'phone-signin':
      case 'phone-create':
        return (
          <PhoneAuthScreen
            mode={currentScreen === 'phone-signin' ? 'signin' : 'create'}
            onBack={() => setCurrentScreen(currentScreen === 'phone-signin' ? 'signin' : 'create')}
          />
        );
      default:
        return (
          <div className="min-h-screen bg-white flex flex-col">
            <div className="flex-1 flex flex-col justify-center items-center px-8">
              <div className="text-center mb-16">
                <h1 className="text-5xl font-light mb-4 text-black">Indara</h1>
                <p className="text-gray-600 text-lg">AI-powered music creation</p>
              </div>
              
              <div className="w-full max-w-sm space-y-4">
                <button
                  onClick={() => setCurrentScreen('create')}
                  className="w-full bg-black text-white py-4 rounded-xl text-lg font-medium transition-all duration-200 hover:bg-gray-800 active:scale-95"
                >
                  Create account
                </button>
                
                <button
                  onClick={() => setCurrentScreen('signin')}
                  className="w-full bg-gray-100 text-black py-4 rounded-xl text-lg font-medium transition-all duration-200 hover:bg-gray-200 active:scale-95"
                >
                  Sign in
                </button>
              </div>
            </div>
            
            <div className="px-8 pb-8">
              <p className="text-sm text-gray-500 text-center leading-relaxed">
                By continuing, you agree to the{' '}
                <span className="text-red-500 underline">Terms of Service</span>{' '}
                and acknowledge that you have read and understood the{' '}
                <span className="text-red-500 underline">Privacy Policy</span>
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {renderScreen()}
    </div>
  );
}

export default App;