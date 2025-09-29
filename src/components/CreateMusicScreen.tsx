import React, { useState, useEffect, useRef } from 'react';
import { X, Settings, Send, Sparkles, Music, ArrowLeft } from 'lucide-react';
import { musicApi } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface CreateMusicScreenProps {
  onClose: () => void;
  onPlaySong: (song: any) => void;
  onOpenSongPlayer?: (song: any) => void;
}

// Generate smart title function (from website)
function generateSmartTitle(prompt: string, style: string): string {
  const isAIEnhanced = prompt.length > 50 && (
    prompt.includes('gentle') || prompt.includes('soothing') || prompt.includes('calming') ||
    prompt.includes('peaceful') || prompt.includes('relaxing') || prompt.includes('tranquil') ||
    prompt.includes('meditation') || prompt.includes('ambient') || prompt.includes('healing')
  );

  const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'shall', 'create', 'generate', 'make', 'music', 'sound', 'audio', 'track', 'that', 'this', 'your', 'into', 'through'];

  const words = prompt
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word))
    .slice(0, isAIEnhanced ? 5 : 3);

  if (words.length > 0) {
    const titleWords = words.map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    );

    if (isAIEnhanced && words.length >= 3) {
      if (words.length === 5) {
        return titleWords.join(' ');
      } else if (words.length === 4) {
        return titleWords.join(' ') + ' Journey';
      } else {
        return titleWords.join(' ') + ' Meditation Music';
      }
    }

    return titleWords.join(' ');
  }

  const styleNames = {
    'ambient': 'Peaceful Ambient Journey Music',
    'nature': 'Tranquil Nature Sounds Experience',
    'binaural': 'Deep Focus Binaural Waves',
    'tibetan': 'Sacred Tibetan Bowl Meditation',
    'piano': 'Gentle Piano Healing Music',
    'crystal': 'Crystal Harmony Meditation Sounds',
    'meditation': 'Deep Peace Meditation Music',
    'chakra': 'Chakra Balancing Healing Journey'
  };

  return styleNames[style.toLowerCase() as keyof typeof styleNames] || 'Peaceful Healing Music Journey';
}

