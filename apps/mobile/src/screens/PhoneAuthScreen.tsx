import { memo, useState } from 'react';
import {
  ActivityIndicator,
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

export type PhoneAuthScreenProps = {
  mode: 'signin' | 'create';
  onBack?: () => void;
  onCodeSent?: (phone: string) => void;
};

function PhoneAuthScreenComponent({ mode, onBack, onCodeSent }: PhoneAuthScreenProps) {
  const { signInWithPhone } = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await signInWithPhone?.(phone);
      if (error) throw error;
      onCodeSent?.(phone);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.headerButton}>
            <Feather name="arrow-left" size={20} color="#111827" />
          </Pressable>

          <View style={styles.content}>
            <Text style={styles.title}>
              {mode === 'signin' ? 'Sign in with your phone number' : 'Create an account with your phone number'}
            </Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+1 (555) 123-4567"
              keyboardType="phone-pad"
              style={styles.input}
              editable={!loading}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable
              accessibilityRole="button"
              onPress={handleSubmit}
              style={[styles.ctaButton, (!phone.trim() || loading) && styles.ctaDisabled]}
              disabled={!phone.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.ctaLabel}>Send verification code</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    gap: 32,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: '#111827',
  },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  error: {
    color: '#ef4444',
    fontSize: 13,
  },
  ctaButton: {
    borderRadius: 18,
    backgroundColor: '#111827',
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaDisabled: {
    backgroundColor: '#cbd5f5',
  },
  ctaLabel: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export const PhoneAuthScreen = memo(PhoneAuthScreenComponent);

export default PhoneAuthScreen;
