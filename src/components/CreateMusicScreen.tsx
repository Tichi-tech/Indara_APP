import React, { useState, useEffect } from 'react';
import { X, Settings } from 'lucide-react';
import { musicApi } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';

interface CreateMusicScreenProps {
  onClose: () => void;
  onPlaySong: (song: any) => void;
  onOpenSongPlayer?: (song: any) => void;
  onTalkToDara?: () => void;
}

const CreateMusicScreen: React.FC<CreateMusicScreenProps> = ({ onClose, onPlaySong, onOpenSongPlayer, onTalkToDara }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Music');
  const [inputText, setInputText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [creationState, setCreationState] = useState<'idle' | 'talking' | 'creating' | 'ready'>('idle');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [currentJobStatus, setCurrentJobStatus] = useState<string | null>(null);

  const musicTags = [
    'Energy', 'Relax', 'Study', 
    'Yoga', 'Focus',
    'Soothing Sleep', 'Healing Piano',
    'Nature Sounds', 'Deep Meditation'
  ];

  const meditationTags = [
    'Mindfulness', 'Breathing', 'Body Scan',
    'Sleep Meditation', 'Stress Relief', 'Inner Peace'
  ];

  const currentTags = activeTab === 'Music' ? musicTags : meditationTags;

  // Real-time job updates handler
  const handleJobUpdate = (job: any) => {
    console.log('🔄 Real-time job update received:', job);

    // Only handle updates for the current job
    if (job.id === currentJobId) {
      setCurrentJobStatus(job.status);

      // Update progress based on job status
      switch (job.status) {
        case 'pending':
          setGenerationProgress(10);
          break;
        case 'processing':
          setGenerationProgress(50);
          break;
        case 'completed':
          setGenerationProgress(100);
          setCreationState('ready');

          // Handle completed track
          if (job.generated_tracks && job.generated_tracks.length > 0) {
            const track = job.generated_tracks[0];
            const createdTrack = {
              id: track.id,
              title: track.title || `${activeTab}: ${inputText.slice(0, 30)}...`,
              description: inputText,
              tags: selectedTags.join(', '),
              duration: activeTab === 'Meditation' ? '5:00' : '3:00',
              audio_url: track.audio_url,
              status: 'completed'
            };

            if (onPlaySong) {
              onPlaySong(createdTrack);
            }
          }
          break;
        case 'failed':
          setError(`${activeTab} generation failed. Please try again.`);
          setCreationState('idle');
          setGenerationProgress(0);
          break;
      }
    }
  };

  // Setup real-time subscriptions
  useRealtimeUpdates({
    onJobUpdate: handleJobUpdate,
    onNewFeaturedTrack: (track) => {
      console.log('🎵 New featured track available:', track);
      // Could show a notification or update the home screen
    }
  });

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleTabSwitch = (tab: 'Music' | 'Meditation') => {
    setActiveTab(tab);
    setInputText('');
    setSelectedTags([]);
    setCreationState('idle');
    setShowKeyboard(false);
  };

  const handleTalkToDara = () => {
    if (onTalkToDara) {
      onTalkToDara();
    }
  };

  const handleCreate = async () => {
    if (!user) {
      setError(`Please sign in to create ${activeTab.toLowerCase()}`);
      return;
    }

    if (!inputText.trim()) {
      setError(`Please enter a description for your ${activeTab.toLowerCase()}`);
      return;
    }

    setCreationState('creating');
    setShowKeyboard(false);
    setError(null);
    setGenerationProgress(0);

    try {
      const prompt = inputText.trim();
      const style = selectedTags.length > 0 ? selectedTags.join(', ') : 'Ambient';

      if (activeTab === 'Meditation') {
        console.log('🧘 Starting meditation generation with ElevenLabs + Suno...');

        // Use meditation API with 5 minutes default - includes ElevenLabs for vocal and Suno for music
        const { data, error } = await musicApi.generateMeditationSession({
          user_text: prompt,
          duration_sec: 300, // 5 minutes default
          use_therapist: false // This will use ElevenLabs for vocal generation + Suno for background music
        });

        if (error) {
          throw new Error(error.message || 'Failed to generate meditation session');
        }

        console.log('✅ Meditation generation started (ElevenLabs + Suno):', data);

        // Track the job for real-time updates
        if (data?.job_id) {
          setCurrentJobId(data.job_id);
          setGenerationProgress(10); // Initial progress
        } else {
          // Fallback if no job_id returned
          setError('Started generation but no job ID returned. Please check status manually.');
        }

      } else {
        console.log('🎵 Starting music generation with Suno only...');

        // Use music API with 3 minutes default - Suno only for music generation
        const { data, error } = await musicApi.generateMusic({
          user_text: prompt,
          duration_sec: 180, // 3 minutes default
          engine: 'suno', // Only Suno for music creation
          style: style
        });

        if (error) {
          throw new Error(error.message || 'Failed to generate music');
        }

        console.log('✅ Music generation started (Suno only):', data);

        // Track the job for real-time updates
        if (data?.job_id) {
          setCurrentJobId(data.job_id);
          setGenerationProgress(10); // Initial progress
        } else {
          // Fallback if no job_id returned
          setError('Started generation but no job ID returned. Please check status manually.');
        }
      }

    } catch (err) {
      console.error(`❌ ${activeTab} generation failed:`, err);
      setError(err instanceof Error ? err.message : `Failed to generate ${activeTab.toLowerCase()}`);
      setCreationState('idle');
      setGenerationProgress(0);
      setCurrentJobId(null);
      setCurrentJobStatus(null);
    }
  };

  const handleReady = () => {
    const newSong = {
      id: `generated-${Date.now()}`,
      title: inputText.split(' ').slice(0, 3).join(' ') || `New ${activeTab}`,
      description: inputText || `Generated ${activeTab.toLowerCase()} content`,
      tags: selectedTags.join(', '),
      plays: 0,
      likes: 0,
      image: activeTab === 'Music' 
        ? 'https://images.pexels.com/photos/167491/pexels-photo-167491.jpeg?auto=compress&cs=tinysrgb&w=400'
        : 'https://images.pexels.com/photos/1496373/pexels-photo-1496373.jpeg?auto=compress&cs=tinysrgb&w=400',
      version: '1.0',
      isPublic: false,
      createdAt: new Date().toISOString().split('T')[0],
      creator: 'You',
      duration: activeTab === 'Music' ? '3:45' : '8:30'
    };
    
    onClose();
    if (onOpenSongPlayer) {
      onOpenSongPlayer(newSong);
    } else {
      onPlaySong(newSong);
    }
  };

  const handleInputFocus = () => {
    setShowKeyboard(true);
  };

  const handleCloseKeyboard = () => {
    setShowKeyboard(false);
  };

  const handleKeyPress = (key: string) => {
    console.log('⌨️ Key pressed:', key, 'Current error:', error);

    // Auto-clear error when user types using keyboard
    if (error && (key.length === 1 || key === 'space')) {
      console.log('🧹 Clearing error because user pressed key:', key);
      setError(null);
    }

    if (key === 'backspace') {
      setInputText(prev => prev.slice(0, -1));
    } else if (key === 'space') {
      setInputText(prev => prev + ' ');
    } else if (key === 'return') {
      setShowKeyboard(false);
    } else if (key.length === 1) {
      setInputText(prev => prev + key);
    }
  };

  const keyboardRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
  ];

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col h-full">
      {/* Header - Always visible */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex items-center gap-8">
          <button
            onClick={() => handleTabSwitch('Music')}
            className={`text-lg font-medium pb-2 border-b-2 transition-colors ${
              activeTab === 'Music'
                ? 'text-black border-black'
                : 'text-gray-400 border-transparent'
            }`}
          >
            Music
          </button>
          <button
            onClick={() => handleTabSwitch('Meditation')}
            className={`text-lg font-medium pb-2 border-b-2 transition-colors ${
              activeTab === 'Meditation'
                ? 'text-black border-black'
                : 'text-gray-400 border-transparent'
            }`}
          >
            Meditation
          </button>
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
        {/* Text Input Area */}
        <div className="flex-1 p-6">
          <div className="w-full h-64 border-2 border-gray-300 rounded-3xl p-6 mb-6">
            <textarea
              value={inputText}
              onChange={(e) => {
                const newValue = e.target.value;
                console.log('📝 Text changed from textarea:', newValue, 'Current error:', error);
                setInputText(newValue);
                // Auto-clear error when user starts typing
                if (error) {
                  console.log('🧹 Clearing error because user is typing');
                  setError(null);
                }
              }}
              onFocus={handleInputFocus}
              placeholder={`Describe the ${activeTab.toLowerCase()} you want to create...`}
              className="w-full h-full resize-none text-lg leading-relaxed focus:outline-none placeholder-gray-400 border-none bg-transparent"
              disabled={creationState === 'talking' || creationState === 'creating'}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-center">{error}</p>
            </div>
          )}

          {/* Generation Progress */}
          {creationState === 'creating' && (
            <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <p className="text-purple-800 text-center mb-2">✨ Creating your {activeTab.toLowerCase()}...</p>
              <div className="w-full bg-purple-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
              <p className="text-purple-600 text-center text-sm mt-1">{generationProgress}%</p>
            </div>
          )}

          {/* Talk to Dara Button - Shows when there's text and not showing keyboard */}
          {inputText.trim() && creationState === 'idle' && !showKeyboard && (
            <div className="mb-6">
              <button
                onClick={handleTalkToDara}
                className="w-full py-4 rounded-full text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <span className="w-3 h-3 bg-white rounded-full"></span>
                Talk to Dara
              </button>
            </div>
          )}

          {/* Tags - Only show in idle state and not showing keyboard */}
          {creationState === 'idle' && !showKeyboard && !inputText.trim() && (
            <div className="mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                  <span className="text-white text-sm">♪</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {currentTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={`px-4 py-3 rounded-full text-sm font-medium transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-black text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Talk to Dara Button - Shows when keyboard is visible */}
        {showKeyboard && (
          <div className="px-6 pb-4">
            <button
              onClick={handleTalkToDara}
              className="w-full py-4 rounded-full text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              <span className="w-3 h-3 bg-white rounded-full"></span>
              Talk to Dara
            </button>
          </div>
        )}

        {/* Keyboard */}
        {showKeyboard && (
          <div className="bg-gray-200 p-3">
            <div className="space-y-2">
              {keyboardRows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-1">
                  {rowIndex === 2 && (
                    <button
                      onClick={() => handleKeyPress('shift')}
                      className="w-12 h-10 bg-gray-300 rounded text-sm font-medium flex items-center justify-center hover:bg-gray-400"
                    >
                      ⇧
                    </button>
                  )}
                  {row.map((key) => (
                    <button
                      key={key}
                      onClick={() => handleKeyPress(key)}
                      className="w-8 h-10 bg-white rounded text-sm font-medium hover:bg-gray-100 active:bg-gray-200"
                    >
                      {key}
                    </button>
                  ))}
                  {rowIndex === 2 && (
                    <button
                      onClick={() => handleKeyPress('backspace')}
                      className="w-12 h-10 bg-gray-300 rounded text-sm font-medium flex items-center justify-center hover:bg-gray-400"
                    >
                      ⌫
                    </button>
                  )}
                </div>
              ))}
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => handleKeyPress('ABC')}
                  className="w-16 h-10 bg-gray-300 rounded text-sm font-medium hover:bg-gray-400"
                >
                  ABC
                </button>
                <button
                  onClick={() => handleKeyPress('space')}
                  className="w-32 h-10 bg-white rounded text-sm font-medium hover:bg-gray-100 active:bg-gray-200"
                >
                  space
                </button>
                <button
                  onClick={() => handleKeyPress('return')}
                  className="w-16 h-10 bg-gray-300 rounded text-sm font-medium hover:bg-gray-400"
                >
                  return
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Button */}
        <div className="px-6 py-4">
          {(creationState === 'idle' && showKeyboard) || (creationState === 'idle' && inputText.trim() && !showKeyboard) ? (
            <button
              onClick={handleCreate}
              className="w-full py-4 rounded-full text-lg font-semibold text-white bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              {activeTab === 'Meditation' ? '🧘' : '♪'} Create {activeTab}
            </button>
          ) : creationState === 'talking' ? (
            <button
              disabled
              className="w-full py-4 rounded-full text-lg font-semibold text-white bg-gradient-to-r from-purple-500 to-pink-500 opacity-70 cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span className="w-3 h-3 bg-white rounded-full"></span>
              Talk to Dara
            </button>
          ) : creationState === 'creating' ? (
            <button
              disabled
              className="w-full py-4 rounded-full text-lg font-semibold text-white opacity-70 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 flex items-center justify-center gap-2"
            >
              ⟳ Creating {activeTab}...
            </button>
          ) : creationState === 'ready' ? (
            <button
              onClick={handleReady}
              className="w-full py-4 rounded-full text-lg font-semibold bg-green-500 text-white transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              {activeTab === 'Meditation' ? '🧘' : '♪'} Ready to Play {activeTab}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CreateMusicScreen;
