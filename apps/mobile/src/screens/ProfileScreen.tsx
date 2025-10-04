import { memo, useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useMyProfile } from '@/hooks/useMyProfile';

export type ProfileScreenProps = {
  onBack?: () => void;
  onSave?: (profile: { name: string; username: string; phone: string; bio: string }) => void;
};

function ProfileScreenComponent({ onBack, onSave }: ProfileScreenProps) {
  const { profile, updateProfile, getDisplayName, getUsername, getPhone, getBio } = useMyProfile();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(getDisplayName() || '');
    setUsername(getUsername() || '');
    setPhone(getPhone() || '');
    setBio(getBio() || '');
  }, [profile, getDisplayName, getUsername, getPhone, getBio]);

  const initialSignature = useMemo(() => {
    const base = `${getDisplayName()}|${getUsername()}|${getPhone()}|${getBio()}`;
    return base;
  }, [getBio, getDisplayName, getPhone, getUsername]);

  const currentSignature = `${name}|${username}|${phone}|${bio}`;
  const hasChanges = currentSignature !== initialSignature;
  const disableSave = !name.trim() || saving || !hasChanges;

  const handleSave = async () => {
    if (disableSave) return;
    setSaving(true);
    try {
      await updateProfile({
        display_name: name.trim(),
        username: username.trim() || undefined,
        phone: phone.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      onSave?.({ name: name.trim(), username: username.trim(), phone: phone.trim(), bio: bio.trim() });
      onBack?.();
    } catch (error) {
      console.error('Failed to update profile', error);
      onBack?.();
    } finally {
      setSaving(false);
    }
  };

  const initials = name ? name.charAt(0).toUpperCase() : (profile?.display_name?.charAt(0).toUpperCase() ?? 'I');

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable accessibilityRole="button" onPress={onBack} style={styles.headerButton}>
            <Feather name="arrow-left" size={20} color="#111827" />
          </Pressable>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <Pressable
            accessibilityRole="button"
            onPress={handleSave}
            disabled={disableSave}
            style={[styles.saveButton, disableSave && styles.saveButtonDisabled]}
          >
            <Text style={[styles.saveLabel, disableSave && styles.saveLabelDisabled]}>
              {saving ? 'Saving…' : 'Save'}
            </Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>{initials}</Text>
            </View>
            <Text style={styles.avatarHint}>Profile photo editing coming soon</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full name</Text>
            <View style={styles.inputWrap}>
              <Feather name="user" size={16} color="#94a3b8" />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputWrap}>
              <Feather name="at-sign" size={16} color="#94a3b8" />
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={(value) => setUsername(value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                placeholder="Choose a unique handle"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <Text style={styles.helper}>Only lowercase letters, numbers, and underscores.</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Phone number</Text>
            <View style={styles.inputWrap}>
              <Feather name="phone" size={16} color="#94a3b8" />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Optional"
                placeholderTextColor="#94a3b8"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Bio</Text>
            <View style={[styles.inputWrap, styles.textAreaWrap]}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                placeholder="Share a little about your healing journey"
                placeholderTextColor="#94a3b8"
                multiline
                numberOfLines={4}
                maxLength={200}
              />
            </View>
            <Text style={styles.helper}>{bio.length}/200 characters</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  saveButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#0f172a',
    borderRadius: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#cbd5f5',
  },
  saveLabel: {
    color: '#ffffff',
    fontWeight: '600',
  },
  saveLabelDisabled: {
    color: '#1f2937',
  },
  content: {
    padding: 20,
    gap: 24,
    paddingBottom: 40,
  },
  avatarWrap: {
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  avatarHint: {
    fontSize: 12,
    color: '#94a3b8',
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
  },
  helper: {
    fontSize: 12,
    color: '#94a3b8',
  },
  textAreaWrap: {
    alignItems: 'flex-start',
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});

export const ProfileScreen = memo(ProfileScreenComponent);

export default ProfileScreen;
