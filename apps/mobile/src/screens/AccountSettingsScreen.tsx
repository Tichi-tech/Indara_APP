import { memo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { BottomNav, BottomNavProps } from '@/components';

export type SettingsItem = {
  key: string;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  onPress?: () => void;
  highlighted?: boolean;
};

export type AccountSettingsScreenProps = {
  onBack?: () => void;
  displayName: string;
  userHandle: string;
  onLogout?: () => void;
  onViewProfile?: () => void;
  settingsItems: SettingsItem[];
  versionLabel?: string;
  bottomNavProps?: BottomNavProps;
};

function AccountSettingsScreenComponent({
  onBack,
  displayName,
  userHandle,
  onLogout,
  onViewProfile,
  settingsItems,
  versionLabel = 'Version 1.0.0',
  bottomNavProps,
}: AccountSettingsScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        <Pressable
          accessibilityRole="button"
          onPress={onViewProfile}
          style={styles.profileCard}
        >
          <View style={styles.profileAvatar}>
            <Text style={styles.profileInitial}>
              {displayName.slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileHandle}>@{userHandle}</Text>
            <Text style={styles.profileLink}>View Profile</Text>
          </View>
          <Feather name="chevron-right" size={18} color="#9ca3af" />
        </Pressable>

        <View style={styles.section}>
          {settingsItems.map((item) => (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              onPress={item.onPress}
              style={[styles.settingRow, item.highlighted && styles.settingRowHighlighted]}
            >
              <View style={[styles.settingIconWrap, item.highlighted && styles.settingIconHighlighted]}>
                <Feather
                  name={item.icon}
                  size={18}
                  color={item.highlighted ? '#7c3aed' : '#4b5563'}
                />
              </View>
              <View style={styles.settingTextWrap}>
                <Text style={styles.settingTitle}>{item.title}</Text>
                <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
              </View>
              <Feather name="chevron-right" size={18} color="#9ca3af" />
            </Pressable>
          ))}
        </View>

        <View style={styles.infoBlock}>
          <Text style={styles.infoTitle}>Indara</Text>
          <Text style={styles.infoSubtitle}>{versionLabel}</Text>
          <Text style={styles.infoCaption}>AI-powered healing music</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={onLogout}
          style={styles.logoutButton}
        >
          <Feather name="log-out" size={18} color="#dc2626" />
          <Text style={styles.logoutLabel}>Sign Out</Text>
        </Pressable>
      </ScrollView>

      {bottomNavProps ? <BottomNav {...bottomNavProps} /> : null}
    </View>
  );
}

export const AccountSettingsScreen = memo(AccountSettingsScreenComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 140,
    gap: 24,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 28,
    backgroundColor: '#f4f0ff',
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#7c3aed',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  profileCopy: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  profileHandle: {
    marginTop: 4,
    color: '#6b7280',
  },
  profileLink: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '500',
    color: '#7c3aed',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingVertical: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  settingRowHighlighted: {
    backgroundColor: '#f9fafc',
  },
  settingIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    marginRight: 16,
  },
  settingIconHighlighted: {
    backgroundColor: '#ede9fe',
  },
  settingTextWrap: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  settingSubtitle: {
    marginTop: 4,
    color: '#6b7280',
    fontSize: 13,
  },
  infoBlock: {
    alignItems: 'center',
    gap: 4,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  infoSubtitle: {
    color: '#6b7280',
  },
  infoCaption: {
    fontSize: 12,
    color: '#9ca3af',
  },
  logoutButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: '#fee2e2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
});

export default AccountSettingsScreen;
