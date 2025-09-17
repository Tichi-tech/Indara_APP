import React, { useState } from 'react';
import { X, Settings } from 'lucide-react';

interface CreateMusicScreenProps {
  onClose: () => void;
  onPlaySong: (song: any) => void;
  onOpenSongPlayer?: (song: any) => void;
}

const CreateMusicScreen: React.FC<CreateMusicScreenProps> = ({ onClose, onPlaySong, onOpenSongPlayer }) => {
  const [activeTab, setActiveTab] = useState('Music');
  const [inputText, setInputText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [creationState, setCreationState] = useState<'idle' | 'talking' | 'creating' | 'ready'>('idle');
  const [showKeyboard, setShowKeyboard] = useState(false);

  const musicTags = [
    'Energy', 'Relax', 'Study', 
    'Yoga', 'Focus',
    'Soothing Sleep', 'Healing Piano',
    'Nature Sounds', 'Deep Meditation'
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
    setInputText('');
    setSelectedTags([]);
    setCreationState('idle');
    setShowKeyboard(false);
  };

  const handleTalkToDara = () => {
    // TODO: Connect chatbot AI here
  };

  const handleCreate = () => {
    setCreationState('creating');
    setShowKeyboard(false);
    setTimeout(() => {
      setCreationState('ready');
    }, 3000);
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

  // Show navigation bar only in idle state without keyboard
  const showNavigationBar = creationState === 'idle' && !showKeyboard;

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col h-full">
      {/* Header - Show in initial idle state */}
      {showNavigationBar && (
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
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Text Input Area */}
        <div className="flex-1 p-6">
          <div className="w-full h-64 border-2 border-gray-300 rounded-3xl p-6 mb-6">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onFocus={handleInputFocus}
              placeholder={`Describe the ${activeTab.toLowerCase()} you want to create...`}
              className="w-full h-full resize-none text-lg leading-relaxed focus:outline-none placeholder-gray-400 border-none bg-transparent"
              disabled={creationState === 'talking' || creationState === 'creating'}
            />
          </div>

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
                  {/* First row */}
                  <div className="flex gap-3 w-full">
                    {currentTags.slice(0, 3).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={`px-6 py-3 rounded-full text-sm font-medium transition-colors flex-1 ${
                          selectedTags.includes(tag)
                            ? 'bg-black text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  
                  {/* Second row */}
                  <div className="flex gap-3 w-full">
                    {currentTags.slice(3, 5).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={`px-6 py-3 rounded-full text-sm font-medium transition-colors flex-1 ${
                          selectedTags.includes(tag)
                            ? 'bg-black text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  
                  {/* Third row */}
                  <div className="flex gap-3 w-full">
                    {currentTags.slice(5, 7).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={`px-6 py-3 rounded-full text-sm font-medium transition-colors flex-1 ${
                          selectedTags.includes(tag)
                            ? 'bg-black text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  
                  {/* Fourth row */}
                  <div className="flex gap-3 w-full">
                    {currentTags.slice(7, 9).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={`px-6 py-3 rounded-full text-sm font-medium transition-colors flex-1 ${
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
        <div className="p-6">
          {(creationState === 'idle' && showKeyboard) || (creationState === 'idle' && inputText.trim() && !showKeyboard) ? (
            <button
              onClick={handleCreate}
              className="w-full py-4 rounded-full text-lg font-semibold text-white bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              ♪ Create Music
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
              ⟳ Creating Music...
            </button>
          ) : creationState === 'ready' ? (
            <button
              onClick={handleReady}
              className="w-full py-4 rounded-full text-lg font-semibold bg-green-500 text-white transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
            >
              ♪ Ready to Play Music
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CreateMusicScreen;
