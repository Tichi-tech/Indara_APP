import { memo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

type DisplayNameScreenProps = {
  onBack?: () => void;
  onContinue?: (name: string) => void;
  initialName?: string;
};

function DisplayNameScreenComponent({
  onBack,
  onContinue,
  initialName = '',
}: DisplayNameScreenProps) {
  const [name, setName] = useState(initialName);

  const handleContinue = () => {
    if (name.trim()) {
      onContinue?.(name.trim());
    }
  };

  return (
    <LinearGradient
      colors={['#29034A', '#520346', '#D300BE']}
      locations={[0.12, 0.88, 1]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton} accessibilityRole="button">
          <Feather name="arrow-left" size={32} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Your name</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Enter display name</Text>

        <TextInput
          style={styles.nameInput}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor="rgba(255, 255, 255, 0.3)"
          autoFocus
        />

        <Pressable
          accessibilityRole="button"
          style={[styles.confirmButton, !name.trim() && styles.confirmButtonDisabled]}
          onPress={handleContinue}
          disabled={!name.trim()}
        >
          <Text style={styles.confirmButtonText}>Love it!</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
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
  label: {
    fontSize: 32,
    fontWeight: '600',
    color: '#EEDDEE',
    marginBottom: 80,
    fontFamily: 'SF Pro',
  },
  nameInput: {
    fontSize: 56,
    fontWeight: '700',
    color: '#EEDDEE',
    padding: 0,
    marginBottom: 120,
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

export const DisplayNameScreen = memo(DisplayNameScreenComponent);

export default DisplayNameScreen;
