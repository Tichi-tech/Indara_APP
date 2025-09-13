import React, { useState } from 'react';
import { ArrowLeft, Wand2, Music, Globe, Lock } from 'lucide-react';

interface CreateMusicScreenProps {
  onBack: () => void;
  onCreateComplete: (song: {
    title: string;
    description: string;
    tags: string;
    image: string;
    isPublic: boolean;
    duration: string;
  }) => void;
}

const CreateMusicScreen: React.FC<CreateMusicScreenProps> = ({ onBack, onCreateComplete }) => {
  const [step, setStep] = useState<'input' | 'generating' | 'complete'>('input');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [duration, setDuration] = useState('3:45');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!title.trim() || !description.trim()) return;
    
    setLoading(true);
    setStep('generating');
    
    // Simulate AI generation process
    setTimeout(() => {
      const newSong = {
        title: title.trim(),
        description: description.trim(),
        tags: tags.trim() || 'healing, meditation',
        image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg',
        isPublic,
        duration
      };
      
      setStep('complete');
      setLoading(false);
      
      // Complete the creation after a brief delay
      setTimeout(() => {
        onCreateComplete(newSong);
      }, 1000);
    }, 3000);
  };

  if (step === 'generating') {
    return (
      <div className="h-full bg-white flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-24 h-24 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-8 animate-pulse">
            <Wand2 className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-2xl font-semibold text-black mb-4 text-center">
            Creating your healing music
          </h1>
          
          <p className="text-gray-600 text-center mb-8 leading-relaxed">
            Our AI is composing a personalized track based on your description. This may take a few moments.
          </p>
          
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Analyzing prompt</span>
              <span>100%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className="w-full bg-gradient-to-r from-orange-400 to-purple-600 rounded-full h-2"></div>
            </div>
            
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Generating melody</span>
              <span>75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className="w-3/4 bg-gradient-to-r from-orange-400 to-purple-600 rounded-full h-2"></div>
            </div>
            
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Adding healing frequencies</span>
              <span>45%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="w-2/5 bg-gradient-to-r from-orange-400 to-purple-600 rounded-full h-2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="h-full bg-white flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-8">
            <Music className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-2xl font-semibold text-black mb-4 text-center">
            Your healing music is ready!
          </h1>
          
          <p className="text-gray-600 text-center mb-8 leading-relaxed">
            "{title}" has been created and is ready to play.
          </p>
          
          <div className="w-full max-w-sm bg-gray-50 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-3">
              <img 
                src="https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg"
                alt={title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-medium text-black">{title}</h3>
                <p className="text-gray-600 text-sm">{duration}</p>
                <div className="flex items-center gap-2 mt-1">
                  {isPublic ? (
                    <Globe className="w-3 h-3 text-green-500" />
                  ) : (
                    <Lock className="w-3 h-3 text-gray-400" />
                  )}
                  <span className="text-xs text-gray-500">
                    {isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="flex items-center px-6 py-4">
        <button onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
        <h1 className="text-lg font-semibold text-black ml-4">Create Music</h1>
      </div>
      
      <div className="flex-1 px-6 pb-20 overflow-y-auto">
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wand2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-black text-center mb-2">
            Describe your healing music
          </h2>
          <p className="text-gray-600 text-center">
            Tell us what kind of healing experience you need
          </p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning Meditation"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              maxLength={50}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the mood, instruments, or healing intention you want..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {description.length}/500
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Tags (optional)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., relaxing, sleep, anxiety relief"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="1:30">1:30 - Quick session</option>
              <option value="3:45">3:45 - Standard</option>
              <option value="5:00">5:00 - Extended</option>
              <option value="10:00">10:00 - Deep meditation</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h3 className="font-medium text-black">Make public</h3>
              <p className="text-sm text-gray-600">Share with the Indara community</p>
            </div>
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`w-12 h-6 rounded-full transition-colors ${
                isPublic ? 'bg-black' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  isPublic ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={loading || !title.trim() || !description.trim()}
          className="w-full bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 text-white py-4 rounded-xl text-lg font-medium mt-8 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <div className="flex items-center justify-center gap-2">
            <Wand2 className="w-5 h-5" />
            {loading ? 'Creating...' : 'Create Healing Music'}
          </div>
        </button>
      </div>
    </div>
  );
};

export default CreateMusicScreen;