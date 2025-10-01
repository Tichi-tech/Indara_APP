import React from 'react';

interface WelcomeScreenProps {
  onCreateAccount: () => void;
  onSignIn: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onCreateAccount, onSignIn }) => {
  return (
    <div className="h-full bg-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-8">
        {/* Logo and Brand */}
        <div className="mb-16">
          <div className="flex items-center mb-12">
            <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <h1 className="text-2xl font-medium text-black">Indara</h1>
          </div>
          
          <div className="mb-8">
            <h2 className="text-5xl font-light text-black mb-6 leading-tight">
              Welcome<br />
              to Indara
            </h2>
            <p className="text-lg text-gray-500 font-normal">
              From your mind to healing music.
            </p>
          </div>
        </div>
        
        {/* Buttons */}
        <div className="space-y-6">
          <button
            onClick={onCreateAccount}
            className="w-full bg-black text-white py-4 rounded-full text-lg font-medium transition-all duration-200 hover:bg-gray-800 active:scale-95"
          >
            Create a free Indara account to begin
          </button>
          
          <div className="text-center pt-2">
            <span className="text-gray-500">Already have an account? </span>
            <button
              onClick={onSignIn}
              className="text-black font-medium underline"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;