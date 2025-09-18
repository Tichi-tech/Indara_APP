import React, { useState } from 'react';
import { X, Settings, Leaf, MessageCircle, Sparkles } from 'lucide-react';
import { musicApi } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface MeditationCreationScreenProps {
  onClose: () => void;
  onPlaySong: (song: any) => void;
  onTalkToDara?: () => void;
}

const MeditationCreationScreen: React.FC<MeditationCreationScreenProps> = ({
  onClose,
  onPlaySong,
  onTalkToDara
}) => {
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState(300); // 5 minutes default
  const [useTherapist, setUseTherapist] = useState(false);
  const [creationState, setCreationState] = useState<'idle' | 'creating' | 'ready'>('idle');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedSession, setGeneratedSession] = useState<any>(null);

  const meditationTags = [
    'Mindfulness', 'Breathing', 'Body Scan',
    'Sleep Meditation', 'Stress Relief', 'Inner Peace',
    'Loving Kindness', 'Gratitude', 'Focus',
    'Anxiety Relief', 'Deep Relaxation', 'Chakra Healing'
  ];

  const durationOptions = [
    { value: 180, label: '3 min' },
    { value: 300, label: '5 min' },
    { value: 600, label: '10 min' },
    { value: 900, label: '15 min' },
    { value: 1200, label: '20 min' },
    { value: 1800, label: '30 min' }
  ];

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleTalkToDara = () => {
    if (onTalkToDara) {
      onTalkToDara();
    }
  };

  const handleCreateMeditation = async () => {
    if (!user) {
      setError('Please sign in to create meditation sessions');
      return;
    }

    if (!inputText.trim() && selectedTags.length === 0) {
      setError('Please describe your meditation session or select some tags');
      return;
    }

    try {
      setCreationState('creating');
      setError(null);
      setGenerationProgress(0);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Combine input text and selected tags
      const sessionDescription = inputText.trim()
        ? `${inputText.trim()}. Focus on: ${selectedTags.join(', ')}`
        : `Meditation session focusing on: ${selectedTags.join(', ')}`;

      const { data, error } = await musicApi.generateMeditationSession({
        user_text: sessionDescription,
        duration_sec: selectedDuration,
        use_therapist: useTherapist
      });

      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (error) {
        throw new Error(error.message || 'Failed to generate meditation session');
      }

      setGeneratedSession(data);
      setCreationState('ready');

      // If we have audio data, create a song object for playback
      if (data?.audio_url) {
        const meditationSong = {
          id: data.id || Date.now().toString(),
          title: `Meditation Session - ${selectedTags.join(', ') || 'Custom'}`,
          description: sessionDescription,
          image: 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=400',
          audio_url: data.audio_url,
          duration: `${Math.floor(selectedDuration / 60)}:${(selectedDuration % 60).toString().padStart(2, '0')}`,
          creator: 'Meditation Guide',
          tags: selectedTags.join(', '),
          plays: 0,
          likes: 0,
          version: '1.0',
          isPublic: false,
          createdAt: new Date().toISOString()
        };

        onPlaySong(meditationSong);
      }

    } catch (err: any) {
      console.error('Meditation generation failed:', err);
      setError(err.message || 'Failed to generate meditation session');
      setCreationState('idle');
    }
  };

  const resetForm = () => {
    setInputText('');
    setSelectedTags([]);
    setSelectedDuration(300);
    setUseTherapist(false);
    setCreationState('idle');
    setGenerationProgress(0);
    setError(null);
    setGeneratedSession(null);
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-b from-green-50 to-teal-50 z-50 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>

          {/* Talk to Dara Button */}
          <button
            onClick={handleTalkToDara}
            className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center hover:shadow-lg transition-shadow"
          >
            <MessageCircle className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Leaf className="w-6 h-6 text-green-600" />
          <h1 className="text-lg font-bold text-gray-800">Create Meditation</h1>
        </div>

        <button
          onClick={onClose}
          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden">
        <div className="flex-1 p-6">
          {/* Description Input */}
          <div className="w-full h-48 border-2 border-green-300 rounded-3xl p-6 mb-6 bg-white/50 backdrop-blur">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Describe your ideal meditation session... (e.g., 'I want to reduce stress and find inner calm')"
              className="w-full h-full resize-none text-lg leading-relaxed focus:outline-none placeholder-gray-400 border-none bg-transparent"
              disabled={creationState === 'creating'}
            />
          </div>

          {/* Duration Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Session Duration</h3>
            <div className="grid grid-cols-3 gap-3">
              {durationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedDuration(option.value)}
                  className={`p-3 rounded-xl border-2 font-medium transition-colors ${
                    selectedDuration === option.value
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
                  }`}
                  disabled={creationState === 'creating'}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Therapist Option */}
          <div className="mb-6">
            <label className="flex items-center gap-3 p-4 bg-white/50 rounded-xl border border-green-200">
              <input
                type="checkbox"
                checked={useTherapist}
                onChange={(e) => setUseTherapist(e.target.checked)}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                disabled={creationState === 'creating'}
              />
              <div>
                <span className="font-medium text-gray-800">Include Therapist Guidance</span>
                <p className="text-sm text-gray-600">Add professional therapy elements to your session</p>
              </div>
            </label>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-center">❌ {error}</p>
            </div>
          )}

          {/* Generation Progress */}
          {creationState === 'creating' && (
            <div className="mb-6 p-4 bg-white/50 rounded-xl border border-green-200">
              <div className="flex items-center gap-3 mb-3">
                <Sparkles className="w-5 h-5 text-green-600 animate-spin" />
                <span className="font-medium text-gray-800">Creating your meditation session...</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{generationProgress}% complete</p>
            </div>
          )}

          {/* Tags Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Focus Areas (select any that resonate)</h3>
            <div className="flex flex-wrap gap-2">
              {meditationTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
                  }`}
                  disabled={creationState === 'creating'}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Create Button */}
        <div className="p-6 border-t border-gray-200 bg-white/80 backdrop-blur">
          {creationState === 'ready' ? (
            <div className="space-y-3">
              <div className="text-center p-3 bg-green-50 rounded-xl border border-green-200">
                <p className="text-green-700 font-medium">✅ Meditation session created successfully!</p>
              </div>
              <button
                onClick={resetForm}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold rounded-2xl hover:shadow-lg transition-shadow"
              >
                Create Another Session
              </button>
            </div>
          ) : (
            <button
              onClick={handleCreateMeditation}
              disabled={creationState === 'creating' || (!inputText.trim() && selectedTags.length === 0)}
              className={`w-full py-4 font-bold rounded-2xl transition-shadow ${
                creationState === 'creating' || (!inputText.trim() && selectedTags.length === 0)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-teal-500 text-white hover:shadow-lg'
              }`}
            >
              {creationState === 'creating' ? 'Creating Meditation...' : 'Create Meditation Session'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeditationCreationScreen;