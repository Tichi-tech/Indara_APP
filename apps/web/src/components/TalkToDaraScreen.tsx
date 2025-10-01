import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, MessageCircle, Sparkles, Heart } from 'lucide-react';
import { musicApi } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import BottomNav from './BottomNav';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface TalkToDaraScreenProps {
  onBack: () => void;
  onCreateMusic?: () => void;
  onMySongs?: () => void;
  onAccountSettings?: () => void;
  onInbox?: () => void;
}

const TalkToDaraScreen: React.FC<TalkToDaraScreenProps> = ({
  onBack,
  onCreateMusic,
  onMySongs,
  onAccountSettings,
  onInbox
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi there! I'm Dara, your AI wellness therapist. I'm here to listen and support you through whatever you're experiencing. Whether you need help with stress, anxiety, sleep, or just want someone to talk to, I'm here for you. What's on your mind today?",
      isUser: false,
      timestamp: new Date()
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

      const { data, error } = await musicApi.talkToDara({
        userInput: userMessage.text,
        sessionType: 'meditation',
        conversationHistory
      });

      if (error) {
        throw new Error('Failed to get response from Dara');
      }

      const daraResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: data?.response || "I'm here to listen. Can you tell me more about how you're feeling?",
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, daraResponse]);
    } catch (error) {
      console.error('Error talking to Dara:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble connecting right now. But I'm still here to listen. Can you tell me more about what's on your mind?",
        isUser: false,
        timestamp: new Date()
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

  // Auto-resize textarea based on content
  const handleTextareaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);

    // Reset height to recalculate
    e.target.style.height = '40px';

    // Set height based on scroll height
    const newHeight = Math.min(Math.max(e.target.scrollHeight, 40), 120);
    e.target.style.height = newHeight + 'px';
  };


  return (
    <div className="min-h-dvh bg-gradient-to-b from-purple-50 to-blue-50">
      <div className="mx-auto max-w-[420px] h-dvh flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-8 h-8 flex items-center justify-center">
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Talk to Dara</h1>
                <p className="text-sm text-white/80">Your wellness therapist</p>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs ml-2">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-[200px]">
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
                    <span className="text-xs font-medium text-purple-600">Dara</span>
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
                  <span className="text-xs font-medium text-purple-600">Dara</span>
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


        {/* Input Area - Fixed above bottom nav */}
        <div
          className="fixed bottom-[80px] left-1/2 -translate-x-1/2 px-3 py-3 bg-white border-t border-gray-200"
          style={{ width: 'calc(100% - 2rem)', maxWidth: '340px' }}
        >
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={inputText}
                onChange={handleTextareaResize}
                onKeyPress={handleKeyPress}
                placeholder="Type your message to Dara..."
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={1}
                style={{ height: '40px', minHeight: '40px', maxHeight: '120px', overflow: 'hidden' }}
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

        {/* Bottom Navigation */}
        <BottomNav
          active="home"
          onHome={onBack}
          onLibrary={onMySongs || (() => {})}
          onCreate={onCreateMusic || (() => {})}
          onInbox={onInbox || (() => {})}
          onAccount={onAccountSettings || (() => {})}
          badgeCount={1}
          accountInitial="D"
        />
      </div>
    </div>
  );
};

export default TalkToDaraScreen;