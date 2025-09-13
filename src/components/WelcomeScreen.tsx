import React from 'react';

interface WelcomeScreenProps {
  onCreateAccount: () => void;
  onSignIn: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onCreateAccount, onSignIn }) => {
  return (
    <div className="h-full bg-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-light text-black mb-4">Indara</h1>
          <p className="text-xl text-gray-600 font-light">
            From your mind to healing music
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={onCreateAccount}
            className="w-full bg-black text-white py-4 rounded-xl text-lg font-medium transition-all duration-200 hover:bg-gray-800 active:scale-95"
          >
            Create account
          </button>
          
          <button
            onClick={onSignIn}
            className="w-full border border-gray-300 text-black py-4 rounded-xl text-lg font-medium transition-all duration-200 hover:bg-gray-50 active:scale-95"
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
};

export default WelcomeScreen;