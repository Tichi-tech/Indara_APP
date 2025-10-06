import { memo } from 'react';
import { Pressable, StyleSheet, Text, View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

import { useAuth } from '@/hooks/useAuth';

export type SignInScreenProps = {
  onBack?: () => void;
  onPhone?: () => void;
};

function SignInScreenComponent({ onBack, onPhone }: SignInScreenProps) {
  const { signInWithGoogle } = useAuth();

  return (
    <LinearGradient
      colors={['#29034A', '#520346', '#D300BE']}
      locations={[0.12, 0.88, 1]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.backButton}>
            <Feather name="arrow-left" size={32} color="#EEDDEE" />
          </Pressable>
          <Text style={styles.headerTitle}>Sign in</Text>
        </View>

        <View style={styles.mainContent}>
          <Text style={styles.title}>Sign in to your{'\n'}Indara account</Text>

          <View style={styles.buttonsContainer}>
            <Pressable accessibilityRole="button" onPress={onPhone} style={styles.optionButton}>
              <Feather name="phone" size={28} color="#1F1F1F" />
              <Text style={styles.optionButtonText}>Use my phone number</Text>
            </Pressable>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable accessibilityRole="button" style={styles.optionButton} onPress={() => signInWithGoogle?.()}>
              <Image
                source={require('../../assets/Gmail_icon_(2020).svg.png')}
                style={styles.gmailIcon}
                resizeMode="contain"
              />
              <Text style={styles.optionButtonText}>Sign in with your Gmail</Text>
            </Pressable>
          </View>

          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By signing in, you agree to the{' '}
              <Text style={styles.termsLink}>Terms of service</Text>{' '}
              and acknowledge the{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 48,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  mainContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 48,
    fontWeight: '700',
    color: '#EEDDEE',
    marginBottom: 64,
    lineHeight: 56,
    fontFamily: 'SF Pro',
  },
  buttonsContainer: {
    gap: 32,
    marginBottom: 48,
  },
  optionButton: {
    backgroundColor: '#E9D5FF',
    borderRadius: 28,
    paddingVertical: 20,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'SF Pro',
  },
  gmailIcon: {
    width: 28,
    height: 28,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEDDEE',
    opacity: 0.3,
  },
  dividerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EEDDEE',
    fontFamily: 'SF Pro',
  },
  termsContainer: {
    marginTop: 'auto',
  },
  termsText: {
    fontSize: 14,
    color: '#EEDDEE',
    opacity: 0.9,
    lineHeight: 22,
    textAlign: 'center',
    fontFamily: 'SF Pro',
  },
  termsLink: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});

export const SignInScreen = memo(SignInScreenComponent);

export default SignInScreen;