const CreateMusicScreen: React.FC<CreateMusicScreenProps> = ({ onClose, onPlaySong, onOpenSongPlayer }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Music');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Hi! I'm your AI music composer. I can help you create personalized ${activeTab.toLowerCase()}. Just tell me what kind of mood, style, or feeling you want, and I'll compose something unique for you. What would you like to create today?`,
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [currentJobStatus, setCurrentJobStatus] = useState<string | null>(null);
  const [enrichedPrompt, setEnrichedPrompt] = useState('');
  const [duration, setDuration] = useState('180');
  const [showGenerateButton, setShowGenerateButton] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update welcome message when tab changes
  useEffect(() => {
    setMessages([{
      id: '1',
      text: activeTab === 'Music'
        ? `Hi! I'm here to help you create personalized music. Tell me what kind of mood, style, or feeling you want to express, and I'll compose something unique for you. What would you like to create today?`
        : `Hi! I'm here to help you create personalized meditation sessions. Tell me what you'd like to focus on - relaxation, stress relief, sleep, or mindfulness - and I'll guide you through it. What would you like to work on today?`,
      isUser: false,
      timestamp: new Date()
    }]);
  }, [activeTab]);

  // Manual job status check function
  const checkJobManually = async () => {
    if (!currentJobId || !user) return;

    console.log('🔍 Manually checking job status for:', currentJobId);

    try {
      // Check specific job
      const jobResult = await musicApi.checkJobStatus(currentJobId);
      if (jobResult.data) {
        console.log('📊 Manual job check result:', jobResult.data);
        handleJobUpdate(jobResult.data);
      } else {
        console.warn('⚠️ No job found with ID:', currentJobId);
        // Check all user jobs to see what's there
        const userJobsResult = await musicApi.getUserJobs(user.id);
        if (userJobsResult.data) {
          console.log('📊 All user jobs:', userJobsResult.data);
        }
      }
    } catch (error) {
      console.error('❌ Manual job check failed:', error);
    }
  };

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

          // Add completion message to chat
          const completionMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: `🎉 Your ${activeTab.toLowerCase()} is ready! Click below to play it.`,
            isUser: false,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, completionMessage]);

          // Handle completed track
          if (job.generated_tracks && job.generated_tracks.length > 0) {
            const track = job.generated_tracks[0];
            const createdTrack = {
              id: track.id,
              title: track.title || `Generated ${activeTab}`,
              description: `AI-generated ${activeTab.toLowerCase()}`,
              duration: activeTab === 'Meditation' ? '5:00' : '3:00',
              audio_url: track.audio_url,
              status: 'completed'
            };

            // Auto-play the completed track
            setTimeout(() => {
              if (onPlaySong) {
                onPlaySong(createdTrack);
              }
              onClose();
            }, 2000);
          }
          break;
        case 'failed':
          const errorMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: `I'm sorry, there was an issue creating your ${activeTab.toLowerCase()}. Please try again with a different description.`,
            isUser: false,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
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

  // Automatic job status polling (backup for real-time updates)
  useEffect(() => {
    if (!currentJobId || !user) return;

    console.log('🔄 Starting automatic job polling for:', currentJobId);

    const pollInterval = setInterval(async () => {
      console.log('🔄 Polling job status...');
      try {
        const jobResult = await musicApi.checkJobStatus(currentJobId);
        if (jobResult.data) {
          console.log('📊 Polling result:', jobResult.data);
          // Only update if we get a different status
          if (jobResult.data.status !== currentJobStatus) {
            handleJobUpdate(jobResult.data);
          }
        }
      } catch (error) {
        console.error('❌ Polling failed:', error);
      }
    }, 10000); // Poll every 10 seconds

    // Cleanup on unmount or when job changes
    return () => {
      console.log('🔕 Stopping job polling for:', currentJobId);
      clearInterval(pollInterval);
    };
  }, [currentJobId, user, currentJobStatus]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputText.trim();
    setInputText('');
    setIsLoading(true);

    try {
      if (activeTab === 'Meditation') {
        // Use meditation-therapist-ai for meditation therapist
        const { data, error } = await musicApi.meditationTherapistAI({
          userInput: messageText,
          sessionType: 'meditation',
          conversationHistory: messages.map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.text
          }))
        });

        if (error) {
          throw new Error('Failed to get response from meditation therapist');
        }

        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: data?.response || "I'm here to help you with your meditation journey. Can you tell me more about what you're looking for?",
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);

        // Check if AI provides an enriched prompt for meditation
        if (data?.enrichedPrompt || (data?.response && data.response.length > 50)) {
          const prompt = data?.enrichedPrompt || data?.response;
          setEnrichedPrompt(prompt);
          setShowGenerateButton(true);

          const enrichmentMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: "Perfect! I've created a meditation description for you. You can now generate your meditation session below. 🧘",
            isUser: false,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, enrichmentMessage]);
        }

      } else {
        // Use therapist-ai for music chatbot
        const { data, error } = await musicApi.talkToDara({
          userInput: messageText,
          sessionType: 'music',
          conversationHistory: messages.map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.text
          }))
        });

        if (error) {
          throw new Error('Failed to get response from music therapist');
        }

        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: data?.response || "I'm here to help you create beautiful music. What kind of musical experience are you looking for?",
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);

        // Check if AI provides an enriched prompt for music
        if (data?.enrichedPrompt || (data?.response && data.response.length > 50)) {
          const prompt = data?.enrichedPrompt || data?.response;
          setEnrichedPrompt(prompt);
          setShowGenerateButton(true);

          const enrichmentMessage: Message = {
            id: (Date.now() + 2).toString(),
            text: "Excellent! I've created a music description for you. You can now generate your healing music below. 🎵",
            isUser: false,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, enrichmentMessage]);
        }
      }

    } catch (error) {
      console.error('Error in AI chat:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `I'm sorry, I'm having trouble connecting right now. Please try again in a moment.`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabSwitch = (tab: 'Music' | 'Meditation') => {
    setActiveTab(tab);
    setInputText('');
    setEnrichedPrompt('');
    setShowGenerateButton(false);
  };

  const handleGenerate = async () => {
    if (!enrichedPrompt.trim()) return;

    try {
      if (activeTab === 'Meditation') {
        const { data, error } = await musicApi.generateMeditationSession({
          user_text: enrichedPrompt,
          duration_sec: parseInt(duration),
          use_therapist: false
        });

        if (error) {
          throw new Error(error.message || 'Failed to generate meditation session');
        }

        if (data?.job_id) {
          setCurrentJobId(data.job_id);
          setGenerationProgress(10);

          const generationMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: "Creating your personalized meditation session... This will take a few moments. 🧘",
            isUser: false,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, generationMessage]);
        }

      } else {
        const jobData = {
          user_text: enrichedPrompt,
          title: generateSmartTitle(enrichedPrompt, 'ambient'),
          style: 'ambient',
          duration_sec: parseInt(duration),
          engine: 'suno'
        };

        const { data, error } = await musicApi.generateMusic(jobData);

        if (error) {
          throw new Error(error.message || 'Failed to generate music');
        }

        if (data?.job_id) {
          setCurrentJobId(data.job_id);
          setGenerationProgress(10);

          const generationMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: `Creating your healing music: "${jobData.title}"... This will take a few moments. 🎵`,
            isUser: false,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, generationMessage]);
        }
      }

      setShowGenerateButton(false);
      setEnrichedPrompt('');

    } catch (error) {
      console.error('Generation error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Failed to generate ${activeTab.toLowerCase()}. Please try again.`,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    e.target.style.height = '60px';
    const newHeight = Math.min(Math.max(e.target.scrollHeight, 60), 120);
    e.target.style.height = newHeight + 'px';
  };

  const handleInputFocus = () => {
    setIsKeyboardVisible(true);
    // Small delay to ensure keyboard animation starts
    setTimeout(() => {
      scrollToBottom();
    }, 300);
  };

  const handleInputBlur = () => {
    setIsKeyboardVisible(false);
  };



  return (
    <div className="absolute inset-0 bg-gradient-to-b from-purple-50 to-blue-50 z-50">
      <div className="mx-auto w-full max-w-sm h-full flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleTabSwitch('Music')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'Music'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Music
            </button>
            <button
              onClick={() => handleTabSwitch('Meditation')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'Meditation'
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Meditation
            </button>
          </div>

          <div className="w-10 h-10"></div>
        </div>

        {/* Messages */}
        <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${showGenerateButton ? 'pb-[300px]' : isKeyboardVisible ? 'pb-[180px]' : 'pb-[120px]'}`}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.isUser
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {!message.isUser && (
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-medium text-purple-600">
                      AI Assistant
                    </span>
                  </div>
                )}
                <p className="text-sm leading-relaxed">{message.text}</p>
                <p className={`text-xs mt-1 ${message.isUser ? 'text-white/70' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[80%]">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-medium text-purple-600">
                    AI Assistant
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Generation Progress */}
          {currentJobId && generationProgress > 0 && (
            <div className="flex justify-start">
              <div className="bg-purple-50 border border-purple-200 rounded-2xl px-4 py-3 max-w-[80%]">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-medium text-purple-600">Creating...</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2 mb-1">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${generationProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-purple-600">{generationProgress}% complete</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Generation Controls - Show when enriched prompt is available */}
        {showGenerateButton && enrichedPrompt && (
          <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
            <div className="space-y-3">
              {/* Enriched Prompt Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your {activeTab} Description
                </label>
                <div className="p-3 bg-white rounded-lg border text-sm">
                  {enrichedPrompt}
                </div>
              </div>

              {/* Duration Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="180">3 minutes</option>
                  <option value="300">5 minutes</option>
                  <option value="600">10 minutes</option>
                </select>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!enrichedPrompt.trim() || currentJobId !== null}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create {activeTab === 'Music' ? 'Healing Music' : 'Meditation Session'}
              </button>
            </div>
          </div>
        )}

        {/* Input Area - Fixed at bottom */}
        <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-sm px-4 py-3 bg-white border-t border-gray-200">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={inputText}
                onChange={handleTextareaResize}
                onKeyPress={handleKeyPress}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder={`How are you feeling? What's on your mind?`}
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={2}
                style={{ height: '60px', minHeight: '60px', maxHeight: '120px', overflow: 'hidden', fontSize: '16px' }}
                disabled={isLoading}
                inputMode="text"
                autoCapitalize="sentences"
                autoComplete="off"
                autoCorrect="on"
                spellCheck="true"
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                inputText.trim() && !isLoading
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateMusicScreen;
