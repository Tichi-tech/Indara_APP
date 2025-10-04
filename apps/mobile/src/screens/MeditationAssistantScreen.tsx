import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

import { BottomNav, type BottomNavProps } from '@/components/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { musicApi } from '@/services/musicApi';

type AssistantMessage = {
  id: string;
  text: string;
  isUser: boolean;
  suggestions?: string[];
};

type MeditationAssistantScreenProps = {
  onBack?: () => void;
  onCreateMusic?: () => void;
  onLibrary?: () => void;
  onInbox?: () => void;
  onAccount?: () => void;
  onStartSession?: (sessionType: string, durationSec: number) => void;
  bottomNavProps?: BottomNavProps;
  accountInitial?: string;
};

const INITIAL_MESSAGE: AssistantMessage = {
  id: 'welcome',
  text: "Welcome to your meditation journey! I'm here to help you find calm, create personal sessions, or guide you through mindful exercises. What would you like to explore today?",
  isUser: false,
  suggestions: [
    'Start a quick 5 minute meditation',
    'Help me relax before sleep',
    'Guide me through breathing exercises',
    'I feel stressed today',
  ],
};

const SESSION_SHORTCUTS = [
  { icon: 'moon', label: 'Sleep', prompt: 'Sleep meditation' },
  { icon: 'zap', label: 'Energy', prompt: 'Energy boosting meditation' },
  { icon: 'heart', label: 'Kindness', prompt: 'Loving kindness meditation' },
  { icon: 'wind', label: 'Breath', prompt: 'Guided breathing exercise' },
  { icon: 'sun', label: 'Morning', prompt: 'Morning meditation' },
  { icon: 'feather', label: 'Mindful', prompt: 'Mindfulness meditation' },
];

