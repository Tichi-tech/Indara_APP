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
import { SafeAreaView } from 'react-native-safe-area-context';
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
  onReturnHome?: () => void;
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

export function CreateMusicScreen({ onClose, onPlaySong, onReturnHome }: CreateMusicScreenProps) {
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
  const [completedTrack, setCompletedTrack] = useState<GeneratedTrack | null>(null);
  const [playedJobIds, setPlayedJobIds] = useState<Set<string>>(new Set());

  const flatListRef = useRef<FlatList>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    });
  };

  // Smooth progress animation
  const animateProgress = (targetProgress: number, currentProgress: number) => {
    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // Don't animate if target is less than current (going backwards)
    if (targetProgress <= currentProgress) {
      setGenerationProgress(targetProgress);
      return;
    }

    // Animate from current to target in steps of 10%
    let progress = currentProgress;
    progressIntervalRef.current = setInterval(() => {
      progress += 10;
      if (progress >= targetProgress) {
        setGenerationProgress(targetProgress);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      } else {
        setGenerationProgress(progress);
      }
    }, 1000); // Update every 1 second
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  // Clean up progress interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setMessages([{ id: 'welcome', text: INITIAL_MESSAGES[activeTab], isUser: false }]);
    setEnrichedPrompt('');
    setShowGenerateButton(false);
    setGenerationProgress(0);
    setCurrentJobId(null);
    setCurrentJobStatus(null);
    setCompletedTrack(null);
  }, [activeTab]);

  // Check for active jobs on mount - resume progress if user returns
  useEffect(() => {
    const checkActiveJob = async () => {
      if (!user?.id) return;

      try {
        const { data: jobs } = await musicApi.getUserJobs(user.id);
        if (!jobs || jobs.length === 0) {
          return;
        }

        // Find the most recent job for current tab (including completed ones!)
        // BUT exclude jobs that user already played
        const activeJob = jobs.find(
          (j: any) =>
            (j.status === 'pending' || j.status === 'processing' || j.status === 'completed') &&
            j.job_type === (activeTab === 'Music' ? 'music' : 'session') &&
            !playedJobIds.has(j.id) // ✅ Skip already-played jobs
        );

        if (activeJob) {
          // ✅ Set state immediately to show UI faster
          setCurrentJobId(activeJob.id);
          setShowGenerateButton(true);

          // Set enriched prompt from job's user_text
          if (activeJob.user_text || activeJob.hints?.user_text) {
            setEnrichedPrompt(activeJob.user_text || activeJob.hints?.user_text);
          }

          // ✅ Set initial progress immediately based on status
          if (activeJob.status === 'pending') {
            setGenerationProgress(10);
            setCurrentJobStatus('pending');
          } else if (activeJob.status === 'processing') {
            setGenerationProgress(50);
            setCurrentJobStatus('processing');
          } else if (activeJob.status === 'completed') {
            setGenerationProgress(100);
            setCurrentJobStatus('completed');
          }

          // Then call handleJobUpdate for detailed processing (extracts track data)
          // Skip ID check since currentJobId state hasn't updated yet
          handleJobUpdate(activeJob, true);
        }
      } catch (error) {
        console.warn('Failed to check active jobs:', error);
      }
    };

    checkActiveJob();
  }, [user?.id, activeTab, playedJobIds]);

  const handleJobUpdate = (job: any, skipIdCheck = false) => {
    // Skip ID check when called from checkActiveJob (during restoration)
    if (!job || (!skipIdCheck && job.id !== currentJobId)) return;

    // Only log status changes, not every update
    if (job.status !== currentJobStatus) {
      console.log(`📊 Job status: ${job.status}`);
    }

    setCurrentJobStatus(job.status);

    switch (job.status) {
      case 'pending':
        animateProgress(10, generationProgress);
        break;
      case 'processing':
        animateProgress(50, generationProgress);
        break;
      case 'completed':
        setGenerationProgress(100);

        // ✅ Extract track data from job.result directly (already contains all info!)
        let trackId: string | undefined;
        let trackTitle: string | undefined;
        let audioUrl: string | undefined;

        if (job.generated_tracks?.[0]) {
          // From generated_tracks array
          const track = job.generated_tracks[0];
          trackId = track.id;
          trackTitle = track.title;
          audioUrl = track.audio_url;
        } else if (job.result) {
          // From job.result (contains trackId, title, audio_url)
          trackId = job.result.trackId || job.result.track_id;
          trackTitle = job.result.title;
          audioUrl = job.result.audio_url || job.result.music_url;
        }

        if (trackId && audioUrl) {
          const generatedTrack: GeneratedTrack = {
            id: trackId,
            title: trackTitle ?? `${activeTab} Track`,
            description: `AI-generated ${activeTab.toLowerCase()}`,
            duration: '3:00', // Default duration
            audio_url: audioUrl,
            status: job.status,
          };

          // ✅ STORE track instead of auto-playing
          setCompletedTrack(generatedTrack);

          // ✅ Show completion message (only if not already shown)
          if (!messages.some(m => m.id.startsWith('complete-'))) {
            setMessages((prev) => [
              ...prev,
              {
                id: `complete-${Date.now()}`,
                text:
                  activeTab === 'Music'
                    ? '🎉 Your healing music is ready! Click "Play Now" to listen.'
                    : '🧘 Your meditation session is ready! Click "Play Now" to listen.',
                isUser: false,
              },
            ]);
            scrollToBottom();
          }
        } else {
          console.warn('⚠️ Job completed but no track data');
        }
        break;
      case 'failed':
        setGenerationProgress(0);
        setCompletedTrack(null);
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
      // Add timeout wrapper (30 seconds)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out after 30 seconds')), 30000)
      );

      const apiPromise = musicApi.talkToDara({
        userInput: trimmed,
        sessionType: activeTab.toLowerCase(),
        conversationHistory: history.map((msg) => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text,
        })),
      });

      const { data, error } = await Promise.race([apiPromise, timeoutPromise]) as any;

      if (error) {
        throw error;
      }

      // Handle the 3-step conversation flow (same as web)
      if (data.status === 'question' && data.question) {
        // Step 1: Dara asks clarifying questions
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          text: data.question,
          isUser: false,
        };
        setMessages((prev) => [...prev, aiMessage]);
        scrollToBottom();

      } else if (data.status === 'offer' && data.confirmation_question) {
        // Step 2: Dara offers a plan and asks for confirmation
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          text: data.confirmation_question,
          isUser: false,
        };
        setMessages((prev) => [...prev, aiMessage]);
        scrollToBottom();

      } else if (data.status === 'final' && data.nl_description) {
        // Step 3: User confirmed - show the final plan
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          text: data.nl_description,
          isUser: false,
        };
        setMessages((prev) => [...prev, aiMessage]);
        scrollToBottom();

        // NOW enable the Generate button with the enriched prompt
        setEnrichedPrompt(data.nl_description);
        setShowGenerateButton(true);

        // Add a message indicating ready to generate
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `ai-${Date.now()}-ready`,
              text:
                activeTab === 'Music'
                  ? '🎵 Your music plan is ready! Tap "Generate" when you\'re ready to create your healing music.'
                  : '🧘 Your meditation plan is ready! Tap "Generate" when you\'re ready to create your session.',
              isUser: false,
            },
          ]);
          scrollToBottom();
        }, 300);

      } else {
        // Fallback for unexpected response format
        const responseText =
          data?.question ?? data?.response ??
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
          animateProgress(10, 0); // Start animation from 0% to 10%
          setCompletedTrack(null); // Clear any previous completed track
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
          animateProgress(10, 0); // Start animation from 0% to 10%
          setCompletedTrack(null); // Clear any previous completed track
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

  const handlePlayNow = () => {
    if (completedTrack && currentJobId) {
      onPlaySong?.(completedTrack);

      // ✅ Mark this job as played so it won't show again
      setPlayedJobIds(prev => new Set(prev).add(currentJobId));

      // ✅ Clear job state so user can start fresh next time
      setCompletedTrack(null);
      setCurrentJobId(null);
      setCurrentJobStatus(null);
      setGenerationProgress(0);
      setShowGenerateButton(false);
      setEnrichedPrompt('');

      // Reset to initial conversation
      setMessages([{ id: 'welcome', text: INITIAL_MESSAGES[activeTab], isUser: false }]);

      // Navigate to now-playing screen
      onClose();
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

  const handleRefresh = () => {
    // ✅ Mark current job as "consumed" if it exists
    if (currentJobId) {
      setPlayedJobIds(prev => new Set(prev).add(currentJobId));
    }

    // Reset the conversation
    setMessages([{ id: 'welcome', text: INITIAL_MESSAGES[activeTab], isUser: false }]);
    setEnrichedPrompt('');
    setShowGenerateButton(false);
    setGenerationProgress(0);
    setCurrentJobId(null);
    setCurrentJobStatus(null);
    setCompletedTrack(null);
    setInputText('');
  };

  return (
    <SafeAreaView style={styles.wrapper} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable
            onPress={onReturnHome || onClose}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Return to home"
          >
            <Feather name="arrow-left" size={20} color="#111827" />
          </Pressable>
          <Text style={styles.headerTitle}>Create {activeTab}</Text>
          <Pressable
            onPress={handleRefresh}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Refresh and start over"
          >
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
          <Text style={styles.generateTitle}>
            {completedTrack ? 'Your music is ready! 🎉' : 'Ready when you are'}
          </Text>
          <Text style={styles.generatePrompt}>{enrichedPrompt}</Text>
          <Pressable
            onPress={completedTrack ? handlePlayNow : handleGenerate}
            style={styles.generateButton}
            accessibilityRole="button"
            disabled={generationProgress > 0 && generationProgress < 100}
          >
            {generationProgress > 0 && generationProgress < 100 ? (
              <View style={styles.progressContainer}>
                <ActivityIndicator color="#ffffff" size="small" />
                <Text style={styles.progressText}>Generating... {generationProgress}%</Text>
              </View>
            ) : completedTrack ? (
              <Text style={styles.generateButtonLabel}>🎵 Play Now</Text>
            ) : (
              <Text style={styles.generateButtonLabel}>Generate</Text>
            )}
          </Pressable>
          {generationProgress > 0 && generationProgress < 100 && (
            <Text style={styles.generateStatus}>
              {currentJobStatus === 'pending' ? 'Starting generation...' :
               currentJobStatus === 'processing' ? 'Creating your music...' :
               'Generating...'}
            </Text>
          )}
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
    </SafeAreaView>
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
  content: {
    flex: 1,
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  progressText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 8,
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
