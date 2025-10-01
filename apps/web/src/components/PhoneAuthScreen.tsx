import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface PhoneAuthScreenProps {
  mode: 'signin' | 'create';
  onBack: () => void;
}

const PhoneAuthScreen: React.FC<PhoneAuthScreenProps> = ({ mode, onBack }) => {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signInWithPhone, verifyOtp } = useAuth();

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await signInWithPhone(phone);
      if (error) {
        if (error.message.includes('phone_provider_disabled')) {
          setError('Phone authentication is not configured. Please use email sign-in instead.');
        } else {
          setError(error.message);
        }
      } else {
        setStep('code');
      }
    } catch (err) {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await verifyOtp(phone, code);
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center px-6 py-4">
        <button 
          onClick={step === 'code' ? () => setStep('phone') : onBack} 
          className="p-2 -ml-2"
        >
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
      </div>
      
      <div className="flex-1 flex flex-col justify-center px-8">
        {step === 'phone' ? (
          <>
            <h1 className="text-4xl font-light leading-tight mb-8 text-black">
              {mode === 'signin' ? 'Sign in with your phone number' : 'Create account with your phone number'}
            </h1>
            
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-4 border border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
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
                disabled={loading || !phone}
                className="w-full bg-black text-white py-4 rounded-xl text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-gray-800 active:scale-95"
              >
                {loading ? 'Sending...' : 'Send verification code'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-4xl font-light leading-tight mb-8 text-black">
              Enter verification code
            </h1>
            
            <p className="text-gray-600 mb-8">
              We sent a 6-digit code to {phone}
            </p>
            
            <form onSubmit={handleCodeSubmit} className="space-y-6">
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
                {loading ? 'Verifying...' : 'Verify code'}
              </button>
              
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-gray-600 py-2 text-sm underline"
              >
                Didn't receive a code? Try again
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default PhoneAuthScreen;