function MeditationAssistantScreenComponent({
  onBack,
  onCreateMusic,
  onLibrary,
  onInbox,
  onAccount,
  onStartSession,
  bottomNavProps,
  accountInitial = 'S',
}: MeditationAssistantScreenProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<AssistantMessage[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<FlatList<AssistantMessage>>(null);

  const mergedBottomNav = useMemo<BottomNavProps | null>(() => {
    if (bottomNavProps) return bottomNavProps;
    return {
      active: 'home',
      onHome: onBack,
      onCreate: onCreateMusic,
      onLibrary,
      onInbox,
      onAccount,
      accountInitial,
    };
  }, [accountInitial, bottomNavProps, onAccount, onBack, onCreateMusic, onInbox, onLibrary]);

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  const conversationHistory = useMemo(
    () =>
      messages.map((msg): { role: 'user' | 'assistant'; content: string } => ({
        role: msg.isUser ? 'user' : 'assistant',
        content: msg.text,
      })),
    [messages]
  );

  const appendMessage = useCallback((message: AssistantMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const handleAssistantResponse = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMessage: AssistantMessage = {
        id: String(Date.now()),
        text: text.trim(),
        isUser: true,
      };

      appendMessage(userMessage);
      setInputValue('');
      setIsLoading(true);

      try {
        const { data, error } = await musicApi.chatWithMeditationAssistant({
          message: userMessage.text,
          conversationHistory,
        });

        if (error) throw error;

        const reply: AssistantMessage = {
          id: `${Date.now()}-assistant`,
          text:
            data?.response ??
            "I'm here for you. Tell me a little more about how you're feeling and I'll guide you to the right practice.",
          isUser: false,
          suggestions: Array.isArray(data?.suggestions) ? data?.suggestions : undefined,
        };

        appendMessage(reply);
      } catch (err) {
        console.warn('Meditation assistant error', err);
        appendMessage({
          id: `${Date.now()}-fallback`,
          text: "I'm having trouble connecting right now, but you can still start with a breathing exercise or try our quick meditations.",
          isUser: false,
          suggestions: [
            'Start a breathing exercise',
            'Give me a grounding meditation',
            'Help me fall asleep',
          ],
        });
      } finally {
        setIsLoading(false);
      }
    },
    [appendMessage, conversationHistory]
  );

  const handleSend = useCallback(() => {
    if (isLoading || !inputValue.trim()) return;
    handleAssistantResponse(inputValue);
  }, [handleAssistantResponse, inputValue, isLoading]);

  const handleSuggestionPress = useCallback(
    (suggestion: string) => {
      if (suggestion.toLowerCase().includes('5 minute') || suggestion.toLowerCase().includes('quick')) {
        onStartSession?.('quick', 300);
        return;
      }

      handleAssistantResponse(suggestion);
    },
    [handleAssistantResponse, onStartSession]
  );

  const renderMessage = ({ item }: { item: AssistantMessage }) => {
    const isUser = item.isUser;
    return (
      <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAssistant]}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
          <Text style={[styles.messageText, isUser ? styles.messageTextUser : styles.messageTextAssistant]}>
            {item.text}
          </Text>
        </View>
        {item.suggestions && item.suggestions.length ? (
          <View style={styles.suggestionWrap}>
            {item.suggestions.map((suggestion) => (
              <Pressable
                key={suggestion}
                accessibilityRole="button"
                style={styles.suggestionChip}
                onPress={() => handleSuggestionPress(suggestion)}
              >
                <Text style={styles.suggestionLabel}>{suggestion}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    );
  };

  const renderShortcut = ({ item }: { item: typeof SESSION_SHORTCUTS[number] }) => (
    <Pressable
      style={styles.shortcutCard}
      accessibilityRole="button"
      onPress={() => handleSuggestionPress(`I want a ${item.prompt.toLowerCase()}`)}
    >
      <View style={styles.shortcutIconWrap}>
        <Feather name={item.icon as keyof typeof Feather.glyphMap} size={18} color="#10b981" />
      </View>
      <Text style={styles.shortcutLabel}>{item.label}</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable accessibilityRole="button" onPress={onBack} style={styles.headerButton}>
              <Feather name="arrow-left" size={20} color="#ffffff" />
            </Pressable>
            <View style={styles.headerTitleWrap}>
              <View style={styles.headerIcon}>
                <Feather name="wind" size={18} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Meditation Assistant</Text>
                <Text style={styles.headerSubtitle}>Your mindfulness guide</Text>
              </View>
            </View>
            <View style={styles.headerStatus}>
              <View style={styles.statusDot} />
              <Text style={styles.statusLabel}>Ready</Text>
            </View>
          </View>

          {messages.length === 1 ? (
            <View style={styles.shortcutsSection}>
              <Text style={styles.shortcutsHeading}>Popular journeys</Text>
              <View style={styles.shortcutsGrid}>
                {SESSION_SHORTCUTS.map((shortcut) => (
                  <View style={styles.shortcutItem} key={shortcut.label}>
                    {renderShortcut({ item: shortcut })}
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          />

          <View style={styles.inputContainer}>
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Share how you're feeling or ask for guidance"
              style={styles.input}
              multiline
              maxLength={400}
              editable={!isLoading}
            />
            <Pressable
              accessibilityRole="button"
              onPress={handleSend}
              disabled={isLoading || !inputValue.trim()}
              style={[styles.sendButton, (isLoading || !inputValue.trim()) && styles.sendButtonDisabled]}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#10b981" />
              ) : (
                <Feather name="send" size={18} color="#ffffff" />
              )}
            </Pressable>
          </View>

          {mergedBottomNav ? <BottomNav {...mergedBottomNav} /> : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ecfdf5',
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#10b981',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#bbf7d0',
  },
  statusLabel: {
    fontSize: 12,
    color: '#ffffff',
  },
  shortcutsSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#f0fdf4',
  },
  shortcutsHeading: {
    fontSize: 13,
    fontWeight: '600',
    color: '#047857',
    marginBottom: 12,
  },
  shortcutsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  shortcutItem: {
    width: '33.333%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  shortcutCard: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d1fae5',
    gap: 8,
  },
  shortcutIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#047857',
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 200,
    gap: 12,
  },
  messageRow: {
    maxWidth: '100%',
  },
  messageRowUser: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  messageRowAssistant: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: '#10b981',
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: '#f0fdf4',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextUser: {
    color: '#ffffff',
  },
  messageTextAssistant: {
    color: '#065f46',
  },
  suggestionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#ecfdf5',
  },
  suggestionLabel: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '600',
  },
  inputContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 120,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d1fae5',
    backgroundColor: '#ffffff',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  input: {
    flex: 1,
    maxHeight: 120,
    fontSize: 14,
    lineHeight: 20,
    color: '#047857',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0f766e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#94d5d3',
  },
});

export const MeditationAssistantScreen = memo(MeditationAssistantScreenComponent);

export default MeditationAssistantScreen;
