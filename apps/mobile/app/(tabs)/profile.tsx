// apps/mobile/app/(tabs)/profile.tsx
import { useMemo } from 'react';
import { useRouter } from 'expo-router';

import { AccountSettingsScreen } from '@/screens';
import type { SettingsItem } from '@/screens';
import { useAuth } from '@/hooks/useAuth';
import { useMyProfile } from '@/hooks/useMyProfile';
import { supabase, isAdminUser } from '@/lib/supabase';

export default function Profile() {
  const router = useRouter();
  const { user } = useAuth();
  const { getDisplayName, getUsername } = useMyProfile();

  const displayName = getDisplayName();
  const handle = useMemo(() => {
    const username = getUsername();
    if (username) return username;
    if (user?.email) return user.email.split('@')[0];
    return 'indara';
  }, [getUsername, user?.email]);

  const isAdmin = isAdminUser(user);

  const settingsItems = useMemo<SettingsItem[]>(() => {
    const baseItems: SettingsItem[] = [
      {
        key: 'edit-profile',
        icon: 'user',
        title: 'Edit Profile',
        subtitle: 'Update your personal information',
        onPress: () => router.push('/account/edit-profile'),
      },
      {
        key: 'subscription',
        icon: 'award',
        title: 'Subscription',
        subtitle: 'Upgrade to Premium',
        highlighted: true,
        onPress: () => {},
      },
      {
        key: 'notifications',
        icon: 'bell',
        title: 'Notifications',
        subtitle: 'Manage your notification preferences',
        onPress: () => router.push('/account/notifications'),
      },
    ];

    const adminItems: SettingsItem[] = isAdmin
      ? [
          {
            key: 'analytics',
            icon: 'bar-chart-2',
            title: 'Analytics',
            subtitle: 'View music performance and stats',
            onPress: () => router.push('/analytics'),
          },
        ]
      : [];

    const tailItems: SettingsItem[] = [
      {
        key: 'privacy',
        icon: 'shield',
        title: 'Privacy & Security',
        subtitle: 'Control your privacy settings',
        onPress: () => router.push('/account/privacy'),
      },
      {
        key: 'support',
        icon: 'help-circle',
        title: 'Help & Support',
        subtitle: 'Get help and contact support',
        onPress: () => router.push('/account/support'),
      },
    ];

    return [...baseItems, ...adminItems, ...tailItems];
  }, [router, isAdmin]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/(auth)/signin');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AccountSettingsScreen
      onBack={() => router.back()}
      displayName={displayName}
      userHandle={handle}
      onLogout={handleLogout}
      onViewProfile={() => router.push('/account/profile')}
      settingsItems={settingsItems}
      versionLabel="Version 1.0.0"
      bottomNavProps={{
        active: 'account',
        onHome: () => router.push('/(tabs)/index'),
        onLibrary: () => router.push('/(tabs)/library'),
        onCreate: () => router.push('/create'),
        onInbox: () => router.push('/(tabs)/inbox'),
        onAccount: () => {},
        accountInitial: displayName.slice(0, 1).toUpperCase(),
      }}
    />
  );
}
