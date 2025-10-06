import { memo } from 'react';
import { StyleSheet, Text, View, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

type WelcomeScreenProps = {
  onCreateAccount?: () => void;
  onSignIn?: () => void;
};

function WelcomeScreenComponent({ onCreateAccount, onSignIn }: WelcomeScreenProps) {
  return (
    <LinearGradient
      colors={['#29034A', '#520346', '#D300BE']}
      locations={[0.12, 0.88, 1]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View style={styles.topSection}>
            <Text style={styles.title}>Welcome</Text>
            <Text style={styles.subtitle}>
              Indara supports your well-being every day
            </Text>
          </View>

          <View style={styles.bottomSection}>
            <Pressable
              accessibilityRole="button"
              style={styles.primaryButton}
              onPress={onCreateAccount}
            >
              <Text style={styles.primaryButtonText}>
                Create your Indara account to begin
              </Text>
            </Pressable>

            <View style={styles.signInContainer}>
              <Text style={styles.signInText}>Already have an account? </Text>
              <Pressable accessibilityRole="button" onPress={onSignIn}>
                <Text style={styles.signInLink}>Sign in</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 48,
  },
  logoImage: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 200,
    height: 200,
  },
  topSection: {
    alignItems: 'flex-start',
    marginTop: 180,
  },
  title: {
    fontSize: 56,
    fontWeight: '700',
    color: '#EEDDEE',
    marginBottom: 16,
    fontFamily: 'SF Pro',
  },
  subtitle: {
    fontSize: 18,
    color: '#EEDDEE',
    opacity: 0.9,
    lineHeight: 28,
    maxWidth: 320,
    fontFamily: 'SF Pro',
  },
  bottomSection: {
    gap: 24,
  },
  primaryButton: {
    backgroundColor: '#E9D5FF',
    borderRadius: 28,
    paddingVertical: 20,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'SF Pro',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 16,
    color: '#EEDDEE',
    fontFamily: 'SF Pro',
  },
  signInLink: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EEDDEE',
    fontFamily: 'SF Pro',
  },
});

export const WelcomeScreen = memo(WelcomeScreenComponent);

export default WelcomeScreen;
