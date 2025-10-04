import { memo, useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { BottomNav, type BottomNavProps } from '@/components/BottomNav';
import { useNotifications, type Notification } from '@/hooks/useNotifications';

const ICONS: Record<string, { name: keyof typeof Feather.glyphMap; color: string; background: string }> = {
  like: { name: 'heart', color: '#ef4444', background: '#fee2e2' },
  comment: { name: 'message-circle', color: '#6366f1', background: '#e0e7ff' },
  dm: { name: 'message-circle', color: '#8b5cf6', background: '#ede9fe' },
  follow: { name: 'user-plus', color: '#10b981', background: '#d1fae5' },
  track_featured: { name: 'star', color: '#f59e0b', background: '#fef3c7' },
  system: { name: 'bell', color: '#6b7280', background: '#e5e7eb' },
};

const formatTimeAgo = (timestamp: string) => {
  const date = new Date(timestamp);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
};

type FilterKey = 'all' | 'unread';

type NotificationsScreenProps = {
  onHome?: () => void;
  onLibrary?: () => void;
  onCreate?: () => void;
  onInbox?: () => void;
  onAccount?: () => void;
  bottomNavProps?: BottomNavProps;
  accountInitial?: string;
};

function NotificationsScreenComponent({
  onHome,
  onLibrary,
  onCreate,
  onInbox,
  onAccount,
  bottomNavProps,
  accountInitial = 'S',
}: NotificationsScreenProps) {
  const { notifications, unreadCount, loading, markAllAsRead, markAsRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState<FilterKey>('all');

  const mergedNav = useMemo<BottomNavProps | null>(() => {
    if (bottomNavProps) return bottomNavProps;
    return {
      active: 'inbox',
      onHome,
      onLibrary,
      onCreate,
      onInbox,
      onAccount,
      accountInitial,
    };
  }, [accountInitial, bottomNavProps, onAccount, onCreate, onHome, onInbox, onLibrary]);

  const data = useMemo(() => {
    if (filter === 'unread') return notifications.filter((item) => !item.is_read);
    return notifications;
  }, [filter, notifications]);

  const handlePress = useCallback(
    async (notification: Notification) => {
      if (!notification.is_read) {
        await markAsRead(notification.id);
      }
    },
    [markAsRead]
  );

  const handleDelete = useCallback(
    async (notificationId: string) => {
      await deleteNotification(notificationId);
    },
    [deleteNotification]
  );

  const renderItem = ({ item }: { item: Notification }) => {
    const palette = ICONS[item.type] ?? ICONS.system;
    return (
      <Pressable
        onPress={() => handlePress(item)}
        style={[styles.card, !item.is_read && styles.cardUnread]}
        accessibilityRole="button"
      >
        <View style={styles.iconWrap}>
          <View style={[styles.iconBubble, { backgroundColor: palette.background }]}> 
            <Feather name={palette.name} size={18} color={palette.color} />
          </View>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardMessage} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={styles.cardMeta}>{formatTimeAgo(item.created_at)}</Text>
        </View>
        <Pressable
          onPress={() => handleDelete(item.id)}
          accessibilityRole="button"
          style={styles.deleteButton}
        >
          <Feather name="trash-2" size={16} color="#94a3b8" />
        </Pressable>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable onPress={onInbox} style={styles.headerButton} accessibilityRole="button">
              <Feather name="arrow-left" size={20} color="#111827" />
            </Pressable>
            <View>
              <Text style={styles.headerTitle}>Notifications</Text>
              {unreadCount > 0 ? (
                <Text style={styles.headerSubtitle}>{unreadCount} unread</Text>
              ) : null}
            </View>
          </View>
          {unreadCount > 0 ? (
            <Pressable onPress={markAllAsRead} style={styles.headerButton} accessibilityRole="button">
              <Feather name="check" size={18} color="#111827" />
            </Pressable>
          ) : <View style={styles.headerButton} />}
        </View>

        <View style={styles.filterRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setFilter('all')}
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
          >
            <Text style={[styles.filterLabel, filter === 'all' && styles.filterLabelActive]}>All</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setFilter('unread')}
            style={[styles.filterChip, filter === 'unread' && styles.filterChipActive]}
          >
            <Text style={[styles.filterLabel, filter === 'unread' && styles.filterLabelActive]}>Unread</Text>
            {unreadCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeLabel}>{unreadCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color="#0f172a" />
          </View>
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Feather name="bell" size={28} color="#94a3b8" />
                <Text style={styles.emptyTitle}>You're all caught up</Text>
                <Text style={styles.emptySubtitle}>New notifications will show up here.</Text>
              </View>
            }
          />
        )}

        {mergedNav ? <BottomNav {...mergedNav} /> : null}
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
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    backgroundColor: '#e5e7eb',
  },
  filterChipActive: {
    backgroundColor: '#111827',
  },
  filterLabel: {
    fontSize: 13,
    color: '#111827',
  },
  filterLabelActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeLabel: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 220,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    padding: 16,
    gap: 12,
  },
  cardUnread: {
    borderWidth: 1,
    borderColor: '#111827',
  },
  iconWrap: {
    width: 40,
    alignItems: 'center',
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  cardMessage: {
    fontSize: 13,
    color: '#475569',
  },
  cardMeta: {
    fontSize: 11,
    color: '#94a3b8',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
});

export const NotificationsScreen = memo(NotificationsScreenComponent);

export default NotificationsScreen;
