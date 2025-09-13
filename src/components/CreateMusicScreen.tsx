import React, { useState } from 'react';
import { X, Settings } from 'lucide-react';

interface CreateMusicScreenProps {
  onClose: () => void;
  onPlaySong: (song: any) => void;
}

const CreateMusicScreen: React.FC<CreateMusicScreenProps> = ({ onClose, onPlaySong }) => {
  const [activeTab, setActiveTab] = useState('Music');
  const [inputText, setInputText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [creationState, setCreationState] = useState<'idle' | 'talking' | 'creating' | 'ready'>('idle');
  const [showKeyboard, setShowKeyboard] = useState(false);

  const musicTags = [
    'Energy', 'Relax', 'Study', 'Yoga', 'Focus', 
    'Deep Sleeping', 'Healing Piano', 'Nature Sounds', 'Deep Meditation'
  ];

  const meditationTags = [
    'Mindfulness', 'Breathing', 'Body Scan', 'Loving Kindness', 'Chakra',
    'Sleep Meditation', 'Stress Relief', 'Inner Peace', 'Gratitude'
  ];

  const currentTags = activeTab === 'Music' ? musicTags : meditationTags;

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleTabSwitch = (tab: 'Music' | 'Meditation') => {
    setActiveTab(tab);
    // Reset/refresh the chatbot state when switching tabs
    setInputText('');
    setSelectedTags([]);
    setCreationState('idle');
    setShowKeyboard(false);
  };

  const handleTalkToDara = () => {
    setCreationState('talking');
    console.log(`Talking to Dara for ${activeTab.toLowerCase()}:`, inputText, selectedTags);
    setTimeout(() => {
      setCreationState('creating');
      setTimeout(() => {
        setCreationState('ready');
      }, 3000);
    }, 2000);
  };

  const handleCreate = () => {
    setCreationState('creating');
    console.log(`Creating ${activeTab.toLowerCase()}:`, inputText, selectedTags);
    setTimeout(() => {
      setCreationState('ready');
    }, 3000);
  };

  const handleReady = () => {
    // Create a new song object for the generated content
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
    
    console.log(`Playing created ${activeTab.toLowerCase()}:`, newSong);
    onClose();
    onPlaySong(newSong);
  };

  const handleInputFocus = () => {
    setShowKeyboard(true);
  };

  const handleCloseKeyboard = () => {
    setShowKeyboard(false);
  };

  const handleKeyPress = (key: string) => {
    if (key === 'backspace') {
      setInputText(prev => prev.slice(0, -1));
    } else if (key === 'space') {
      setInputText(prev => prev + ' ');
    } else if (key.length === 1) {
      setInputText(prev => prev + key);
    }
  };

  const keyboardRows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
        
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
      <div className="flex-1 flex flex-col min-h-0">
        {/* Text Input Area */}
        <div className="flex-1 p-6 min-h-0">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onFocus={handleInputFocus}
            placeholder={creationState === 'talking' ? 'Talking to Dara...' : `Describe the ${activeTab.toLowerCase()} you want to create...`}
            className="w-full h-full resize-none text-lg leading-relaxed focus:outline-none placeholder-gray-400 border-none bg-transparent min-h-[200px]"
            disabled={creationState === 'talking' || creationState === 'creating'}
          />
        </div>

        {/* Talk to Dara Button - Shows when there's text */}
        {inputText.trim() && creationState === 'idle' && (
          <div className="px-6 mb-4">
            <button
              onClick={handleTalkToDara}
              className="w-full py-4 rounded-full text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white transition-all duration-300 hover:scale-105 active:scale-95"
            >
              💬 Talk to Dara
            </button>
          </div>
        )}

        {/* Tags */}
        <div className="px-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mt-1">
              <span className="text-gray-600 text-sm">{activeTab === 'Music' ? '🎵' : '🧘'}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-black text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
        <div className="px-6 mb-6">
          {creationState === 'idle' ? (
            <button
              onClick={handleCreate}
              className={`w-full py-4 rounded-full text-lg font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95 ${
                activeTab === 'Music' 
                  ? 'bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600'
                  : 'bg-gradient-to-r from-green-400 via-blue-500 to-purple-600'
              }`}
            >
              {activeTab === 'Music' ? '♪ Create Music' : '🧘 Create Meditation'}
            </button>
          ) : creationState === 'talking' ? (
            <button
              disabled
              className="w-full py-4 rounded-full text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white opacity-70"
            >
              💬 Talking to Dara...
            </button>
          ) : creationState === 'creating' ? (
            <button
              disabled
              className={`w-full py-4 rounded-full text-lg font-semibold text-white opacity-70 ${
                activeTab === 'Music' 
                  ? 'bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600'
                  : 'bg-gradient-to-r from-green-400 via-blue-500 to-purple-600'
              }`}
            >
              {activeTab === 'Music' ? '⟳ Creating Music...' : '⟳ Creating Meditation...'}
            </button>
          ) : (
            <button
              onClick={handleReady}
              className="w-full py-4 rounded-full text-lg font-semibold bg-green-500 text-white transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {activeTab === 'Music' ? '♪ Ready to Play Music' : '🧘 Ready to Play Meditation'}
            </button>
          )}
        </div>

        {/* Keyboard */}
        {showKeyboard && (
          <div className="bg-gray-200 p-3 border-t">
            <div className="space-y-2">
              {keyboardRows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-1">
                  {rowIndex === 2 && (
                    <button
                      onClick={() => handleKeyPress('backspace')}
                      className="w-12 h-10 bg-gray-300 rounded text-sm font-medium flex items-center justify-center hover:bg-gray-400"
                    >
                      ⌫
                    </button>
                  )}
                  {row.map((key) => (
                    <button
                      key={key}
                      onClick={() => handleKeyPress(key.toLowerCase())}
                      className="w-8 h-10 bg-white rounded text-sm font-medium hover:bg-gray-100 active:bg-gray-200"
                    >
                      {key}
                    </button>
                  ))}
                  {rowIndex === 2 && (
                    <button
                      onClick={handleCloseKeyboard}
                      className="w-12 h-10 bg-gray-300 rounded text-sm font-medium flex items-center justify-center hover:bg-gray-400"
                    >
                      ↓
                    </button>
                  )}
                </div>
              ))}
              <div className="flex justify-center">
                <button
                  onClick={() => handleKeyPress('space')}
                  className="w-32 h-10 bg-white rounded text-sm font-medium hover:bg-gray-100 active:bg-gray-200"
                >
                  Space
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateMusicScreen;
