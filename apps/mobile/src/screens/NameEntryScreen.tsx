import { memo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

export type NameEntryScreenProps = {
  onBack?: () => void;
  onNext?: () => void;
  onNameChange?: (value: string) => void;
  initialName?: string;
};

function NameEntryScreenComponent({ onBack, onNext, onNameChange, initialName = '' }: NameEntryScreenProps) {
  const [name, setName] = useState(initialName);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    onNameChange?.(trimmed);

    // mimic light processing delay for UI feedback
    setTimeout(() => {
      setSubmitting(false);
      onNext?.();
    }, 300);
  };

  const handleChange = (value: string) => {
    setName(value);
    onNameChange?.(value);
  };

  const disabled = !name.trim() || submitting;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable onPress={onBack} accessibilityRole="button" style={styles.backButton}>
            <Feather name="arrow-left" size={20} color="#111827" />
          </Pressable>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>What's your name?</Text>
          <Text style={styles.subtitle}>This appears on your profile.</Text>

          <TextInput
            value={name}
            onChangeText={handleChange}
            placeholder="Enter your full name"
            placeholderTextColor="#94a3b8"
            style={styles.input}
            editable={!submitting}
            maxLength={50}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />

          <Pressable
            accessibilityRole="button"
            onPress={handleSubmit}
            style={[styles.ctaButton, disabled && styles.ctaButtonDisabled]}
            disabled={disabled}
          >
            <Text style={styles.ctaLabel}>{submitting ? 'Saving…' : 'Continue'}</Text>
          </Pressable>
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
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  header: {
    height: 48,
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 15,
    color: '#4b5563',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  ctaButton: {
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  ctaLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export const NameEntryScreen = memo(NameEntryScreenComponent);

export default NameEntryScreen;
