import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

interface NameEntryScreenProps {
  onBack: () => void;
  onNext: () => void;
  onNameChange: (name: string) => void;
}

const NameEntryScreen: React.FC<NameEntryScreenProps> = ({ onBack, onNext, onNameChange }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    onNameChange(name.trim());
    
    // Simulate processing
    setTimeout(() => {
      setLoading(false);
      onNext();
    }, 500);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    onNameChange(value);
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
          What's your name?
        </h1>
        
        <p className="text-gray-600 mb-8">
          This will be displayed on your profile
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-4 border border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              required
              maxLength={50}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full bg-black text-white py-4 rounded-xl text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-gray-800 active:scale-95"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NameEntryScreen;