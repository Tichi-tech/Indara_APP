import { memo, useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { BottomNav, type BottomNavProps } from '@/components/BottomNav';
import { useNotifications, type Notification } from '@/hooks/useNotifications';

const ICON_CONFIG: Record<string, {
  name: keyof typeof Feather.glyphMap;
  color: string;
  gradientColors: [string, string];
}> = {
  like: {
    name: 'heart',
    color: '#ef4444',
    gradientColors: ['#ef4444', '#ec4899']
  },
  comment: {
    name: 'message-circle',
    color: '#3b82f6',
    gradientColors: ['#3b82f6', '#8b5cf6']
  },
  dm: {
    name: 'message-circle',
    color: '#8b5cf6',
    gradientColors: ['#3b82f6', '#8b5cf6']
  },
  follow: {
    name: 'user-plus',
    color: '#10b981',
    gradientColors: ['#10b981', '#14b8a6']
  },
  track_featured: {
    name: 'star',
    color: '#f59e0b',
    gradientColors: ['#f59e0b', '#f97316']
  },
  system: {
    name: 'bell',
    color: '#6b7280',
    gradientColors: ['#6b7280', '#4b5563']
  },
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
    // Only create nav if any navigation callback is provided
    if (!onHome && !onLibrary && !onCreate && !onInbox && !onAccount) return null;
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

      // Handle navigation based on notification type
      switch (notification.type) {
        case 'like':
        case 'track_featured':
          if (notification.data?.track_id) {
            console.log('Navigate to track:', notification.data.track_id);
          }
          break;
        case 'follow':
          if (notification.data?.follower_id) {
            console.log('Navigate to user profile:', notification.data.follower_id);
          }
          break;
        case 'dm':
          if (notification.data?.sender_id) {
            console.log('Navigate to DM with:', notification.data.sender_id);
          }
          break;
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
    const config = ICON_CONFIG[item.type] ?? ICON_CONFIG.system;
    const hasAvatar = item.sender?.avatar_url;

    return (
      <Pressable
        onPress={() => handlePress(item)}
        style={[styles.card, !item.is_read && styles.cardUnread]}
        accessibilityRole="button"
      >
        {/* Avatar or Icon */}
        <View style={styles.avatarContainer}>
          {hasAvatar ? (
            <Image
              source={{ uri: item.sender.avatar_url }}
              style={styles.avatar}
            />
          ) : (
            <LinearGradient
              colors={config.gradientColors}
              style={styles.avatarGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Feather name={config.name} size={20} color="#ffffff" />
            </LinearGradient>
          )}

          {/* Type Icon Overlay */}
          <View style={styles.iconOverlay}>
            <Feather name={config.name} size={12} color={config.color} />
          </View>
        </View>

        {/* Content */}
        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTextContainer}>
              <Text style={[styles.cardTitle, !item.is_read && styles.cardTitleUnread]}>
                {item.title}
              </Text>
              <Text style={styles.cardMessage} numberOfLines={2}>
                {item.message}
              </Text>
              <Text style={styles.cardMeta}>{formatTimeAgo(item.created_at)}</Text>
            </View>

            {/* Delete and Unread Indicator */}
            <View style={styles.cardActions}>
              <Pressable
                onPress={() => handleDelete(item.id)}
                accessibilityRole="button"
                style={styles.deleteButton}
                hitSlop={8}
              >
                <Feather name="trash-2" size={16} color="#9ca3af" />
              </Pressable>

              {!item.is_read && (
                <View style={styles.unreadDot} />
              )}
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 ? (
              <Text style={styles.headerSubtitle}>{unreadCount} unread</Text>
            ) : null}
          </View>

          {/* Settings Button */}
          <Pressable style={styles.headerButton} accessibilityRole="button">
            <Feather name="settings" size={20} color="#6b7280" />
          </Pressable>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setFilter('all')}
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
          >
            <Text style={[styles.filterLabel, filter === 'all' && styles.filterLabelActive]}>
              All
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => setFilter('unread')}
            style={[styles.filterChip, filter === 'unread' && styles.filterChipActive]}
          >
            <Text style={[styles.filterLabel, filter === 'unread' && styles.filterLabelActive]}>
              Unread
            </Text>
            {unreadCount > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeLabel}>{unreadCount}</Text>
              </View>
            ) : null}
          </Pressable>

          {/* Mark All Read - Moved here like web */}
          {unreadCount > 0 && (
            <Pressable
              onPress={markAllAsRead}
              style={styles.markAllButton}
              accessibilityRole="button"
            >
              <Text style={styles.markAllText}>Mark all read</Text>
            </Pressable>
          )}
        </View>

        {/* Notifications List */}
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
                <View style={styles.emptyIconWrap}>
                  <Feather name="bell" size={32} color="#9ca3af" />
                </View>
                <Text style={styles.emptyTitle}>
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {filter === 'unread'
                    ? 'All caught up! Check back later for new updates.'
                    : 'When you receive notifications, they\'ll appear here.'
                  }
                </Text>
              </View>
            }
          />
        )}

        {mergedNav ? <BottomNav {...mergedNav} badgeCount={unreadCount} /> : null}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerContent: {
    flex: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
  },
  filterChipActive: {
    backgroundColor: '#000000',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
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
  markAllButton: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 120,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  cardUnread: {
    backgroundColor: '#eff6ff',
  },
  avatarContainer: {
    position: 'relative',
    width: 48,
    height: 48,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  cardBody: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  cardTitleUnread: {
    fontWeight: '600',
    color: '#000000',
  },
  cardMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
    lineHeight: 20,
  },
  cardMeta: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
  cardActions: {
    alignItems: 'center',
    gap: 12,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 120,
    paddingHorizontal: 32,
    gap: 16,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export const NotificationsScreen = memo(NotificationsScreenComponent);

export default NotificationsScreen;
