import React from 'react';

interface OnboardingCompleteScreenProps {
  onNext: () => void;
  name: string;
}

const OnboardingCompleteScreen: React.FC<OnboardingCompleteScreenProps> = ({ onNext, name }) => {
  return (
    <div className="h-full bg-white flex flex-col">
      <div className="flex-1 flex flex-col justify-center items-center px-8 text-center">
        <div className="w-24 h-24 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-8">
          <svg viewBox="0 0 24 24" fill="white" className="w-12 h-12">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
        </div>
        
        <h1 className="text-4xl font-light leading-tight mb-4 text-black">
          Welcome to Indara,<br />
          {name}!
        </h1>
        
        <p className="text-xl text-gray-600 font-light mb-12 leading-relaxed">
          Your healing music journey<br />
          starts now
        </p>
        
        <button
          onClick={onNext}
          className="w-full bg-black text-white py-4 rounded-xl text-lg font-medium transition-all duration-200 hover:bg-gray-800 active:scale-95"
        >
          Get started
        </button>
      </div>
    </div>
  );
};

export default OnboardingCompleteScreen;