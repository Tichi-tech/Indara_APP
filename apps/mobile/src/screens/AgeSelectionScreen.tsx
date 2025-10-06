import { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type AgeSelectionScreenProps = {
  userName?: string;
  onAgeSelected?: (ageGroup: '18+' | '13-17') => void;
};

function AgeSelectionScreenComponent({
  userName = 'User',
  onAgeSelected,
}: AgeSelectionScreenProps) {
  const handleAgeSelection = (ageGroup: '18+' | '13-17') => {
    onAgeSelected?.(ageGroup);
  };

  return (
    <LinearGradient
      colors={['#29034A', '#520346', '#D300BE']}
      locations={[0.12, 0.88, 1]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{userName}, how old are you?</Text>
          <Text style={styles.subtitle}>
            We would like to help you by providing appropriate support based on your age
          </Text>
        </View>

        <View style={styles.buttonsContainer}>
          <Pressable
            accessibilityRole="button"
            style={styles.ageButton}
            onPress={() => handleAgeSelection('18+')}
          >
            <Text style={styles.ageButtonText}>18 years and older</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            style={styles.ageButton}
            onPress={() => handleAgeSelection('13-17')}
          >
            <Text style={styles.ageButtonText}>13-17 years old</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 120,
    paddingBottom: 48,
    justifyContent: 'space-between',
  },
  textContainer: {
    gap: 24,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    color: '#EEDDEE',
    lineHeight: 48,
    fontFamily: 'SF Pro',
  },
  subtitle: {
    fontSize: 18,
    color: '#EEDDEE',
    opacity: 0.9,
    lineHeight: 28,
    fontFamily: 'SF Pro',
  },
  buttonsContainer: {
    gap: 24,
  },
  ageButton: {
    backgroundColor: '#E9D5FF',
    borderRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  ageButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'SF Pro',
  },
});

export const AgeSelectionScreen = memo(AgeSelectionScreenComponent);

export default AgeSelectionScreen;
