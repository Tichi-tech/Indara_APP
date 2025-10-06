import { memo, useState, useRef } from 'react';
import {
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

type VerificationScreenProps = {
  phoneNumber: string;
  onBack?: () => void;
  onVerified?: () => void;
};

function VerificationScreenComponent({ phoneNumber, onBack, onVerified }: VerificationScreenProps) {
  const { verifyOtp } = useAuth();
  const [code, setCode] = useState(['', '', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleSubmit = async (fullCode: string) => {
    if (fullCode.length !== 7 || loading) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await verifyOtp?.(phoneNumber, fullCode);
      if (error) throw error;
      onVerified?.();
    } catch (err: any) {
      setError(err?.message ?? 'Invalid verification code. Please try again.');
      // Clear code on error
      setCode(['', '', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text[text.length - 1];
    }

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-advance to next input
    if (text && index < 6) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 7 digits are entered
    if (text && index === 6) {
      const fullCode = newCode.join('');
      if (fullCode.length === 7) {
        void handleSubmit(fullCode);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <LinearGradient
      colors={['#29034A', '#520346', '#D300BE']}
      locations={[0.12, 0.88, 1]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.backButton} accessibilityRole="button">
            <Feather name="arrow-left" size={32} color="#FFFFFF" />
          </Pressable>
          <Text style={styles.headerTitle}>Enter confirmation code</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <View key={index} style={styles.digitWrapper}>
                <TextInput
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={styles.digitInput}
                  value={digit}
                  onChangeText={(text) => handleCodeChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  editable={!loading}
                />
                {!digit && <View style={styles.digitPlaceholder} />}
              </View>
            ))}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {loading ? <Text style={styles.loadingText}>Verifying...</Text> : null}
        </View>
      </KeyboardAvoidingView>
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
    paddingTop: 120,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  digitWrapper: {
    flex: 1,
    position: 'relative',
  },
  digitInput: {
    fontSize: 56,
    fontWeight: '700',
    color: '#EEDDEE',
    textAlign: 'center',
    padding: 0,
    height: 80,
    fontFamily: 'SF Pro',
  },
  digitPlaceholder: {
    position: 'absolute',
    bottom: 10,
    left: '50%',
    marginLeft: -20,
    width: 40,
    height: 4,
    backgroundColor: '#EEDDEE',
    opacity: 0.3,
  },
  error: {
    color: '#fca5a5',
    fontSize: 16,
    marginTop: 32,
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: 'SF Pro',
  },
  loadingText: {
    color: '#EEDDEE',
    fontSize: 16,
    marginTop: 32,
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.8,
    fontFamily: 'SF Pro',
  },
});

export const VerificationScreen = memo(VerificationScreenComponent);

export default VerificationScreen;
