import { memo, useState } from 'react';
import {
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

type VerificationScreenProps = {
  phoneNumber: string;
  onBack?: () => void;
  onVerified?: () => void;
};

function VerificationScreenComponent({ phoneNumber, onBack, onVerified }: VerificationScreenProps) {
  const { verifyOtp } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await verifyOtp?.(phoneNumber, code);
      if (error) throw error;
      onVerified?.();
    } catch (err: any) {
      setError(err?.message ?? 'Invalid verification code. Please try again.');
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
            <Text style={styles.title}>Enter verification code</Text>
            <Text style={styles.subtitle}>We sent a 6-digit code to {phoneNumber}</Text>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={(value) => setCode(value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              keyboardType="number-pad"
              textAlign="center"
              maxLength={6}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Pressable
              accessibilityRole="button"
              onPress={handleSubmit}
              style={[styles.ctaButton, (code.length !== 6 || loading) && styles.ctaDisabled]}
              disabled={code.length !== 6 || loading}
            >
              <Text style={styles.ctaLabel}>{loading ? 'Verifying…' : 'Verify code'}</Text>
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
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
  },
  input: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    letterSpacing: 6,
    color: '#111827',
  },
  error: {
    color: '#ef4444',
    fontSize: 13,
    textAlign: 'center',
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

export const VerificationScreen = memo(VerificationScreenComponent);

export default VerificationScreen;
