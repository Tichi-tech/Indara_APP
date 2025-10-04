import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { useAuth } from '@/hooks/useAuth';

export type SignInScreenProps = {
  onBack?: () => void;
  onPhone?: () => void;
};

function SignInScreenComponent({ onBack, onPhone }: SignInScreenProps) {
  const { signInWithGoogle } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.headerButton}>
          <Feather name="arrow-left" size={20} color="#111827" />
        </Pressable>

        <View style={styles.heroBlock}>
          <Text style={styles.title}>{`Sign in to your\nIndara account`}</Text>
        </View>

        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={onPhone} style={styles.primaryButton}>
            <Feather name="phone" size={18} color="#ffffff" />
            <Text style={styles.primaryLabel}>Use my phone number</Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerLabel}>or</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.socialRow}>
            <Pressable accessibilityRole="button" style={styles.socialButton}>
              <Feather name="globe" size={22} color="#111827" />
            </Pressable>
            <Pressable accessibilityRole="button" style={styles.socialButton} onPress={() => signInWithGoogle?.()}>
              <Feather name="globe" size={22} color="#111827" />
            </Pressable>
          </View>
        </View>

        <Text style={styles.footerText}>
          By signing in, you agree to the <Text style={styles.footerLink}>Terms of Service</Text>{' '}
          and acknowledge the <Text style={styles.footerLink}>Privacy Policy</Text>.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  heroBlock: {
    gap: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '300',
    color: '#111827',
  },
  actions: {
    gap: 24,
  },
  primaryButton: {
    borderRadius: 20,
    backgroundColor: '#111827',
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  primaryLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerLabel: {
    color: '#94a3b8',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 13,
  },
  footerLink: {
    color: '#111827',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export const SignInScreen = memo(SignInScreenComponent);

export default SignInScreen;
