import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useAuth } from '@/hooks/useAuth';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { musicApi } from '@/services/musicApi';

export type GeneratedTrack = {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  audio_url?: string;
  status?: string;
};

export type CreateMusicScreenProps = {
  onClose: () => void;
  onPlaySong?: (track: GeneratedTrack) => void;
};

type Message = {
  id: string;
  text: string;
  isUser: boolean;
};

const INITIAL_MESSAGES: Record<'Music' | 'Meditation', string> = {
  Music:
    "Hi! I'm Dara, your music therapist. I'm here to listen and help you find inner peace through personalized healing music. How are you feeling today?",
  Meditation:
    "Hi! I'm Dara, your meditation therapist. I'm here to listen and guide you through your wellness journey. What would you like to focus on today - relaxation, stress relief, sleep, or mindfulness?",
};

const DEFAULT_DURATION = '180';

export function CreateMusicScreen({ onClose, onPlaySong }: CreateMusicScreenProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'Music' | 'Meditation'>('Music');
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', text: INITIAL_MESSAGES.Music, isUser: false },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [enrichedPrompt, setEnrichedPrompt] = useState('');
  const [showGenerateButton, setShowGenerateButton] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [currentJobStatus, setCurrentJobStatus] = useState<string | null>(null);
  const [duration, setDuration] = useState(DEFAULT_DURATION);

  const flatListRef = useRef<FlatList>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  useEffect(() => {
    setMessages([{ id: 'welcome', text: INITIAL_MESSAGES[activeTab], isUser: false }]);
    setEnrichedPrompt('');
    setShowGenerateButton(false);
    setGenerationProgress(0);
    setCurrentJobId(null);
    setCurrentJobStatus(null);
  }, [activeTab]);

  const handleJobUpdate = (job: any) => {
    if (!job || job.id !== currentJobId) return;

    setCurrentJobStatus(job.status);

    switch (job.status) {
      case 'pending':
        setGenerationProgress(15);
        break;
      case 'processing':
        setGenerationProgress(60);
        break;
      case 'completed':
        setGenerationProgress(100);
        if (job.generated_tracks && job.generated_tracks.length > 0) {
          const trackData = job.generated_tracks[0];
          const generatedTrack: GeneratedTrack = {
            id: trackData.id,
            title: trackData.title ?? `${activeTab} Track`,
            description: trackData.prompt ?? `AI-generated ${activeTab.toLowerCase()}`,
            duration: `${Math.round((trackData.duration_sec ?? 180) / 60)}:${String((trackData.duration_sec ?? 180) % 60).padStart(2, '0')}`,
            audio_url: trackData.audio_url,
            status: job.status,
          };

          setMessages((prev) => [
            ...prev,
            {
              id: `complete-${Date.now()}`,
              text:
                activeTab === 'Music'
                  ? '🎉 Your healing music is ready! Tapping play now.'
                  : '🧘 Your meditation session is ready! Starting playback now.',
              isUser: false,
            },
          ]);

          scrollToBottom();

          setTimeout(() => {
            onPlaySong?.(generatedTrack);
            onClose();
          }, 1200);
        }
        break;
      case 'failed':
        setGenerationProgress(0);
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            text: "I'm sorry, I ran into an issue creating that. Could you describe what you're looking for in a different way?",
            isUser: false,
          },
        ]);
        scrollToBottom();
        break;
    }
  };

  useRealtimeUpdates({
    onJobUpdate: handleJobUpdate,
  });

  useEffect(() => {
    if (!currentJobId) return;

    const interval = setInterval(async () => {
      try {
        const { data } = await musicApi.checkJobStatus(currentJobId);
        if (data && data.status !== currentJobStatus) {
          handleJobUpdate(data);
        }
      } catch (error) {
        console.warn('job polling failed', error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [currentJobId, currentJobStatus]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const trimmed = inputText.trim();
    setInputText('');

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: trimmed,
      isUser: true,
    };

    const history = [...messages, userMessage];
    setMessages(history);
    scrollToBottom();

    setIsLoading(true);
    try {
      const { data } = await musicApi.talkToDara({
        userInput: trimmed,
        sessionType: activeTab.toLowerCase(),
        conversationHistory: history.map((msg) => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text,
        })),
      });

      const responseText =
        data?.response ??
        (activeTab === 'Music'
          ? "I'm listening. Tell me more about the mood you'd like to set for your music."
          : "I'm here for you. What kind of meditation experience are you seeking?");

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        text: responseText,
        isUser: false,
      };
      setMessages((prev) => [...prev, aiMessage]);
      scrollToBottom();

      const enriched = data?.enrichedPrompt || (responseText.length > 50 ? responseText : '');
      if (enriched) {
        setEnrichedPrompt(enriched);
        setShowGenerateButton(true);
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}-prompt`,
            text:
              activeTab === 'Music'
                ? 'Great, I drafted a description. When you are ready, press Generate to create your track.'
                : 'I have shaped your meditation session. Tap Generate when you are ready.',
            isUser: false,
          },
        ]);
        scrollToBottom();
      }
    } catch (error) {
      console.error('talkToDara failed', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}-error`,
          text: "I'm having trouble connecting right now. Let's try again in a moment.",
          isUser: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!enrichedPrompt.trim()) return;

    try {
      if (activeTab === 'Meditation') {
        const { data, error } = await musicApi.generateMeditationSession({
          user_text: enrichedPrompt,
          duration_sec: Number(duration) || 300,
          use_therapist: false,
        });
        if (error) throw error;
        if (data?.job_id) {
          setCurrentJobId(data.job_id);
          setGenerationProgress(15);
          setMessages((prev) => [
            ...prev,
            {
              id: `ai-${Date.now()}-gen`,
              text: 'Creating your meditation session… this will take a moment. 🧘',
              isUser: false,
            },
          ]);
        }
      } else {
        const { data, error } = await musicApi.generateMusic({
          user_text: enrichedPrompt,
          title: generateSmartTitle(enrichedPrompt),
          duration_sec: Number(duration) || 180,
          style: 'ambient',
        });
        if (error) throw error;
        if (data?.job_id) {
          setCurrentJobId(data.job_id);
          setGenerationProgress(15);
          setMessages((prev) => [
            ...prev,
            {
              id: `ai-${Date.now()}-gen`,
              text: 'Creating your healing music… this will take a moment. 🎵',
              isUser: false,
            },
          ]);
        }
      }
    } catch (error) {
      console.error('generation failed', error);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}-gen-error`,
          text: 'I could not create it right now. Could you try again shortly?',
          isUser: false,
        },
      ]);
    }
  };

  const manualCheck = async () => {
    if (!currentJobId || !user?.id) return;
    try {
      const { data } = await musicApi.checkJobStatus(currentJobId);
      if (data) handleJobUpdate(data);
    } catch (error) {
      console.warn('manual job check failed', error);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        item.isUser ? styles.messageBubbleUser : styles.messageBubbleAssistant,
      ]}
    >
      <Text style={item.isUser ? styles.messageTextUser : styles.messageTextAssistant}>
        {item.text}
      </Text>
    </View>
  );

  const tabs = useMemo(
    () => [
      { id: 'Music', label: 'Music', description: 'Healing music sessions' },
      { id: 'Meditation', label: 'Meditation', description: 'Guided meditations' },
    ],
    []
  );

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Pressable onPress={onClose} style={styles.iconButton} accessibilityRole="button">
          <Feather name="x" size={20} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle}>Create {activeTab}</Text>
        <Pressable onPress={manualCheck} style={styles.iconButton} accessibilityRole="button">
          <Feather name="refresh-cw" size={20} color="#6b7280" />
        </Pressable>
      </View>

      <View style={styles.tabBar}>
        {tabs.map((tab, index) => {
          const selected = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActiveTab(tab.id as 'Music' | 'Meditation')}
              style={[
                styles.tabButton,
                selected && styles.tabButtonActive,
                index < tabs.length - 1 && styles.tabButtonSpacing,
              ]}
            >
              <Text style={[styles.tabLabel, selected && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={scrollToBottom}
      />

      {showGenerateButton && (
        <View style={styles.generateCard}>
          <Text style={styles.generateTitle}>Ready when you are</Text>
          <Text style={styles.generatePrompt}>{enrichedPrompt}</Text>
          <Pressable
            onPress={handleGenerate}
            style={styles.generateButton}
            accessibilityRole="button"
          >
            {generationProgress > 0 && generationProgress < 100 ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.generateButtonLabel}>
                {generationProgress >= 100 ? 'Completed' : 'Generate'}
              </Text>
            )}
          </Pressable>
          {generationProgress > 0 && generationProgress < 100 ? (
            <Text style={styles.generateStatus}>
              {currentJobStatus ? currentJobStatus.replace(/_/g, ' ') : 'Generating…'}
            </Text>
          ) : null}
        </View>
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.textInput}
          placeholder="Tell Dara how you feel…"
          placeholderTextColor="#9ca3af"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <Pressable
          onPress={handleSend}
          disabled={!inputText.trim() || isLoading}
          style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
          accessibilityRole="button"
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Feather name="send" size={18} color="#ffffff" />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function generateSmartTitle(prompt: string) {
  const words = prompt
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .slice(0, 4)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1));

  if (words.length) {
    return words.join(' ');
  }

  return 'Healing Music Journey';
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  tabButton: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabButtonSpacing: {
    marginRight: 12,
  },
  tabButtonActive: {
    backgroundColor: '#ede9fe',
  },
  tabLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  tabLabelActive: {
    color: '#7c3aed',
    fontWeight: '600',
  },
  messagesContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 160,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    marginBottom: 12,
  },
  messageBubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#4338CA',
  },
  messageBubbleAssistant: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
  },
  messageTextUser: {
    color: '#ffffff',
  },
  messageTextAssistant: {
    color: '#111827',
  },
  generateCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
  },
  generateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  generatePrompt: {
    color: '#6b7280',
    marginBottom: 12,
  },
  generateButton: {
    borderRadius: 18,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  generateButtonLabel: {
    color: '#ffffff',
    fontWeight: '600',
  },
  generateStatus: {
    marginTop: 8,
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  inputBar: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d1d5db',
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c3aed',
    marginLeft: 12,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default CreateMusicScreen;
