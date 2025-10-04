import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type NavKey = 'home' | 'library' | 'create' | 'inbox' | 'account';

export interface BottomNavProps {
  active: NavKey;
  onHome?: () => void;
  onLibrary?: () => void;
  onCreate?: () => void;
  onInbox?: () => void;
  onAccount?: () => void;
  badgeCount?: number;
  accountInitial?: string;
  style?: object;
}

const ICONS: Record<Exclude<NavKey, 'create'>, keyof typeof Feather.glyphMap> = {
  home: 'home',
  library: 'book-open',
  inbox: 'bell',
  account: 'user',
};

function BottomNavComponent({
  active,
  onHome,
  onLibrary,
  onCreate,
  onInbox,
  onAccount,
  badgeCount = 0,
  accountInitial = 'S',
  style,
}: BottomNavProps) {
  const insets = useSafeAreaInsets();

  const renderTab = (key: Exclude<NavKey, 'create'>, label: string, onPress?: () => void) => {
    const isActive = active === key;
    const isAccount = key === 'account';

    return (
      <Pressable
        key={key}
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
        onPress={onPress}
        style={styles.tabButton}
      >
        {isAccount ? (
          <View
            style={[
              styles.accountBubble,
              { backgroundColor: isActive ? '#f472b6' : '#e5e7eb' },
            ]}
          >
            <Text style={[styles.accountInitial, { color: isActive ? '#ffffff' : '#374151' }]}>
              {accountInitial.slice(0, 1).toUpperCase()}
            </Text>
          </View>
        ) : (
          <Feather
            name={ICONS[key]}
            size={22}
            color={isActive ? '#111827' : '#9ca3af'}
          />
        )}
        <Text
          style={{
            marginTop: 6,
            fontSize: 12,
            fontWeight: isActive ? '600' : '500',
            color: isActive ? '#111827' : '#9ca3af',
          }}
        >
          {label}
        </Text>
        {key === 'inbox' && badgeCount > 0 ? <View style={styles.badge} /> : null}
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom, 14) },
        style,
      ]}
    >
      {renderTab('home', 'Home', onHome)}
      {renderTab('library', 'Library', onLibrary)}

      <Pressable
        accessibilityRole="button"
        onPress={onCreate}
        style={styles.createButtonWrapper}
      >
        <View style={styles.createButton}>
          <Feather name="music" size={22} color="#ffffff" />
        </View>
        <Text style={styles.createLabel}>Create</Text>
      </Pressable>

      {renderTab('inbox', 'Inbox', onInbox)}
      {renderTab('account', 'Account', onAccount)}
    </View>
  );
}

export const BottomNav = memo(BottomNavComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  accountBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountInitial: {
    fontSize: 14,
    fontWeight: '600',
  },
  createButtonWrapper: {
    alignItems: 'center',
    marginHorizontal: 16,
  },
  createButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f973ab',
    shadowColor: '#f973ab',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  createLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
    color: '#9ca3af',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 24,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
});

export default BottomNav;
