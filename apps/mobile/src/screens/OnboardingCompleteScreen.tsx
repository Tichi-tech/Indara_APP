import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

type OnboardingCompleteScreenProps = {
  name?: string;
  onNext?: () => void;
};

function OnboardingCompleteScreenComponent({ name = 'friend', onNext }: OnboardingCompleteScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.illustrationWrap}>
          <View style={styles.badge}>
            <Feather name="check" size={28} color="#ffffff" />
          </View>
          <Text style={styles.title}>Welcome to Indara, {name}!</Text>
          <Text style={styles.subtitle}>Your healing music journey starts now.</Text>
        </View>

        <Pressable accessibilityRole="button" onPress={onNext} style={styles.ctaButton}>
          <Text style={styles.ctaLabel}>Get started</Text>
        </Pressable>
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
    justifyContent: 'space-between',
    padding: 32,
  },
  illustrationWrap: {
    alignItems: 'center',
    gap: 16,
  },
  badge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#6b7280',
  },
  ctaButton: {
    backgroundColor: '#111827',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaLabel: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export const OnboardingCompleteScreen = memo(OnboardingCompleteScreenComponent);

export default OnboardingCompleteScreen;
