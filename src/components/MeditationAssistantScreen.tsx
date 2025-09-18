import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles, Moon, Sun, Leaf, Heart, Zap, Play } from 'lucide-react';
import { musicApi } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import BottomNav from './BottomNav';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  suggestions?: string[];
}

interface MeditationAssistantScreenProps {
  onBack: () => void;
  onCreateMusic?: () => void;
  onMySongs?: () => void;
  onAccountSettings?: () => void;
  onInbox?: () => void;
  onStartSession?: (sessionType: string, duration: number) => void;
}

const MeditationAssistantScreen: React.FC<MeditationAssistantScreenProps> = ({
  onBack,
  onCreateMusic,
  onMySongs,
  onAccountSettings,
  onInbox,
  onStartSession
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Welcome to your meditation journey! I'm your personal meditation assistant. I can help you find the perfect meditation for your needs, guide you through techniques, or create custom sessions. What would you like to explore today?",
      isUser: false,
      timestamp: new Date(),
      suggestions: [
        "Start a quick 5-min meditation",
        "Help me with stress relief",
        "I want to improve my sleep",
        "Guide me through breathing exercises"
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Prepare conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text
      }));

      const { data, error } = await musicApi.chatWithMeditationAssistant({
        message: userMessage.text,
        conversationHistory
      });

      if (error) {
        throw new Error('Failed to get response from meditation assistant');
      }

      const assistantResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data?.response || "I understand you're looking for meditation guidance. Let me help you find what works best for you. What specific area would you like to focus on?",
        isUser: false,
        timestamp: new Date(),
        suggestions: data?.suggestions || []
      };

      setMessages(prev => [...prev, assistantResponse]);
    } catch (error) {
      console.error('Error chatting with meditation assistant:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm having trouble connecting right now, but I'm still here to help! You can try starting with some basic breathing exercises or explore our meditation library. What would you like to focus on?",
        isUser: false,
        timestamp: new Date(),
        suggestions: [
          "Basic breathing exercise",
          "Browse meditation library",
          "Quick stress relief",
          "5-minute mindfulness"
        ]
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    // Check if suggestion is a session request
    if (suggestion.includes('5-min') || suggestion.includes('quick')) {
      if (onStartSession) {
        onStartSession('quick', 300); // 5 minutes
        return;
      }
    }

    // Otherwise treat as regular message
    setInputText(suggestion);
    // Auto-send suggestion
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const meditationTypes = [
    { icon: Moon, name: 'Sleep', color: 'bg-indigo-500' },
    { icon: Zap, name: 'Energy', color: 'bg-yellow-500' },
    { icon: Heart, name: 'Loving Kindness', color: 'bg-pink-500' },
    { icon: Leaf, name: 'Nature', color: 'bg-green-500' },
    { icon: Sun, name: 'Morning', color: 'bg-orange-500' },
    { icon: Sparkles, name: 'Mindfulness', color: 'bg-purple-500' }
  ];

  return (
    <div className="min-h-dvh bg-gradient-to-b from-green-50 to-blue-50">
      <div className="mx-auto max-w-[420px] h-dvh flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-green-500 to-teal-500 text-white">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-8 h-8 flex items-center justify-center">
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Meditation Assistant</h1>
                <p className="text-sm text-white/80">Your guide to mindfulness</p>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs ml-2">Ready</span>
          </div>
        </div>

        {/* Quick Access Meditation Types */}
        {messages.length <= 1 && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50">
            <p className="text-sm font-medium text-gray-700 mb-3">Popular meditation types:</p>
            <div className="grid grid-cols-3 gap-3">
              {meditationTypes.map((type, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(`I want to try ${type.name.toLowerCase()} meditation`)}
                  className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`w-8 h-8 ${type.color} rounded-full flex items-center justify-center mb-2`}>
                    <type.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-700">{type.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-[180px]">
          {messages.map((message) => (
            <div key={message.id}>
              <div
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.isUser
                      ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {!message.isUser && (
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-green-500" />
                      <span className="text-xs font-medium text-green-600">Assistant</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.isUser ? 'text-white/70' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Suggestions */}
              {!message.isUser && message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-3 ml-4">
                  <div className="flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-3 py-2 bg-green-100 text-green-700 rounded-full text-xs hover:bg-green-200 transition-colors flex items-center gap-1"
                      >
                        {suggestion.includes('meditation') || suggestion.includes('session') ? (
                          <Play className="w-3 h-3" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[85%]">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-medium text-green-600">Assistant</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about meditation techniques, sessions, or guidance..."
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={1}
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                inputText.trim() && !isLoading
                  ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <BottomNav
          active="home"
          onHome={onBack}
          onLibrary={onMySongs || (() => {})}
          onCreate={onCreateMusic || (() => {})}
          onInbox={onInbox || (() => {})}
          onAccount={onAccountSettings || (() => {})}
          badgeCount={1}
          accountInitial="M"
        />
      </div>
    </div>
  );
};

export default MeditationAssistantScreen;