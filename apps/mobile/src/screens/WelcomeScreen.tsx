import { memo } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type WelcomeScreenProps = {
  onCreateAccount?: () => void;
  onSignIn?: () => void;
};

function WelcomeScreenComponent({ onCreateAccount, onSignIn }: WelcomeScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.brandBlock}>
          <View style={styles.logoGlyph}>
            <Text style={styles.logoGlyphLabel}>🎵</Text>
          </View>
          <Text style={styles.brandTitle}>Indara</Text>
        </View>

        <View style={styles.heroBlock}>
          <Text style={styles.heroTitle}>Welcome to Indara</Text>
          <Text style={styles.heroSubtitle}>From your mind to healing music.</Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={onCreateAccount}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryLabel}>Create a free Indara account</Text>
          </Pressable>
          <View style={styles.secondaryRow}>
            <Text style={styles.secondaryText}>Already have an account? </Text>
            <Pressable accessibilityRole="button" onPress={onSignIn}>
              <Text style={styles.secondaryLink}>Sign in</Text>
            </Pressable>
          </View>
        </View>
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
    justifyContent: 'space-between',
  },
  brandBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoGlyph: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlyphLabel: {
    fontSize: 16,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  heroBlock: {
    gap: 12,
  },
  heroTitle: {
    fontSize: 44,
    fontWeight: '300',
    color: '#111827',
    lineHeight: 50,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#6b7280',
  },
  actions: {
    gap: 24,
  },
  primaryButton: {
    backgroundColor: '#111827',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryText: {
    color: '#6b7280',
    fontSize: 14,
  },
  secondaryLink: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export const WelcomeScreen = memo(WelcomeScreenComponent);

export default WelcomeScreen;
