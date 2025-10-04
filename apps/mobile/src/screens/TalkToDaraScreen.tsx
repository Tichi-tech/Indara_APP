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

type ChatMessage = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
};

type TalkToDaraScreenProps = {
  onBack?: () => void;
  onCreate?: () => void;
  onLibrary?: () => void;
  onInbox?: () => void;
  onAccount?: () => void;
  bottomNavProps?: BottomNavProps;
  accountInitial?: string;
};

function TalkToDaraScreenComponent({
  onBack,
  onCreate,
  onLibrary,
  onInbox,
  onAccount,
  bottomNavProps,
  accountInitial = 'S',
}: TalkToDaraScreenProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      text: "Hi there! I'm Dara, your AI wellness therapist. Whether you're feeling stressed, anxious, or simply need someone to listen, I'm here for you. What's on your mind today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const mergedNav = useMemo<BottomNavProps | null>(() => {
    if (bottomNavProps) return bottomNavProps;
    return {
      active: 'inbox',
      onHome: onBack,
      onLibrary,
      onCreate,
      onInbox,
      onAccount,
      accountInitial,
    };
  }, [accountInitial, bottomNavProps, onAccount, onBack, onCreate, onInbox, onLibrary]);

  useEffect(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      text: trimmed,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const history = [...messages, userMessage].map(
        (msg): { role: 'user' | 'assistant'; content: string } => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text,
        })
      );

      const { data, error } = await musicApi.talkToDara({
        userInput: trimmed,
        sessionType: 'meditation',
        conversationHistory: history,
      });

      const reply: ChatMessage = {
        id: `${Date.now()}-assistant`,
        text:
          error || !data?.response
            ? "I'm having trouble connecting right now, but I'm still here for you. Could you share a bit more about how you're feeling?"
            : data.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      console.error('Failed to talk to Dara', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-fallback`,
          text: "I couldn't reach the wellness service, but I'm still listening. Could you describe what you're experiencing?",
          isUser: false,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, messages]);

  const renderItem = ({ item }: { item: ChatMessage }) => (
    <View
      style={[styles.bubbleRow, item.isUser ? styles.bubbleRowUser : styles.bubbleRowAssistant]}
    >
      <View
        style={[styles.bubble, item.isUser ? styles.bubbleUser : styles.bubbleAssistant]}
      >
        {!item.isUser ? (
          <View style={styles.daraLabelWrap}>
            <Feather name="star" size={12} color="#7c3aed" />
            <Text style={styles.daraLabel}>Dara</Text>
          </View>
        ) : null}
        <Text style={[styles.messageText, item.isUser ? styles.messageTextUser : styles.messageTextAssistant]}>
          {item.text}
        </Text>
        <Text style={[styles.timestamp, item.isUser ? styles.timestampUser : styles.timestampAssistant]}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable accessibilityRole="button" onPress={onBack} style={styles.headerButton}>
              <Feather name="arrow-left" size={20} color="#ffffff" />
            </Pressable>
            <View style={styles.headerTitleWrap}>
              <View style={styles.headerAvatar}>
                <Feather name="heart" size={18} color="#ffffff" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Talk to Dara</Text>
                <Text style={styles.headerSubtitle}>Therapeutic support</Text>
              </View>
            </View>
            <View style={styles.headerStatus}>
              <View style={styles.statusDot} />
              <Text style={styles.statusLabel}>Online</Text>
            </View>
          </View>

          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          />

          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Share how you're feeling"
              placeholderTextColor="#94a3b8"
              multiline
            />
            <Pressable
              accessibilityRole="button"
              style={[styles.sendButton, (!inputValue.trim() || isLoading) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputValue.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Feather name="send" size={16} color="#ffffff" />
              )}
            </Pressable>
          </View>

          {mergedNav ? <BottomNav {...mergedNav} /> : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    backgroundColor: '#7c3aed',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#a7f3d0',
  },
  statusLabel: {
    fontSize: 12,
    color: '#ffffff',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 200,
    gap: 12,
  },
  bubbleRow: {
    flexDirection: 'row',
  },
  bubbleRowUser: {
    justifyContent: 'flex-end',
  },
  bubbleRowAssistant: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    gap: 6,
  },
  bubbleUser: {
    backgroundColor: '#7c3aed',
  },
  bubbleAssistant: {
    backgroundColor: '#f3f4f6',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextUser: {
    color: '#ffffff',
  },
  messageTextAssistant: {
    color: '#1f2937',
  },
  timestamp: {
    fontSize: 11,
  },
  timestampUser: {
    color: 'rgba(255,255,255,0.6)',
    alignSelf: 'flex-end',
  },
  timestampAssistant: {
    color: '#9ca3af',
    alignSelf: 'flex-start',
  },
  daraLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  daraLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7c3aed',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#cbd5f5',
  },
});

export const TalkToDaraScreen = memo(TalkToDaraScreenComponent);

export default TalkToDaraScreen;
