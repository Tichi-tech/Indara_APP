import { memo, useState, useEffect, useRef } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

import { useAuth } from '@/hooks/useAuth';

export type PhoneAuthScreenProps = {
  mode: 'signin' | 'create';
  onBack?: () => void;
  onCodeSent?: (phone: string) => void;
};

function PhoneAuthScreenComponent({ mode, onBack, onCodeSent }: PhoneAuthScreenProps) {
  const { signInWithPhone } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Focus input after a short delay to ensure keyboard appears
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');

    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    } else {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhoneNumber(formatted);
  };

  const handleSubmit = async () => {
    if (!phoneNumber.trim()) return;
    setLoading(true);
    setError(null);
    try {
      // Convert formatted phone number back to raw format for auth
      const cleanedPhone = '+1' + phoneNumber.replace(/\D/g, '');
      const { error } = await signInWithPhone?.(cleanedPhone);
      if (error) throw error;
      onCodeSent?.(cleanedPhone);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#29034A', '#520346', '#D300BE']}
      locations={[0.12, 0.88, 1]}
      style={styles.container}
    >
      <View style={styles.flex}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backButton} accessibilityRole="button">
            <Feather name="arrow-left" size={32} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Your phone number</Text>
        </View>

        <View style={styles.content}>
          <Pressable
            style={styles.phoneInputContainer}
            onPress={() => inputRef.current?.focus()}
          >
            <Text style={styles.countryCode}>+1 </Text>
            <TextInput
              ref={inputRef}
              style={styles.phoneInput}
              value={phoneNumber}
              onChangeText={handlePhoneChange}
              placeholder="201-555-0123"
              placeholderTextColor="rgba(255, 255, 255, 0.3)"
              keyboardType="phone-pad"
              maxLength={12}
              editable={!loading}
              autoFocus
              returnKeyType="done"
            />
          </Pressable>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            accessibilityRole="button"
            style={[styles.confirmButton, (!phoneNumber.trim() || loading) && styles.confirmButtonDisabled]}
            onPress={handleSubmit}
            disabled={!phoneNumber.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#1F1F1F" />
            ) : (
              <Text style={styles.confirmButtonText}>Confirm</Text>
            )}
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    gap: 24,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#EEDDEE',
    fontFamily: 'SF Pro',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 48,
  },
  countryCode: {
    fontSize: 32,
    fontWeight: '700',
    color: '#EEDDEE',
    fontFamily: 'SF Pro',
  },
  phoneInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '700',
    color: '#EEDDEE',
    padding: 0,
    fontFamily: 'SF Pro',
  },
  error: {
    color: '#fca5a5',
    fontSize: 16,
    marginBottom: 24,
    fontWeight: '500',
    fontFamily: 'SF Pro',
  },
  confirmButton: {
    backgroundColor: '#E9D5FF',
    borderRadius: 28,
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
    position: 'absolute',
    bottom: 48,
    left: 24,
    right: 24,
  },
  confirmButtonDisabled: {
    backgroundColor: 'rgba(233, 213, 255, 0.5)',
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'SF Pro',
  },
});

export const PhoneAuthScreen = memo(PhoneAuthScreenComponent);

export default PhoneAuthScreen;
