import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface VerificationScreenProps {
  onBack: () => void;
  onNext: () => void;
  phoneNumber: string;
  isSignIn: boolean;
}

const VerificationScreen: React.FC<VerificationScreenProps> = ({ 
  onBack, 
  onNext, 
  phoneNumber, 
  isSignIn 
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    
    setLoading(true);
    setError('');
    
    // Simulate verification process
    setTimeout(() => {
      setLoading(false);
      onNext();
    }, 1000);
  };

  const handleResendCode = () => {
    setError('');
    // Simulate resending code
    alert('Verification code sent!');
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="flex items-center px-6 py-4">
        <button onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
      </div>
      
      <div className="flex-1 flex flex-col justify-center px-8">
        <h1 className="text-4xl font-light leading-tight mb-8 text-black">
          Enter verification code
        </h1>
        
        <p className="text-gray-600 mb-8">
          We sent a 6-digit code to {phoneNumber}
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              className="w-full px-4 py-4 border border-gray-300 rounded-xl text-lg text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              maxLength={6}
              required
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full bg-black text-white py-4 rounded-xl text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-gray-800 active:scale-95"
          >
            {loading ? 'Verifying...' : isSignIn ? 'Sign in' : 'Continue'}
          </button>
          
          <button
            type="button"
            onClick={handleResendCode}
            className="w-full text-gray-600 py-2 text-sm underline"
          >
            Didn't receive a code? Resend
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerificationScreen;